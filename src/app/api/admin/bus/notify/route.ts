import { NextRequest, NextResponse } from "next/server";
import { verifyRequest } from "@/lib/admin-auth";
import { SolapiMessageService } from "solapi";

const OWNER_NUMBERS = ["01085319531", "01053140146", "01046968497", "01046965529"];

const messageService = new SolapiMessageService(
  (process.env.SOLAPI_API_KEY || "").trim(),
  (process.env.SOLAPI_API_SECRET || "").trim()
);

const fmt = (n: number) => n.toLocaleString("ko-KR") + "원";

interface BusNotifyBody {
  guestName: string;
  guestPhone: string;
  reservationDate: string;
  stayNights: number;
  guestCount: number;
  extraGuests: number;
  busMode: "oneway" | "roundtrip";
  pickupPlace: string;
  pickupPeople: string;
  pickupTime: string;
  pickupDetail: string;
  dropoffPlace: string;
  dropoffPeople: string;
  dropoffTime: string;
  dropoffDetail: string;
  driverName: string;
  driverPhone: string;
  busNumber: string;
  managerName: string;
  managerPhone: string;
  cost: number;
}

function buildBusMessage(d: BusNotifyBody): string {
  const modeLabel = d.busMode === "roundtrip" ? "왕복" : "편도";
  const totalPeople = d.guestCount + (d.extraGuests || 0);

  let msg = `[달팽이아지트] 버스 예약 확인

안녕하세요, ${d.guestName}님!
버스 예약 정보를 안내드립니다.

■ 예약일: ${d.reservationDate} (${d.stayNights}박)
■ 인원: ${totalPeople}명
■ 버스: ${d.pickupPlace} ${modeLabel}${d.cost > 0 ? ` (${fmt(d.cost)})` : ""}

━━ 승차 정보 ━━
• 출발지: ${d.pickupPlace}
• 탑승 시간: ${d.pickupTime || "미정"}
• 탑승 인원: ${d.pickupPeople || "-"}명${d.pickupDetail ? `\n• 세부: ${d.pickupDetail}` : ""}`;

  if (d.busMode === "roundtrip") {
    msg += `

━━ 하차 정보 ━━
• 도착지: ${d.dropoffPlace || d.pickupPlace}
• 출발 시간: ${d.dropoffTime || "미정"}
• 하차 인원: ${d.dropoffPeople || "-"}명${d.dropoffDetail ? `\n• 세부: ${d.dropoffDetail}` : ""}`;
  }

  if (d.driverName || d.driverPhone || d.busNumber) {
    msg += `

━━ 버스 기사 정보 ━━${d.driverName ? `\n• 기사명: ${d.driverName}` : ""}${d.driverPhone ? `\n• 연락처: ${d.driverPhone}` : ""}${d.busNumber ? `\n• 차량번호: ${d.busNumber}` : ""}`;
  }

  msg += `

⚠️ 승차 장소와 시간을 꼭 다시 한번 확인해주세요!
⚠️ 하차 장소와 시간도 반드시 확인 부탁드립니다!
※ 탑승 10분 전까지 집합 부탁드립니다.
※ 변경 사항이 있으시면 미리 연락 부탁드립니다.${d.managerName ? `\n\n담당: ${d.managerName}${d.managerPhone ? ` (${d.managerPhone})` : ""}` : ""}
문의: 010-8531-9531`;

  return msg;
}

export async function POST(req: NextRequest) {
  if (!(await verifyRequest(req))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const data: BusNotifyBody = await req.json();
    const sender = (process.env.SOLAPI_SENDER || "").trim();
    const customerPhone = data.guestPhone.replace(/[^0-9]/g, "");
    const msg = buildBusMessage(data);

    const results = [];

    // 고객에게 발송
    results.push(await messageService.sendOne({
      to: customerPhone, from: sender, text: msg, type: "LMS", subject: "달팽이아지트 버스예약 확인"
    }));

    // 대표님들께 발송
    for (const num of OWNER_NUMBERS) {
      results.push(await messageService.sendOne({
        to: num, from: sender, text: `[버스예약] ${data.guestName} (${data.guestPhone})\n\n${msg}`, type: "LMS", subject: "버스 예약 확인"
      }));
    }

    return NextResponse.json({ success: true, count: results.length });
  } catch (error) {
    console.error("버스 확인 SMS 실패:", error);
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 });
  }
}
