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
    try {
      const { data: busData, error: busErr } = await supabaseAdmin
        .from("bus_requests")
        .select("*")
        .eq("reservation_id", parseInt(busReservationId));

      if (busErr) {
        console.error("bus_requests 조회 에러:", busErr);
        return NextResponse.json({ bus_request: null, error: busErr.message });
      }
      return NextResponse.json({ bus_request: busData && busData.length > 0 ? busData[0] : null });
    } catch (e) {
      console.error("bus_requests 조회 예외:", e);
      return NextResponse.json({ bus_request: null, error: String(e) });
    }
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

  const body = await req.json();
  const { id, bus_form } = body;
  if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });

  // reservation 업데이트
  const allowed = [
    "status", "notes", "guest_count", "extra_guests",
    "bbq_count", "burner_count", "dinner_count", "woodcraft_count",
    "pot_bbq_count", "bus_requested", "stay_nights", "reservation_date",
    "checkout_date", "time_slot", "program_type", "guest_name", "guest_phone",
  ];
  const filtered: Record<string, unknown> = {};
  for (const key of allowed) {
    if (key in body) filtered[key] = body[key];
  }
  filtered.updated_at = new Date().toISOString();

  const { error } = await supabaseAdmin.from("reservations").update(filtered).eq("id", id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const busErrors: string[] = [];

  // 버스 렌트 저장
  if (bus_form && body.bus_requested === true) {
    const busData = {
      reservation_id: id,
      manager_name: bus_form.managerName || "",
      manager_phone: bus_form.managerPhone || "",
      pickup_place: bus_form.pickupPlace === "기타" ? (bus_form.customPickup || "") : (bus_form.pickupPlace || ""),
      pickup_people: bus_form.pickupPeople || "",
      pickup_time: bus_form.pickupTime || "",
      dropoff_place: bus_form.dropoffPlace === "기타" ? (bus_form.customDropoff || "") : (bus_form.dropoffPlace || bus_form.pickupPlace || ""),
      dropoff_people: bus_form.dropoffPeople || "",
      dropoff_time: bus_form.dropoffTime || "",
    };

    console.log("버스 데이터 저장 시도:", JSON.stringify(busData));

    // 먼저 기존 데이터 확인
    const { data: existingRows, error: findErr } = await supabaseAdmin
      .from("bus_requests")
      .select("id")
      .eq("reservation_id", id);

    if (findErr) {
      console.error("bus_requests 조회 실패:", findErr);
      busErrors.push("bus 조회 실패: " + findErr.message);
    }

    if (existingRows && existingRows.length > 0) {
      // UPDATE
      const { error: upErr } = await supabaseAdmin
        .from("bus_requests")
        .update(busData)
        .eq("reservation_id", id);
      if (upErr) {
        console.error("bus_requests UPDATE 실패:", upErr);
        busErrors.push("bus UPDATE 실패: " + upErr.message);
      } else {
        console.log("bus_requests UPDATE 성공, reservation_id:", id);
      }
    } else {
      // INSERT
      const { error: insErr } = await supabaseAdmin
        .from("bus_requests")
        .insert(busData);
      if (insErr) {
        console.error("bus_requests INSERT 실패:", insErr);
        busErrors.push("bus INSERT 실패: " + insErr.message);
      } else {
        console.log("bus_requests INSERT 성공, reservation_id:", id);
      }
    }
  } else if (body.bus_requested === false) {
    await supabaseAdmin.from("bus_requests").delete().eq("reservation_id", id);
  }

  return NextResponse.json({
    success: true,
    busErrors: busErrors.length > 0 ? busErrors : undefined,
  });
}

export async function DELETE(req: NextRequest) {
  if (!(await verifyRequest(req))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await req.json();
  if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });

  await supabaseAdmin.from("bus_requests").delete().eq("reservation_id", id);
  const { error } = await supabaseAdmin.from("reservations").delete().eq("id", id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ success: true });
}
