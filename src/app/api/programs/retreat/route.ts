import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";

// GET: 현재 신청 수 조회
export async function GET() {
  const { count } = await supabaseAdmin
    .from("retreat_applications")
    .select("*", { count: "exact", head: true });

  return NextResponse.json({ count: count || 0, max: 20 });
}

// POST: 신청 접수
export async function POST(req: NextRequest) {
  const body = await req.json();
  const { name, phone, age, gender, occupation, reason } = body;

  if (!name || !phone) {
    return NextResponse.json({ error: "이름과 연락처는 필수입니다." }, { status: 400 });
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

  // 정원 확인
  const { count } = await supabaseAdmin
    .from("retreat_applications")
    .select("*", { count: "exact", head: true });

  if ((count || 0) >= 20) {
    return NextResponse.json({ error: "정원이 마감되었습니다." }, { status: 400 });
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
      program: "spring-retreat-2026",
      status: "pending",
    });

  if (error) {
    return NextResponse.json({ error: "신청 저장 실패: " + error.message }, { status: 500 });
  }

  const newCount = (count || 0) + 1;
  return NextResponse.json({ success: true, count: newCount, max: 20 });
}
