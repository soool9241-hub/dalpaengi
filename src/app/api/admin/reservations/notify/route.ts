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
  dropoffPlace: string;
  dropoffPeople: string;
  dropoffTime: string;
  managerName: string;
  managerPhone: string;
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
  woodcraftCount: number;
  potBbqCount: number;
  busRequested: boolean;
  busDetail?: BusDetail;
  timeSlot: string | null;
  notes: string | null;
  changes: string[];
  originalAmount?: number;
  newAmount?: number;
}

function buildChangeMessage(d: NotifyBody): string {
  const programLabel = PROGRAM_LABELS[d.programType] || d.programType;
  const changesStr = d.changes.length > 0 ? d.changes.join("\n") : "옵션 변경";

  let busSection = "";
  if (d.busRequested && d.busDetail) {
    const b = d.busDetail;
    const modeLabel = b.mode === "roundtrip" ? "왕복" : "편도";
    busSection = `\n━━ 버스 렌트 (${modeLabel}) ━━
• 노선: ${b.pickupPlace}${b.cost > 0 ? ` (${fmt(b.cost)})` : ""}
• 담당자: ${b.managerName} ${b.managerPhone}
• 승차: ${b.pickupPlace} ${b.pickupTime} (${b.pickupPeople}명)${b.mode === "roundtrip" ? `\n• 하차: ${b.dropoffPlace} ${b.dropoffTime} (${b.dropoffPeople}명)` : ""}
※ 탑승 시간을 다시 한번 확인 부탁드립니다.
`;
  } else if (d.busRequested) {
    busSection = "\n• 버스 렌트: 요청 (상세 미정)\n";
  }

  return `[달팽이아지트] 예약 변경 안내

■ 예약자: ${d.guestName}님
■ 날짜: ${d.reservationDate} (${d.stayNights}박)
■ 프로그램: ${programLabel}
■ 인원: ${d.guestCount}명${d.extraGuests > 0 ? ` (추가 ${d.extraGuests}명)` : ""}
${d.timeSlot ? `■ 시간대: ${d.timeSlot}\n` : ""}
━━ 변경 내역 ━━
${changesStr}
${d.originalAmount != null && d.newAmount != null ? `
━━ 금액 안내 ━━
• 변경 전: ${fmt(d.originalAmount)}
• 변경 후: ${fmt(d.newAmount)}
${d.newAmount < d.originalAmount ? `• 환불 금액: ${fmt(d.originalAmount - d.newAmount)}\n※ 차액분은 입실 1일 전 입금 처리 예정입니다.` : d.newAmount > d.originalAmount ? `• 추가 결제: ${fmt(d.newAmount - d.originalAmount)}\n※ 추가 결제금을 아래 계좌로 입금 부탁드립니다.\n카카오뱅크 3333-06-4749542 임솔` : "• 금액 변동 없음"}
` : ""}
━━ 현재 옵션 ━━
${d.bbqCount > 0 ? `• BBQ 그릴: ${d.bbqCount}개\n` : ""}${d.burnerCount > 0 ? `• 가스렌지: ${d.burnerCount}개\n` : ""}${d.dinnerCount > 0 ? `• 저녁식사: ${d.dinnerCount}명\n` : ""}${d.woodcraftCount > 0 ? `• 목공키트: ${d.woodcraftCount}개\n` : ""}${d.potBbqCount > 0 ? `• 항아리BBQ: ${d.potBbqCount}인분\n` : ""}${busSection}${d.notes ? `\n메모: ${d.notes}` : ""}
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
