import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { SolapiMessageService } from "solapi";

const messageService = new SolapiMessageService(
  (process.env.SOLAPI_API_KEY || "").trim(),
  (process.env.SOLAPI_API_SECRET || "").trim()
);

const SENDER = (process.env.SOLAPI_SENDER || "").trim();

// 관리자 번호 (바이브코딩은 임솔 담당)
const ADMIN_SOL = "01085319531";

// GET: 현재 신청 수 조회 (취소 제외)
export async function GET() {
  const { count } = await supabaseAdmin
    .from("vibecoding_applications")
    .select("*", { count: "exact", head: true })
    .in("status", ["pending", "confirmed"]);

  const { count: courseACount } = await supabaseAdmin
    .from("vibecoding_applications")
    .select("*", { count: "exact", head: true })
    .eq("course", "A")
    .in("status", ["pending", "confirmed"]);

  const { count: courseBCount } = await supabaseAdmin
    .from("vibecoding_applications")
    .select("*", { count: "exact", head: true })
    .eq("course", "B")
    .in("status", ["pending", "confirmed"]);

  return NextResponse.json({
    closed: (count || 0) >= 20,
    max: 20,
    courseA: courseACount || 0,
    courseB: courseBCount || 0,
  });
}

// POST: 신청 접수
export async function POST(req: NextRequest) {
  const body = await req.json();
  const { name, phone, age, occupation, idea, course, experience, how_found, preferred_date } = body;

  if (!name || !phone) {
    return NextResponse.json({ error: "이름과 연락처는 필수입니다." }, { status: 400 });
  }

  // 중복 체크
  const { data: existing } = await supabaseAdmin
    .from("vibecoding_applications")
    .select("id")
    .eq("phone", phone)
    .maybeSingle();

  if (existing) {
    return NextResponse.json({ error: "이미 신청된 연락처입니다." }, { status: 409 });
  }

  // 정원 확인 (취소 제외)
  const { count } = await supabaseAdmin
    .from("vibecoding_applications")
    .select("*", { count: "exact", head: true })
    .in("status", ["pending", "confirmed"]);

  if ((count || 0) >= 20) {
    return NextResponse.json({ error: "정원이 마감되었습니다." }, { status: 400 });
  }

  const selectedCourse = course || "A";
  const FEE_TEXT = "290,000원";

  const { error } = await supabaseAdmin
    .from("vibecoding_applications")
    .insert({
      name,
      phone,
      age: age || null,
      occupation: occupation || null,
      idea: idea || null,
      course: selectedCourse,
      experience: experience || null,
      how_found: how_found || null,
      preferred_date: preferred_date || null,
      program: "vibe-coding-basic",
      status: "pending",
    });

  if (error) {
    return NextResponse.json({ error: "신청 저장 실패: " + error.message }, { status: 500 });
  }

  const newCount = (count || 0) + 1;
  const applicantPhone = phone.replace(/[^0-9]/g, "");

  // SMS 발송 (실패해도 신청은 성공 처리)
  try {
    // 1. 신청자에게 결제 요청 문자
    const applicantMsg = `안녕하세요, ${name}님!
달팽이아지트 바이브코딩 워크숍에 신청해주셔서 감사합니다 🙌

■ 프로그램: 바이브코딩 워크숍 (6시간)
■ 장소: 달팽이아지트펜션 (전북 완주군 소양면 해월신왕길 92)
■ 참가비: ${FEE_TEXT}

━━ 💳 결제 안내 ━━
입금계좌: 카카오뱅크 3333-06-4749542 임솔
입금금액: ${FEE_TEXT}
입금자명: ${name}

※ 입금해주시면 예약이 최종 확정됩니다.
※ 확정 후 워크숍 전 1:1 원격 세팅 안내를 별도로 드리겠습니다.

문의: 010-8531-9531 (임솔)
감사합니다 :)`;

    // 2. 관리자(임솔)에게만 알림 문자
    const adminMsg = `[바이브코딩 새 신청]
■ 이름: ${name}
■ 연락처: ${phone}
■ 나이: ${age || "-"}
■ 하시는 일: ${occupation || "-"}
■ 만들고 싶은 것: ${idea || "-"}
■ AI 경험: ${experience || "-"}
■ 경로: ${how_found || "-"}

현재 ${newCount}/20명
⏳ 입금 대기 (카카오뱅크 3333-06-4749542)`;

    await Promise.allSettled([
      messageService.sendOne({ to: applicantPhone, from: SENDER, text: applicantMsg, type: "LMS", subject: "바이브코딩 결제 요청" }),
      messageService.sendOne({ to: ADMIN_SOL, from: SENDER, text: adminMsg, type: "LMS", subject: "바이브코딩 새 신청" }),
    ]);
  } catch (smsErr) {
    console.error("바이브코딩 SMS 발송 실패:", smsErr);
  }

  return NextResponse.json({ success: true, count: newCount, max: 20 });
}
