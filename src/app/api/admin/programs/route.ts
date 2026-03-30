import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { SolapiMessageService } from "solapi";

const messageService = new SolapiMessageService(
  (process.env.SOLAPI_API_KEY || "").trim(),
  (process.env.SOLAPI_API_SECRET || "").trim()
);
const SENDER = (process.env.SOLAPI_SENDER || "").trim();

// 프로그램 목록 정의 (향후 프로그램 추가 시 여기에 추가)
const PROGRAMS: Record<string, { label: string; maxCapacity: number }> = {
  "spring-retreat-2026": { label: "완주하다 봄 리트릿 2026", maxCapacity: 20 },
};

// GET: 프로그램별 신청자 목록 조회
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const program = searchParams.get("program"); // 특정 프로그램 필터
  const search = searchParams.get("search") || "";

  let query = supabaseAdmin
    .from("retreat_applications")
    .select("*")
    .order("created_at", { ascending: false });

  if (program) {
    query = query.eq("program", program);
  }

  if (search) {
    query = query.or(`name.ilike.%${search}%,phone.ilike.%${search}%`);
  }

  const { data, error } = await query;

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // 프로그램별 통계
  const stats: Record<string, { total: number; pending: number; confirmed: number; cancelled: number }> = {};
  for (const row of data || []) {
    if (!stats[row.program]) {
      stats[row.program] = { total: 0, pending: 0, confirmed: 0, cancelled: 0 };
    }
    stats[row.program].total++;
    if (row.status === "pending") stats[row.program].pending++;
    else if (row.status === "confirmed") stats[row.program].confirmed++;
    else if (row.status === "cancelled") stats[row.program].cancelled++;
  }

  return NextResponse.json({ data, stats, programs: PROGRAMS });
}

// POST: 수동 신청자 추가
export async function POST(req: NextRequest) {
  const body = await req.json();
  const { name, phone, age, gender, occupation, reason, program, status } = body;

  if (!name || !phone) {
    return NextResponse.json({ error: "이름과 연락처는 필수입니다." }, { status: 400 });
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
      program: program || "spring-retreat-2026",
      status: status || "confirmed",
    });

  if (error) {
    return NextResponse.json({ error: "추가 실패: " + error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}

// PATCH: 신청자 상태 변경
export async function PATCH(req: NextRequest) {
  const body = await req.json();
  const { id, status, memo } = body;

  if (!id) {
    return NextResponse.json({ error: "id가 필요합니다." }, { status: 400 });
  }

  // 상태 변경 전 신청자 정보 조회 (SMS용)
  const { data: appData } = await supabaseAdmin
    .from("retreat_applications")
    .select("*")
    .eq("id", id)
    .single();

  const updateData: Record<string, string> = {};
  if (status) updateData.status = status;
  if (memo !== undefined) updateData.memo = memo;

  const { error } = await supabaseAdmin
    .from("retreat_applications")
    .update(updateData)
    .eq("id", id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // 확정 시 신청자에게 확정 문자 발송
  if (status === "confirmed" && appData?.phone) {
    try {
      const phone = appData.phone.replace(/[^0-9]/g, "");
      const msg = `안녕하세요, ${appData.name}님!
완주하다 봄 리트릿 참가가 확정되었습니다.

■ 프로그램: 완주하다 봄 리트릿
■ 일시: 2026.4.18(토) ~ 19(일) 1박2일
■ 장소: 전북 완주

입금이 확인되어 참가가 최종 확정되었습니다.
당일 현장에서 뵙겠습니다!

문의: 010-5314-0146
감사합니다 :)`;

      await messageService.sendOne({
        to: phone, from: SENDER, text: msg, type: "LMS", subject: "봄 리트릿 참가 확정"
      });
    } catch (smsErr) {
      console.error("확정 SMS 발송 실패:", smsErr);
    }
  }

  return NextResponse.json({ success: true });
}

// DELETE: 신청자 삭제
export async function DELETE(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");

  if (!id) {
    return NextResponse.json({ error: "id가 필요합니다." }, { status: 400 });
  }

  const { error } = await supabaseAdmin
    .from("retreat_applications")
    .delete()
    .eq("id", Number(id));

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
