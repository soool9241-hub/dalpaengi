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
const MEMBER_TABLE = "membership_applications";

/* ───── 회차 정보 ─────
   월 2회 진행. 다음 회차를 열 때 PROGRAM / EVENT_DATE_TEXT 를 바꾸면
   정원 카운트가 자동으로 0부터 다시 시작한다. */
const PROGRAM = "bbq-2026-09-1";
const EVENT_DATE_TEXT = "2026.9.8(화)";
const EVENT_TIME_TEXT = "19:00~23:00 (4시간)";

/* 30석. 정상 운영기에는 멤버 20 + 신규 10 으로 나누지만,
   초기 회차는 멤버가 아직 없어 30석 전부를 신규에게 연다.
   멤버 좌석을 분리할 때 아래 두 상수를 켜서 쓴다. */
const MAX_CAPACITY = 30;
// const MEMBER_SEATS = 20;
// const GUEST_SEATS = 10;

const ACCOUNT = "카카오뱅크 3333-06-4749542 임솔";
const VENUE = "달팽이아지트펜션 (전북 완주군 소양면 해월신왕길 92)";

/* ───── 요금 3단 ─────
   "무엇을 듣느냐"가 아니라 "누구냐"로 갈린다. 프로그램은 모두 동일한 4시간.
   가격을 바꿀 땐 programs/bbq/page.tsx 의 FEE_TYPES 도 같이 고친다. */
type FeeType = "guest" | "code" | "member";
const FEE_TYPES: Record<FeeType, { label: string; amount: number; text: string }> = {
  guest: { label: "일반 참가", amount: 60_000, text: "60,000원" },
  code: { label: "라이브 코드 할인", amount: 50_000, text: "50,000원" },
  member: { label: "멤버십 회원", amount: 15_000, text: "15,000원" },
};
const DEFAULT_FEE: FeeType = "guest";

/* 온라인 라이브를 끝까지 본 분에게 공지하는 코드. 회차마다 바뀌므로
   Vercel 환경변수(BBQ_LIVE_CODE)로 빼서 재배포 없이 교체할 수 있게 했다. */
const LIVE_CODE = (process.env.BBQ_LIVE_CODE || "DALPAENGI").trim().toUpperCase();

// 이동수단별 집결 안내 — 19:00 시작 기준
const GATHER: Record<string, string> = {
  전주고속터미널: "전주고속터미널 18:10 (카니발 차량 픽업)",
  전주역: "전주역 18:30 (카니발 차량 픽업)",
  자차: "펜션 18:50 직접 도착 (무료 주차)",
};

// 타임테이블 — 모든 참가자가 동일하게 4시간
const TIMETABLE = `1부 19:00~21:00 항아리 바베큐 + 포트럭
2부 21:00~23:00 사례 공유 · 자동수익 스터디`;

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

/* 멤버십 회원인지 확인한다.
   checkable=false 는 멤버십 테이블 자체를 못 읽은 경우다. 이때는 신청을 막지 않고
   관리자 확인 대상으로 넘긴다 — 테이블이 없는 기간에 접수가 끊기면 안 되기 때문. */
async function verifyMember(phone: string): Promise<{ verified: boolean; checkable: boolean }> {
  const { data, error } = await supabaseAdmin
    .from(MEMBER_TABLE)
    .select("id")
    .eq("phone", phone)
    .eq("status", "confirmed")
    .maybeSingle();

  if (error) return { verified: false, checkable: false };
  return { verified: !!data, checkable: true };
}

// POST: 신청 접수
export async function POST(req: NextRequest) {
  const body = await req.json();
  const { name, age, gender, occupation, reason, photoConsent, transport, region } = body;
  let { phone } = body;

  const feeType: FeeType = (["guest", "code", "member"] as const).includes(body.feeType)
    ? body.feeType
    : DEFAULT_FEE;
  const feeInfo = FEE_TYPES[feeType];

  if (!name || !phone) {
    return NextResponse.json({ error: "이름과 연락처는 필수입니다." }, { status: 400 });
  }
  if (!age || !gender || !occupation || !reason || !region || !transport) {
    return NextResponse.json({ error: "모든 항목을 입력해주세요." }, { status: 400 });
  }
  if (photoConsent !== true) {
    return NextResponse.json({ error: "촬영 동의는 필수입니다." }, { status: 400 });
  }

  // 라이브 코드 검증 — 대소문자·공백 무시
  if (feeType === "code") {
    const input = String(body.liveCode || "").trim().toUpperCase();
    if (!input) {
      return NextResponse.json({ error: "라이브 코드를 입력해주세요." }, { status: 400 });
    }
    if (input !== LIVE_CODE) {
      return NextResponse.json(
        { error: "라이브 코드가 맞지 않습니다. 다시 확인해주세요." },
        { status: 400 }
      );
    }
  }

  // 전화번호 정규화: 숫자만 추출 + 0 누락 시 복구 + 010-1234-5678 형식
  let digits = String(phone).replace(/[^0-9]/g, "");
  if (digits.length === 10 && !digits.startsWith("0")) digits = "0" + digits;
  if (digits.length === 11) {
    phone = `${digits.slice(0, 3)}-${digits.slice(3, 7)}-${digits.slice(7)}`;
  } else {
    phone = digits;
  }

  // 멤버 요금은 확정 멤버만. 확인이 가능한데 명단에 없으면 되돌려보낸다.
  let memberNeedsCheck = false;
  if (feeType === "member") {
    const { verified, checkable } = await verifyMember(phone);
    if (checkable && !verified) {
      return NextResponse.json(
        {
          error:
            "멤버십 회원으로 확인되지 않는 번호입니다. 일반 참가로 신청하시거나 멤버십에 먼저 지원해주세요.",
        },
        { status: 403 }
      );
    }
    if (!checkable) memberNeedsCheck = true;
  }

  // 중복 체크 — 이번 회차 안에서만 (다음 회차 재참가는 허용)
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

  let { error } = await supabaseAdmin
    .from(TABLE)
    .insert({ ...row, fee_type: feeType, fee_amount: feeInfo.amount });
  // fee_type 컬럼 마이그레이션 전이면 컬럼 없이 재시도한다. 신청을 흘리지 않기 위한 임시 안전장치.
  // TODO(sol): 20260829150000_bbq_fee_type.sql 적용 확인 후 이 분기 삭제
  if (error && (error.message.includes("fee_type") || error.message.includes("fee_amount"))) {
    ({ error } = await supabaseAdmin.from(TABLE).insert(row));
  }

  if (error) {
    return NextResponse.json({ error: "신청 저장 실패: " + error.message }, { status: 500 });
  }

  const newCount = (activeCount || 0) + 1;
  const applicantPhone = phone.replace(/[^0-9]/g, "");
  const gatherInfo = GATHER[transport] ? `\n■ 집결: ${GATHER[transport]}` : "";

  console.log(
    "[bbq] 신청 접수:",
    phone.replace(/(\d{3})-\d{4}-(\d{4})/, "$1-****-$2"),
    feeType,
    isWaitlist ? "(대기)" : ""
  );

  // SMS 발송 (실패해도 신청은 성공 처리)
  try {
    const applicantMsg = isWaitlist
      ? `안녕하세요, ${name}님!

아쉽게도 항아리 바베큐 모임
${MAX_CAPACITY}석이 마감되었습니다 🍖

대기자 명단에 등록되었습니다.
━━━━━━━━━━━
🔥 대기자 번호: ${waitlistNumber}번
━━━━━━━━━━━

• 취소자 발생 시 순번대로 연락드립니다
• 다음 회차(월 2회) 진행 시 가장 먼저 안내드립니다

문의: 010-8531-9531 (임솔)
관심 가져주셔서 진심으로 감사합니다 :)`
      : `안녕하세요, ${name}님!
항아리 바베큐 모임 신청이 접수되었습니다 🍖

━━ 📋 신청 내용 ━━
▶ ${feeInfo.label}
▶ 참가비 ${feeInfo.text}

■ 일시: ${EVENT_DATE_TEXT} ${EVENT_TIME_TEXT}
■ 장소: ${VENUE}${gatherInfo}

━━ 🍖 참가비에 포함된 것 ━━
• 항아리 훈연 바베큐 (배부르게)
• 음료 & 펜션 대관료
• 2부 사례 공유 · 자동수익 스터디

━━ 🥘 포트럭 안내 ━━
나눠 드실 음식이나 음료를 한 가지씩
가져와주세요. 부담 없는 걸로 충분합니다.

━━ 💳 결제 안내 ━━
입금계좌: ${ACCOUNT}
입금금액: ${feeInfo.text}
입금자명: ${name}
※ 입금해주시면 신청이 최종 확정됩니다.
${memberNeedsCheck ? "※ 멤버십 회원 여부 확인 후 안내드립니다.\n" : ""}
━━ ⏰ 타임테이블 ━━
${TIMETABLE}

※ 노트북 또는 태블릿을 가져오시면
   2부에 바로 따라 만들어보실 수 있습니다.

문의: 010-8531-9531 (임솔)
감사합니다 :)`;

    const adminMsg = `[항아리BBQ ${isWaitlist ? "대기자" : "새 신청"}]

■ 요금: ${feeInfo.label} (${feeInfo.text})${memberNeedsCheck ? " ⚠️멤버확인필요" : ""}
■ 이름: ${name}
■ 연락처: ${phone}
■ 나이: ${age || "-"}
■ 성별: ${gender || "-"}
■ 하시는 일: ${occupation || "-"}
■ 신청 이유: ${reason || "-"}
■ 지역: ${region || "-"}
■ 이동방법: ${transport || "-"}
■ 촬영동의: ${photoConsent ? "동의" : "미동의"}

${isWaitlist ? `⭐ 대기자 ${waitlistNumber}번 등록` : `현재 ${newCount}/${MAX_CAPACITY}석`}
⏳ 입금 대기 (${ACCOUNT})`;

    const applicantSubject = isWaitlist ? "항아리BBQ 대기자 등록 안내" : "항아리BBQ 신청 안내";
    const adminSubject = isWaitlist ? "항아리BBQ 대기자 신청" : "항아리BBQ 새 신청";

    await Promise.allSettled([
      messageService.sendOne({
        to: applicantPhone, from: SENDER, text: applicantMsg, type: "LMS", subject: applicantSubject,
      }),
      messageService.sendOne({
        to: ADMIN_SOL, from: SENDER, text: adminMsg, type: "LMS", subject: adminSubject,
      }),
    ]);
  } catch (e) {
    console.error("[bbq] SMS 발송 실패:", e);
  }

  return NextResponse.json({
    success: true,
    count: newCount,
    max: MAX_CAPACITY,
    waitlisted: isWaitlist,
    waitlistNumber: isWaitlist ? waitlistNumber : null,
  });
}
