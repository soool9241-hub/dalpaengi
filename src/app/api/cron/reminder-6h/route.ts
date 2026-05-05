// 입실 6시간 전 길안내 + 키패드 비밀번호
// 매시 정각 실행. 체크인 시각 = reservation_date 15:00 KST 기준.
// 손님에게만 발송 (길안내 목적)

import { NextRequest, NextResponse } from "next/server";
import { SolapiMessageService } from "solapi";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { buildSixHourMessage } from "@/lib/reminder-templates";

const messageService = new SolapiMessageService(
  (process.env.SOLAPI_API_KEY || "").trim(),
  (process.env.SOLAPI_API_SECRET || "").trim()
);

const PROGRAM_LABELS: Record<string, string> = {
  stay: "숙박",
  half: "3시간 대여",
  daynight: "주/야간",
  healing: "힐링캠프",
};

function todayKST(): string {
  const kst = new Date(Date.now() + 9 * 60 * 60 * 1000);
  return kst.toISOString().slice(0, 10);
}

function nowKstHour(): number {
  const kst = new Date(Date.now() + 9 * 60 * 60 * 1000);
  return kst.getUTCHours();
}

function fmtDateKr(iso: string): string {
  const [y, m, d] = iso.split("-").map(Number);
  return `${y}년 ${m}월 ${d}일`;
}

export async function GET(req: NextRequest) {
  const auth = req.headers.get("authorization") || "";
  const token = auth.replace(/^Bearer\s+/i, "");
  if (token !== (process.env.CRON_SECRET || "")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // 체크인은 15:00 KST. 6시간 전 = 09:00 KST. 즉 9시 정각 cron이 발송.
  // 매시 cron이라도 9시 한 번만 발송하도록 시간 체크.
  const hour = nowKstHour();
  if (hour !== 9) {
    return NextResponse.json({ ok: true, skipped: `현재 KST ${hour}시 (9시에만 발송)` });
  }

  const target = todayKST(); // 오늘 입실 = 오늘 15:00 - 6h = 오늘 9:00
  const sender = (process.env.SOLAPI_SENDER || "").trim();

  const { data: reservations, error } = await supabaseAdmin
    .from("reservations")
    .select("id, guest_name, guest_phone, reservation_date, stay_nights, guest_count, program_type, purpose, bus_pickup_info, reminder_6h_sent_at")
    .eq("reservation_date", target)
    .not("status", "in", "(cancelled,rejected)")
    .is("reminder_6h_sent_at", null);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  if (!reservations || reservations.length === 0) {
    return NextResponse.json({ ok: true, target, sent: 0, message: "대상 예약 없음" });
  }

  const keypadCode = process.env.PENSION_KEYPAD_CODE || null;
  const results: Array<{ id: number; ok: boolean; error?: string }> = [];

  for (const r of reservations) {
    try {
      const programLabel = PROGRAM_LABELS[r.program_type] || r.program_type;
      const customerPhone = (r.guest_phone || "").replace(/[^0-9]/g, "");
      const dateKr = fmtDateKr(r.reservation_date);

      let busPickupPlace: string | null = null;
      let busPickupTime: string | null = null;
      try {
        if (r.bus_pickup_info) {
          const info = typeof r.bus_pickup_info === "string" ? JSON.parse(r.bus_pickup_info) : r.bus_pickup_info;
          busPickupPlace = info.place || info.pickupPlace || null;
          busPickupTime = info.time || info.pickupTime || null;
        }
      } catch {}

      const msg = buildSixHourMessage({
        guestName: r.guest_name,
        reservationDate: dateKr,
        stayNights: r.stay_nights || 1,
        guestCount: r.guest_count || 0,
        programLabel,
        purpose: r.purpose,
        busPickupPlace,
        busPickupTime,
        keypadCode,
      });

      if (customerPhone) {
        await messageService.sendOne({
          to: customerPhone, from: sender, text: msg, type: "LMS",
          subject: "달팽이아지트 입실 안내",
        });
      }

      await supabaseAdmin
        .from("reservations")
        .update({ reminder_6h_sent_at: new Date().toISOString() })
        .eq("id", r.id);

      results.push({ id: r.id, ok: true });
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      console.error(`[reminder-6h] id=${r.id} 실패:`, msg);
      results.push({ id: r.id, ok: false, error: msg });
    }
  }

  return NextResponse.json({
    ok: true,
    target,
    found: reservations.length,
    sent: results.filter((r) => r.ok).length,
    failed: results.filter((r) => !r.ok).length,
    results,
  });
}
