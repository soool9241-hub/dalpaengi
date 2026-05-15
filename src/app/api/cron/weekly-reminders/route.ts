import { NextRequest, NextResponse } from "next/server";
import { SolapiMessageService } from "solapi";
import { supabaseAdmin } from "@/lib/supabase-admin";

// 매주 금요일 10시 (KST) 발송 — 사장님들께만 (고객 제외)
// Vercel Cron: 매주 금 01:00 UTC = KST 10:00
// Trigger: GET /api/cron/weekly-reminders (CRON_SECRET 인증)

const OWNER_NUMBERS = ["01085319531", "01053140146", "01046968497", "01046965529"];

const messageService = new SolapiMessageService(
  (process.env.SOLAPI_API_KEY || "").trim(),
  (process.env.SOLAPI_API_SECRET || "").trim()
);

const fmt = (n: number) => (n || 0).toLocaleString("ko-KR") + "원";

const PROGRAM_LABEL: Record<string, string> = {
  stay: "숙박", half: "반나절", daynight: "주야간", day: "당일",
};

const PRICE = {
  base: 700000, extra: 10000, grill: 30000, gas: 15000,
  dinner: 10000, breakfast: 10000, pool: 50000, wood: 20000, pot: 30000,
};

interface Reservation {
  id: number;
  guest_name: string;
  guest_phone: string;
  reservation_date: string;
  checkout_date?: string;
  stay_nights?: number;
  guest_count: number;
  extra_guests?: number;
  program_type?: string;
  program_label?: string;
  time_slot?: string | null;
  purpose?: string | null;
  bbq_count?: number;
  burner_count?: number;
  pool_count?: number;
  dinner_count?: number;
  breakfast_count?: number;
  breakfast_menu?: string | null;
  woodcraft_count?: number;
  pot_bbq_count?: number;
  bus_requested?: boolean;
  bus_fee?: number;
  total_amount?: number;
}

interface BusRequest {
  id: number;
  reservation_id: number;
  manager_name?: string;
  manager_phone?: string;
  pickup_place?: string;
  pickup_people?: string;
  pickup_time?: string;
  pickup_detail?: string;
  pickup_detail_address?: string;
  dropoff_place?: string;
  dropoff_people?: string;
  dropoff_time?: string;
  dropoff_detail?: string;
  dropoff_detail_address?: string;
  stopover_text?: string | null;
}

function totalAndBase(r: Reservation) {
  const extra = r.extra_guests || 0;
  const total = extra > 0 ? r.guest_count + extra : r.guest_count;
  const base = r.guest_count;
  return { total, base, extra };
}

function buildLines(r: Reservation): string[] {
  const lines: string[] = [];
  const nights = r.stay_nights || 1;
  const { base } = totalAndBase(r);
  const programLabel = PROGRAM_LABEL[r.program_type || "stay"] || "숙박";
  if (!r.program_type || r.program_type === "stay") {
    lines.push(`• ${programLabel} 기본${base}인 (${nights}박): ${fmt(PRICE.base * nights)}`);
  } else {
    lines.push(`• ${programLabel}`);
  }
  if ((r.extra_guests || 0) > 0)
    lines.push(`• 추가인원 (${r.extra_guests}명 × ${fmt(PRICE.extra)}): ${fmt((r.extra_guests || 0) * PRICE.extra)}`);
  if ((r.bbq_count || 0) > 0)
    lines.push(`• 그릴 대여 (${r.bbq_count}개 × ${fmt(PRICE.grill)}): ${fmt((r.bbq_count || 0) * PRICE.grill)}`);
  if ((r.burner_count || 0) > 0)
    lines.push(`• 가스버너 (${r.burner_count}개 × ${fmt(PRICE.gas)}): ${fmt((r.burner_count || 0) * PRICE.gas)}`);
  if ((r.pool_count || 0) > 0)
    lines.push(`• 🏊 미니수영장 (${r.pool_count}대 × ${fmt(PRICE.pool)}): ${fmt((r.pool_count || 0) * PRICE.pool)}`);
  if ((r.dinner_count || 0) > 0)
    lines.push(`• 저녁식사 (${r.dinner_count}명 × ${fmt(PRICE.dinner)}): ${fmt((r.dinner_count || 0) * PRICE.dinner)}`);
  if ((r.breakfast_count || 0) > 0)
    lines.push(`• 조식${r.breakfast_menu ? ` [${r.breakfast_menu}]` : ""} (${r.breakfast_count}명 × ${fmt(PRICE.breakfast)}): ${fmt((r.breakfast_count || 0) * PRICE.breakfast)}`);
  if ((r.woodcraft_count || 0) > 0)
    lines.push(`• 목공키트 (${r.woodcraft_count}개 × ${fmt(PRICE.wood)}): ${fmt((r.woodcraft_count || 0) * PRICE.wood)}`);
  if ((r.pot_bbq_count || 0) > 0)
    lines.push(`• 항아리BBQ (${r.pot_bbq_count}인분 × ${fmt(PRICE.pot)}): ${fmt((r.pot_bbq_count || 0) * PRICE.pot)}`);
  return lines;
}

function dayLabel(dateStr: string, today: Date): string {
  const d = new Date(dateStr + "T00:00:00");
  const dow = ["일", "월", "화", "수", "목", "금", "토"][d.getDay()];
  const diff = Math.round((d.getTime() - today.getTime()) / 86400000);
  let when = `${dateStr} (${dow})`;
  if (diff === 0) when += " · 오늘";
  else if (diff === 1) when += " · 내일";
  else if (diff === 2) when += " · 모레";
  return when;
}

function buildMessage(r: Reservation, busList: BusRequest[], today: Date): string {
  const lines = buildLines(r);
  const total = r.total_amount || 0;
  const { total: totalGuests, base, extra } = totalAndBase(r);
  const perPerson = totalGuests > 0 ? Math.round(total / totalGuests) : 0;
  const peopleDesc = extra > 0
    ? `${totalGuests}명 (기본 ${base} + 추가 ${extra})`
    : `${totalGuests}명`;
  const programLabel = PROGRAM_LABEL[r.program_type || "stay"] || "숙박";

  let busSection = "";
  if (r.bus_requested && busList.length > 0) {
    busSection = "\n━━ 🚌 버스 렌트 ━━\n";
    for (const b of busList) {
      const vehicle = b.pickup_detail || b.dropoff_detail || "미지정";
      busSection += `• 담당자: ${b.manager_name || "-"} (${b.manager_phone || "-"})\n`;
      busSection += `• 최종 차량: ${vehicle}\n`;
      busSection += `• 승차: ${b.pickup_place || "-"} ${b.pickup_time || ""} (${b.pickup_people || "-"}명)\n`;
      if (b.pickup_detail_address) busSection += `  ↳ 세부 장소: ${b.pickup_detail_address}\n`;
      if (b.stopover_text) busSection += `• 경유: ${b.stopover_text}\n`;
      busSection += `• 하차: ${b.dropoff_place || b.pickup_place || "-"} ${b.dropoff_time || ""} (${b.dropoff_people || "-"}명)\n`;
      if (b.dropoff_detail_address) busSection += `  ↳ 세부 장소: ${b.dropoff_detail_address}\n`;
      if (r.bus_fee) busSection += `• 견적: ${fmt(r.bus_fee)} (왕복)\n`;
    }
  }

  return `[달팽이아지트] 🔔 주말 예약 리마인드

📅 체크인: ${dayLabel(r.reservation_date, today)}
🏠 ${r.stay_nights || 1}박 / 체크아웃 ${r.checkout_date || "-"}

■ 예약자: ${r.guest_name} (${r.guest_phone})
■ 인원: ${peopleDesc}
■ 프로그램: ${programLabel}
${r.purpose ? `■ 목적: ${r.purpose}\n` : ""}${r.time_slot ? `■ 시간대: ${r.time_slot}\n` : ""}
━━ 옵션 / 금액 ━━
${lines.join("\n")}
${r.bus_requested && r.bus_fee ? `• 버스 렌트: ${fmt(r.bus_fee)}\n` : ""}━━━━━━━━━━━━
✅ 총 금액: ${fmt(total)}
1인당: 약 ${fmt(perPerson)}
${busSection}
※ 입실 준비 부탁드립니다.`;
}

function ymdKST(d: Date): string {
  const kst = new Date(d.getTime() + 9 * 3600 * 1000);
  return kst.toISOString().slice(0, 10);
}

export async function GET(req: NextRequest) {
  // 인증: Vercel Cron은 자동으로 Authorization: Bearer ${CRON_SECRET} 헤더 추가
  const auth = req.headers.get("authorization");
  if (auth !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const now = new Date();
    // KST 기준 오늘 ~ +2일 (금/토/일)
    const todayKST = new Date(ymdKST(now) + "T00:00:00");
    const start = ymdKST(now);
    const end = ymdKST(new Date(now.getTime() + 2 * 86400000));

    const { data: reservations, error: resErr } = await supabaseAdmin
      .from("reservations")
      .select("*")
      .gte("reservation_date", start)
      .lte("reservation_date", end)
      .neq("status", "cancelled")
      .order("reservation_date", { ascending: true });

    if (resErr) throw resErr;
    if (!reservations || reservations.length === 0) {
      return NextResponse.json({ success: true, count: 0, message: "No reservations this weekend" });
    }

    const ids = (reservations as Reservation[]).map((r) => r.id);
    const { data: buses } = await supabaseAdmin
      .from("bus_requests")
      .select("*")
      .in("reservation_id", ids);

    const busesByRes: Record<number, BusRequest[]> = {};
    for (const b of (buses || []) as BusRequest[]) {
      if (!busesByRes[b.reservation_id]) busesByRes[b.reservation_id] = [];
      busesByRes[b.reservation_id].push(b);
    }

    const sender = (process.env.SOLAPI_SENDER || "").trim();
    const results: Array<{ res_id: number; phone: string; statusCode?: string; error?: string }> = [];

    for (const r of reservations as Reservation[]) {
      const msg = buildMessage(r, busesByRes[r.id] || [], todayKST);
      for (const num of OWNER_NUMBERS) {
        try {
          const out = await messageService.sendOne({
            to: num, from: sender, text: msg, type: "LMS",
            subject: `[리마인드] ${r.guest_name} ${r.reservation_date}`,
          });
          results.push({ res_id: r.id, phone: num, statusCode: out.statusCode });
        } catch (e) {
          results.push({ res_id: r.id, phone: num, error: String(e) });
        }
      }
    }

    return NextResponse.json({
      success: true,
      reservations_count: reservations.length,
      sms_count: results.length,
      results,
    });
  } catch (error) {
    console.error("Cron weekly-reminders failed:", error);
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 });
  }
}
