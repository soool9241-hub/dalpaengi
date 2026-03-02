import { NextRequest, NextResponse } from "next/server";
import { SolapiMessageService } from "solapi";

const OWNER_NUMBERS = ["01085319531", "01053140146"];

const messageService = new SolapiMessageService(
  process.env.SOLAPI_API_KEY!,
  process.env.SOLAPI_API_SECRET!
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
  timeSlot: string | null;
  totalPrice: number;
}

function buildOptionLines(data: ReservationSMS): string[] {
  const lines: string[] = [];
  const nights = data.stayNights;

  lines.push(`• ${data.programLabel} (${nights}박): ${formatPrice(data.basePrice * nights)}`);

  if (data.extraGuests > 0)
    lines.push(`• 추가인원 (${data.extraGuests}명 × 10,000원): ${formatPrice(data.extraGuests * 10000)}`);
  if (data.bbqGrills > 0)
    lines.push(`• 그릴 대여 (${data.bbqGrills}개 × 30,000원): ${formatPrice(data.bbqGrills * 30000)}`);
  if (data.gasRanges > 0)
    lines.push(`• 가스렌지 (${data.gasRanges}개 × 15,000원): ${formatPrice(data.gasRanges * 15000)}`);
  if (data.dinnerCount > 0)
    lines.push(`• 저녁식사 (${data.dinnerCount}명 × 10,000원): ${formatPrice(data.dinnerCount * 10000)}`);
  if (data.woodcraftCount > 0)
    lines.push(`• 목공키트 (${data.woodcraftCount}개 × 20,000원): ${formatPrice(data.woodcraftCount * 20000)}`);
  if (data.potBbqCount > 0)
    lines.push(`• 항아리BBQ (${data.potBbqCount}인분 × 30,000원): ${formatPrice(data.potBbqCount * 30000)}`);

  return lines;
}

function buildCustomerMessage(data: ReservationSMS): string {
  const optionLines = buildOptionLines(data);
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
${data.busRequested ? "• 버스 렌트: 별도 견적\n" : ""}━━━━━━━━━━━━
총 금액: ${formatPrice(data.totalPrice)}
1인당: 약 ${formatPrice(perPerson)}

입금계좌: 농협 351-0322-8946-53 임솔
※ 입금 순 예약 확정

문의: 010-8531-9531
감사합니다 :)`;
}

function buildOwnerMessage(data: ReservationSMS): string {
  const optionLines = buildOptionLines(data);
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
${data.busRequested ? "• 버스: 견적 요청\n" : ""}━━━━━━━━━━━━
총 금액: ${formatPrice(data.totalPrice)}
1인당: 약 ${formatPrice(perPerson)}

채널: 웹사이트`;
}

export async function POST(req: NextRequest) {
  try {
    const data: ReservationSMS = await req.json();
    const sender = process.env.SOLAPI_SENDER!;
    const customerPhone = data.guestPhone.replace(/[^0-9]/g, "");

    const customerMsg = buildCustomerMessage(data);
    const ownerMsg = buildOwnerMessage(data);

    // LMS (장문) 발송 - 고객 + 대표 2명
    const messages = [
      { to: customerPhone, from: sender, text: customerMsg, type: "LMS" as const, subject: "달팽이아지트 예약확인" },
      ...OWNER_NUMBERS.map((num) => ({
        to: num,
        from: sender,
        text: ownerMsg,
        type: "LMS" as const,
        subject: "새 예약 접수",
      })),
    ];

    const result = await messageService.send(messages);

    return NextResponse.json({ success: true, result });
  } catch (error) {
    console.error("SMS 발송 실패:", error);
    return NextResponse.json(
      { success: false, error: String(error) },
      { status: 500 }
    );
  }
}
