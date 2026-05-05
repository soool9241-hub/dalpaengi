import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      guestName, guestPhone, reservationDate, checkoutDate, stayNights,
      totalGuests, extraGuests, programType, bbqGrills, gasRanges,
      dinnerCount, breakfastCount, breakfastMenu, woodcraftCount, potBbqCount, busRequested, busForm, busStopover,
      selectedTimeSlot, totalPrice, notes, purpose, purposeRaw,
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

    // 2. 중복 예약 방지 - 같은 날짜 범위에 다른 숙박/힐링 예약이 있는지 확인
    //    [reservation_date, checkout_date) 반개구간 기준 (체크아웃 당일 새 체크인 허용 - 에어비앤비 방식)
    //    두 구간이 겹치려면: existing.ci < new.co AND existing.co > new.ci
    const isRangeProgram = programType === "stay" || programType === "healing";
    if (isRangeProgram && reservationDate && checkoutDate) {
      const { data: conflicts, error: confErr } = await supabaseAdmin
        .from("reservations")
        .select("id, guest_name, reservation_date, checkout_date, program_type, status")
        .neq("status", "cancelled")
        .in("program_type", ["stay", "healing"])
        .lt("reservation_date", checkoutDate)
        .gt("checkout_date", reservationDate);

      if (confErr) {
        console.error("중복 체크 실패:", confErr);
      } else if (conflicts && conflicts.length > 0) {
        const first = conflicts[0];
        console.warn("중복 예약 차단:", {
          new: { guest: guestName, from: reservationDate, to: checkoutDate },
          existing: first,
        });
        return NextResponse.json(
          {
            error: `해당 기간(${reservationDate} ~ ${checkoutDate})은 이미 예약되어 있습니다.\n다른 날짜를 선택해주세요.`,
            code: "DATE_CONFLICT",
            conflict: {
              reservation_date: first.reservation_date,
              checkout_date: first.checkout_date,
            },
          },
          { status: 409 }
        );
      }
    }

    // 3. 예약 생성
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
      // extra_guests는 항상 0으로 저장.
      // 이유: DB trigger가 total_amount = stay + (guest_count-15)*10k + extra_guests*10k + 옵션 으로 계산.
      // extraGuests를 따로 저장하면 (guest_count-15)와 이중 카운트되어 가격 부풀림 (2026-05 대량 사고 발생).
      extra_guests: 0,
      dinner_count: dinnerCount,
      woodcraft_count: woodcraftCount,
      pot_bbq_count: potBbqCount,
      bus_requested: busRequested,
      time_slot: selectedTimeSlot || null,
      purpose: purpose || null,
      purpose_raw: purposeRaw || purpose || null,
      referral_source: "website",
      source: "website",
      status: reservationDate >= new Date().toISOString().split("T")[0] ? "upcoming" : "confirmed",
      notes,
    };

    // 1차 시도: 새 컬럼 포함 (breakfast_count, breakfast_menu)
    let inserted: { id: number } | null = null;
    let resErr: { message?: string; code?: string } | null = null;
    {
      const res = await supabaseAdmin
        .from("reservations")
        .insert({
          ...reservationData,
          breakfast_count: breakfastCount || 0,
          breakfast_menu: breakfastMenu || null,
        })
        .select("id")
        .single();
      inserted = res.data;
      resErr = res.error;
    }

    // 2차 시도: 새 컬럼이 DB에 없으면 제외하고 재시도
    if (resErr && String(resErr.message || "").toLowerCase().includes("breakfast")) {
      console.warn("breakfast 컬럼 없음 - 제외 후 재시도");
      const res2 = await supabaseAdmin
        .from("reservations")
        .insert(reservationData)
        .select("id")
        .single();
      inserted = res2.data;
      resErr = res2.error;
    }

    if (resErr || !inserted) {
      console.error("예약 저장 실패:", resErr);
      return NextResponse.json({ error: "예약 저장 실패: " + (resErr?.message || "unknown") }, { status: 500 });
    }

    // 3. 버스 렌트 요청
    if (busRequested && busForm) {
      const actualPickup = busForm.pickupPlace === "기타" ? busForm.customPickup : busForm.pickupPlace;
      const actualDropoff = busForm.pickupPlace === "기타" ? busForm.customDropoff : busForm.pickupPlace;
      const stopoverText = Array.isArray(busStopover) && busStopover.length > 0
        ? busStopover.filter((s: { place: string; time: string }) => s.place?.trim()).map((s: { place: string; time: string }) => `${s.place}(${s.time || "시간미정"})`).join(" → ")
        : null;
      const baseBus = {
        reservation_id: inserted.id,
        manager_name: busForm.managerName,
        manager_phone: busForm.managerPhone,
        pickup_place: actualPickup,
        pickup_people: busForm.pickupPeople,
        pickup_time: busForm.pickupTime,
        dropoff_place: actualDropoff,
        dropoff_people: busForm.dropoffPeople,
        dropoff_time: busForm.dropoffTime,
      };
      // 1차: stopover_text 포함
      let { error: busErr } = await supabaseAdmin.from("bus_requests").insert({
        ...baseBus,
        stopover_text: stopoverText,
      });
      // 2차: stopover_text 컬럼 없으면 제외 후 재시도
      if (busErr && String(busErr.message || "").toLowerCase().includes("stopover")) {
        console.warn("stopover_text 컬럼 없음 - 제외 후 재시도");
        const retry = await supabaseAdmin.from("bus_requests").insert(baseBus);
        busErr = retry.error;
      }
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
