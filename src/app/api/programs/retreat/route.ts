import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { SolapiMessageService } from "solapi";

const messageService = new SolapiMessageService(
  (process.env.SOLAPI_API_KEY || "").trim(),
  (process.env.SOLAPI_API_SECRET || "").trim()
);

const SENDER = (process.env.SOLAPI_SENDER || "").trim();

// 관리자 번호
const ADMIN_SOL = "01085319531";     // 홈페이지 관리자 임솔
const ADMIN_SEJIN = "01053140146";   // 리트릿 운영자 임세진

// GET: 현재 신청 수 조회 (pending+confirmed만 카운트)
export async function GET() {
  const { count } = await supabaseAdmin
    .from("retreat_applications")
    .select("*", { count: "exact", head: true })
    .in("status", ["pending", "confirmed"]);

  return NextResponse.json({ closed: (count || 0) >= 20, max: 20, current: count || 0, remaining: 20 - (count || 0) });
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
    .from("retreat_applications")
    .select("id")
    .eq("phone", phone)
    .maybeSingle();

  if (existing) {
    return NextResponse.json({ error: "이미 신청된 연락처입니다." }, { status: 409 });
  }

  // 정원 확인 (pending + confirmed만 카운트, waitlist/cancelled 제외)
  const { count: activeCount } = await supabaseAdmin
    .from("retreat_applications")
    .select("*", { count: "exact", head: true })
    .in("status", ["pending", "confirmed"]);

  const isFull = (activeCount || 0) >= 20;
  const isWaitlist = isFull;

  // 대기자 번호 계산 (현재 대기자 수 + 1)
  let waitlistNumber = 0;
  if (isWaitlist) {
    const { count: wlCount } = await supabaseAdmin
      .from("retreat_applications")
      .select("*", { count: "exact", head: true })
      .eq("status", "waitlist");
    waitlistNumber = (wlCount || 0) + 1;
  }

  const { error } = await supabaseAdmin
    .from("retreat_applications")
    .insert({
      name,
      phone,
      age: age || null,
      gender: gender || null,
      occupation: occupation || null,
      reason: reason || null,
      ...(photoConsent !== undefined ? { photo_consent: photoConsent } : {}),
      ...(transport ? { transport } : {}),
      ...(region ? { region } : {}),
      program: "spring-retreat-2026",
      status: isWaitlist ? "waitlist" : "pending",
    });

  if (error) {
    return NextResponse.json({ error: "신청 저장 실패: " + error.message }, { status: 500 });
  }

  const newCount = (activeCount || 0) + 1;
  const applicantPhone = phone.replace(/[^0-9]/g, "");

  // SMS 발송 (실패해도 신청은 성공 처리)
  try {
    // 1. 신청자에게 확인 문자
    const applicantMsg = isWaitlist
      ? `안녕하세요, ${name}님!

아쉽게도 완주하다 봄 리트릿이
20명 선착순 마감되었습니다 🌸

대기자 명단에 등록되었습니다.
━━━━━━━━━━━
🌿 대기자 번호: ${waitlistNumber}번
━━━━━━━━━━━

• 취소자 발생 시 순번대로 연락드립니다
• 다음 회차 진행 시 가장 먼저 안내드립니다

문의: 010-5314-0146
관심 가져주셔서 진심으로 감사합니다 :)`
      : `안녕하세요, ${name}님!
완주하다 봄 리트릿에 신청해주셔서 감사합니다.

■ 프로그램: 완주하다 봄 리트릿
■ 일시: 2026.4.18(토) ~ 19(일) 1박2일
■ 장소: 전북 완주군 해월신왕길 92
■ 참가비: 200,000원

입금계좌: 우리은행 1002-938-937713 임세진
※ 입금 확인 후 최종 확정 안내드리겠습니다.

문의: 010-5314-0146
감사합니다 :)`;

    // 2. 관리자에게 알림 문자
    const adminMsg = `[봄 리트릿 ${isWaitlist ? "대기자" : "새"} 신청]

■ 이름: ${name}
■ 연락처: ${phone}
■ 나이: ${age || "-"}
■ 성별: ${gender || "-"}
■ 하시는 일: ${occupation || "-"}
■ 신청 이유: ${reason || "-"}
■ 이동방법: ${transport || "-"}
■ 지역: ${region || "-"}
■ 촬영동의: ${photoConsent ? "동의" : "미동의"}

${isWaitlist ? `⭐ 대기자 ${waitlistNumber}번 등록` : `현재 ${newCount}/20명`}`;

    const applicantSubject = isWaitlist ? "봄 리트릿 대기자 등록 안내" : "봄 리트릿 신청 확인";
    const adminSubject = isWaitlist ? "봄 리트릿 대기자 신청" : "봄 리트릿 새 신청";

    await Promise.allSettled([
      messageService.sendOne({ to: applicantPhone, from: SENDER, text: applicantMsg, type: "LMS", subject: applicantSubject }),
      messageService.sendOne({ to: ADMIN_SOL, from: SENDER, text: adminMsg, type: "LMS", subject: adminSubject }),
      messageService.sendOne({ to: ADMIN_SEJIN, from: SENDER, text: adminMsg, type: "LMS", subject: adminSubject }),
    ]);
  } catch (smsErr) {
    console.error("리트릿 SMS 발송 실패:", smsErr);
  }

  return NextResponse.json({
    success: true,
    count: newCount,
    max: 20,
    waitlisted: isWaitlist,
    waitlistNumber: isWaitlist ? waitlistNumber : null,
  });
}
