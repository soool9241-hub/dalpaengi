import { NextRequest, NextResponse } from "next/server";
import { verifyRequest } from "@/lib/admin-auth";
import { SolapiMessageService } from "solapi";

const OWNER_NUMBERS = ["01085319531", "01053140146", "01046968497", "01046965529"];

const messageService = new SolapiMessageService(
  (process.env.SOLAPI_API_KEY || "").trim(),
  (process.env.SOLAPI_API_SECRET || "").trim()
);

const fmt = (n: number) => n.toLocaleString("ko-KR") + "원";

const PROGRAM_LABELS: Record<string, string> = {
  stay: "숙박", half: "3시간 대여", daynight: "주/야간 패키지",
};

interface BusDetail {
  mode: "oneway" | "roundtrip";
  pickupPlace: string;
  pickupPeople: string;
  pickupTime: string;
  pickupDetail?: string;
  dropoffPlace: string;
  dropoffPeople: string;
  dropoffTime: string;
  dropoffDetail?: string;
  managerName: string;
  managerPhone: string;
  vehicleLabel?: string;
  cost: number;
}

interface NotifyBody {
  guestName: string;
  guestPhone: string;
  reservationDate: string;
  stayNights: number;
  guestCount: number;
  extraGuests: number;
  programType: string;
  bbqCount: number;
  burnerCount: number;
  dinnerCount: number;
  breakfastCount?: number;
  breakfastMenu?: string;
  poolCount?: number;
  woodcraftCount: number;
  potBbqCount: number;
  busRequested: boolean;
  busFee?: number;
  busDetail?: BusDetail;
  busDetails?: BusDetail[];
  timeSlot: string | null;
  notes: string | null;
  changes: string[];
  originalAmount?: number;
  newAmount?: number;
  purpose?: string | null;
}

// 변경 알림 SMS 명세서용 기본가 (settings 동기화 X — 변경시점 스냅샷)
const PRICES = {
  stay: 700000, half: 300000, daynight: 400000,
  extraGuest: 10000, bbqGrill: 30000, gasRange: 15000,
  dinner: 10000, breakfast: 10000, woodcraft: 20000,
  potBbq: 30000, miniPool: 50000,
} as const;

function buildOptionLines(d: NotifyBody, totalBusCost: number): string[] {
  const lines: string[] = [];

  if (d.programType === "stay") {
    lines.push(`• 숙박 기본15인 (${d.stayNights}박): ${fmt(PRICES.stay * (d.stayNights || 1))}`);
  } else if (d.programType === "half") {
    lines.push(`• 3시간 대여 1타임: ${fmt(PRICES.half)}`);
  } else if (d.programType === "daynight") {
    lines.push(`• 주/야간 패키지 1타임: ${fmt(PRICES.daynight)}`);
  }

  if (d.guestCount > 15) {
    const ex = d.guestCount - 15;
    lines.push(`• 추가인원 (${ex}명 × ${fmt(PRICES.extraGuest)}): ${fmt(ex * PRICES.extraGuest)}`);
  }
  if (d.bbqCount > 0) lines.push(`• 그릴 대여 (${d.bbqCount}개 × ${fmt(PRICES.bbqGrill)}): ${fmt(d.bbqCount * PRICES.bbqGrill)}`);
  if (d.burnerCount > 0) lines.push(`• 가스버너 (${d.burnerCount}개 × ${fmt(PRICES.gasRange)}): ${fmt(d.burnerCount * PRICES.gasRange)}`);
  if (d.dinnerCount > 0) lines.push(`• 저녁식사 (${d.dinnerCount}명 × ${fmt(PRICES.dinner)}): ${fmt(d.dinnerCount * PRICES.dinner)}`);
  if ((d.breakfastCount || 0) > 0) {
    const bc = d.breakfastCount!;
    lines.push(`• 조식${d.breakfastMenu ? ` [${d.breakfastMenu}]` : ""} (${bc}명 × ${fmt(PRICES.breakfast)}): ${fmt(bc * PRICES.breakfast)}`);
  }
  if ((d.poolCount || 0) > 0) {
    const pc = d.poolCount!;
    lines.push(`• 🏊 미니수영장 (${pc}개 × ${fmt(PRICES.miniPool)}): ${fmt(pc * PRICES.miniPool)}`);
  }
  if (d.woodcraftCount > 0) lines.push(`• 목공키트 (${d.woodcraftCount}개 × ${fmt(PRICES.woodcraft)}): ${fmt(d.woodcraftCount * PRICES.woodcraft)}`);
  if (d.potBbqCount > 0) lines.push(`• 항아리BBQ (${d.potBbqCount}인분 × ${fmt(PRICES.potBbq)}): ${fmt(d.potBbqCount * PRICES.potBbq)}`);
  if (d.busRequested && totalBusCost > 0) lines.push(`• 버스 렌트: ${fmt(totalBusCost)}`);
  return lines;
}

function buildChangeMessage(d: NotifyBody): string {
  const programLabel = PROGRAM_LABELS[d.programType] || d.programType;
  const changesStr = d.changes.length > 0 ? d.changes.join("\n") : "옵션 변경";
  const peopleDesc = d.guestCount > 15
    ? `총 ${d.guestCount}명 (기본 15 + 추가 ${d.guestCount - 15})`
    : `${d.guestCount}명`;

  // 버스 상세 + 총 버스비 계산
  const busList = d.busDetails && d.busDetails.length > 0
    ? d.busDetails
    : (d.busDetail ? [d.busDetail] : []);
  const busCostFromDetails = busList.reduce((s, b) => s + (b.cost || 0), 0);
  const totalBusCost = busCostFromDetails > 0 ? busCostFromDetails : (d.busFee || 0);

  let busSection = "";
  if (d.busRequested && busList.length > 0) {
    const headerLabel = busList.length > 1 ? `버스 렌트 (총 ${busList.length}대)` : `버스 렌트 (${busList[0].mode === "roundtrip" ? "왕복" : "편도"})`;
    const blocks = busList.map((b, idx) => {
      const modeLabel = b.mode === "roundtrip" ? "왕복" : "편도";
      const heading = busList.length > 1
        ? `[${idx + 1}호차${b.vehicleLabel ? ` · ${b.vehicleLabel}` : ""}] ${modeLabel}${b.cost > 0 ? ` (${fmt(b.cost)})` : ""}`
        : `${b.vehicleLabel ? b.vehicleLabel + " · " : ""}${b.pickupPlace}${b.cost > 0 ? ` (${fmt(b.cost)})` : ""}`;
      const lines: string[] = [heading];
      if (b.managerName || b.managerPhone) lines.push(`• 담당자: ${b.managerName || "-"} ${b.managerPhone || ""}`.trim());
      lines.push(`• 승차: ${b.pickupPlace} ${b.pickupTime || "-"} (${b.pickupPeople || "-"}명)${b.pickupDetail ? ` · ${b.pickupDetail}` : ""}`);
      if (b.mode === "roundtrip") {
        lines.push(`• 하차: ${b.dropoffPlace || b.pickupPlace} ${b.dropoffTime || "-"} (${b.dropoffPeople || "-"}명)${b.dropoffDetail ? ` · ${b.dropoffDetail}` : ""}`);
      }
      return lines.join("\n");
    }).join("\n\n");
    busSection = `\n━━ ${headerLabel} ━━\n${blocks}\n${busList.length > 1 && totalBusCost > 0 ? `• 총 버스비: ${fmt(totalBusCost)}\n` : ""}※ 탑승 시간을 다시 한번 확인 부탁드립니다.\n`;
  } else if (d.busRequested) {
    busSection = "\n• 버스 렌트: 요청 (상세 미정)\n";
  }

  // 옵션 명세서
  const optionLines = buildOptionLines(d, totalBusCost);
  const optionsTotalFallback = optionLines.length > 0
    ? optionLines.reduce((s, l) => {
        const m = l.match(/([\d,]+)\s*원$/);
        return s + (m ? parseInt(m[1].replace(/,/g, ""), 10) : 0);
      }, 0)
    : 0;
  const finalTotal = d.newAmount != null ? d.newAmount : optionsTotalFallback;
  const perPerson = d.guestCount > 0 ? Math.round(finalTotal / d.guestCount) : 0;

  // 금액 안내(변경 전/후)
  const amountSection = (d.originalAmount != null && d.newAmount != null)
    ? `\n━━ 금액 안내 ━━\n• 변경 전: ${fmt(d.originalAmount)}\n• 변경 후: ${fmt(d.newAmount)}\n${
        d.newAmount < d.originalAmount
          ? `• 환불 금액: ${fmt(d.originalAmount - d.newAmount)}\n※ 차액분은 입실 1일 전 입금 처리 예정입니다.`
          : d.newAmount > d.originalAmount
          ? `• 추가 결제: ${fmt(d.newAmount - d.originalAmount)}\n※ 추가 결제금을 아래 계좌로 입금 부탁드립니다.\n카카오뱅크 3333-06-4749542 임솔`
          : "• 금액 변동 없음"
      }\n`
    : "";

  return `[달팽이아지트] 예약 변경 안내

■ 예약자: ${d.guestName}님
■ 날짜: ${d.reservationDate} (${d.stayNights}박)
■ 프로그램: ${programLabel}
■ 인원: ${peopleDesc}
${d.purpose ? `■ 목적: ${d.purpose}\n` : ""}${d.timeSlot ? `■ 시간대: ${d.timeSlot}\n` : ""}
━━ 변경 내역 ━━
${changesStr}
${amountSection}
━━ 최종 예약 안내 ━━
■ 예약자: ${d.guestName}님
■ 날짜: ${d.reservationDate} (${d.stayNights}박)
■ 프로그램: ${programLabel}
■ 인원: ${peopleDesc}${d.purpose ? `\n■ 목적: ${d.purpose}` : ""}${d.timeSlot ? `\n■ 시간대: ${d.timeSlot}` : ""}

━━ 옵션 / 금액 ━━
${optionLines.join("\n")}
━━━━━━━━━━━━
총 금액: ${fmt(finalTotal)}${perPerson > 0 ? `\n1인당: 약 ${fmt(perPerson)}` : ""}
${busSection}${d.notes ? `\n메모: ${d.notes}\n` : ""}
문의: 010-8531-9531`;
}

export async function POST(req: NextRequest) {
  if (!(await verifyRequest(req))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const data: NotifyBody = await req.json();
    const sender = (process.env.SOLAPI_SENDER || "").trim();
    const customerPhone = data.guestPhone.replace(/[^0-9]/g, "");
    const msg = buildChangeMessage(data);

    const results = [];

    // 고객에게 발송
    results.push(await messageService.sendOne({
      to: customerPhone, from: sender, text: msg, type: "LMS", subject: "달팽이아지트 예약변경"
    }));

    // 대표님들께 발송
    for (const num of OWNER_NUMBERS) {
      results.push(await messageService.sendOne({
        to: num, from: sender, text: `[예약변경] ${data.guestName} (${data.guestPhone})\n\n${msg}`, type: "LMS", subject: "예약 변경 알림"
      }));
    }

    return NextResponse.json({ success: true, count: results.length });
  } catch (error) {
    console.error("변경 알림 SMS 실패:", error);
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 });
  }
}
