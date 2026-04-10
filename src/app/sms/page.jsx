"use client";
import { useState, useMemo, useCallback, useEffect } from "react";

// ═══════════════════════════════════════════════
// 전환율 극대화 메시지 템플릿 (40개)
// 퍼널: 모객→응답→견적→클로징→팔로업→입금→입실→퇴실→이슈
// ═══════════════════════════════════════════════

const T = [
  // ── 1. 모객 ──
  { id: "r1", cat: "빈방긴급", phase: "모객", title: "D-7 빈방 알림", msg: "[달팽이아지트] 🐌\n{date}({day}) 독채 하루 오픈되었습니다!\n\n✅ 60평 독채 · 바베큐 · 수영장\n✅ 전주역 10분 · 소양IC 5분\n✅ 최대 60명 수용\n\n봄날 모임 계획 있으시면\n지금 바로 연락주세요 😊\n\n📞 010-8531-9531\n💬 카톡 sool9241" },
  { id: "r2", cat: "빈방긴급", phase: "모객", title: "D-3 긴급 오픈", msg: "[달팽이아지트] 🐌\n이번 {day}({date}) 독채 긴급 오픈!\n\n🔥 선착순 1팀 한정\n60평 독채+수영장+바베큐\n\n주말 모임 장소 못 정하셨다면\n편하게 문의주세요!\n\n📞 010-8531-9531" },
  { id: "r3", cat: "빈방긴급", phase: "모객", title: "당일 오픈", msg: "🐌 오늘 독채 오픈!\n\n오늘 저녁 바베큐 하고 싶은 분?\n60평 독채 당일 이용 가능합니다\n\n체크인 15:00~\n📞 010-8531-9531" },
  { id: "r4", cat: "MT모객", phase: "모객", title: "MT 단체 모객", msg: "[달팽이아지트] 🐌\n{month}월 MT 독채 예약 오픈!\n\n🔥 30명 올인클루시브 190만원\n(숙박+저녁+조식+버스픽업)\n인당 6만원대, 시내 고기집보다 저렴!\n\n✅ 바베큐 6대 + 가스렌지 5대\n✅ 수영장 · 별 관측\n✅ 60평 독채 · 회의실\n\n📞 010-8531-9531" },
  { id: "r5", cat: "MT모객", phase: "모객", title: "MT 간사 전용 제안", msg: "간사님, 준비 부담 없게 해드릴게요!\n\n저녁BBQ 세팅 + 조식 배달 + 버스 렌트까지\n인원만 알려주시면 나머지는 저희가 다 세팅합니다.\n\n솔직히 간사님이 할 일은\n1. 날짜 잡기\n2. 인원 알려주기\n3. 예약금 보내기\n이 3개뿐이에요!\n\n30명 이상이시면 목공키트 5개 무료 서비스 😊\n📞 010-8531-9531" },
  { id: "r6", cat: "종교모임", phase: "모객", title: "교회 수련회 전용", msg: "안녕하세요! 수련회 장소 안내드릴게요.\n\n📌 예배: 워크샵 공간 (20인, 100인치 TV)\n📌 숙박: 방 4개 (조별활동 딱 좋아요)\n📌 식사: 저녁 BBQ + 조식 제공\n📌 야외: 수영장 + 넓은 마당 (레크리에이션)\n\n1인 5.2만원에 올인원이에요.\n7~8월 성수기 날짜 빨리 마감되니\n빈 날짜 확인해보시겠어요?\n\n📞 010-8531-9531" },
  { id: "r7", cat: "워크샵", phase: "모객", title: "평일 워크샵 제안", msg: "[달팽이아지트] 🐌\n평일 워크샵 공간 안내\n\n✅ 60평 독채 · 회의실 20인\n✅ 빔프로젝터 · Wi-Fi\n✅ 평일 특가 50만원~\n\n📞 010-8531-9531" },
  { id: "r8", cat: "시즌", phase: "모객", title: "여름 수영장 오픈", msg: "[달팽이아지트] 🐌\n🏊 수영장 시즌 오픈!\n\n프라이빗 수영장에서\n바베큐 파티 어떠세요?\n\n✅ 60평 독채 + 전용 수영장\n✅ 항아리BBQ 3시간 훈연\n✅ 하루 1팀 독채\n\n7~8월 주말 빠르게 마감됩니다\n📞 010-8531-9531" },
  { id: "r9", cat: "시즌", phase: "모객", title: "가을 시즌 오픈", msg: "[달팽이아지트] 가을 독채에서 BBQ🐌\n단풍+별관측+항아리BBQ\n9~10월 주말 예약 오픈!\n▶ dalpaengi-five.vercel.app" },
  { id: "r10", cat: "SMS대량", phase: "모객", title: "재방문 고객 SMS", msg: "[달팽이아지트] 안녕하세요!\n올해 수영장 오픈했어요🐌\n4~5월 예약 시 항아리BBQ세트 업그레이드!\n재방문 고객 10% 할인\n▶ dalpaengi-five.vercel.app" },
  { id: "r11", cat: "SMS대량", phase: "모객", title: "단체 고객 SMS", msg: "[달팽이아지트] 올해 MT 준비 중이시면!\n30명 190만원 올인원(숙박+식사+버스)\n4~5월 예약 시 목공키트 5개 무료🐌\n▶ dalpaengi-five.vercel.app" },

  // ── 2. 응답 ──
  { id: "a1", cat: "첫응답", phase: "응답", title: "MT/단체 첫 문의", msg: "안녕하세요! 달팽이아지트 솔입니다 🐌\n\nMT 문의 감사합니다!\n몇 가지만 확인하면 바로 견적 보내드릴게요.\n\n1. 날짜: 언제 오실 예정이세요?\n2. 인원: 몇 명 예상하세요?\n3. 식사: 저녁BBQ + 조식 필요하세요?\n4. 버스: 전용버스 렌트 필요하세요?\n\n참고로 30명 기준 올인원 190만원이에요.\n인당 6만원대, 시내 고기집보다 저렴합니다 😊" },
  { id: "a2", cat: "첫응답", phase: "응답", title: "가족/소모임 첫 문의", msg: "안녕하세요! 달팽이아지트 솔입니다 🐌\n\n문의 감사합니다!\n\n1. 날짜: 언제 오실 예정이세요?\n2. 인원: 몇 분이세요?\n\n60평 독채라 하루 1팀만 받아서 눈치 볼 일 없어요.\n수영장+항아리BBQ+별 관측까지 다 가능합니다!\n\n빈 날짜 바로 확인해드릴게요 😊" },
  { id: "a3", cat: "첫응답", phase: "응답", title: "가격만 물어볼 때", msg: "안녕하세요! 달팽이아지트 솔입니다 🐌\n\n기본 요금 안내드릴게요!\n\n📌 숙박 (1박): 70만원 (기본 15인)\n📌 추가 인원: 1인 1만원\n📌 저녁BBQ: 1인 1만원\n📌 조식: 1인 1만원\n📌 버스 렌트: 왕복 60만원~\n\n예: 30명 올인원 = 190만원 (인당 6.3만원)\n\n인원이랑 날짜 알려주시면 정확한 견적 보내드릴게요!" },

  // ── 3. 견적 ──
  { id: "q1", cat: "견적", phase: "견적", title: "견적서 발송", msg: "📋 달팽이아지트 견적서\n\n━━━━━━━━━━━━━━━━━━\n📅 날짜: {date}({day}) 1박2일\n👥 인원: {count}명\n━━━━━━━━━━━━━━━━━━\n\n[기본]\n• 숙박 (기본 15인): 700,000원\n• 추가 인원 {extra}명: {extra_fee}원\n\n[식사]\n• 저녁 BBQ {dinner}인: {dinner_fee}원\n• 조식 {breakfast}인: {breakfast_fee}원\n\n[교통]\n• 전용버스 왕복: {bus_fee}원\n\n━━━━━━━━━━━━━━━━━━\n💰 합계: {total}원\n👤 인당: {per_person}원\n━━━━━━━━━━━━━━━━━━\n\n✅ 60평 독채 + 방4개 + 수영장\n✅ 화장실 8개 + 100인치TV + 회의공간\n\n📌 예약: 예약금 10만원 → 잔금 체크인 전날\n국민 xxx-xxxx-xxxxx (임솔)\n\n❓ 궁금한 점 편하게 물어보세요!" },

  // ── 4. 클로징 ──
  { id: "c1", cat: "클로징", phase: "클로징", title: "\"생각해볼게요\" 대응", msg: "네, 편하게 생각해보세요! 😊\n\n참고로 같은 날짜 문의가 2건 더 들어와 있어서요,\n내일까지 결정해주시면 날짜 확보해드릴게요.\n\n예약금 10만원만 먼저 보내주시면 확정이고,\n혹시 취소하셔도 3일 전까지 전액 환불이에요!\n부담 없이 먼저 잡아놓으세요 🐌" },
  { id: "c2", cat: "클로징", phase: "클로징", title: "\"비싼데요\" 가격 저항", msg: "30명 기준이면 인당 6.3만원이에요.\n시내 고기집 가시면 1인 3만원은 하시잖아요?\n\n여기는 고기 + 숙박 + 수영장 + 별 관측 + 독채까지요.\n사실 고기집보다 저렴한 건데 경험은 비교 불가예요 😊\n\n예산이 빠듯하시면 조식 빼고 180만원으로도 가능해요!" },
  { id: "c3", cat: "클로징", phase: "클로징", title: "\"다른 곳도 보는 중\"", msg: "당연하죠! 비교해보시는 게 맞아요 😊\n\n참고로 비교하실 때 체크하시면 좋은 것들:\n✅ 60평 독채 (전주 근교 최대급)\n✅ 화장실 8개 (단체 필수)\n✅ 숙박+식사+버스 올인원 (간사님 부담 제로)\n✅ 에어비앤비 5.0 / 7년 운영 / 누적 7000명\n\n비교하시고 궁금한 거 있으면 편하게 물어보세요!" },
  { id: "c4", cat: "클로징", phase: "클로징", title: "\"인원 미확정\" (MT간사)", msg: "인원 미확정이시면 날짜부터 먼저 잡으세요!\n\n예약금 10만원으로 날짜 확보해두시고,\n인원은 체크인 3일 전까지 최종 확정 주시면 됩니다.\n\n추가 인원은 1인 1만원이라\n나중에 늘어나도 부담 없어요 😊" },

  // ── 5. 팔로업 ──
  { id: "f1", cat: "팔로업", phase: "팔로업", title: "D+1 견적 확인", msg: "안녕하세요! 어제 보내드린 견적 확인하셨나요? 😊\n궁금한 점 있으시면 편하게 물어보세요!\n\n참고로 같은 날짜 문의가 계속 들어오고 있어서\n확정이시면 빨리 알려주시면 좋을 것 같아요 🐌" },
  { id: "f2", cat: "팔로업", phase: "팔로업", title: "D+3 옵션 조정 제안", msg: "안녕하세요, 달팽이아지트입니다 🐌\n혹시 다른 날짜나 옵션 조정이 필요하시면\n편하게 말씀해주세요!\n\n예산에 맞춰서 패키지 조정도 가능합니다 😊" },
  { id: "f3", cat: "팔로업", phase: "팔로업", title: "D+7 마지막 안내", msg: "안녕하세요! 마지막으로 한번 더 안내드려요 😊\n\n요청하신 날짜({date}) 아직 비어있긴 한데,\n최근 문의가 많아서 오래 비워두기 어려울 것 같아요.\n\n결정하시면 언제든 연락주세요!\n좋은 하루 보내세요 🐌" },

  // ── 6. 입금 ──
  { id: "p1", cat: "입금", phase: "입금", title: "입금 리마인더 D+2", msg: "안녕하세요, 달팽이아지트입니다 🐌\n\n{date} 예약 견적 확인하셨나요?\n궁금한 점 있으시면 편하게 말씀해주세요!\n\n입금 확인되면 바로 확정해드릴게요 😊\n📞 010-8531-9531" },
  { id: "p2", cat: "입금", phase: "입금", title: "입금 최종 D+5", msg: "안녕하세요, 달팽이아지트입니다.\n\n{date} 예약건 입금 미확인 안내드립니다.\n내일까지 입금 어려우시면 자동 취소됩니다.\n\n날짜 변경도 가능합니다!\n📞 010-8531-9531" },
  { id: "p3", cat: "입금", phase: "입금", title: "입금 확인 즉시", msg: "입금 확인됐습니다! 예약 확정이에요 🎉\n\n📅 {date}({day}) 1박2일\n👥 {count}명\n💰 잔금: {balance}원 (체크인 전날까지)\n\n체크인 3일 전에 상세 안내 보내드릴게요!\n궁금한 거 있으면 언제든 카톡 주세요 😊" },

  // ── 7. 입실 ──
  { id: "i1", cat: "입실안내", phase: "입실", title: "D-7 준비사항", msg: "{name}님 안녕하세요 🐌\n\n{date} 방문 일주일전!\n\n⚠️ 꼭 확인\nㆍ수건 개별 지참\nㆍ반려동물 불가\nㆍ퇴실시 택시 어려움\n\n📌 체크인 15:00~\n📌 체크아웃 11:00\n\n📞 010-8531-9531" },
  { id: "i2", cat: "입실안내", phase: "입실", title: "D-3 체크인 상세", msg: "이번 주 {day} 오시죠! 안내드릴게요 🐌\n\n🔑 체크인: 오후 3시 이후\n🔑 키패드 비밀번호: {keypad}\n🗺 네비: \"스토리팜\" 검색 (티맵)\n🚗 소양IC에서 5분\n\n⚠️ 꼭 챙기세요:\n• 수건 (미제공, 개별 지참!)\n• 퇴실 시 택시 불가 → 버스/자차 필수\n\n최종 인원 확정해주시면 식사 준비할게요!" },
  { id: "i3", cat: "입실안내", phase: "입실", title: "D-1 전날 확인", msg: "내일 뵙겠습니다! 기대되네요 🐌\n\n🕒 체크인: 오후 3시\n🔑 비밀번호: {keypad}\n🅿️ 주차: 건물 앞 무료\n\n내일 날씨: {weather}\n→ 별 관측 최적이에요!\n\n저녁 BBQ는 {bbq_time}시에 세팅해놓을게요.\n편하게 오세요! 😊" },
  { id: "i4", cat: "입실안내", phase: "입실", title: "당일 환영", msg: "{name}님, 오늘입니다! 🐌\n\n🔑 비밀번호: {keypad}\n\n체크인 15:00~\n주소: 완주군 소양면 해월리 866-6\n(티맵 \"스토리팜\")\n\n📞 010-8531-9531" },

  // ── 8. 퇴실 ──
  { id: "o1", cat: "퇴실", phase: "퇴실", title: "퇴실 아침 가이드", msg: "좋은 아침입니다 🐌\n\n체크아웃 11:00까지\nㆍ식기류 설거지\nㆍ분리수거\nㆍ문단속\n\n편안한 귀가 되세요! 😊" },
  { id: "o2", cat: "리뷰", phase: "퇴실", title: "D+1 감사 & 리뷰", msg: "어제 잘 들어가셨나요? 😊\n\n즐거운 시간 되셨길 바라요!\n혹시 불편했던 점 있으면 알려주세요,\n다음에 더 좋은 공간으로 보답하겠습니다.\n\n⭐ 에어비앤비 후기 남겨주시면\n다음 방문 시 10% 할인 드려요!\n→ airbnb.co.kr/rooms/28715892\n\n감사합니다, 달팽이아지트 솔 드림 🐌" },
  { id: "o3", cat: "재방문", phase: "퇴실", title: "시즌 재방문 유도", msg: "{name}님 안녕하세요!\n달팽이아지트 임솔입니다 🐌\n\n{season} 모임 계획 있으시면\n연락주세요!\n\n재방문 특별 혜택 드려요 ✨\n📞 010-8531-9531" },

  // ── 9. 이슈 ──
  { id: "e1", cat: "이슈", phase: "이슈", title: "취소 확인", msg: "{name}님, 달팽이아지트입니다.\n\n{date} 예약 취소 확인.\n\n정책:\nㆍ7일전: 전액 환불\nㆍ3일전: 50%\nㆍ당일: 불가\n\n다른 날짜 변경 가능합니다 😊\n📞 010-8531-9531" },
  { id: "e2", cat: "취소복구", phase: "이슈", title: "취소자 재연락", msg: "안녕하세요, 달팽이아지트 임솔입니다 😊\n{date} 예약 취소하신 건 날짜가 안 맞으셨을까요?\n\n다른 날짜로 변경도 가능하니\n편하게 말씀해주세요!\n\n📞 010-8531-9531" },
  { id: "e3", cat: "이슈", phase: "이슈", title: "불만 사과", msg: "{name}님, 달팽이아지트 임솔입니다.\n\n{issue} 건 정말 죄송합니다.\n{resolution}\n\n개선하겠습니다.\n📞 010-8531-9531" },
];

// 퍼널 단계 정의
const PHASES = [
  { key: "모객", label: "모객", icon: "📢", desc: "빈방 채우기 + 타겟별 모객", color: "#E8593C" },
  { key: "응답", label: "응답", icon: "💬", desc: "5분 이내 즉시 응답", color: "#3DB88C" },
  { key: "견적", label: "견적", icon: "📋", desc: "투명 가격 + 인당 환산", color: "#5B9FE4" },
  { key: "클로징", label: "클로징", icon: "🎯", desc: "전환율 50→65%", color: "#E4A84B" },
  { key: "팔로업", label: "팔로업", icon: "🔄", desc: "미응답 시퀀스", color: "#9B8FE8" },
  { key: "입금", label: "입금", icon: "💰", desc: "입금 유도 + 확인", color: "#E4A84B" },
  { key: "입실", label: "입실", icon: "🏠", desc: "자동 입실 안내", color: "#5B9FE4" },
  { key: "퇴실", label: "퇴실", icon: "⭐", desc: "후기 + 재방문 유도", color: "#9B8FE8" },
  { key: "이슈", label: "이슈", icon: "🚨", desc: "취소 · 불만 대응", color: "#E85D5D" },
];

const CC = { "빈방긴급": "#E8593C", "MT모객": "#5B9FE4", "종교모임": "#9B8FE8", "워크샵": "#3DB88C", "시즌": "#E8593C", "SMS대량": "#E4A84B", "첫응답": "#3DB88C", "견적": "#5B9FE4", "클로징": "#E4A84B", "팔로업": "#9B8FE8", "입금": "#E4A84B", "입실안내": "#5B9FE4", "퇴실": "#888", "리뷰": "#9B8FE8", "재방문": "#3DB88C", "이슈": "#E85D5D", "취소복구": "#E4A84B" };
const PFS = ["전체", "MT", "가족모임", "종교모임", "워크샵", "지인모임", "동호회", "숙박"];
const SL = { "upcoming": "예정", "visited": "방문완료", "cancelled": "취소" };
const SCO = { "upcoming": "#5B9FE4", "visited": "#3DB88C", "cancelled": "#E85D5D" };

// 색상
const bg0 = "#080808", bg1 = "#0f0f0e", bg2 = "#171716", bg3 = "#1e1e1c";
const bdr = "#2d2d2a", tx1 = "#e8e6df", tx2 = "#9c9a92", tx3 = "#5e5d58";
const grn = "#40916C", grnL = "#5aad86";

export default function SmsPage() {
  // steps: 0=퍼널선택, 1=템플릿선택, 2=고객선택, 3=발송
  const [step, setStep] = useState(0);
  const [selPhase, setSelPhase] = useState(null);
  const [sel, setSel] = useState(null);
  const [expand, setExpand] = useState(null);
  const [copied, setCopied] = useState(null);

  // 고객
  const [cQ, setCQ] = useState("");
  const [custs, setCusts] = useState([]);
  const [picks, setPicks] = useState([]);
  const [ld, setLd] = useState(false);
  const [err, setErr] = useState(null);
  const [pF, setPF] = useState("전체");
  const [sF, setSF] = useState("전체");

  // 발송
  const [msg, setMsg] = useState("");
  const [sending, setSending] = useState(false);
  const [sendRes, setSendRes] = useState(null);

  const loadC = useCallback(async () => {
    setLd(true); setErr(null);
    try {
      const params = new URLSearchParams();
      if (pF !== "전체") params.set("purpose", pF);
      if (sF !== "전체") params.set("status", sF);
      if (cQ.trim()) params.set("q", cQ.trim());
      const res = await fetch(`/api/customers?${params}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setCusts(data.customers || []);
    } catch (e) { setErr(e.message); setCusts([]); }
    setLd(false);
  }, [cQ, pF, sF]);

  useEffect(() => { if (step === 2) loadC(); }, [step, pF, sF]);

  const phaseTpls = useMemo(() => {
    if (!selPhase) return [];
    return T.filter(t => t.phase === selPhase);
  }, [selPhase]);

  const pick = p => setPicks(v => v.includes(p) ? v.filter(x => x !== p) : [...v, p]);
  const pickAll = () => setPicks(v => v.length === custs.length ? [] : custs.map(c => c.guest_phone));
  const cp = (id, txt) => { navigator.clipboard.writeText(txt); setCopied(id); setTimeout(() => setCopied(null), 1500); };

  const send = async () => {
    setSending(true); setSendRes(null);
    try {
      const res = await fetch("/api/sms-bulk", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ phones: picks, message: msg }) });
      const data = await res.json();
      setSendRes(res.ok ? { ok: true, n: picks.length } : { ok: false, e: data.error });
    } catch (e) { setSendRes({ ok: false, e: e.message }); }
    setSending(false);
  };

  const bytes = msg ? new TextEncoder().encode(msg).length : 0;
  const mt = bytes > 2000 ? "MMS" : bytes > 90 ? "LMS" : "SMS";

  const goPhase = (phase) => { setSelPhase(phase.key); setStep(1); setExpand(null); setSel(null); };
  const goTemplate = (t) => { setSel(t); setMsg(t.msg); setStep(2); };
  const goSend = () => { if (picks.length) setStep(3); };

  const stepLabels = ["퍼널 단계", "템플릿", "고객 선택", "발송"];
  const stepIcons = ["📢", "📝", "👥", "📤"];

  const inp = { width: "100%", padding: "14px 18px", fontSize: 16, border: `1px solid ${bdr}`, borderRadius: 14, background: bg2, color: tx1, outline: "none", boxSizing: "border-box" };

  return (
    <div style={{ fontFamily: "'Pretendard',system-ui", maxWidth: 720, margin: "0 auto", background: bg0, minHeight: "100vh", color: tx1 }}>
      {/* 헤더 */}
      <div style={{ padding: "28px 24px 22px", borderBottom: `1px solid ${bdr}` }}>
        <div style={{ fontSize: 28, fontWeight: 800, letterSpacing: "-1px" }}>🐌 달팽이 SMS</div>
        <div style={{ fontSize: 14, color: tx2, marginTop: 6 }}>전환율 극대화 발송 시스템 · {T.length}개 템플릿</div>
      </div>

      {/* 스텝 인디케이터 */}
      <div style={{ display: "flex", alignItems: "center", padding: "16px 24px 20px", gap: 4 }}>
        {stepLabels.map((l, i) => {
          const done = i < step, on = i === step;
          return (
            <div key={i} style={{ display: "flex", alignItems: "center", flex: 1 }}>
              <button
                onClick={() => {
                  if (i === 0) { setStep(0); }
                  if (i === 1 && selPhase) { setStep(1); }
                  if (i === 2 && sel) { setStep(2); }
                  if (i === 3 && sel && picks.length) { setStep(3); }
                }}
                style={{
                  width: "100%", padding: "10px 0", fontSize: 13, fontWeight: 700,
                  borderRadius: 10, border: "none", cursor: "pointer", transition: "all .15s",
                  background: on ? grn : done ? grn + "20" : bg2,
                  color: on ? "#fff" : done ? grnL : tx3,
                }}
              >
                {done ? "✓" : stepIcons[i]} {l}
              </button>
              {i < 3 && <div style={{ width: 12, height: 2, background: done ? grn : bg3, flexShrink: 0 }} />}
            </div>
          );
        })}
      </div>

      <div style={{ padding: "0 24px 80px" }}>

        {/* ═══ STEP 0: 퍼널 단계 선택 ═══ */}
        {step === 0 && (
          <>
            <div style={{ fontSize: 20, fontWeight: 800, marginBottom: 6 }}>어떤 상황인가요?</div>
            <div style={{ fontSize: 14, color: tx2, marginBottom: 20 }}>퍼널 단계를 선택하면 맞는 템플릿을 보여드려요</div>

            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {PHASES.map((p, idx) => {
                const count = T.filter(t => t.phase === p.key).length;
                return (
                  <button
                    key={p.key}
                    onClick={() => goPhase(p)}
                    style={{
                      display: "flex", alignItems: "center", gap: 16,
                      padding: "20px 20px", borderRadius: 16,
                      border: `1px solid ${bdr}`, background: bg1,
                      cursor: "pointer", transition: "all .15s", textAlign: "left",
                    }}
                    onMouseEnter={e => { e.currentTarget.style.borderColor = p.color; e.currentTarget.style.background = p.color + "08"; }}
                    onMouseLeave={e => { e.currentTarget.style.borderColor = bdr; e.currentTarget.style.background = bg1; }}
                  >
                    <div style={{ fontSize: 32, width: 48, textAlign: "center", flexShrink: 0 }}>{p.icon}</div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                        <span style={{ fontSize: 18, fontWeight: 800, color: tx1 }}>{p.label}</span>
                        <span style={{ fontSize: 12, fontWeight: 700, padding: "3px 10px", borderRadius: 20, background: p.color + "18", color: p.color }}>{count}개</span>
                      </div>
                      <div style={{ fontSize: 14, color: tx2, marginTop: 4 }}>{p.desc}</div>
                    </div>
                    <div style={{ fontSize: 18, color: tx3, flexShrink: 0 }}>→</div>
                  </button>
                );
              })}
            </div>

            {/* 퍼널 흐름 안내 */}
            <div style={{ marginTop: 24, padding: 18, borderRadius: 14, background: bg1, border: `1px solid ${bdr}` }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: tx3, marginBottom: 10 }}>퍼널 흐름</div>
              <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 6 }}>
                {PHASES.map((p, i) => (
                  <span key={p.key} style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
                    <span style={{ fontSize: 13, fontWeight: 700, padding: "4px 10px", borderRadius: 8, background: p.color + "15", color: p.color }}>{p.icon} {p.label}</span>
                    {i < PHASES.length - 1 && <span style={{ color: tx3, fontSize: 12 }}>→</span>}
                  </span>
                ))}
              </div>
            </div>
          </>
        )}

        {/* ═══ STEP 1: 템플릿 선택 ═══ */}
        {step === 1 && selPhase && (
          <>
            {(() => {
              const phase = PHASES.find(p => p.key === selPhase);
              return (
                <div style={{ padding: 18, borderRadius: 14, background: phase.color + "10", border: `1px solid ${phase.color}30`, marginBottom: 18, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div>
                    <div style={{ fontSize: 13, color: tx2 }}>퍼널 단계</div>
                    <div style={{ fontSize: 22, fontWeight: 800, marginTop: 2 }}>{phase.icon} {phase.label} <span style={{ fontSize: 14, fontWeight: 600, color: phase.color }}>· {phase.desc}</span></div>
                  </div>
                  <button onClick={() => setStep(0)} style={{ fontSize: 14, fontWeight: 600, color: grnL, background: "none", border: "none", cursor: "pointer" }}>← 변경</button>
                </div>
              );
            })()}

            <div style={{ fontSize: 16, fontWeight: 700, marginBottom: 14 }}>
              템플릿을 선택하세요 <span style={{ color: tx2, fontWeight: 500 }}>({phaseTpls.length}개)</span>
            </div>

            {/* 카테고리별 그룹핑 */}
            {(() => {
              const cats = [...new Set(phaseTpls.map(t => t.cat))];
              return cats.map(cat => {
                const catTpls = phaseTpls.filter(t => t.cat === cat);
                const catColor = CC[cat] || "#888";
                return (
                  <div key={cat} style={{ marginBottom: 16 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
                      <span style={{ fontSize: 13, fontWeight: 700, padding: "4px 12px", borderRadius: 8, background: catColor + "18", color: catColor }}>{cat}</span>
                      <span style={{ fontSize: 13, color: tx3 }}>{catTpls.length}개</span>
                    </div>
                    {catTpls.map(t => {
                      const isOpen = expand === t.id;
                      const isSel = sel?.id === t.id;
                      return (
                        <div key={t.id} style={{ borderRadius: 14, marginBottom: 8, border: `1px solid ${isSel ? catColor : bdr}`, background: bg1, overflow: "hidden" }}>
                          <div onClick={() => setExpand(isOpen ? null : t.id)} style={{ padding: "16px 18px", cursor: "pointer", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                            <div style={{ display: "flex", alignItems: "center", gap: 10, flex: 1, minWidth: 0 }}>
                              <span style={{ fontSize: 16, fontWeight: 700, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{t.title}</span>
                              {isSel && <span style={{ fontSize: 10, fontWeight: 700, padding: "3px 8px", borderRadius: 5, background: grn, color: "#fff", flexShrink: 0 }}>선택됨</span>}
                            </div>
                            <span style={{ fontSize: 13, color: tx3, transform: isOpen ? "rotate(180deg)" : "none", transition: "transform .2s", marginLeft: 8, flexShrink: 0 }}>▼</span>
                          </div>
                          {!isOpen && <div style={{ padding: "0 18px 14px", fontSize: 14, color: tx3, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{t.msg.split("\n")[0]}</div>}
                          {isOpen && (
                            <div style={{ padding: "0 18px 18px" }}>
                              <div style={{ padding: 18, borderRadius: 12, background: bg0, border: `1px solid ${bdr}`, whiteSpace: "pre-wrap", fontSize: 15, lineHeight: 1.8, color: tx1 }}>{t.msg}</div>
                              <div style={{ display: "flex", gap: 8, marginTop: 14 }}>
                                <button onClick={e => { e.stopPropagation(); cp(t.id, t.msg); }} style={{ flex: 1, padding: 12, fontSize: 14, fontWeight: 600, borderRadius: 10, border: `1px solid ${bdr}`, background: bg2, color: tx1, cursor: "pointer" }}>{copied === t.id ? "✅ 복사됨" : "📋 복사"}</button>
                                <button onClick={e => { e.stopPropagation(); goTemplate(t); }} style={{ flex: 2, padding: 12, fontSize: 15, fontWeight: 700, borderRadius: 10, border: "none", background: grn, color: "#fff", cursor: "pointer" }}>이 템플릿으로 발송 →</button>
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                );
              });
            })()}
          </>
        )}

        {/* ═══ STEP 2: 고객 선택 ═══ */}
        {step === 2 && (
          <>
            {/* 선택된 템플릿 요약 */}
            <div style={{ padding: 16, borderRadius: 14, background: bg1, border: `1px solid ${bdr}`, marginBottom: 18, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div>
                <div style={{ fontSize: 12, color: tx3 }}>선택된 템플릿</div>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 4 }}>
                  <span style={{ fontSize: 18, fontWeight: 700 }}>{sel?.title}</span>
                  <span style={{ fontSize: 11, fontWeight: 600, padding: "2px 8px", borderRadius: 5, background: CC[sel?.cat] + "18", color: CC[sel?.cat] }}>{sel?.cat}</span>
                </div>
              </div>
              <button onClick={() => setStep(1)} style={{ fontSize: 14, fontWeight: 600, color: grnL, background: "none", border: "none", cursor: "pointer" }}>← 변경</button>
            </div>

            {/* 검색 */}
            <div style={{ display: "flex", gap: 8, marginBottom: 14 }}>
              <input placeholder="🔍 이름 · 전화번호 검색" value={cQ} onChange={e => setCQ(e.target.value)} onKeyDown={e => e.key === "Enter" && loadC()} style={{ ...inp, flex: 1 }} />
              <button onClick={loadC} style={{ padding: "14px 22px", fontSize: 15, fontWeight: 700, borderRadius: 12, border: "none", background: tx1, color: bg0, cursor: "pointer", flexShrink: 0 }}>{ld ? "..." : "검색"}</button>
            </div>

            {/* 필터 */}
            <div style={{ marginBottom: 8 }}>
              <div style={{ fontSize: 12, fontWeight: 600, color: tx3, marginBottom: 6 }}>예약 목적</div>
              <div style={{ display: "flex", gap: 5, flexWrap: "wrap" }}>
                {PFS.map(f => (
                  <button key={f} onClick={() => setPF(f)} style={{ padding: "6px 12px", fontSize: 13, fontWeight: 600, borderRadius: 10, border: "none", cursor: "pointer", background: pF === f ? tx1 : bg3, color: pF === f ? bg0 : tx2 }}>{f}</button>
                ))}
              </div>
            </div>
            <div style={{ marginBottom: 16 }}>
              <div style={{ fontSize: 12, fontWeight: 600, color: tx3, marginBottom: 6, marginTop: 8 }}>상태</div>
              <div style={{ display: "flex", gap: 5 }}>
                {["전체", "upcoming", "visited", "cancelled"].map(f => {
                  const c = SCO[f]; const on = sF === f;
                  return <button key={f} onClick={() => setSF(f)} style={{ padding: "6px 12px", fontSize: 13, fontWeight: 600, borderRadius: 10, border: "none", cursor: "pointer", background: on ? (c || tx1) : bg3, color: on ? "#fff" : tx2 }}>{f === "전체" ? "전체" : SL[f]}</button>;
                })}
              </div>
            </div>

            {err && <div style={{ padding: 14, borderRadius: 12, background: "#E85D5D15", border: "1px solid #E85D5D30", marginBottom: 14, fontSize: 14, color: "#E85D5D" }}>{err}<button onClick={loadC} style={{ marginLeft: 12, padding: "4px 12px", fontSize: 12, borderRadius: 6, border: "none", background: "#E85D5D", color: "#fff", cursor: "pointer" }}>재시도</button></div>}

            {/* 고객 목록 헤더 */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
              <div style={{ fontSize: 16, fontWeight: 700 }}>
                {ld ? "불러오는 중..." : (<>{custs.length}명{picks.length > 0 && <span style={{ color: grnL, marginLeft: 10 }}>{picks.length}명 선택</span>}</>)}
              </div>
              {custs.length > 0 && (
                <button onClick={pickAll} style={{ padding: "8px 16px", fontSize: 13, fontWeight: 700, borderRadius: 10, border: "none", cursor: "pointer", background: picks.length === custs.length ? grn : bg3, color: picks.length === custs.length ? "#fff" : tx2 }}>
                  {picks.length === custs.length ? "전체 해제" : "전체 선택"}
                </button>
              )}
            </div>

            {/* 고객 리스트 */}
            <div style={{ borderRadius: 14, border: `1px solid ${bdr}`, overflow: "hidden", maxHeight: 420, overflowY: "auto" }}>
              {custs.map((c, i) => {
                const on = picks.includes(c.guest_phone);
                const sc = SCO[c.status] || "#888";
                return (
                  <div key={c.guest_phone + i} onClick={() => pick(c.guest_phone)} style={{ padding: "16px 18px", display: "flex", justifyContent: "space-between", alignItems: "center", cursor: "pointer", borderBottom: `1px solid ${bg3}`, background: on ? grn + "08" : "transparent" }}>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <span style={{ fontSize: 16, fontWeight: 700 }}>{c.guest_name}</span>
                        <span style={{ fontSize: 11, fontWeight: 600, padding: "2px 8px", borderRadius: 5, background: sc + "15", color: sc }}>{SL[c.status] || c.status}</span>
                      </div>
                      <div style={{ fontSize: 14, color: tx2, marginTop: 4 }}>{c.guest_phone} · {c.purpose} · {c.guest_count}명 · {c.reservation_date}</div>
                    </div>
                    <div style={{ width: 28, height: 28, borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, border: on ? "none" : `2px solid ${tx3}`, background: on ? grn : "transparent", color: "#fff", fontSize: 16, fontWeight: 800 }}>{on && "✓"}</div>
                  </div>
                );
              })}
            </div>

            {custs.length > 0 && (
              <button onClick={goSend} disabled={!picks.length} style={{ width: "100%", padding: 16, fontSize: 17, fontWeight: 800, borderRadius: 14, border: "none", marginTop: 18, cursor: picks.length ? "pointer" : "not-allowed", background: picks.length ? grn : bg3, color: picks.length ? "#fff" : tx3 }}>
                {picks.length}명에게 발송 준비 →
              </button>
            )}
          </>
        )}

        {/* ═══ STEP 3: 메시지 편집 & 발송 ═══ */}
        {step === 3 && (
          <>
            {/* 요약 카드 */}
            <div style={{ display: "flex", gap: 10, marginBottom: 18 }}>
              <div style={{ flex: 1, padding: 16, borderRadius: 14, background: bg1, border: `1px solid ${bdr}` }}>
                <div style={{ fontSize: 12, color: tx2 }}>템플릿</div>
                <div style={{ fontSize: 16, fontWeight: 700, marginTop: 4 }}>{sel?.title}</div>
                <div style={{ fontSize: 12, color: CC[sel?.cat], marginTop: 2 }}>{sel?.phase} · {sel?.cat}</div>
              </div>
              <div style={{ flex: 1, padding: 16, borderRadius: 14, background: bg1, border: `1px solid ${bdr}` }}>
                <div style={{ fontSize: 12, color: tx2 }}>발송 대상</div>
                <div style={{ fontSize: 26, fontWeight: 800, color: grnL, marginTop: 2 }}>{picks.length}명</div>
                <button onClick={() => setStep(2)} style={{ fontSize: 12, fontWeight: 600, color: grnL, background: "none", border: "none", cursor: "pointer", padding: 0, marginTop: 2 }}>← 수정</button>
              </div>
            </div>

            {/* 수신자 미리보기 */}
            <div style={{ padding: 14, borderRadius: 12, background: bg1, border: `1px solid ${bdr}`, marginBottom: 18 }}>
              <div style={{ fontSize: 12, color: tx3, marginBottom: 6 }}>수신자</div>
              <div style={{ fontSize: 14, color: tx2, lineHeight: 1.7, maxHeight: 52, overflow: "hidden" }}>
                {custs.filter(c => picks.includes(c.guest_phone)).map(c => c.guest_name).join(", ")}
              </div>
            </div>

            {/* 메시지 편집 */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
              <span style={{ fontSize: 18, fontWeight: 800 }}>메시지 편집</span>
              <span style={{ fontSize: 14, fontWeight: 700, padding: "5px 14px", borderRadius: 8, background: mt === "SMS" ? grn + "18" : mt === "LMS" ? "#E4A84B18" : "#E85D5D18", color: mt === "SMS" ? grnL : mt === "LMS" ? "#E4A84B" : "#E85D5D" }}>{mt} · {bytes}byte</span>
            </div>
            <textarea value={msg} onChange={e => setMsg(e.target.value)} style={{ width: "100%", minHeight: 280, padding: 18, fontSize: 16, lineHeight: 1.8, fontFamily: "'Pretendard',system-ui", border: `1px solid ${bdr}`, borderRadius: 14, background: bg1, color: tx1, outline: "none", resize: "vertical", boxSizing: "border-box" }} />
            <div style={{ fontSize: 14, color: tx3, marginTop: 8, marginBottom: 20 }}>
              <span style={{ color: "#E4A84B", fontWeight: 700 }}>{"{변수}"}</span> 부분을 실제 값으로 수정하세요
            </div>

            {/* 버튼들 */}
            <div style={{ display: "flex", gap: 10, marginBottom: 14 }}>
              <button onClick={() => cp("m", msg)} style={{ flex: 1, padding: 14, fontSize: 15, fontWeight: 700, borderRadius: 12, border: `1px solid ${bdr}`, background: bg1, color: tx1, cursor: "pointer" }}>{copied === "m" ? "✅ 복사됨" : "📋 메시지 복사"}</button>
              <button onClick={() => cp("n", picks.join("\n"))} style={{ flex: 1, padding: 14, fontSize: 15, fontWeight: 700, borderRadius: 12, border: `1px solid ${bdr}`, background: bg1, color: tx1, cursor: "pointer" }}>{copied === "n" ? "✅ 복사됨" : "📱 번호 복사"}</button>
            </div>
            <button onClick={send} disabled={sending} style={{ width: "100%", padding: 18, fontSize: 18, fontWeight: 800, borderRadius: 14, border: "none", cursor: sending ? "not-allowed" : "pointer", background: sending ? bg3 : grn, color: sending ? tx3 : "#fff" }}>
              {sending ? "발송 중..." : `📤 ${picks.length}명에게 Solapi 발송`}
            </button>
            {sendRes && (
              <div style={{ marginTop: 14, padding: 18, borderRadius: 14, fontSize: 16, fontWeight: 700, textAlign: "center", background: sendRes.ok ? grn + "12" : "#E85D5D12", color: sendRes.ok ? grnL : "#E85D5D", border: `1px solid ${sendRes.ok ? grn + "30" : "#E85D5D30"}` }}>
                {sendRes.ok ? `✅ ${sendRes.n}건 발송 완료!` : `❌ ${sendRes.e}`}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
