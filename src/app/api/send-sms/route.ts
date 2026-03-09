import { NextRequest, NextResponse } from "next/server";
import { SolapiMessageService } from "solapi";
import { supabaseAdmin } from "@/lib/supabase-admin";
import type { PricingData } from "@/context/SettingsContext";

const OWNER_NUMBERS = ["01085319531", "01053140146", "01046968497", "01046965529"];

const messageService = new SolapiMessageService(
  (process.env.SOLAPI_API_KEY || "").trim(),
  (process.env.SOLAPI_API_SECRET || "").trim()
);

const formatPrice = (price: number) => price.toLocaleString("ko-KR") + "원";

interface ReservationSMS {
  guestName: string;
  guestPhone: string;
  reservationDate: string;
  stayNights: number;
  totalGuests: number;
  baseGuests: number;
  extraGuests: number;
  programLabel: string;
  basePrice: number;
  bbqGrills: number;
  gasRanges: number;
  dinnerCount: number;
  woodcraftCount: number;
  potBbqCount: number;
  busRequested: boolean;
  busPrice?: number;
  busManagerName?: string;
  busManagerPhone?: string;
  busPickupPlace?: string;
  busPickupPeople?: string;
  busPickupTime?: string;
  busDropoffPlace?: string;
  busDropoffPeople?: string;
  busDropoffTime?: string;
  timeSlot: string | null;
  totalPrice: number;
}

async function loadPricing(): Promise<PricingData> {
  const defaults: PricingData = {
    stay: 700000, half: 400000, halfExtra: 200000, daynight: 400000,
    extraGuest: 10000, bbqGrill: 30000, gasRange: 15000,
    dinner: 10000, woodcraft: 20000, potBbq: 30000,
  };
  try {
    const { data } = await supabaseAdmin.from("site_settings").select("value").eq("key", "pricing").single();
    if (data?.value) return { ...defaults, ...(data.value as Partial<PricingData>) };
  } catch {}
  return defaults;
}

function buildOptionLines(data: ReservationSMS, p: PricingData): string[] {
  const lines: string[] = [];
  const nights = data.stayNights;

  lines.push(`• ${data.programLabel} 기본${data.baseGuests}인 (${nights}박): ${formatPrice(data.basePrice * nights)}`);

  if (data.extraGuests > 0)
    lines.push(`• 추가인원 (${data.extraGuests}명 × ${formatPrice(p.extraGuest)}): ${formatPrice(data.extraGuests * p.extraGuest)}`);
  if (data.bbqGrills > 0)
    lines.push(`• 그릴 대여 (${data.bbqGrills}개 × ${formatPrice(p.bbqGrill)}): ${formatPrice(data.bbqGrills * p.bbqGrill)}`);
  if (data.gasRanges > 0)
    lines.push(`• 가스렌지 (${data.gasRanges}개 × ${formatPrice(p.gasRange)}): ${formatPrice(data.gasRanges * p.gasRange)}`);
  if (data.dinnerCount > 0)
    lines.push(`• 저녁식사 (${data.dinnerCount}명 × ${formatPrice(p.dinner)}): ${formatPrice(data.dinnerCount * p.dinner)}`);
  if (data.woodcraftCount > 0)
    lines.push(`• 목공키트 (${data.woodcraftCount}개 × ${formatPrice(p.woodcraft)}): ${formatPrice(data.woodcraftCount * p.woodcraft)}`);
  if (data.potBbqCount > 0)
    lines.push(`• 항아리BBQ (${data.potBbqCount}인분 × ${formatPrice(p.potBbq)}): ${formatPrice(data.potBbqCount * p.potBbq)}`);

  return lines;
}

function buildCustomerMessage(data: ReservationSMS, p: PricingData): string {
  const optionLines = buildOptionLines(data, p);
  const perPerson = Math.round(data.totalPrice / data.totalGuests);
  const peopleDesc = data.extraGuests > 0
    ? `${data.totalGuests}명 (기본 ${data.baseGuests}명 + 추가 ${data.extraGuests}명)`
    : `${data.totalGuests}명 (기본 ${data.baseGuests}명)`;

  return `[달팽이아지트] 예약이 확정되었습니다!

■ 예약자: ${data.guestName}님
■ 날짜: ${data.reservationDate} (${data.stayNights}박)
■ 인원: ${peopleDesc}
■ 프로그램: ${data.programLabel}
${data.timeSlot ? `■ 시간대: ${data.timeSlot}\n` : ""}
━━ 요금 상세 ━━
${optionLines.join("\n")}
${data.busRequested && data.busPrice ? `• 버스 렌트 (${data.busPickupPlace} 왕복): ${formatPrice(data.busPrice)}\n` : ""}${data.busRequested && !data.busPrice ? "• 버스 렌트: 별도 추후 안내\n" : ""}━━━━━━━━━━━━
총 금액: ${formatPrice(data.totalPrice)}${data.busRequested && !data.busPrice ? " + 버스 별도" : ""}
1인당: 약 ${formatPrice(perPerson)}
${data.busRequested && data.busPickupPlace ? `
🚌 버스 정보
승차: ${data.busPickupPlace} / ${data.busPickupPeople || ""}명 / ${data.busPickupTime || ""}
하차: ${data.busDropoffPlace || data.busPickupPlace} / ${data.busDropoffPeople || ""}명 / ${data.busDropoffTime || ""}
${data.busPrice ? `견적: ${formatPrice(data.busPrice)} (왕복)` : "견적: 별도 추후 안내드리겠습니다"}
` : ""}
입금계좌: 카카오뱅크 3333-06-4749542 임솔
※ 입금 순 예약 확정

[환불규정] 예약일 2주 전 취소 시 100% 환불 / 이후 환불 불가

문의: 010-8531-9531
감사합니다 :)`;
}

function buildOwnerMessage(data: ReservationSMS, p: PricingData): string {
  const optionLines = buildOptionLines(data, p);
  const perPerson = Math.round(data.totalPrice / data.totalGuests);
  const peopleDesc = data.extraGuests > 0
    ? `${data.totalGuests}명 (기본${data.baseGuests} + 추가${data.extraGuests})`
    : `${data.totalGuests}명`;

  return `[새 예약 접수]

■ 예약자: ${data.guestName} (${data.guestPhone})
■ 날짜: ${data.reservationDate} (${data.stayNights}박)
■ 인원: ${peopleDesc}
■ 프로그램: ${data.programLabel}
${data.timeSlot ? `■ 시간대: ${data.timeSlot}\n` : ""}
━━ 옵션 / 금액 ━━
${optionLines.join("\n")}
${data.busRequested && data.busPrice ? `• 버스 렌트 (${data.busPickupPlace} 왕복): ${formatPrice(data.busPrice)}\n` : ""}${data.busRequested && !data.busPrice ? "• 버스 렌트: 별도 추후 안내\n" : ""}━━━━━━━━━━━━
총 금액: ${formatPrice(data.totalPrice)}${data.busRequested && !data.busPrice ? " + 버스 별도" : ""}
1인당: 약 ${formatPrice(perPerson)}
${data.busRequested && data.busManagerName ? `
🚌 책임자: ${data.busManagerName} (${data.busManagerPhone || ""})
승차: ${data.busPickupPlace || ""} / ${data.busPickupPeople || ""}명 / ${data.busPickupTime || ""}
하차: ${data.busDropoffPlace || data.busPickupPlace || ""} / ${data.busDropoffPeople || ""}명 / ${data.busDropoffTime || ""}
${data.busPrice ? `견적: ${formatPrice(data.busPrice)} (왕복)` : "견적: 별도 추후 안내"}` : ""}`;
}

export async function POST(req: NextRequest) {
  try {
    const data: ReservationSMS = await req.json();
    const sender = (process.env.SOLAPI_SENDER || "").trim();
    const customerPhone = data.guestPhone.replace(/[^0-9]/g, "");

    const p = await loadPricing();
    const customerMsg = buildCustomerMessage(data, p);
    const ownerMsg = buildOwnerMessage(data, p);

    // LMS (장문) 발송 - sendOne 사용
    const results = [];

    // 1. 고객님께
    results.push(await messageService.sendOne({
      to: customerPhone, from: sender, text: customerMsg, type: "LMS", subject: "달팽이아지트 예약확인"
    }));

    // 2,3. 대표님들께
    for (const num of OWNER_NUMBERS) {
      results.push(await messageService.sendOne({
        to: num, from: sender, text: ownerMsg, type: "LMS", subject: "새 예약 접수"
      }));
    }

    return NextResponse.json({ success: true, count: results.length });
  } catch (error) {
    console.error("SMS 발송 실패:", error);
    return NextResponse.json(
      { success: false, error: String(error) },
      { status: 500 }
    );
  }
}
