// 입실 1일 전 자동 리마인더
// 매일 09:00 KST(00:00 UTC) 실행
// 손님 + 운영자 4명에게 발송

import { NextRequest, NextResponse } from "next/server";
import { SolapiMessageService } from "solapi";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { buildDayBeforeMessage } from "@/lib/reminder-templates";

const OWNER_NUMBERS = ["01085319531", "01053140146", "01046968497", "01046965529"];

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

function tomorrowKST(): string {
  // KST 기준 내일 날짜 YYYY-MM-DD
  const now = new Date();
  const kstNow = new Date(now.getTime() + 9 * 60 * 60 * 1000);
  kstNow.setUTCDate(kstNow.getUTCDate() + 1);
  return kstNow.toISOString().slice(0, 10);
}

function fmtDateKr(iso: string): string {
  const [y, m, d] = iso.split("-").map(Number);
  return `${y}년 ${m}월 ${d}일`;
}

export async function GET(req: NextRequest) {
  // Cron 인증
  const auth = req.headers.get("authorization") || "";
  const token = auth.replace(/^Bearer\s+/i, "");
  if (token !== (process.env.CRON_SECRET || "")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const target = tomorrowKST();
  const sender = (process.env.SOLAPI_SENDER || "").trim();

  // 내일 체크인 + 아직 D-1 발송 안 된 예약
  const { data: reservations, error } = await supabaseAdmin
    .from("reservations")
    .select("id, guest_name, guest_phone, reservation_date, stay_nights, guest_count, program_type, purpose, bus_pickup_info, reminder_d1_sent_at")
    .eq("reservation_date", target)
    .not("status", "in", "(cancelled,rejected)")
    .is("reminder_d1_sent_at", null);

  if (error) {
    console.error("[reminder-d1] DB 조회 실패:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  if (!reservations || reservations.length === 0) {
    return NextResponse.json({ ok: true, target, sent: 0, message: "대상 예약 없음" });
  }

  const results: Array<{ id: number; ok: boolean; error?: string }> = [];

  for (const r of reservations) {
    try {
      const programLabel = PROGRAM_LABELS[r.program_type] || r.program_type;
      const customerPhone = (r.guest_phone || "").replace(/[^0-9]/g, "");
      const dateKr = fmtDateKr(r.reservation_date);

      // 버스 정보 추출 (bus_pickup_info JSON에서)
      let busPickupPlace: string | null = null;
      let busPickupTime: string | null = null;
      try {
        if (r.bus_pickup_info) {
          const info = typeof r.bus_pickup_info === "string" ? JSON.parse(r.bus_pickup_info) : r.bus_pickup_info;
          busPickupPlace = info.place || info.pickupPlace || null;
          busPickupTime = info.time || info.pickupTime || null;
        }
      } catch {}

      const customerMsg = buildDayBeforeMessage({
        guestName: r.guest_name,
        reservationDate: dateKr,
        stayNights: r.stay_nights || 1,
        guestCount: r.guest_count || 0,
        programLabel,
        purpose: r.purpose,
        busPickupPlace,
        busPickupTime,
      });

      const ownerMsg = `[달팽이아지트 운영] 내일 입실 안내

내일 손님이 오십니다 🐌

■ 예약자: ${r.guest_name} (${r.guest_phone})
■ 날짜: ${dateKr} (${r.stay_nights || 1}박)
■ 인원: ${r.guest_count}명
■ 프로그램: ${programLabel}${r.purpose ? ` · ${r.purpose}` : ""}
${busPickupPlace ? `■ 버스: ${busPickupPlace} ${busPickupTime || ""}\n` : ""}
체크인 준비 + 키패드 비밀번호 6시간 전 자동 안내됩니다.

— 자동 알림`;

      // 손님 발송
      if (customerPhone) {
        await messageService.sendOne({
          to: customerPhone, from: sender, text: customerMsg, type: "LMS",
          subject: "달팽이아지트 입실 1일 전 안내",
        });
      }

      // 운영자 4명 발송
      for (const num of OWNER_NUMBERS) {
        await messageService.sendOne({
          to: num, from: sender, text: ownerMsg, type: "LMS",
          subject: "[운영] D-1 알림",
        });
      }

      // 발송 기록
      await supabaseAdmin
        .from("reservations")
        .update({ reminder_d1_sent_at: new Date().toISOString() })
        .eq("id", r.id);

      results.push({ id: r.id, ok: true });
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      console.error(`[reminder-d1] id=${r.id} 실패:`, msg);
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
