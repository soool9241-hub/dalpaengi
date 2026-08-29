import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { SolapiMessageService } from "solapi";

const messageService = new SolapiMessageService(
  (process.env.SOLAPI_API_KEY || "").trim(),
  (process.env.SOLAPI_API_SECRET || "").trim()
);

const SENDER = (process.env.SOLAPI_SENDER || "").trim();

// 관리자 번호 (멤버십 심사는 임솔 단독)
const ADMIN_SOL = "01085319531";

const TABLE = "membership_applications";

/* ───── 기수 정보 ─────
   월 1기수 오픈. 다음 기수를 열 때 PROGRAM / COHORT_LABEL / START_TEXT 를 바꾸면
   정원 카운트가 자동으로 0부터 다시 시작한다.
   총 100명(5기수)까지만 받는 구조라 COHORT_NO 도 같이 올린다. */
const PROGRAM = "membership-2026-10";
const COHORT_LABEL = "1기";
const START_TEXT = "2026년 10월 시작";
const MAX_CAPACITY = 20;

const FEE_TEXT = "월 300,000원";
const MIN_MONTHS = 3;
const ACCOUNT = "카카오뱅크 3333-06-4749542 임솔";

// 지원 → 심사 → 입회. 접수 문자에서 이 일정을 반드시 알려준다.
const REVIEW_DAYS = "3일 이내";

/* GET: 이번 기수 지원 현황
   심사가 있는 상품이라 "남은 자리"보다 "정원/모집중" 이 정확한 표현이다. */
export async function GET() {
  const { count } = await supabaseAdmin
    .from(TABLE)
    .select("*", { count: "exact", head: true })
    .eq("program", PROGRAM)
    .in("status", ["pending", "confirmed"]);

  const applied = count || 0;

  const { count: confirmedCount } = await supabaseAdmin
    .from(TABLE)
    .select("*", { count: "exact", head: true })
    .eq("program", PROGRAM)
    .eq("status", "confirmed");

  const confirmed = confirmedCount || 0;

  return NextResponse.json({
    cohort: COHORT_LABEL,
    max: MAX_CAPACITY,
    applied,
    confirmed,
    remaining: Math.max(0, MAX_CAPACITY - confirmed),
    closed: confirmed >= MAX_CAPACITY,
  });
}

// POST: 지원서 접수
export async function POST(req: NextRequest) {
  const body = await req.json();
  const {
    name, email, occupation, region,
    channels, reach, give, want, helped, howFound, privacyConsent,
  } = body;
  let { phone } = body;

  if (!name || !phone) {
    return NextResponse.json({ error: "이름과 연락처는 필수입니다." }, { status: 400 });
  }
  if (!occupation || !region || !channels) {
    return NextResponse.json({ error: "하시는 일·지역·운영 채널을 입력해주세요." }, { status: 400 });
  }
  // 이 세 문항이 심사의 전부다. 비어 있으면 받을 이유가 없다.
  if (!give || !want || !helped) {
    return NextResponse.json({ error: "지원서 3문항을 모두 작성해주세요." }, { status: 400 });
  }
  if (privacyConsent !== true) {
    return NextResponse.json({ error: "개인정보 수집 동의는 필수입니다." }, { status: 400 });
  }

  // 전화번호 정규화: 숫자만 추출 + 0 누락 시 복구 + 010-1234-5678 형식
  let digits = String(phone).replace(/[^0-9]/g, "");
  if (digits.length === 10 && !digits.startsWith("0")) digits = "0" + digits;
  if (digits.length === 11) {
    phone = `${digits.slice(0, 3)}-${digits.slice(3, 7)}-${digits.slice(7)}`;
  } else {
    phone = digits;
  }

  // 중복 지원 차단 — 이번 기수 안에서만 (다음 기수 재지원은 허용)
  const { data: existing } = await supabaseAdmin
    .from(TABLE)
    .select("id")
    .eq("phone", phone)
    .eq("program", PROGRAM)
    .maybeSingle();

  if (existing) {
    return NextResponse.json(
      { error: "이미 이번 기수에 지원하셨습니다. 심사 결과를 기다려주세요." },
      { status: 409 }
    );
  }

  // 정원은 "심사를 통과한 인원(confirmed)" 기준이다.
  // 지원서는 정원을 넘겨도 계속 받는다 — 심사에서 걸러지기 때문.
  const { count: confirmedCount } = await supabaseAdmin
    .from(TABLE)
    .select("*", { count: "exact", head: true })
    .eq("program", PROGRAM)
    .eq("status", "confirmed");

  const isFull = (confirmedCount || 0) >= MAX_CAPACITY;

  const reachNum = Number.isFinite(Number(reach)) && Number(reach) > 0 ? Math.floor(Number(reach)) : null;

  const { error } = await supabaseAdmin.from(TABLE).insert({
    name,
    phone,
    email: email || null,
    occupation: occupation || null,
    region: region || null,
    channels: channels || null,
    reach: reachNum,
    give,
    want,
    helped,
    how_found: howFound || null,
    privacy_consent: privacyConsent,
    program: PROGRAM,
    // 정원이 찼으면 다음 기수 대기로 접수한다. 탈락이 아니라 순번이다.
    status: isFull ? "waitlist" : "pending",
  });

  if (error) {
    return NextResponse.json({ error: "지원서 저장 실패: " + error.message }, { status: 500 });
  }

  const applicantPhone = phone.replace(/[^0-9]/g, "");

  // 로그에는 전화번호를 마스킹해서 남긴다
  console.log(
    "[membership] 지원 접수:",
    phone.replace(/(\d{3})-\d{4}-(\d{4})/, "$1-****-$2"),
    isFull ? "(대기)" : "(심사대기)"
  );

  // SMS 발송 (실패해도 접수는 성공 처리)
  try {
    const applicantMsg = isFull
      ? `안녕하세요, ${name}님!
달팽이 프라이빗 멤버십 지원서가 접수되었습니다 🐌

${COHORT_LABEL} ${MAX_CAPACITY}명이 이미 채워져
다음 기수 우선 대상으로 등록해드렸습니다.

• 다음 기수는 한 달 뒤에 열립니다
• 열리는 즉시 가장 먼저 안내드립니다
• 지원서는 그대로 유지되니 다시 쓰지 않으셔도 됩니다

기다려주셔서 감사합니다.
문의: 010-8531-9531 (임솔)`
      : `안녕하세요, ${name}님!
달팽이 프라이빗 멤버십 ${COHORT_LABEL} 지원서가
정상 접수되었습니다 🐌

━━ 📋 접수 내용 ━━
■ 기수: ${COHORT_LABEL} (${START_TEXT})
■ 정원: ${MAX_CAPACITY}명
■ 회비: ${FEE_TEXT} (최소 ${MIN_MONTHS}개월)

━━ 🔍 다음 단계 ━━
지원서를 읽고 ${REVIEW_DAYS} 연락드립니다.
결과와 무관하게 꼭 회신드립니다.

※ 지금 입금하지 마세요.
   심사 후 안내드린 뒤에 결제하시면 됩니다.

━━ 🤝 미리 알려드릴 것 ━━
이 멤버십은 배우러 오는 곳이 아니라
각자 가진 걸 내놓고 함께 키우는 곳입니다.
"내놓을 수 있는 것"에 적어주신 내용을
가장 눈여겨 봅니다.

문의: 010-8531-9531 (임솔)
감사합니다 :)`;

    const adminMsg = `[멤버십 ${isFull ? "대기 지원" : "새 지원서"}] ${COHORT_LABEL}

■ 이름: ${name}
■ 연락처: ${phone}
■ 하시는 일: ${occupation || "-"}
■ 지역: ${region || "-"}
■ 채널: ${channels || "-"}
■ 도달 규모: ${reachNum ? reachNum.toLocaleString("ko-KR") + "명" : "-"}

━━ 내놓을 수 있는 것 ━━
${give}

━━ 받고 싶은 것 ━━
${want}

━━ 도와본 경험 ━━
${helped}

■ 알게 된 경로: ${howFound || "-"}
${isFull ? "⭐ 정원 마감 — 다음 기수 대기" : `현재 확정 ${confirmedCount || 0}/${MAX_CAPACITY}명`}
▶ 관리자에서 심사 처리`;

    await Promise.allSettled([
      messageService.sendOne({
        to: applicantPhone, from: SENDER, text: applicantMsg, type: "LMS",
        subject: isFull ? "멤버십 대기 등록 안내" : "멤버십 지원서 접수 안내",
      }),
      messageService.sendOne({
        to: ADMIN_SOL, from: SENDER, text: adminMsg, type: "LMS",
        subject: isFull ? "멤버십 대기 지원" : "멤버십 새 지원서",
      }),
    ]);
  } catch (e) {
    console.error("[membership] SMS 발송 실패:", e);
  }

  return NextResponse.json({
    success: true,
    waitlisted: isFull,
    cohort: COHORT_LABEL,
  });
}
