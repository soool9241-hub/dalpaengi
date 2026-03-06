import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      guestName, guestPhone, reservationDate, checkoutDate, stayNights,
      totalGuests, extraGuests, programType, bbqGrills, gasRanges,
      dinnerCount, woodcraftCount, potBbqCount, busRequested, busForm,
      selectedTimeSlot, totalPrice, notes, purpose,
    } = body;

    const phone = guestPhone.replace(/[^0-9]/g, "");

    // 1. 고객 생성 또는 조회
    let customerId: number | null = null;
    const { data: existing } = await supabaseAdmin
      .from("customers")
      .select("id")
      .eq("phone", phone)
      .limit(1)
      .single();

    if (existing) {
      customerId = existing.id;
    } else {
      const { data: newCust, error: custErr } = await supabaseAdmin
        .from("customers")
        .insert({
          name: guestName.trim(),
          phone,
          visit_count: 1,
          first_visit: reservationDate,
          last_visit: reservationDate,
          total_guests_brought: totalGuests,
        })
        .select("id")
        .single();

      if (custErr) {
        console.error("고객 생성 실패:", custErr);
        return NextResponse.json({ error: "고객 생성 실패: " + custErr.message }, { status: 500 });
      }
      customerId = newCust.id;
    }

    // 2. 예약 생성
    const reservationData = {
      customer_id: customerId,
      guest_name: guestName.trim(),
      guest_phone: phone,
      reservation_date: reservationDate,
      checkout_date: checkoutDate,
      submitted_at: new Date().toISOString(),
      stay_nights: stayNights,
      guest_count: totalGuests,
      bbq_count: bbqGrills,
      burner_count: gasRanges,
      program_type: programType,
      extra_guests: extraGuests,
      dinner_count: dinnerCount,
      woodcraft_count: woodcraftCount,
      pot_bbq_count: potBbqCount,
      bus_requested: busRequested,
      time_slot: selectedTimeSlot || null,
      purpose: purpose,
      purpose_raw: purpose,
      referral_source: "website",
      source: "website",
      status: reservationDate >= new Date().toISOString().split("T")[0] ? "upcoming" : "confirmed",
      notes,
    };

    const { data: inserted, error: resErr } = await supabaseAdmin
      .from("reservations")
      .insert(reservationData)
      .select("id")
      .single();

    if (resErr || !inserted) {
      console.error("예약 저장 실패:", resErr);
      return NextResponse.json({ error: "예약 저장 실패: " + (resErr?.message || "unknown") }, { status: 500 });
    }

    // 3. 버스 렌트 요청
    if (busRequested && busForm) {
      const actualPickup = busForm.pickupPlace === "기타" ? busForm.customPickup : busForm.pickupPlace;
      const actualDropoff = busForm.pickupPlace === "기타" ? busForm.customDropoff : busForm.pickupPlace;
      const { error: busErr } = await supabaseAdmin.from("bus_requests").insert({
        reservation_id: inserted.id,
        manager_name: busForm.managerName,
        manager_phone: busForm.managerPhone,
        pickup_place: actualPickup,
        pickup_people: busForm.pickupPeople,
        pickup_time: busForm.pickupTime,
        dropoff_place: actualDropoff,
        dropoff_people: busForm.dropoffPeople,
        dropoff_time: busForm.dropoffTime,
      });
      if (busErr) {
        console.error("버스 요청 저장 실패 (예약은 성공):", busErr);
      }
    }

    return NextResponse.json({ success: true, id: inserted.id });
  } catch (e) {
    console.error("Reservation API error:", e);
    return NextResponse.json({ error: "서버 오류: " + String(e) }, { status: 500 });
  }
}
