// 자동 리마인더 SMS 템플릿
// 손님이 받기 좋은 따뜻한 톤. [달팽이아지트] 접두사 일관 유지.

export interface ReminderInput {
  guestName: string;
  reservationDate: string;          // "2026년 5월 9일" 형식
  stayNights: number;
  guestCount: number;
  programLabel: string;
  purpose?: string | null;
  busPickupPlace?: string | null;
  busPickupTime?: string | null;
  keypadCode?: string | null;       // 환경변수 PENSION_KEYPAD_CODE에서 주입
}

const ADDRESS = "전북 완주군 소양면 해월신왕길 92";
const KAKAO_ID = "sool9241";
const OWNER_PHONE = "010-8531-9531";

export function buildDayBeforeMessage(d: ReminderInput): string {
  return `[달팽이아지트] 내일 만나요 🐌

${d.guestName}님, 안녕하세요 :)
드디어 내일이네요. ${d.stayNights}박 ${d.stayNights + 1}일 푹 쉬다 가실 수 있도록 준비 다 해두고 기다릴게요.

📅 ${d.reservationDate} (${d.stayNights}박)
👥 ${d.guestCount}명 / ${d.programLabel}${d.purpose ? ` · ${d.purpose}` : ""}
📍 ${ADDRESS}

체크인은 오후 3시부터, 셀프 체크인이라 키패드 비밀번호는 입실 6시간 전에 다시 보내드릴게요.

오늘 짐 챙기실 때 수건은 꼭 챙겨주세요(미제공) 🤍
도착해서 헷갈리시면 언제든 연락 주세요.

문의: ${OWNER_PHONE}
카톡: ${KAKAO_ID}

천천히, 정성을 담아
달팽이아지트 임솔 드림`;
}

export function buildSixHourMessage(d: ReminderInput): string {
  const keypad = d.keypadCode || "(별도 안내)";
  const busLine = d.busPickupPlace
    ? `\n🚌 버스 ${d.busPickupPlace} 출발 예정 (${d.busPickupTime || "시간 확인"})\n`
    : "";

  return `[달팽이아지트] 곧 만나요 🐌

${d.guestName}님, 약 6시간 뒤면 만나뵙네요!

📍 주소
${ADDRESS}
(네이버/카카오 "달팽이아지트" 검색하시면 바로 떠요)

🚗 오시는 길
• 전주역에서 차로 10~15분
• 마을 안쪽 좁은 길이라 천천히 오세요
• "달팽이" 간판 보이면 도착!
${busLine}
🔑 셀프 체크인
키패드 비밀번호: ${keypad}
체크인 15:00 ~ 체크아웃 11:00

⚠️ 다시 한번 안내
• 수건 미제공 (개별 지참)
• 반려동물 동반 불가
• 퇴실 시 원상복구 부탁드려요

도착하시면 카톡으로 살짝 알려주세요 :)
임솔 ${OWNER_PHONE} / ${KAKAO_ID}`;
}
