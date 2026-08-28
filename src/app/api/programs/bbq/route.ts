import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { SolapiMessageService } from "solapi";

const messageService = new SolapiMessageService(
  (process.env.SOLAPI_API_KEY || "").trim(),
  (process.env.SOLAPI_API_SECRET || "").trim()
);

const SENDER = (process.env.SOLAPI_SENDER || "").trim();

// 관리자 번호 (항아리 바베큐는 임솔 단독 진행)
const ADMIN_SOL = "01085319531";

const TABLE = "bbq_applications";
// 월 1회 정기 모임. 다음 회차를 열 때는 이 값과 EVENT_DATE_TEXT 만 바꾸면
// 정원 카운트가 자동으로 0부터 다시 시작한다.
const PROGRAM = "bbq-2026-09";
const MAX_CAPACITY = 6;
const ACCOUNT = "카카오뱅크 3333-06-4749542 임솔";
const VENUE = "달팽이아지트펜션 (전북 완주군 소양면 해월신왕길 92)";
const EVENT_DATE_TEXT = "2026.9.8(화)";

/* ───── 참가 코스 3종 ─────
   1교시(바베큐)와 2교시(스터디)를 따로 신청할 수 있다.
   full 은 두 코스를 합친 금액이라 별도 묶음 할인은 없다.
   가격을 바꿀 땐 여기와 programs/bbq/page.tsx 의 COURSES 를 같이 고친다. */
type CourseKey = "bbq" | "full" | "study";
const COURSES: Record<CourseKey, {
  label: string; feeText: string; time: string; sessions: string; included: string[];
}> = {
  bbq: {
    label: "항아리 바베큐만",
    feeText: "30,000원",
    time: "19:00~20:00 (1시간)",
    sessions: "1교시 19:00~20:00 항아리 바베큐",
    included: ["항아리 훈연 바베큐 (배부르게)", "주류 & 음료", "펜션 대관료"],
  },
  full: {
    label: "항아리 바베큐 + AI 스터디",
    feeText: "60,000원",
    time: "19:00~22:00 (3시간)",
    sessions: "1교시 19:00~20:00 항아리 바베큐\n2교시 20:00~22:00 자동 수익 시스템 만들기",
    included: ["항아리 훈연 바베큐 (배부르게)", "주류 & 음료", "펜션 대관료", "AI 자동수익 워크숍 2시간"],
  },
  study: {
    label: "AI 스터디만",
    feeText: "30,000원",
    time: "20:00~22:00 (2시간)",
    sessions: "2교시 20:00~22:00 자동 수익 시스템 만들기",
    included: ["AI 자동수익 워크숍 2시간", "음료 & 다과", "펜션 대관료"],
  },
};
const DEFAULT_COURSE: CourseKey = "full";

/* 이동수단별 집결 시각 — 스터디만 참가하면 시작이 1시간 늦으므로 픽업도 1시간 뒤 */
const GATHER: Record<string, { label: string; bbq: string; study: string }> = {
  전주고속터미널: { label: "전주고속터미널 (카니발 차량 픽업)", bbq: "18:10", study: "19:10" },
  전주역: { label: "전주역 (카니발 차량 픽업)", bbq: "18:30", study: "19:30" },
  자차: { label: "펜션 직접 도착 (무료 주차)", bbq: "18:50", study: "19:50" },
};

function gatherText(transport: string, course: CourseKey) {
  const g = GATHER[transport];
  if (!g) return "";
  return `${g.label} ${course === "study" ? g.study : g.bbq}`;
}

// GET: 현재 신청 수 조회 (이번 회차의 pending+confirmed만 카운트)
export async function GET() {
  const { count } = await supabaseAdmin
    .from(TABLE)
    .select("*", { count: "exact", head: true })
    .eq("program", PROGRAM)
    .in("status", ["pending", "confirmed"]);

  const current = count || 0;
  return NextResponse.json({
    closed: current >= MAX_CAPACITY,
    max: MAX_CAPACITY,
    current,
    remaining: Math.max(0, MAX_CAPACITY - current),
  });
}

// POST: 신청 접수
export async function POST(req: NextRequest) {
  const body = await req.json();
  const { name, age, gender, occupation, reason, photoConsent, transport, region } = body;
  let { phone } = body;

  // 코스는 화면에서 항상 보내지만, 값이 이상하면 풀코스로 떨어뜨린다.
  const course: CourseKey = (["bbq", "full", "study"] as const).includes(body.course)
    ? body.course
    : DEFAULT_COURSE;
  const courseInfo = COURSES[course];

  if (!name || !phone) {
    return NextResponse.json({ error: "이름과 연락처는 필수입니다." }, { status: 400 });
  }
  if (!age || !gender || !occupation || !reason || !region || !transport) {
    return NextResponse.json({ error: "모든 항목을 입력해주세요." }, { status: 400 });
  }
  if (photoConsent !== true) {
    return NextResponse.json({ error: "촬영 동의는 필수입니다." }, { status: 400 });
  }

  // 전화번호 정규화: 숫자만 추출 + 0 누락 시 복구 + 010-1234-5678 형식
  let digits = String(phone).replace(/[^0-9]/g, "");
  if (digits.length === 10 && !digits.startsWith("0")) digits = "0" + digits;
  if (digits.length === 11) {
    phone = `${digits.slice(0, 3)}-${digits.slice(3, 7)}-${digits.slice(7)}`;
  } else {
    phone = digits;
  }

  // 중복 체크 — 이번 회차 안에서만 (다음 달 재참가는 허용)
  const { data: existing } = await supabaseAdmin
    .from(TABLE)
    .select("id")
    .eq("phone", phone)
    .eq("program", PROGRAM)
    .maybeSingle();

  if (existing) {
    return NextResponse.json({ error: "이미 신청된 연락처입니다." }, { status: 409 });
  }

  // 정원 확인 (pending + confirmed만 카운트, waitlist/cancelled 제외)
  const { count: activeCount } = await supabaseAdmin
    .from(TABLE)
    .select("*", { count: "exact", head: true })
    .eq("program", PROGRAM)
    .in("status", ["pending", "confirmed"]);

  const isWaitlist = (activeCount || 0) >= MAX_CAPACITY;

  // 대기자 번호 계산 (이번 회차 대기자 수 + 1)
  let waitlistNumber = 0;
  if (isWaitlist) {
    const { count: wlCount } = await supabaseAdmin
      .from(TABLE)
      .select("*", { count: "exact", head: true })
      .eq("program", PROGRAM)
      .eq("status", "waitlist");
    waitlistNumber = (wlCount || 0) + 1;
  }

  const row = {
    name,
    phone,
    age: age || null,
    gender: gender || null,
    occupation: occupation || null,
    reason: reason || null,
    region: region || null,
    transport: transport || null,
    photo_consent: photoConsent,
    program: PROGRAM,
    status: isWaitlist ? "waitlist" : "pending",
  };

  let { error } = await supabaseAdmin.from(TABLE).insert({ ...row, course });
  // course 컬럼 마이그레이션 전이면 컬럼 없이 재시도한다. 신청을 흘리지 않기 위한 임시 안전장치.
  // TODO(sol): 20260829120000_bbq_course.sql 적용 확인 후 이 분기 삭제
  if (error && error.message.includes("course")) {
    ({ error } = await supabaseAdmin.from(TABLE).insert(row));
  }

  if (error) {
    return NextResponse.json({ error: "신청 저장 실패: " + error.message }, { status: 500 });
  }

  const newCount = (activeCount || 0) + 1;
  const applicantPhone = phone.replace(/[^0-9]/g, "");
  const gather = gatherText(transport, course);
  const gatherInfo = gather ? `\n■ 집결: ${gather}` : "";

  // SMS 발송 (실패해도 신청은 성공 처리)
  try {
    const applicantMsg = isWaitlist
      ? `안녕하세요, ${name}님!

아쉽게도 항아리 바베큐 모임
${MAX_CAPACITY}명 정원이 마감되었습니다 🍖

대기자 명단에 등록되었습니다.
━━━━━━━━━━━
🔥 대기자 번호: ${waitlistNumber}번
━━━━━━━━━━━

• 취소자 발생 시 순번대로 연락드립니다
• 다음 회차(월 1회) 진행 시 가장 먼저 안내드립니다

문의: 010-8531-9531 (임솔)
관심 가져주셔서 진심으로 감사합니다 :)`
      : `안녕하세요, ${name}님!
항아리 바베큐 모임 신청이 접수되었습니다 🍖

━━ 📋 신청하신 코스 ━━
▶ ${courseInfo.label}
▶ 참가비 ${courseInfo.feeText}

■ 일시: ${EVENT_DATE_TEXT} ${courseInfo.time}
■ 장소: ${VENUE}${gatherInfo}

━━ 🍖 회비에 포함된 것 ━━
${courseInfo.included.map((v) => `• ${v}`).join("\n")}

━━ 💳 결제 안내 ━━
입금계좌: ${ACCOUNT}
입금금액: ${courseInfo.feeText}
입금자명: ${name}
※ 입금해주시면 신청이 최종 확정됩니다.

━━ ⏰ 참여하시는 시간 ━━
${courseInfo.sessions}
${
  course === "bbq"
    ? "\n※ 2교시(AI 스터디)까지 함께하고 싶으시면\n   말씀 주세요. 차액 3만원으로 변경됩니다."
    : "\n※ 노트북 또는 태블릿을 가져오시면\n   2교시에 바로 따라 만들어보실 수 있습니다."
}
문의: 010-8531-9531 (임솔)
감사합니다 :)`;

    const adminMsg = `[항아리BBQ ${isWaitlist ? "대기자" : "새 신청"}]

■ 코스: ${courseInfo.label} (${courseInfo.feeText})
■ 이름: ${name}
■ 연락처: ${phone}
■ 나이: ${age || "-"}
■ 성별: ${gender || "-"}
■ 하시는 일: ${occupation || "-"}
■ 신청 이유: ${reason || "-"}
■ 지역: ${region || "-"}
■ 이동방법: ${transport || "-"}
■ 촬영동의: ${photoConsent ? "동의" : "미동의"}

${isWaitlist ? `⭐ 대기자 ${waitlistNumber}번 등록` : `현재 ${newCount}/${MAX_CAPACITY}명`}
⏳ 입금 대기 (${ACCOUNT})`;

    const applicantSubject = isWaitlist ? "항아리BBQ 대기자 등록 안내" : "항아리BBQ 신청 안내";
    const adminSubject = isWaitlist ? "항아리BBQ 대기자 신청" : "항아리BBQ 새 신청";

    await Promise.allSettled([
      messageService.sendOne({ to: applicantPhone, from: SENDER, text: applicantMsg, type: "LMS", subject: applicantSubject }),
      messageService.sendOne({ to: ADMIN_SOL, from: SENDER, text: adminMsg, type: "LMS", subject: adminSubject }),
    ]);
  } catch (smsErr) {
    console.error("항아리BBQ SMS 발송 실패:", smsErr);
  }

  return NextResponse.json({
    success: true,
    count: newCount,
    max: MAX_CAPACITY,
    waitlisted: isWaitlist,
    waitlistNumber: isWaitlist ? waitlistNumber : null,
  });
}
