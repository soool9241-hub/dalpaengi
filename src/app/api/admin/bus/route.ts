import { NextRequest, NextResponse } from "next/server";
import { verifyRequest } from "@/lib/admin-auth";
import { supabaseAdmin } from "@/lib/supabase-admin";

export async function GET(req: NextRequest) {
  if (!(await verifyRequest(req))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const status = req.nextUrl.searchParams.get("status"); // pending | confirmed | completed | all
  const search = req.nextUrl.searchParams.get("search");

  // bus_requests + reservations 조인
  let query = supabaseAdmin
    .from("bus_requests")
    .select("*, reservations!inner(id, guest_name, guest_phone, reservation_date, checkout_date, stay_nights, guest_count, extra_guests, program_type, status, notes)");

  if (status && status !== "all") {
    query = query.eq("status", status);
  }

  if (search) {
    query = query.or(`reservations.guest_name.ilike.%${search}%,reservations.guest_phone.ilike.%${search}%`);
  }

  query = query.order("created_at", { ascending: false });

  const { data, error } = await query;

  if (error) {
    console.error("버스 목록 조회 에러:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ data: data || [] });
}

export async function PATCH(req: NextRequest) {
  if (!(await verifyRequest(req))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const { id, ...updates } = body;
  if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });

  const allowed = [
    "status", "manager_name", "manager_phone",
    "pickup_place", "pickup_people", "pickup_time",
    "dropoff_place", "dropoff_people", "dropoff_time",
    "driver_name", "driver_phone", "bus_number",
  ];
  const filtered: Record<string, unknown> = {};
  for (const key of allowed) {
    if (key in updates) filtered[key] = updates[key];
  }

  const { error } = await supabaseAdmin.from("bus_requests").update(filtered).eq("id", id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ success: true });
}

export async function DELETE(req: NextRequest) {
  if (!(await verifyRequest(req))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id, reservation_id } = await req.json();
  if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });

  const { error } = await supabaseAdmin.from("bus_requests").delete().eq("id", id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  // reservations 테이블의 bus_requested도 false로
  if (reservation_id) {
    await supabaseAdmin.from("reservations").update({ bus_requested: false, updated_at: new Date().toISOString() }).eq("id", reservation_id);
  }

  return NextResponse.json({ success: true });
}
