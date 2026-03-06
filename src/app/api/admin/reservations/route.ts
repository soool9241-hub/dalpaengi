import { NextRequest, NextResponse } from "next/server";
import { verifyRequest } from "@/lib/admin-auth";
import { supabaseAdmin } from "@/lib/supabase-admin";

export async function GET(req: NextRequest) {
  if (!(await verifyRequest(req))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // 자동 상태 업데이트: 체크아웃 날짜 지난 confirmed/upcoming → visited
  const today = new Date().toISOString().split("T")[0];
  await supabaseAdmin
    .from("reservations")
    .update({ status: "visited", updated_at: new Date().toISOString() })
    .in("status", ["confirmed", "upcoming"])
    .lt("checkout_date", today);

  const url = req.nextUrl.searchParams;
  const status = url.get("status");
  const program = url.get("program");
  const from = url.get("from");
  const to = url.get("to");
  const search = url.get("search");
  const page = parseInt(url.get("page") || "0");
  const pageSize = 20;
  const sort = url.get("sort") || "reservation_date";
  const order = url.get("order") || "desc";

  let query = supabaseAdmin
    .from("reservations")
    .select("*", { count: "exact" });

  if (status && status !== "all") query = query.eq("status", status);
  if (program && program !== "all") query = query.eq("program_type", program);
  if (from) query = query.gte("reservation_date", from);
  if (to) query = query.lte("reservation_date", to);
  if (search) query = query.or(`guest_name.ilike.%${search}%,guest_phone.ilike.%${search}%`);

  query = query
    .order(sort, { ascending: order === "asc" })
    .range(page * pageSize, (page + 1) * pageSize - 1);

  const { data, count, error } = await query;

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ data: data || [], total: count || 0, page, pageSize });
}

export async function PATCH(req: NextRequest) {
  if (!(await verifyRequest(req))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id, ...updates } = await req.json();
  if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });

  const allowed = [
    "status", "notes", "guest_count", "extra_guests",
    "bbq_count", "burner_count", "dinner_count", "woodcraft_count",
    "pot_bbq_count", "bus_requested", "stay_nights", "reservation_date",
    "checkout_date", "time_slot", "program_type", "guest_name", "guest_phone",
  ];
  const filtered: Record<string, unknown> = {};
  for (const key of allowed) {
    if (key in updates) filtered[key] = updates[key];
  }
  filtered.updated_at = new Date().toISOString();

  const { error } = await supabaseAdmin.from("reservations").update(filtered).eq("id", id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ success: true });
}

export async function DELETE(req: NextRequest) {
  if (!(await verifyRequest(req))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await req.json();
  if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });

  // 연결된 bus_requests 먼저 삭제
  await supabaseAdmin.from("bus_requests").delete().eq("reservation_id", id);
  const { error } = await supabaseAdmin.from("reservations").delete().eq("id", id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ success: true });
}
