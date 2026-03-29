import { NextRequest, NextResponse } from "next/server";
import { verifyRequest } from "@/lib/admin-auth";
import { supabaseAdmin } from "@/lib/supabase-admin";

export async function POST(req: NextRequest) {
  if (!(await verifyRequest(req))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const {
      guestName, guestPhone, reservationDate, stayNights,
      guestCount, extraGuests,
      managerName, managerPhone,
      pickupPlace, pickupPeople, pickupTime, pickupDetail,
      dropoffPlace, dropoffPeople, dropoffTime, dropoffDetail,
      driverName, driverPhone, busNumber, busMode,
    } = body;

    if (!guestName || !guestPhone || !reservationDate || !pickupPlace) {
      return NextResponse.json({ error: "필수 항목이 누락되었습니다." }, { status: 400 });
    }

    // 인원 계산 (최대 45명)
    const totalPeople = Math.min((parseInt(guestCount) || 15) + (parseInt(extraGuests) || 0), 45);
    const baseCount = Math.min(totalPeople, 15);
    const extraCount = Math.max(totalPeople - 15, 0);

    // 1) 해당 고객의 기존 예약이 있는지 확인 (같은 날짜 + 이름 + 전화번호)
    const phone = guestPhone.replace(/[^0-9]/g, "");
    const { data: existingRes } = await supabaseAdmin
      .from("reservations")
      .select("id")
      .eq("guest_phone", phone)
      .eq("reservation_date", reservationDate)
      .neq("status", "cancelled")
      .limit(1);

    let reservationId: number;

    if (existingRes && existingRes.length > 0) {
      // 기존 예약에 연결 + 인원 업데이트
      reservationId = existingRes[0].id;
      await supabaseAdmin.from("reservations").update({
        bus_requested: true,
        guest_count: baseCount,
        extra_guests: extraCount,
        updated_at: new Date().toISOString(),
      }).eq("id", reservationId);
    } else {
      // 새 예약 생성
      const nights = parseInt(stayNights) || 1;
      const checkoutDate = new Date(reservationDate);
      checkoutDate.setDate(checkoutDate.getDate() + nights);
      const checkoutStr = checkoutDate.toISOString().split("T")[0];

      const { data: newRes, error: resErr } = await supabaseAdmin
        .from("reservations")
        .insert({
          guest_name: guestName,
          guest_phone: phone,
          reservation_date: reservationDate,
          checkout_date: checkoutStr,
          stay_nights: nights,
          guest_count: baseCount,
          extra_guests: extraCount,
          program_type: "stay",
          bus_requested: true,
          status: "confirmed",
          source: "admin_bus",
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .select("id")
        .single();

      if (resErr || !newRes) {
        console.error("예약 생성 실패:", resErr);
        return NextResponse.json({ error: "예약 생성 실패: " + (resErr?.message || "unknown") }, { status: 500 });
      }
      reservationId = newRes.id;
    }

    // 2) bus_requests에 저장
    const busData = {
      reservation_id: reservationId,
      manager_name: managerName || "",
      manager_phone: managerPhone || "",
      pickup_place: pickupPlace === "기타" ? (pickupDetail || "기타") : pickupPlace,
      pickup_people: pickupPeople || "",
      pickup_time: pickupTime || "",
      pickup_detail: pickupDetail || "",
      dropoff_place: busMode === "roundtrip" ? (dropoffPlace || pickupPlace) : "",
      dropoff_people: busMode === "roundtrip" ? (dropoffPeople || "") : "",
      dropoff_time: busMode === "roundtrip" ? (dropoffTime || "") : "",
      dropoff_detail: busMode === "roundtrip" ? (dropoffDetail || "") : "",
      driver_name: driverName || "",
      driver_phone: driverPhone || "",
      bus_number: busNumber || "",
      status: "pending",
    };

    // 기존 bus_request가 있으면 업데이트, 없으면 삽입
    const { data: existingBus } = await supabaseAdmin
      .from("bus_requests")
      .select("id")
      .eq("reservation_id", reservationId);

    if (existingBus && existingBus.length > 0) {
      const { error: upErr } = await supabaseAdmin
        .from("bus_requests")
        .update(busData)
        .eq("reservation_id", reservationId);
      if (upErr) {
        console.error("bus_requests 업데이트 실패:", upErr);
        return NextResponse.json({ error: "버스 데이터 업데이트 실패" }, { status: 500 });
      }
    } else {
      const { error: insErr } = await supabaseAdmin
        .from("bus_requests")
        .insert(busData);
      if (insErr) {
        console.error("bus_requests 생성 실패:", insErr);
        return NextResponse.json({ error: "버스 데이터 생성 실패: " + insErr.message }, { status: 500 });
      }
    }

    return NextResponse.json({ success: true, reservationId });
  } catch (e) {
    console.error("버스 신규 등록 오류:", e);
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
