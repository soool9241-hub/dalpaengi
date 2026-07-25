import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { SolapiMessageService } from "solapi";

const messageService = new SolapiMessageService(
  (process.env.SOLAPI_API_KEY || "").trim(),
  (process.env.SOLAPI_API_SECRET || "").trim()
);

const SENDER = (process.env.SOLAPI_SENDER || "").trim();

// 관리자 번호 (소리산책은 임솔 단독 진행)
const ADMIN_SOL = "01085319531";

const TABLE = "soundwalk_applications";
const PROGRAM = "soundwalk-2026";
const MAX_CAPACITY = 20;
const FEE_TEXT = "99,000원";
const ACCOUNT = "카카오뱅크 3333-06-4749542 임솔";
const VENUE = "달팽이아지트펜션 (전북 완주군 소양면 해월신왕길 92)";

// 이동수단별 집결 안내 — 12:00 점심 시작에 맞춘 시각
const GATHER: Record<string, string> = {
  전주고속터미널: "전주고속터미널 11:00 (카니발 차량 픽업)",
  전주역: "전주역 11:20 (카니발 차량 픽업)",
  자차: "펜션 11:50 직접 도착 (무료 주차)",
};

// GET: 현재 신청 수 조회 (pending+confirmed만 카운트)
export async function GET() {
  const { count } = await supabaseAdmin
    .from(TABLE)
    .select("*", { count: "exact", head: true })
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

  // 중복 체크
  const { data: existing } = await supabaseAdmin
    .from(TABLE)
    .select("id")
    .eq("phone", phone)
    .maybeSingle();

  if (existing) {
    return NextResponse.json({ error: "이미 신청된 연락처입니다." }, { status: 409 });
  }

  // 정원 확인 (pending + confirmed만 카운트, waitlist/cancelled 제외)
  const { count: activeCount } = await supabaseAdmin
    .from(TABLE)
    .select("*", { count: "exact", head: true })
    .in("status", ["pending", "confirmed"]);

  const isWaitlist = (activeCount || 0) >= MAX_CAPACITY;

  // 대기자 번호 계산 (현재 대기자 수 + 1)
  let waitlistNumber = 0;
  if (isWaitlist) {
    const { count: wlCount } = await supabaseAdmin
      .from(TABLE)
      .select("*", { count: "exact", head: true })
      .eq("status", "waitlist");
    waitlistNumber = (wlCount || 0) + 1;
  }

  const { error } = await supabaseAdmin.from(TABLE).insert({
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
  });

  if (error) {
    return NextResponse.json({ error: "신청 저장 실패: " + error.message }, { status: 500 });
  }

  const newCount = (activeCount || 0) + 1;
  const applicantPhone = phone.replace(/[^0-9]/g, "");
  const gatherInfo = GATHER[transport] ? `\n■ 집결: ${GATHER[transport]}` : "";

  // SMS 발송 (실패해도 신청은 성공 처리)
  try {
    // 1. 신청자에게 확인 + 결제 + Suno 사전준비 안내
    const applicantMsg = isWaitlist
      ? `안녕하세요, ${name}님!

아쉽게도 달팽이 소리산책 리트릿이
${MAX_CAPACITY}명 선착순 마감되었습니다 🎵

대기자 명단에 등록되었습니다.
━━━━━━━━━━━
🌿 대기자 번호: ${waitlistNumber}번
━━━━━━━━━━━

• 취소자 발생 시 순번대로 연락드립니다
• 다음 회차 진행 시 가장 먼저 안내드립니다

문의: 010-8531-9531 (임솔)
관심 가져주셔서 진심으로 감사합니다 :)`
      : `안녕하세요, ${name}님!
달팽이 소리산책 리트릿에 신청해주셔서 감사합니다 🎵

■ 프로그램: 달팽이 소리산책 리트릿
■ 일시: 2026.9.6(일) 12:00~18:00 (6시간)
■ 장소: ${VENUE}${gatherInfo}
■ 참가비: ${FEE_TEXT}

━━ 💳 결제 안내 ━━
입금계좌: ${ACCOUNT}
입금금액: ${FEE_TEXT}
입금자명: ${name}
※ 입금해주시면 참가가 최종 확정됩니다.

━━ 🎧 미리 준비해주세요 ━━
1) 스마트폰에 Suno 앱 설치 + 무료 가입
   (당일 AI 음악창작에 사용합니다)
2) 편한 운동화 — 숲길을 걷습니다
3) 이어폰 (선택)
※ 녹음키트·태블릿·스피커는 저희가 준비합니다.

문의: 010-8531-9531 (임솔)
감사합니다 :)`;

    // 2. 관리자(임솔) 알림
    const adminMsg = `[소리산책 ${isWaitlist ? "대기자" : "새"} 신청]

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

    const applicantSubject = isWaitlist ? "소리산책 대기자 등록 안내" : "소리산책 신청 확인";
    const adminSubject = isWaitlist ? "소리산책 대기자 신청" : "소리산책 새 신청";

    await Promise.allSettled([
      messageService.sendOne({ to: applicantPhone, from: SENDER, text: applicantMsg, type: "LMS", subject: applicantSubject }),
      messageService.sendOne({ to: ADMIN_SOL, from: SENDER, text: adminMsg, type: "LMS", subject: adminSubject }),
    ]);
  } catch (smsErr) {
    console.error("소리산책 SMS 발송 실패:", smsErr);
  }

  return NextResponse.json({
    success: true,
    count: newCount,
    max: MAX_CAPACITY,
    waitlisted: isWaitlist,
    waitlistNumber: isWaitlist ? waitlistNumber : null,
  });
}
