import { NextRequest, NextResponse } from "next/server";
import { verifyRequest } from "@/lib/admin-auth";
import { supabaseAdmin } from "@/lib/supabase-admin";

export async function GET(req: NextRequest) {
  if (!(await verifyRequest(req))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // 버스 요청 단건 조회
  const busReservationId = req.nextUrl.searchParams.get("bus_reservation_id");
  if (busReservationId) {
    const { data: busRequest } = await supabaseAdmin
      .from("bus_requests")
      .select("*")
      .eq("reservation_id", parseInt(busReservationId))
      .limit(1)
      .single();
    return NextResponse.json({ bus_request: busRequest || null });
  }

  // 자동 상태 업데이트
  const today = new Date().toISOString().split("T")[0];
  const nowISO = new Date().toISOString();

  // 1) 체크아웃 지난 예약 → 방문완료
  await supabaseAdmin
    .from("reservations")
    .update({ status: "visited", updated_at: nowISO })
    .in("status", ["confirmed", "upcoming"])
    .lt("checkout_date", today);

  // 2) 입실일이 오늘 이후인 confirmed → 방문예정
  await supabaseAdmin
    .from("reservations")
    .update({ status: "upcoming", updated_at: nowISO })
    .eq("status", "confirmed")
    .gte("reservation_date", today);

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

  const { id, bus_form, ...updates } = await req.json();
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

  // 버스 렌트 요청 upsert
  if (bus_form && updates.bus_requested) {
    const busData = {
      reservation_id: id,
      manager_name: bus_form.managerName || "",
      manager_phone: bus_form.managerPhone || "",
      pickup_place: bus_form.pickupPlace === "기타" ? bus_form.customPickup : bus_form.pickupPlace,
      pickup_people: bus_form.pickupPeople || "",
      pickup_time: bus_form.pickupTime || "",
      dropoff_place: bus_form.pickupPlace === "기타" ? bus_form.customDropoff : bus_form.pickupPlace,
      dropoff_people: bus_form.dropoffPeople || "",
      dropoff_time: bus_form.dropoffTime || "",
    };

    // 기존 bus_request 확인
    const { data: existing } = await supabaseAdmin
      .from("bus_requests")
      .select("id")
      .eq("reservation_id", id)
      .limit(1)
      .single();

    if (existing) {
      await supabaseAdmin.from("bus_requests").update(busData).eq("id", existing.id);
    } else {
      await supabaseAdmin.from("bus_requests").insert(busData);
    }
  } else if (updates.bus_requested === false) {
    // 버스 요청 해제 시 bus_requests 삭제
    await supabaseAdmin.from("bus_requests").delete().eq("reservation_id", id);
  }

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
