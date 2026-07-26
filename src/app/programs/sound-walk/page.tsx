"use client";

import { useState, useEffect, useRef } from "react";
import {
  ChevronDown,
  ChevronUp,
  ChevronLeft,
  ChevronRight,
  Calendar,
  MapPin,
  Users,
  Clock,
  ArrowRight,
  Train,
  MessageCircle,
  Check,
  Headphones,
  Sparkles,
} from "lucide-react";
import Link from "next/link";

/* ───── 프로그램 고정값 ─────
   1기(베타 1회차) 한정 특가: 정가 200,000원 → 50% 할인 → 99,000원.
   20명 정원이 차면 특가 종료. */
const ORIGINAL_FEE = 200_000;
const FEE = 99_000;
// 표기 할인율. 실제로는 50.5% 할인(200,000→99,000)이지만 광고 표기는 "50%"로 고정한다.
// 계산값을 그대로 쓰면 반올림으로 51%가 되어 안내 문자·홈카드 표기와 어긋난다.
const DISCOUNT_PERCENT = 50;
const MAX_CAPACITY = 20;
const MIN_CAPACITY = 10;
const EVENT_DATE = "2026-09-06T12:00:00+09:00";
const KAKAO_URL = "https://open.kakao.com/o/ssowhRlg";
// AI 음악창작에 사용하는 서비스. 참가자가 사전에 가입해와야 한다.
const SUNO_URL = "https://suno.com/me";

/* ───── 이미지
   TODO(sol): 소리산책 촬영 후 /img/soundwalk-*.jpg 로 교체.
   지금은 기존 펜션·리트릿 사진을 임시로 사용한다. ───── */
const IMG = {
  hero: "/img/retreat-spring-bg.jpg",
  lunch: "/img/group-dining.jpg",
  forest: "/img/nature-yard.jpg",
  create: "/img/whiteboard.jpg",
  share: "/img/group-event.jpg",
  closing: "/img/retreat-cta-bg.jpg",
};

/* ───── 히어로 3키워드 — 이 워크샵이 주는 경험 3가지
   ① 자연의 소리를 직접 들어보는 경험
   ② 그 소리로 나만의 음악을 만들어보는 경험
   ③ 만든 것을 함께 나누는 경험 ───── */
const KEYWORDS = [
  { word: "채집", icon: "🌿", desc: "새소리·계곡·바람\n직접 녹음" },
  { word: "창작", icon: "🎵", desc: "내 소리를 원소스로\nAI 작곡" },
  { word: "공유", icon: "🎉", desc: "스무 개의 숲을\n다 함께 감상" },
];

/* ───── 숫자로 보는 리트릿 ───── */
const STATS = [
  { num: "6시간", label: "올인원 리트릿", sub: "점심부터 공유회까지" },
  { num: `${MAX_CAPACITY}명`, label: "소수 정원", sub: `최소 ${MIN_CAPACITY}명 개최` },
  { num: "3종", label: "기념품 세트", sub: "음원 + 목판 + 카드" },
  { num: "1곡", label: "나만의 음악", sub: "내 손으로 직접 창작" },
];

/* ───── 이런 분께 추천 ───── */
const TARGETS = [
  { icon: "😮‍💨", title: "머리가 복잡한 분", desc: "도시의 소음에서 벗어나 진짜 고요를 만나고 싶은 분" },
  { icon: "🎨", title: "새로운 걸 만들어보고\n싶은 분", desc: "AI로 나만의 무언가를 창작하는 경험을 원하는 분" },
  { icon: "🌿", title: "자연에서 쉬고 싶은 분", desc: "완주 숲에서 오감을 열고 힐링하고 싶은 분" },
];

/* ───── BEFORE → AFTER ───── */
const BEFORE_AFTER = [
  { before: "도시 소음에 지친 상태", after: "완주 숲의 고요로 리셋됨" },
  { before: "“자연 소리”를 그냥 흘려들음", after: "소리를 채집하고 귀 기울이는 감각 획득" },
  { before: "AI가 막연하고 어렵게 느껴짐", after: "AI로 직접 음악을 만들어본 경험" },
  { before: "여행은 사진만 남음", after: "나만의 음악 + 소리목판이 손에 남음" },
];

/* ───── 참여 흐름 (사전예약부터 귀가까지) ───── */
const JOURNEY = [
  { step: 1, title: "사전예약 & 입금", desc: "사전예약 폼 작성 → 특가 안내 문자 수신 → 입금하면 참가 확정", icon: "📝" },
  { step: 2, title: "사전 준비", desc: "문자 안내대로 스마트폰에 Suno 앱 설치·무료가입만 해두면 끝", icon: "🎧" },
  { step: 3, title: "숲에서 소리 줍기", desc: "완주 소양 숲길을 걸으며 새소리·계곡·바람을 직접 녹음", icon: "🌿" },
  { step: 4, title: "내 소리로 내 음악", desc: "채집한 소리를 재료로 AI와 함께 세상에 하나뿐인 곡 완성", icon: "🎵" },
  { step: 5, title: "함께 듣고, 손에 남기고", desc: "다 함께 감상하고 소리 파형 목판·카드를 받아 돌아갑니다", icon: "🎉" },
];

/* ───── 주요 프로그램 (카드) ───── */
const PROGRAMS = [
  {
    num: 1,
    emoji: "🍚",
    title: "웰컴 & 점심",
    tag: "완주 로컬 밥상",
    desc: "건강한 점심으로 하루를 열고 오늘의 여정을 소개합니다",
    img: IMG.lunch,
    color: "bg-amber-50 border-amber-200",
  },
  {
    num: 2,
    emoji: "🌿",
    title: "소리 자연채집",
    tag: "숲 소리산책 · 녹음",
    desc: "완주 소양 숲을 걸으며 새소리·계곡·바람을 직접 녹음합니다",
    img: IMG.forest,
    color: "bg-emerald-50 border-emerald-200",
  },
  {
    num: 3,
    emoji: "🎵",
    title: "소리로 음악 만들기",
    tag: "채집한 소리를 원소스로 · Suno AI",
    desc: "내가 녹음한 숲의 소리를 원소스로 넣고, Suno로 나만의 곡을 만듭니다",
    img: IMG.create,
    color: "bg-blue-50 border-blue-200",
  },
  {
    num: 4,
    emoji: "🎉",
    title: "결과물 공유회",
    tag: "함께 감상 · 나눔",
    desc: "각자 만든 곡을 다 함께 듣고, 기념품을 받습니다",
    img: IMG.share,
    color: "bg-purple-50 border-purple-200",
  },
];

/* ───── 세부 프로그램 (아코디언) ───── */
const PROGRAM_DETAILS = [
  {
    num: 1,
    title: "웰컴 & 점심",
    sub: "완주 로컬 밥상으로 하루를 열고, 오늘의 여정을 그려봅니다",
    leader: "솔",
    time: "12:00~13:00",
    img: IMG.lunch,
    desc: "처음 만난 사람들과 어색함을 풀고, 오늘 우리가 무엇을 하러 왔는지 함께 그려보는 시간. 녹음키트 사용법도 이때 익힙니다.",
    details: [
      "체크인 & 가벼운 아이스브레이킹",
      "완주 로컬 재료로 차린 점심 밥상",
      "오늘의 여정 소개 — 6시간을 어떻게 보내는지",
      "녹음키트 사용법 익히기 (처음이어도 3분이면 됩니다)",
      "소리산책 카드 배부 — 오늘의 기록장",
    ],
  },
  {
    num: 2,
    title: "소리 자연채집",
    sub: "완주 소양 숲을 걸으며 귀로 풍경을 담습니다",
    leader: "소리채집 가이드",
    time: "13:00~15:00",
    img: IMG.forest,
    desc: "눈을 감으면 그때부터 들리기 시작합니다. 숲길을 천천히 걸으며 새소리·계곡물·바람·발밑 낙엽까지, 평소 흘려보내던 소리를 하나씩 골라 녹음합니다.",
    details: [
      "귀 열기 — 눈 감고 1분 동안 듣기만 하기",
      "완주 소양 숲길 사운드워킹 (천천히, 말 없이)",
      "새소리 · 계곡물 · 바람 · 발밑 소리 녹음",
      "“가장 마음에 남은 소리” 고르기",
      "채집한 소리 다시 들으며 정리",
    ],
  },
  {
    num: 3,
    title: "소리로 음악 만들기",
    sub: "내가 주운 소리를 원소스로 넣어 내 곡을 만듭니다",
    leader: "솔",
    time: "15:20~17:00",
    img: IMG.create,
    desc: "악기도 악보도 필요 없습니다. 숲에서 채집한 소리를 그대로 원소스(원재료)로 올리고, 오늘의 감각을 말로 풀어 프롬프트를 쓰면 Suno가 그것을 한 곡으로 완성해줍니다. 프롬프트를 어떻게 쓰는지부터 같이 해봅니다.",
    details: [
      "소리 정리 — 오늘 채집한 소리 중 원소스로 쓸 것 골라내기 (15분)",
      "Suno에 내 소리 업로드 — 새소리·계곡·바람이 곡의 재료가 됩니다",
      "프롬프트 워크샵 — 느낌을 말로 옮기는 연습 (20분)",
      "AI 생성 · 비교 — 여러 버전 만들어 고르기 (30분)",
      "완성 · 공유 준비 — 제목 붙이고 마무리 (20분)",
      "만든 곡은 각자 Suno 계정에 남아 본인 소유가 됩니다",
    ],
  },
  {
    num: 4,
    title: "결과물 공유회",
    sub: "각자의 숲이 어떤 소리였는지 함께 듣습니다",
    leader: "솔",
    time: "17:00~18:00",
    img: IMG.share,
    desc: "같은 숲을 걸었는데 완성된 곡은 스무 개가 다 다릅니다. 어떤 소리를 왜 골랐는지 나누다 보면, 오늘 하루가 한 번 더 남습니다.",
    details: [
      "한 사람씩 자기 곡 감상",
      "어떤 소리를 왜 골랐는지 이야기 나눔",
      "소리 파형 목판 기념품 전달 (CNC 각인)",
      "소리산책 카드에 오늘의 기록 마무리",
      "플레이리스트에 내 곡을 담고 귀가",
    ],
  },
];

/* ───── 타임테이블 ───── */
const TIMETABLE = [
  { time: "12:00~13:00", label: "웰컴 & 점심식사", icon: "🍚" },
  { time: "13:00~15:00", label: "소리 자연채집 (숲 소리산책·녹음)", icon: "🌿", tag: "2시간", color: "bg-emerald-100 text-emerald-800" },
  { time: "15:00~15:20", label: "쉬는 시간 + 간식", icon: "☕" },
  { time: "15:20~17:00", label: "소리로 음악 만들기 (AI 음악창작)", icon: "🎵", tag: "1시간 40분", color: "bg-blue-100 text-blue-800" },
  { time: "17:00~18:00", label: "결과물 공유회 (감상·나눔 + 기념품)", icon: "🎉" },
];

/* ───── 원소스 → 음악 흐름 (채집한 소리가 곡의 재료가 되는 과정) ───── */
const SOURCE_FLOW = [
  { icon: "🌿", title: "숲에서 채집", desc: "새소리·계곡·바람을 직접 녹음" },
  { icon: "📤", title: "원소스로 업로드", desc: "내가 녹음한 소리를 Suno에 올림" },
  { icon: "✍️", title: "프롬프트 작성", desc: "오늘의 감각을 말로 옮김" },
  { icon: "🎧", title: "내 곡 완성", desc: "세상에 하나뿐인 음악이 됩니다" },
];

/* ───── 음악창작 블록 세부 ───── */
const CREATE_STEPS = [
  { step: "소리 정리", min: "15분" },
  { step: "프롬프트 워크샵", min: "20분" },
  { step: "AI 생성 · 비교", min: "30분" },
  { step: "완성 · 공유", min: "20분" },
];

/* ───── VALUE PACKAGE ───── */
const BENEFITS = [
  { icon: "🍽", title: "완주 로컬 점심", desc: "건강한 한 끼", value: "1.5만원 상당" },
  { icon: "🌿", title: "소리채집 프로그램", desc: "숲 소리산책 가이드", value: "3만원 상당" },
  { icon: "🎵", title: "AI 음악창작 워크샵", desc: "나만의 곡 만들기", value: "5만원 상당" },
  { icon: "🪵", title: "소리 파형 목판", desc: "CNC 각인 기념품", value: "2만원 상당" },
  { icon: "🎴", title: "소리산책 카드", desc: "그날의 기록", value: "정성 가득" },
  { icon: "🎧", title: "녹음키트 대여", desc: "전문 장비 제공", value: "덤!" },
  { icon: "🌲", title: "자연 힐링", desc: "완주 숲 치유", value: "측정불가!" },
  { icon: "🤝", title: "네트워킹", desc: "같은 취향 동료", value: "측정불가!" },
];

const INCLUDED = [
  "점심식사",
  "소리채집 프로그램",
  "AI 음악창작 워크샵",
  "녹음키트 대여",
  "소리목판 기념품",
  "소리산책 카드",
  "결과물 공유회",
];

/* ───── 사전예약 특가 근거
   기존 할인 그리드(얼리버드/동반/숙박)는 50% 특가와 중복돼 혼선을 주므로 제거하고,
   "왜 이 가격인가"를 설명하는 구조로 대체. ───── */
const PRICE_NOTES = [
  {
    icon: "🌱",
    title: "첫 회차 사전예약 특가",
    desc: "소리산책은 이번이 첫 회차입니다. 함께 만들어주시는 분들께 정가의 절반으로 드립니다.",
  },
  {
    icon: "👥",
    title: "선착순 20명까지만",
    desc: "20명이 채워지면 특가는 종료되고, 이후 회차는 정가로 진행됩니다.",
  },
  {
    icon: "📸",
    title: "후기·사진 협조 부탁",
    desc: "첫 회차라 후기와 현장 사진을 남겨주시면 큰 도움이 됩니다. (강제 아님)",
  },
];

/* ───── 준비물 ───── */
const PREP = [
  {
    who: "호스트가 준비합니다",
    icon: "🎧",
    tone: "bg-sage/60 border-primary/20",
    items: ["녹음키트", "태블릿", "블루투스 스피커", "Wi-Fi"],
  },
  {
    who: "참가자가 준비해주세요",
    icon: "🎒",
    tone: "bg-amber-50 border-amber-200",
    items: ["스마트폰 (suno.com 무료가입 완료)", "편한 운동화", "이어폰 (선택)"],
  },
];

/* ───── 왜 달팽이아지트인가 ───── */
const VENUE_POINTS = [
  { icon: "🏕️", title: "완주 숲속 독채 펜션", desc: "소양 자연 한복판, 새소리로 아침을 여는 청정 소리풍경" },
  { icon: "🔧", title: "120평 CNC 공방", desc: "채집한 소리 파형을 나무판에 각인 — 아무도 못 따라하는 기념품" },
  { icon: "🎵", title: "AI 창작 노하우", desc: "바이브코딩으로 서비스 5개+ 운영, AI를 일상에 쓰는 법을 아는 호스트" },
];

/* ───── 이끄미 ───── */
const LEADERS = [
  {
    name: "솔(Sol)",
    role: "전체 진행 · AI 음악창작",
    emoji: "🐌",
    color: "bg-emerald-50 border-emerald-200",
    tagColor: "bg-emerald-100 text-emerald-800",
    desc: "달팽이아지트 대표. AI로 서비스 5개+ 만들어 운영하고 있습니다. “소리로 창작하는 새로운 경험을 안내합니다.”",
    programs: ["웰컴 & 점심", "AI 음악창작", "결과물 공유회"],
  },
  {
    name: "소리채집 가이드",
    role: "완주 사운드워커 · 섭외 중",
    emoji: "🌿",
    color: "bg-blue-50 border-blue-200",
    tagColor: "bg-blue-100 text-blue-800",
    desc: "완주 지역 사운드워커 또는 생태 해설사와 함께 숲의 소리를 읽는 시간을 준비하고 있습니다. (협업 검토 중)",
    programs: ["소리 자연채집"],
  },
];

/* ───── 후기
   ⚠️ 소리산책은 2026.9.6 베타 1회차 = 아직 후기 없음.
   달팽이아지트에서 진행한 「완주하다 봄 리트릿」(2026.4) 실제 후기를 사용하며,
   섹션 제목·주석으로 어느 프로그램 후기인지 명확히 밝힌다. ───── */
const REVIEWS = [
  {
    name: "머리 빗는 네오",
    text: "살짜기 금빛 들판에 석양을 바라보며 서울로 올라갑니다. 행사 기획부터 진행까지 수고해주신 기획자 분들께 깊이 감사드립니다. 참여하기를 잘 했다는 저만의 생각입니다.",
  },
  {
    name: "눈빛 예고 어피치",
    text: "각자의 인생에 대해 들을 수 있어서 좋았어요~ 무엇보다 새벽까지 수다 떤 게 오랜만이라 좋았어요 ♥ 이런 좋은 프로그램 기획해주신 달팽이님들께 감사해용~^^",
  },
  {
    name: "피스메이커 프로도",
    text: "불편함 없이 너무 잘 쉬다 돌아갑니다. 애써주신 분들 챙겨주신 분들 전해주신 마음 모두 감사합니다. 일상으로 돌아가서도 나눠주신 에너지로 잘 살아가 볼게요 ♥",
  },
  {
    name: "불나게 일하는 네오",
    text: "좋은 프로그램 마련해주시고 함께 해주셔서 감사합니다. 명상 요가 산책 맛있는 식사 정말 힐링 그 자체였어요. 일상으로 돌아가서 신선한 마음 간직하며 하루하루 즐겁게 생활하도록 하겠습니다^^",
  },
  {
    name: "씩씩거리는 무지",
    text: "완주를 벗어나니 바로 현실이더라고요? 힐링캠프가 벌써 아련하게 느껴집니다. 혼자 갔지만 혼자일 틈이 없게 만들어주신 모든 분들 진심으로 감사했습니다.",
  },
];

/* ───── FAQ ───── */
const FAQS = [
  { q: "사전예약 특가는 어떻게 받나요?", a: `아래 사전예약 폼을 작성하시면 특가 ${FEE.toLocaleString("ko-KR")}원 기준으로 안내 문자가 발송됩니다. 입금이 확인되면 확정입니다. 별도 쿠폰이나 코드는 없습니다.` },
  { q: "왜 이렇게 저렴한가요?", a: `소리산책은 이번이 첫 회차입니다. 함께 만들어주시는 분들께 정가 ${ORIGINAL_FEE.toLocaleString("ko-KR")}원의 절반으로 드리고, 선착순 ${MAX_CAPACITY}명이 채워지면 특가는 종료됩니다.` },
  { q: "사전예약 후 취소하면 환불되나요?", a: "입금 전이면 문자로 알려주시면 바로 취소됩니다. 입금 후 취소는 문의(010-8531-9531)로 연락 주시면 안내드립니다." },
  { q: "음악을 전혀 못 만들어도 참가할 수 있나요?", a: "네, AI가 도와주니 누구나 가능합니다. 악기도 악보도 필요 없어요." },
  { q: "스마트폰만 있으면 되나요?", a: "네. suno.com 무료가입만 미리 해오시면 됩니다(1분). 녹음키트와 태블릿은 저희가 준비합니다." },
  { q: "만든 곡은 제가 갖나요?", a: "네, 각자 본인 Suno 계정으로 만들기 때문에 곡의 권리는 본인 소유입니다. 채집한 소리도 본인이 녹음한 것이라 그대로 쓰실 수 있어요." },
  { q: "Suno 유료 결제를 해야 하나요?", a: "무료 체험으로도 충분히 만들 수 있습니다. 곡을 소장·상업적으로 활용하려면 Pro(월 약 1.3만원) 결제가 필요하고, 이건 각자 선택입니다." },
  { q: "비가 오면 어떻게 되나요?", a: "실내 소리채집과 대체 프로그램으로 진행합니다. 비 오는 날의 소리도 좋은 재료가 됩니다." },
  { q: "점심이 포함되나요?", a: "네, 완주 로컬 점심이 참가비에 포함되어 있습니다." },
  { q: "아이도 참가할 수 있나요?", a: "초등학생 이상 가족 참가 가능합니다." },
  { q: "주차 가능한가요?", a: "네, 펜션 내 무료 주차 가능합니다." },
];

/* ───── 세부 프로그램 아코디언 ───── */
function ProgramAccordion({ p }: { p: typeof PROGRAM_DETAILS[0] }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden transition-shadow hover:shadow-md">
      <button onClick={() => setOpen(!open)} className="w-full text-left px-5 sm:px-6 py-5 flex items-center gap-4">
        <span className="flex-shrink-0 w-11 h-11 rounded-full bg-primary text-white flex items-center justify-center font-bold text-base">
          {p.num}
        </span>
        <div className="flex-1 min-w-0">
          <p className="font-bold text-gray-900 text-lg">{p.title}</p>
          <p className={`text-sm sm:text-base text-gray-500 ${open ? "" : "line-clamp-2"}`}>{p.sub}</p>
        </div>
        <span className="text-sm text-primary font-semibold whitespace-nowrap hidden sm:block">{p.leader}</span>
        {open ? <ChevronUp size={20} className="text-gray-400 flex-shrink-0" /> : <ChevronDown size={20} className="text-gray-400 flex-shrink-0" />}
      </button>
      {open && (
        <div className="px-5 sm:px-6 pb-6 border-t border-gray-100 pt-5">
          <div className="rounded-xl overflow-hidden mb-4">
            <img src={p.img} alt={p.title} className="w-full h-48 sm:h-56 object-cover" />
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-500 mb-3">
            <Clock size={14} /> {p.time}
            <span className="ml-2 px-2.5 py-1 rounded-full bg-primary/10 text-primary font-semibold text-sm">{p.leader}</span>
          </div>
          <p className="text-base text-gray-700 mb-4 leading-relaxed">{p.desc}</p>
          <ul className="space-y-2.5">
            {p.details.map((d, i) => (
              <li key={i} className="flex items-start gap-2.5 text-base text-gray-600">
                <span className="text-primary mt-0.5">&#x2022;</span> {d}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

/* ───── 후기 슬라이더 ───── */
function ReviewSlider() {
  const [current, setCurrent] = useState(0);
  const total = REVIEWS.length;
  const touchStart = useRef(0);

  const next = () => setCurrent((c) => (c + 1) % total);
  const prev = () => setCurrent((c) => (c === 0 ? total - 1 : c - 1));

  return (
    <section className="pb-14 sm:pb-16">
      <h2 className="text-xl sm:text-2xl font-black text-gray-900 text-center mb-2">달팽이아지트 리트릿 후기</h2>
      <p className="text-sm text-gray-500 text-center mb-1">같은 공간, 같은 호스트가 진행한 리트릿에 참가한 분들의 실제 후기입니다</p>
      <p className="text-xs text-gray-400 text-center mb-8">※ 「완주하다 봄 리트릿」(2026.4) 참가자 후기 · 소리산책은 9.6 첫 회차입니다</p>
      <div
        className="relative"
        onTouchStart={(e) => { touchStart.current = e.touches[0].clientX; }}
        onTouchEnd={(e) => {
          const diff = touchStart.current - e.changedTouches[0].clientX;
          if (diff > 50) next();
          else if (diff < -50) prev();
        }}
      >
        <div className="bg-white rounded-2xl border border-gray-200 p-6 sm:p-8 min-h-[200px] flex flex-col justify-between shadow-sm">
          <p className="text-base sm:text-lg text-gray-700 leading-relaxed">&ldquo;{REVIEWS[current].text}&rdquo;</p>
          <p className="text-sm font-bold text-primary mt-4">— {REVIEWS[current].name}</p>
        </div>
        <button onClick={prev} aria-label="이전 후기"
          className="absolute left-1 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white/80 backdrop-blur-sm shadow-md flex items-center justify-center hover:bg-white transition-colors">
          <ChevronLeft size={16} className="text-gray-700" />
        </button>
        <button onClick={next} aria-label="다음 후기"
          className="absolute right-1 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white/80 backdrop-blur-sm shadow-md flex items-center justify-center hover:bg-white transition-colors">
          <ChevronRight size={16} className="text-gray-700" />
        </button>
        <div className="flex items-center justify-center gap-2 mt-4">
          {Array.from({ length: total }).map((_, i) => (
            <button key={i} onClick={() => setCurrent(i)} aria-label={`${i + 1}번째 후기`}
              className={`w-2 h-2 rounded-full transition-all ${i === current ? "bg-primary scale-125" : "bg-gray-300"}`} />
          ))}
        </div>
        <p className="text-center text-xs text-gray-400 mt-2">{current + 1} / {total}</p>
      </div>
    </section>
  );
}

/* ───── FAQ 아코디언 ───── */
function FaqItem({ faq }: { faq: { q: string; a: string } }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden transition-shadow hover:shadow-md">
      <button onClick={() => setOpen(!open)} className="w-full text-left px-5 sm:px-6 py-5 flex items-center gap-4">
        <span className="flex-shrink-0 w-8 h-8 rounded-full bg-sage text-primary flex items-center justify-center font-bold text-sm">Q</span>
        <p className="flex-1 font-bold text-gray-900 text-sm sm:text-base">{faq.q}</p>
        {open ? <ChevronUp size={20} className="text-gray-400 flex-shrink-0" /> : <ChevronDown size={20} className="text-gray-400 flex-shrink-0" />}
      </button>
      {open && (
        <div className="px-5 sm:px-6 pb-5 border-t border-gray-100 pt-4">
          <p className="text-sm sm:text-base text-gray-700 leading-relaxed">{faq.a}</p>
        </div>
      )}
    </div>
  );
}

/* ───── 사전예약 폼 ───── */
function ApplyForm() {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [age, setAge] = useState("");
  const [gender, setGender] = useState("");
  const [occupation, setOccupation] = useState("");
  const [reason, setReason] = useState("");
  const [region, setRegion] = useState("");
  const [transport, setTransport] = useState("");
  const [photoConsent, setPhotoConsent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ ok: boolean; msg: string } | null>(null);
  const [waitlistModal, setWaitlistModal] = useState<{ show: boolean; number: number }>({ show: false, number: 0 });

  const submit = async () => {
    if (!name.trim()) { setResult({ ok: false, msg: "이름을 입력해주세요." }); return; }
    if (!phone.trim()) { setResult({ ok: false, msg: "연락처를 입력해주세요." }); return; }
    if (!age.trim()) { setResult({ ok: false, msg: "나이를 입력해주세요." }); return; }
    if (!gender) { setResult({ ok: false, msg: "성별을 선택해주세요." }); return; }
    if (!occupation.trim()) { setResult({ ok: false, msg: "현재 하시는 일을 입력해주세요." }); return; }
    if (!reason.trim()) { setResult({ ok: false, msg: "신청 이유를 입력해주세요." }); return; }
    if (!region.trim()) { setResult({ ok: false, msg: "지역을 입력해주세요." }); return; }
    if (!transport) { setResult({ ok: false, msg: "이동 방법을 선택해주세요." }); return; }
    if (!photoConsent) { setResult({ ok: false, msg: "촬영 동의에 체크해주세요." }); return; }
    setLoading(true);
    setResult(null);
    try {
      const res = await fetch("/api/programs/sound-walk", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, phone, age, gender, occupation, reason, region, transport, photoConsent }),
      });
      const data = await res.json();

      if (res.ok && data.success) {
        setName(""); setPhone(""); setAge(""); setGender(""); setOccupation("");
        setReason(""); setRegion(""); setTransport(""); setPhotoConsent(false);

        if (data.waitlisted === true) {
          const num = Number(data.waitlistNumber) || 1;
          setWaitlistModal({ show: true, number: num });
          setResult({ ok: true, msg: `🎵 아쉽게도 마감되었습니다! 대기자 ${num}번으로 등록되었어요.` });
        } else {
          setResult({ ok: true, msg: "사전예약이 완료되었습니다! 특가 결제·준비물 안내 문자가 발송됩니다." });
        }
      } else {
        setResult({ ok: false, msg: data.error || "사전예약 실패" });
      }
    } catch {
      setResult({ ok: false, msg: "네트워크 오류" });
    }
    setLoading(false);
  };

  const inputClass = "w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20";

  return (
    <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
      {/* 마감 안내 모달 */}
      {waitlistModal.show && (
        <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white rounded-3xl max-w-sm w-full overflow-hidden shadow-2xl">
            <div className="bg-gradient-to-br from-emerald-500 to-teal-600 text-white px-6 py-8 text-center">
              <div className="text-5xl mb-3">🎵</div>
              <p className="text-xs font-bold tracking-widest opacity-90 mb-1">SOLD OUT</p>
              <h3 className="text-2xl font-black">사전예약이 마감되었어요</h3>
              <p className="text-sm text-white/90 mt-2">사전예약 특가 {MAX_CAPACITY}명이 이미 채워졌습니다</p>
            </div>
            <div className="p-6 space-y-4">
              <div className="bg-emerald-50 border-2 border-emerald-200 rounded-2xl p-5 text-center">
                <p className="text-xs font-bold text-emerald-600 tracking-wide mb-1">대기자 번호</p>
                <p className="text-5xl font-black text-emerald-600">{waitlistModal.number}<span className="text-2xl">번</span></p>
                <p className="text-xs text-gray-500 mt-2">대기자 명단에 등록 완료 ✅</p>
              </div>
              <div className="bg-gray-50 rounded-xl p-4 space-y-2">
                <p className="text-sm font-bold text-gray-900">🌿 이렇게 진행됩니다</p>
                <ul className="text-xs text-gray-600 space-y-1 leading-relaxed">
                  <li>• 취소자 발생 시 <span className="font-bold text-emerald-600">순번대로</span> 연락드립니다</li>
                  <li>• 다음 회차 진행 시 <span className="font-bold text-emerald-600">가장 먼저</span> 안내드립니다</li>
                  <li>• 입력하신 연락처로 문자가 발송되었어요</li>
                </ul>
              </div>
              <button
                onClick={() => setWaitlistModal({ show: false, number: 0 })}
                className="w-full py-3.5 bg-primary text-white rounded-xl font-bold text-base hover:bg-primary-light transition-colors"
              >
                확인했어요
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="p-6 space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-xs font-semibold text-gray-600 block mb-1">이름 <span className="text-red-500">*</span></label>
            <input value={name} onChange={(e) => setName(e.target.value)} placeholder="홍길동" className={inputClass} />
          </div>
          <div>
            <label className="text-xs font-semibold text-gray-600 block mb-1">연락처 <span className="text-red-500">*</span></label>
            <input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="010-1234-5678" className={inputClass} />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-xs font-semibold text-gray-600 block mb-1">나이 <span className="text-red-500">*</span></label>
            <input value={age} onChange={(e) => setAge(e.target.value)} placeholder="예: 32" className={inputClass} />
          </div>
          <div>
            <label className="text-xs font-semibold text-gray-600 block mb-1">성별 <span className="text-red-500">*</span></label>
            <div className="flex gap-2">
              {["남성", "여성"].map((g) => (
                <button key={g} type="button" onClick={() => setGender(g)}
                  className={`flex-1 py-2.5 rounded-xl text-sm font-semibold border transition-all ${
                    gender === g ? "border-primary bg-primary/10 text-primary" : "border-gray-200 text-gray-400 hover:bg-gray-50"
                  }`}>{g}</button>
              ))}
            </div>
          </div>
        </div>
        <div>
          <label className="text-xs font-semibold text-gray-600 block mb-1">현재 하시는 일 <span className="text-red-500">*</span></label>
          <input value={occupation} onChange={(e) => setOccupation(e.target.value)} placeholder="예: 디자이너" className={inputClass} />
        </div>
        <div>
          <label className="text-xs font-semibold text-gray-600 block mb-1">신청 이유 / 기대하는 점 <span className="text-red-500">*</span></label>
          <textarea value={reason} onChange={(e) => setReason(e.target.value)} rows={3}
            placeholder="소리산책에 참가하고 싶은 이유나 기대하는 점을 자유롭게 적어주세요."
            className={`${inputClass} resize-none`} />
        </div>
        <div>
          <label className="text-xs font-semibold text-gray-600 block mb-1">지역 (시/군 단위) <span className="text-red-500">*</span></label>
          <input value={region} onChange={(e) => setRegion(e.target.value)} placeholder="예: 완주군" className={inputClass} />
        </div>
        <div>
          <label className="text-xs font-semibold text-gray-600 block mb-1">이동 방법 <span className="text-red-500">*</span></label>
          <div className="flex flex-col gap-2">
            {[
              { value: "전주고속터미널", label: "뚜벅이전용 — 전주고속터미널", time: "11:00", pickup: true },
              { value: "전주역", label: "뚜벅이전용 — 전주역", time: "11:20", pickup: true },
              { value: "자차", label: "개별이동 — 자차이용", time: "11:50", pickup: false },
            ].map((t) => (
              <button key={t.value} type="button" onClick={() => setTransport(t.value)}
                className={`w-full rounded-xl border-2 transition-all text-left overflow-hidden ${
                  transport === t.value ? "border-primary bg-primary/5 shadow-md" : "border-gray-200 hover:border-gray-300"
                }`}>
                <div className="flex items-center gap-3 px-4 py-3">
                  <span className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                    transport === t.value ? "border-primary bg-primary" : "border-gray-300"
                  }`}>
                    {transport === t.value && <span className="w-2 h-2 rounded-full bg-white" />}
                  </span>
                  <div className="flex-1">
                    <p className={`text-sm font-bold ${transport === t.value ? "text-primary" : "text-gray-700"}`}>{t.label}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-amber-100 text-amber-700 rounded-full text-[11px] font-bold">⏰ {t.time} 집결</span>
                      {t.pickup
                        ? <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-blue-100 text-blue-700 rounded-full text-[11px] font-bold">🚐 카니발 픽업</span>
                        : <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-gray-100 text-gray-600 rounded-full text-[11px] font-bold">🏡 펜션 집결</span>}
                    </div>
                  </div>
                </div>
              </button>
            ))}
          </div>
          {(transport === "전주역" || transport === "전주고속터미널") && (
            <div className="mt-2 p-3 bg-gradient-to-r from-primary/10 to-amber-50 border border-primary/30 rounded-xl">
              <p className="text-sm font-black text-primary">🚐 카니발로 친절히 모시러 갑니다!</p>
              <p className="text-xs text-gray-600 mt-1">
                <span className="font-bold text-amber-600">{transport}</span>에서{" "}
                <span className="font-bold text-amber-600">{transport === "전주고속터미널" ? "11:00" : "11:20"}</span>에 집결 — 확정 후 상세 안내 드립니다
              </p>
            </div>
          )}
        </div>
        <div>
          <label className="flex items-start gap-2 cursor-pointer">
            <input type="checkbox" checked={photoConsent} onChange={(e) => setPhotoConsent(e.target.checked)}
              className="mt-0.5 w-4 h-4 rounded border-gray-300 text-primary focus:ring-primary/20" />
            <span className="text-xs text-gray-600">
              <span className="font-bold text-red-500">*</span> 리트릿 중 촬영되는 사진/영상이 홍보 목적으로 활용될 수 있음에 동의합니다. (필수)
            </span>
          </label>
        </div>
        <button onClick={submit} disabled={loading}
          className="w-full py-3.5 rounded-xl text-white font-bold text-base transition-colors disabled:opacity-50 bg-primary hover:bg-primary-light">
          {loading ? "사전예약 중..." : `사전예약 특가 ${FEE.toLocaleString("ko-KR")}원으로 신청하기`}
        </button>
        {result && (
          <p className={`text-center text-sm font-semibold ${result.ok ? "text-green-600" : "text-red-500"}`}>
            {result.msg}
          </p>
        )}
      </div>
    </div>
  );
}

/* ───── 잔여석 조회 ───── */
function useSoundwalkStatus() {
  const [status, setStatus] = useState({ current: 0, remaining: MAX_CAPACITY, max: MAX_CAPACITY, closed: false });
  useEffect(() => {
    fetch("/api/programs/sound-walk")
      .then((r) => r.json())
      .then((d) => setStatus(d))
      .catch(() => {});
  }, []);
  return status;
}

/* ───── D-day ───── */
function getDday() {
  const diff = Math.ceil((new Date(EVENT_DATE).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
  return diff > 0 ? diff : 0;
}

/* ───── 메인 페이지 ───── */
export default function SoundWalkPage() {
  const status = useSoundwalkStatus();
  const [dday, setDday] = useState<number | null>(null);

  // D-day는 클라이언트에서만 계산 (SSR/CSR 시각 차이로 인한 hydration 불일치 방지)
  useEffect(() => setDday(getDday()), []);

  const fee = FEE.toLocaleString("ko-KR");
  const originalFee = ORIGINAL_FEE.toLocaleString("ko-KR");

  return (
    <div className="min-h-screen bg-background">
      {/* 상단 내비 */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-md shadow-sm">
        <div className="max-w-5xl mx-auto px-4 h-14 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 text-gray-700 hover:text-primary transition-colors">
            <ChevronLeft size={18} />
            <span className="text-sm font-medium">달팽이아지트</span>
          </Link>
          <div className="flex items-center gap-2">
            <a href={KAKAO_URL} target="_blank" rel="noopener noreferrer"
              className="flex items-center gap-1 bg-[#FEE500] text-[#3C1E1E] px-3 py-2 rounded-full text-xs font-bold hover:brightness-95 transition-all">
              <MessageCircle size={12} /> 카톡문의
            </a>
            <a href="#apply" className="bg-primary text-white px-4 py-2 rounded-full text-xs font-semibold hover:bg-primary-light transition-all">
              사전예약
            </a>
          </div>
        </div>
      </nav>

      {/* ─── 1. 히어로 ─── */}
      <section className="relative pt-14">
        {/* 3키워드 블록이 들어가 높이가 늘어나므로 고정 높이 대신 min-height + 패딩으로
            내용이 잘리지 않게 한다. */}
        <div className="relative min-h-[80vh] overflow-hidden">
          <img src={IMG.hero} alt="완주 숲 소리산책" className="absolute inset-0 w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/45 to-black/75" />
          <div className="relative z-10 min-h-[80vh] flex flex-col items-center justify-center text-center px-4 py-14 sm:py-16">
            {/* 얼굴 문구 — 3키워드보다 먼저 읽히는 은은한 도입 한 줄 */}
            <p className="flex items-center gap-2.5 text-xs sm:text-sm text-white/55 tracking-[0.2em] mb-5">
              <span className="w-6 sm:w-10 h-px bg-white/25" />
              자연에 귀 기울여보세요
              <span className="w-6 sm:w-10 h-px bg-white/25" />
            </p>

            <span className="text-4xl mb-3">🎵</span>

            {/* 3키워드 — 이 워크샵이 주는 경험 3가지 */}
            <p className="text-xl sm:text-3xl font-black text-white tracking-[0.15em]">
              {KEYWORDS.map((k, i) => (
                <span key={k.word}>
                  {i > 0 && <span className="text-white/40 font-normal mx-1.5">·</span>}
                  {k.word}
                </span>
              ))}
            </p>

            <h1 className="text-2xl sm:text-4xl font-black text-white leading-tight mt-3">
              완주 숲의 소리로<br />나만의 음악을 만드는 하루
            </h1>

            {/* 키워드별 한 줄 설명 */}
            <div className="grid grid-cols-3 gap-2 sm:gap-3 mt-5 w-full max-w-lg">
              {KEYWORDS.map((k) => (
                <div key={k.word} className="bg-white/10 backdrop-blur-sm rounded-xl px-2 py-3 border border-white/20">
                  <span className="text-xl block">{k.icon}</span>
                  <p className="text-sm font-black text-white mt-1">{k.word}</p>
                  <p className="text-[10px] sm:text-xs text-white/60 mt-0.5 leading-snug whitespace-pre-line">{k.desc}</p>
                </div>
              ))}
            </div>

            <div className="mt-5 inline-flex items-center gap-2 bg-red-500 text-white px-4 py-1.5 rounded-full text-sm font-black shadow-lg animate-pulse">
              🎉 사전예약 특가 {DISCOUNT_PERCENT}% · {MAX_CAPACITY}명 한정
            </div>

            <div className="flex flex-wrap items-center justify-center gap-3 mt-6">
              <div className="flex items-center gap-1.5 bg-white/20 backdrop-blur-sm text-white px-4 py-2 rounded-full text-sm">
                <Calendar size={14} /> 2026.9.6(일) 12:00~18:00
              </div>
              <div className="flex items-center gap-1.5 bg-white/20 backdrop-blur-sm text-white px-4 py-2 rounded-full text-sm">
                <MapPin size={14} /> 달팽이아지트펜션 (전북 완주 소양)
              </div>
              <div className="flex items-center gap-1.5 bg-white/20 backdrop-blur-sm text-white px-4 py-2 rounded-full text-sm">
                <Users size={14} /> {MAX_CAPACITY}명 한정
              </div>
            </div>
            <p className="text-xs text-white/50 mt-3 flex items-center gap-1">
              <Train size={12} /> 서울에서 KTX 1시간 30분 · 자차 2시간 30분
            </p>

            <div className="mt-6 bg-white/10 backdrop-blur-md rounded-2xl px-6 py-4 border border-white/20">
              <div className="flex items-center justify-center gap-2">
                <span className="text-lg text-white/50 line-through">{originalFee}원</span>
                <span className="text-xs bg-red-500 text-white px-2 py-0.5 rounded-full font-black">{DISCOUNT_PERCENT}% OFF</span>
              </div>
              <p className="text-4xl font-black text-white mt-1">{fee}원</p>
              <p className="text-xs text-amber-300 font-bold mt-1.5">사전예약 특가 · 선착순 {MAX_CAPACITY}명</p>
              {dday !== null && dday > 0 && (
                <p className="text-xs font-bold text-white/60 mt-2">D-{dday}</p>
              )}
            </div>

            <div className="flex items-center gap-2 mt-6">
              <a href="#apply" className="px-6 py-3 bg-primary text-white rounded-full font-bold text-sm hover:bg-primary-light transition-colors">
                사전예약하기
              </a>
              <a href={KAKAO_URL} target="_blank" rel="noopener noreferrer"
                className="px-6 py-3 bg-[#FEE500] text-[#3C1E1E] rounded-full font-bold text-sm hover:brightness-95 transition-all">
                카톡 문의
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* ─── 2. 숫자로 보는 리트릿 ─── */}
      <section className="bg-gray-50 border-b border-gray-100">
        <div className="max-w-4xl mx-auto px-4 py-10 sm:py-14">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 text-center">
            {STATS.map((s, i) => (
              <div key={i}>
                <p className="text-3xl sm:text-4xl font-black text-primary">{s.num}</p>
                <p className="text-sm font-bold text-gray-900 mt-1">{s.label}</p>
                <p className="text-xs text-gray-400 mt-0.5">{s.sub}</p>
              </div>
            ))}
          </div>
          {!status.closed && (
            <p className="text-center text-xs font-bold text-amber-600 mt-6">
              🎧 사전예약 {status.current}명 · <span className="text-red-600">특가 남은 자리 {status.remaining}석</span>
            </p>
          )}
          {status.closed && (
            <p className="text-center text-xs font-bold text-rose-600 mt-6">
              🎵 사전예약 특가 {MAX_CAPACITY}명 마감 — 지금 신청하시면 대기자로 등록됩니다
            </p>
          )}
        </div>
      </section>

      <div className="max-w-3xl mx-auto px-4 pb-24">
        {/* ─── 인트로 카피 ─── */}
        <section className="py-14 sm:py-16 text-center">
          <p className="text-lg sm:text-xl text-gray-700 leading-relaxed font-medium">
            눈을 뜨면 풍경을 보지만,<br />눈을 감으면 소리가 들립니다.
          </p>
          <p className="text-lg sm:text-xl text-primary font-bold mt-6 leading-relaxed">
            완주의 숲이 들려주는 소리를 모아,<br />세상에 하나뿐인 나의 음악으로.
          </p>
          <p className="text-sm text-gray-500 mt-6 max-w-md mx-auto">
            천천히 걷고, 귀 기울이고, 만들어보는<br />
            채집한 소리를 <span className="font-bold text-primary">원소스</span>로 쓰는 AI 음악창작 리트릿
          </p>
        </section>

        {/* ─── 3. 이런 분께 추천 ─── */}
        <section className="pb-14 sm:pb-16">
          <h2 className="text-xl sm:text-2xl font-black text-gray-900 text-center mb-8">이런 분께 추천합니다</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {TARGETS.map((t, i) => (
              <div key={i} className="bg-white rounded-2xl border border-gray-200 p-6 text-center hover:shadow-md transition-shadow">
                <span className="text-3xl">{t.icon}</span>
                <p className="font-bold text-gray-900 mt-3 whitespace-pre-line text-sm">{t.title}</p>
                <p className="text-xs text-gray-500 mt-2">{t.desc}</p>
              </div>
            ))}
          </div>
          <div className="mt-6 bg-sage/50 rounded-2xl p-5">
            <p className="text-sm text-gray-700 font-medium text-center">
              자연을 좋아하는 사람, 새로운 청각 경험을 원하는 사람,<br />
              <span className="text-primary font-bold">AI 창작이 궁금한 사람, 나만의 기념품을 갖고 싶은 사람 누구나</span>
            </p>
          </div>
        </section>

        {/* ─── 4. BEFORE → AFTER ─── */}
        <section className="pb-14 sm:pb-16">
          <p className="text-xs font-bold text-primary text-center tracking-widest mb-2">BEFORE → AFTER</p>
          <h2 className="text-xl sm:text-2xl font-black text-gray-900 text-center mb-8">6시간이 바꾸는 것</h2>
          <div className="grid grid-cols-2 gap-3 sm:gap-4">
            <div className="bg-gray-50 rounded-2xl border border-gray-200 p-5">
              <p className="text-xs font-black text-gray-400 tracking-widest mb-4">BEFORE</p>
              <ul className="space-y-3">
                {BEFORE_AFTER.map((b, i) => (
                  <li key={i} className="text-sm text-gray-500 leading-snug">{b.before}</li>
                ))}
              </ul>
            </div>
            <div className="bg-white rounded-2xl border-2 border-primary/30 p-5 shadow-sm">
              <p className="text-xs font-black text-primary tracking-widest mb-4">AFTER</p>
              <ul className="space-y-3">
                {BEFORE_AFTER.map((b, i) => (
                  <li key={i} className="text-sm font-semibold text-gray-800 leading-snug flex items-start gap-1.5">
                    <Check size={14} className="text-primary flex-shrink-0 mt-0.5" /> {b.after}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        {/* ─── 5. 참여 흐름 (세로 타임라인) ─── */}
        <section className="pb-14 sm:pb-16">
          <p className="text-xs font-bold text-primary text-center tracking-widest mb-2">HOW IT WORKS</p>
          <h2 className="text-xl sm:text-2xl font-black text-gray-900 text-center mb-10">사전예약부터 귀가까지</h2>
          <div className="relative">
            <div className="absolute left-5 sm:left-6 top-2 bottom-2 w-0.5 bg-sage" />
            <div className="space-y-5">
              {JOURNEY.map((j) => (
                <div key={j.step} className="relative flex items-start gap-4">
                  <div className="relative z-10 w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-white border-2 border-primary flex items-center justify-center flex-shrink-0 shadow-sm">
                    <span className="text-lg">{j.icon}</span>
                  </div>
                  <div className="flex-1 bg-white rounded-2xl border border-gray-200 p-4 sm:p-5">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-black text-primary tracking-widest">STEP {j.step}</span>
                    </div>
                    <p className="font-black text-gray-900 text-base mt-1">{j.title}</p>
                    <p className="text-sm text-gray-600 mt-1 leading-relaxed">{j.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ─── 6. 주요 프로그램 ─── */}
        <section className="pb-14 sm:pb-16">
          <h2 className="text-xl sm:text-2xl font-black text-gray-900 text-center mb-8">주요 프로그램</h2>
          <div className="space-y-4">
            {PROGRAMS.map((p, i) => (
              <div key={p.num} className={`rounded-2xl border ${p.color} relative overflow-hidden`}>
                <div className="relative h-48 sm:h-56 overflow-hidden">
                  <img src={p.img} alt={p.title} className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
                  <div className="absolute top-3 left-3 w-9 h-9 rounded-full bg-white/90 flex items-center justify-center font-black text-base">
                    {p.num}
                  </div>
                  <div className="absolute bottom-3 left-4 right-4 flex items-center gap-2">
                    <span className="text-lg">{p.emoji}</span>
                    <h3 className="font-black text-white text-base sm:text-lg drop-shadow-md">{p.title}</h3>
                  </div>
                </div>
                <div className="p-4">
                  <p className="text-xs font-semibold text-primary/70">{p.tag}</p>
                  <p className="text-sm text-gray-600 mt-1.5 leading-relaxed">{p.desc}</p>
                </div>
                {i < PROGRAMS.length - 1 && (
                  <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 text-gray-300">
                    <ChevronDown size={20} />
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>

        {/* ─── 7. 이끄미 ─── */}
        <section className="pb-14 sm:pb-16">
          <h2 className="text-xl sm:text-2xl font-black text-gray-900 text-center mb-3">이 시간을 함께 여는 이끄미</h2>
          <p className="text-sm text-gray-500 text-center mb-8">소리와 창작, 두 갈래를 함께 안내합니다</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {LEADERS.map((l, i) => (
              <div key={i} className={`rounded-2xl border p-5 ${l.color}`}>
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-20 h-20 rounded-full bg-white flex items-center justify-center flex-shrink-0 border-2 border-white shadow-sm">
                    <span className="text-3xl">{l.emoji}</span>
                  </div>
                  <div>
                    <p className="text-lg font-black text-gray-900">
                      {l.name} <span className="text-sm font-medium text-gray-500">이끄미</span>
                    </p>
                    <p className="text-xs font-semibold text-gray-500">{l.role}</p>
                  </div>
                </div>
                <p className="text-sm text-gray-700 leading-relaxed mb-3">{l.desc}</p>
                <div className="flex flex-wrap gap-1.5">
                  {l.programs.map((prog) => (
                    <span key={prog} className={`text-xs font-semibold px-2.5 py-1 rounded-full ${l.tagColor}`}>{prog}</span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ─── 8. 참가비 배너 ─── */}
        <section className="pb-14 sm:pb-16">
          <div className="bg-gradient-to-r from-primary to-emerald-600 rounded-2xl p-6 sm:p-8 text-white text-center relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-full opacity-10">
              <div className="absolute top-4 left-8 text-6xl rotate-12">🎵</div>
              <div className="absolute bottom-4 right-8 text-6xl -rotate-12">🌿</div>
            </div>
            <div className="relative z-10">
              <p className="text-sm font-bold text-white/80 uppercase tracking-wider">사전예약 특가</p>
              <div className="flex items-center justify-center gap-2 mt-3">
                <span className="text-xl sm:text-2xl text-white/50 line-through">{originalFee}원</span>
                <span className="text-xs bg-red-500 text-white px-2.5 py-1 rounded-full font-black">{DISCOUNT_PERCENT}% OFF</span>
              </div>
              <div className="flex items-center justify-center gap-3 mt-1">
                <span className="text-4xl sm:text-5xl font-black">{fee}원</span>
              </div>
              <div className="inline-block mt-3 px-4 py-1.5 bg-white/20 backdrop-blur-sm rounded-full">
                <span className="text-sm">6시간 · 점심·프로그램·기념품 모두 포함</span>
              </div>
              <p className="text-sm text-white/70 mt-3">사전예약 {MAX_CAPACITY}명까지만 특가 · 최소 {MIN_CAPACITY}명 개최</p>
            </div>
          </div>
        </section>

        {/* ─── 9. VALUE PACKAGE ─── */}
        <section className="pb-14 sm:pb-16">
          <div className="text-center mb-8">
            <p className="text-sm font-bold text-primary uppercase tracking-wider mb-2">VALUE PACKAGE</p>
            <h2 className="text-xl sm:text-2xl font-black text-gray-900">
              참가비에 포함된 <span className="text-primary">8가지 혜택</span>
            </h2>
            <p className="text-sm text-gray-500 mt-2">이 모든 것이 한 번의 참가비에 포함됩니다</p>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {BENEFITS.map((b, i) => (
              <div key={i} className="bg-white rounded-xl border border-gray-200 p-4 hover:shadow-md transition-all hover:-translate-y-0.5">
                <div className="flex items-start gap-3">
                  <span className="text-2xl flex-shrink-0">{b.icon}</span>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-gray-900 text-sm">{b.title}</p>
                    <p className="text-xs text-gray-500 mt-0.5">{b.desc}</p>
                    <p className="text-xs font-bold text-primary mt-1">{b.value}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-6 bg-gradient-to-r from-primary/5 to-primary/10 rounded-2xl p-6 text-center border border-primary/20">
            <p className="text-sm text-gray-600">혜택을 환산하면</p>
            <p className="text-2xl font-black text-gray-900 mt-1">
              총 <span className="text-primary">11.5만원</span> 이상의 가치{" "}
              <span className="text-sm text-gray-500">+ 측정불가 혜택</span>
            </p>
            <div className="mt-4">
              <p className="text-sm text-gray-500">정가</p>
              <p className="text-xl font-bold text-gray-400 line-through">{originalFee}원</p>
              <p className="text-sm text-gray-500 mt-3">
                사전예약 특가 <span className="text-red-500 font-black">{DISCOUNT_PERCENT}% OFF</span>
              </p>
              <p className="text-4xl font-black text-primary mt-1">{fee}원</p>
            </div>
            <div className="mt-5 pt-5 border-t border-primary/20">
              <p className="text-base sm:text-lg font-bold text-gray-800 leading-relaxed">
                자연에 귀 기울여 보는 경험은<br />
                <span className="text-primary">그 어떤 가치로도 환산할 수 없습니다.</span>
              </p>
            </div>
            <a href="#apply" className="inline-flex items-center gap-2 mt-5 px-6 py-3 bg-primary text-white rounded-full font-bold text-sm hover:bg-primary-light transition-colors">
              사전예약 특가로 신청하기 <ArrowRight size={14} />
            </a>
          </div>
        </section>

        {/* ─── 10. 타임테이블 ─── */}
        <section className="pb-14 sm:pb-16">
          <h2 className="text-xl sm:text-2xl font-black text-gray-900 text-center mb-2">하루 타임테이블</h2>
          <p className="text-sm text-gray-500 text-center mb-6">2026.9.6(일) · 12:00~18:00</p>
          <div className="space-y-2.5">
            {TIMETABLE.map((item, i) => (
              <div key={i} className="flex items-center gap-3 bg-white rounded-xl border border-gray-200 px-4 py-3">
                <span className="text-xl flex-shrink-0">{item.icon}</span>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-gray-900 text-sm">
                    {item.label.includes("(") ? (
                      <>
                        {item.label.split("(")[0].trim()}
                        <br />
                        <span className="font-normal text-xs text-gray-500">({item.label.split("(").slice(1).join("(")}</span>
                      </>
                    ) : item.label}
                  </p>
                  <p className="text-[11px] text-gray-400 mt-0.5">{item.time}</p>
                </div>
                {item.tag && (
                  <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full flex-shrink-0 ${item.color}`}>{item.tag}</span>
                )}
              </div>
            ))}
          </div>

          {/* 음악창작 블록 세부 */}
          <div className="mt-5 bg-blue-50 rounded-2xl border border-blue-100 p-5">
            <p className="text-sm font-black text-gray-900 mb-3">🎵 음악창작 블록은 이렇게 진행돼요</p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {CREATE_STEPS.map((s, i) => (
                <div key={i} className="bg-white rounded-xl p-3 text-center border border-blue-100">
                  <p className="text-[11px] font-bold text-blue-600">{s.min}</p>
                  <p className="text-xs font-semibold text-gray-700 mt-1">{s.step}</p>
                </div>
              ))}
            </div>
          </div>

          {/* 원소스 → 음악 흐름 */}
          <div className="mt-5 bg-white rounded-2xl border-2 border-primary/20 p-5 sm:p-6">
            <p className="text-xs font-bold text-primary text-center tracking-widest mb-1">ONE SOURCE</p>
            <p className="text-base sm:text-lg font-black text-gray-900 text-center mb-5">
              내가 주운 소리가 <span className="text-primary">곡의 원소스</span>가 됩니다
            </p>
            <div className="flex flex-col sm:flex-row items-stretch justify-center gap-2 sm:gap-3">
              {SOURCE_FLOW.map((f, i) => (
                <div key={f.title} className="flex-1 flex flex-col sm:flex-row items-center gap-2 sm:gap-3">
                  <div className="flex-1 w-full bg-sage/40 rounded-xl p-4 text-center border border-primary/10">
                    <span className="text-2xl block">{f.icon}</span>
                    <p className="text-sm font-black text-gray-900 mt-1.5">{f.title}</p>
                    <p className="text-[11px] text-gray-600 mt-1 leading-snug">{f.desc}</p>
                  </div>
                  {i < SOURCE_FLOW.length - 1 && (
                    <span className="text-primary font-black text-lg rotate-90 sm:rotate-0 flex-shrink-0">→</span>
                  )}
                </div>
              ))}
            </div>
            <p className="text-xs text-gray-500 text-center mt-5">
              녹음키트는 저희가 준비합니다 ·{" "}
              <a href={SUNO_URL} target="_blank" rel="noopener noreferrer" className="font-bold text-blue-700 underline hover:no-underline">
                Suno 가입만 미리 해오세요
              </a>
            </p>
          </div>
        </section>

        {/* ─── 11. 세부 프로그램 (아코디언) ─── */}
        <section className="pb-14 sm:pb-16">
          <h2 className="text-xl sm:text-2xl font-black text-gray-900 text-center mb-3">세부 프로그램</h2>
          <p className="text-sm text-gray-500 text-center mb-8">각 블록에서 실제로 무엇을 하는지 눌러서 확인하세요</p>
          <div className="space-y-4">
            {PROGRAM_DETAILS.map((p) => (
              <ProgramAccordion key={p.num} p={p} />
            ))}
          </div>
        </section>

        {/* ─── 12. 준비물 안내 ─── */}
        <section className="pb-14 sm:pb-16">
          <div className="text-center mb-8">
            <Headphones size={28} className="mx-auto text-primary" />
            <h2 className="text-xl sm:text-2xl font-black text-gray-900 mt-3">준비물 안내</h2>
            <p className="text-sm text-gray-500 mt-2">Suno 앱만 미리 설치해오시면 끝!</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {PREP.map((p, i) => (
              <div key={i} className={`rounded-2xl border p-5 ${p.tone}`}>
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-xl">{p.icon}</span>
                  <p className="font-black text-gray-900 text-sm">{p.who}</p>
                </div>
                <ul className="space-y-2">
                  {p.items.map((item) => (
                    <li key={item} className="flex items-start gap-2 text-sm text-gray-700">
                      <Check size={14} className="text-primary flex-shrink-0 mt-0.5" /> {item}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          {/* Suno 가입 바로가기 */}
          <div className="mt-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl border-2 border-blue-200 p-5 text-center">
            <p className="text-sm font-black text-gray-900">🎼 지금 Suno 가입해두세요</p>
            <p className="text-xs text-gray-600 mt-1.5 leading-relaxed">
              당일 <span className="font-bold text-blue-700">채집한 소리를 원소스로 업로드</span>해서 곡을 만듭니다.<br />
              가입만 미리 해두시면 현장에서 바로 시작할 수 있어요. (1분, 무료)
            </p>
            <a
              href={SUNO_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-4 inline-flex items-center gap-2 px-6 py-3 bg-gray-900 text-white rounded-xl font-bold text-sm hover:bg-gray-800 transition-colors"
            >
              suno.com 무료 가입하기 <ArrowRight size={14} />
            </a>
            <p className="text-[11px] text-gray-400 mt-2">{SUNO_URL.replace("https://", "")}</p>
          </div>

          <div className="mt-4 bg-white rounded-2xl border border-gray-200 p-5">
            <p className="text-sm font-bold text-gray-900 mb-2">💡 Suno 결제, 꼭 해야 하나요?</p>
            <p className="text-xs text-gray-600 leading-relaxed">
              무료 체험으로도 곡을 만들 수 있습니다. 만든 곡을 소장·활용하려면 Pro(월 약 1.3만원) 결제가 필요하고,
              이건 각자 선택입니다. <span className="font-semibold text-primary">어떤 경우든 만든 곡의 권리는 본인 소유</span>입니다.
            </p>
          </div>
        </section>

        {/* ─── 13. 가격 안내 ─── */}
        <section className="pb-14 sm:pb-16">
          <p className="text-xs font-bold text-primary text-center tracking-widest mb-2">PRICING</p>
          <h2 className="text-xl sm:text-2xl font-black text-gray-900 text-center mb-2">사전예약 특가 안내</h2>
          <p className="text-sm text-gray-500 text-center mb-8">첫 회차 사전예약 {MAX_CAPACITY}명에게만 드리는 가격입니다</p>

          <div className="max-w-md mx-auto">
            <div className="bg-white rounded-2xl border-2 border-primary-light overflow-hidden shadow-lg">
              <div className="bg-primary text-white px-6 py-6 text-center relative">
                <div className="absolute top-3 right-3 bg-red-500 text-white text-xs font-black px-3 py-1 rounded-full">
                  {DISCOUNT_PERCENT}% OFF
                </div>
                <p className="text-sm font-bold text-emerald-200">달팽이 소리산책 리트릿</p>
                <p className="text-lg text-white/50 line-through mt-2">{originalFee}원</p>
                <p className="text-4xl font-black">{fee}<span className="text-lg font-bold">원</span></p>
                <div className="flex items-center justify-center gap-1.5 mt-3 bg-white/20 px-4 py-1.5 rounded-full text-sm mx-auto w-fit">
                  <Clock size={14} /> 12:00~18:00 (6시간)
                </div>
              </div>
              <div className="p-6">
                <p className="text-xs font-bold text-gray-600 mb-3">포함 항목</p>
                <div className="space-y-2">
                  {INCLUDED.map((item) => (
                    <div key={item} className="flex items-center gap-2">
                      <Check size={14} className="text-primary flex-shrink-0" />
                      <span className="text-sm text-gray-700">{item}</span>
                    </div>
                  ))}
                </div>
                <a href="#apply" className="mt-6 w-full inline-flex items-center justify-center gap-2 py-3.5 bg-primary text-white rounded-xl font-bold text-base hover:bg-primary-light transition-colors">
                  사전예약하기 <ArrowRight size={14} />
                </a>
              </div>
            </div>
          </div>

          {/* 사전예약 특가 조건 안내 */}
          <div className="mt-8 bg-red-50 rounded-2xl p-6 border-2 border-red-200 max-w-md mx-auto">
            <p className="text-sm font-black text-gray-900 mb-4 text-center">🎉 왜 이 가격인가요?</p>
            <div className="space-y-3">
              {PRICE_NOTES.map((n, i) => (
                <div key={i} className="flex items-start gap-2.5 bg-white rounded-xl p-3.5 border border-red-100">
                  <span className="text-lg flex-shrink-0">{n.icon}</span>
                  <div>
                    <p className="text-sm font-bold text-gray-900">{n.title}</p>
                    <p className="text-xs text-gray-600 mt-0.5 leading-relaxed">{n.desc}</p>
                  </div>
                </div>
              ))}
            </div>
            <p className="text-[11px] text-center text-red-500 font-bold mt-4">
              {MAX_CAPACITY}명 마감 시 특가 종료 · 이후 회차는 정가 {originalFee}원
            </p>
          </div>
        </section>

        {/* ─── 14. 왜 달팽이아지트인가 ─── */}
        <section className="pb-14 sm:pb-16">
          <p className="text-xs font-bold text-primary text-center tracking-widest mb-2">VENUE</p>
          <h2 className="text-xl sm:text-2xl font-black text-gray-900 text-center mb-8">왜 달팽이아지트인가?</h2>
          <div className="space-y-3">
            {VENUE_POINTS.map((v, i) => (
              <div key={i} className="bg-white rounded-2xl border border-gray-200 p-5 flex items-start gap-4">
                <span className="text-2xl flex-shrink-0">{v.icon}</span>
                <div>
                  <p className="font-black text-gray-900 text-sm">{v.title}</p>
                  <p className="text-sm text-gray-600 mt-1 leading-relaxed">{v.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ─── 15. 참가 안내 + 교통 + 사전예약 폼 ─── */}
        <section className="pb-14 sm:pb-16">
          <h2 className="text-xl sm:text-2xl font-black text-gray-900 text-center mb-8">참가 안내</h2>
          <div className="bg-white rounded-2xl border border-gray-200 p-6 space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">일시</p>
                <p className="text-sm font-semibold text-gray-900 mt-1">2026.9.6(일)</p>
                <p className="text-xs text-gray-500">12:00~18:00 (6시간)</p>
              </div>
              <div>
                <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">장소</p>
                <p className="text-sm font-semibold text-gray-900 mt-1">달팽이아지트펜션</p>
                <p className="text-xs text-gray-500">전북 완주군 소양면 해월신왕길 92</p>
              </div>
              <div>
                <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">인원</p>
                <p className="text-sm font-semibold text-gray-900 mt-1">{MAX_CAPACITY}명 한정</p>
                <p className="text-xs text-gray-500">사전예약 선착순 · 최소 {MIN_CAPACITY}명 개최</p>
              </div>
              <div>
                <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">참가비</p>
                <p className="text-sm font-semibold mt-1">
                  <span className="text-gray-400 line-through text-xs">{originalFee}원</span>{" "}
                  <span className="text-primary text-lg font-black">{fee}원</span>
                </p>
                <p className="text-xs text-red-500 font-bold">사전예약 특가 {DISCOUNT_PERCENT}% OFF</p>
              </div>
            </div>
            <div className="border-t border-gray-100 pt-4">
              <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-2">포함 내용</p>
              <div className="flex flex-wrap gap-2">
                {INCLUDED.map((item) => (
                  <span key={item} className="px-3 py-1.5 rounded-full bg-sage text-sm text-gray-700 font-medium">{item}</span>
                ))}
              </div>
            </div>
          </div>

          {/* 교통편 */}
          <div className="mt-8 bg-blue-50 rounded-2xl p-6 border border-blue-100">
            <div className="flex items-center gap-2 mb-4">
              <Train size={20} className="text-blue-600" />
              <h3 className="font-black text-gray-900">서울에서 오시나요?</h3>
            </div>
            <div className="space-y-3">
              <div className="flex items-start gap-3 bg-white rounded-xl p-4">
                <span className="text-lg">🚄</span>
                <div>
                  <p className="font-bold text-sm text-gray-900">KTX (추천)</p>
                  <p className="text-xs text-gray-500 mt-0.5">용산역 → 전주역 <span className="font-bold text-blue-600">1시간 30분</span></p>
                  <p className="text-xs text-gray-400">전주역 11:20 카니발 픽업</p>
                </div>
              </div>
              <div className="flex items-start gap-3 bg-white rounded-xl p-4">
                <span className="text-lg">🚌</span>
                <div>
                  <p className="font-bold text-sm text-gray-900">고속버스</p>
                  <p className="text-xs text-gray-500 mt-0.5">센트럴시티 → 전주 <span className="font-bold text-blue-600">2시간 40분</span></p>
                  <p className="text-xs text-gray-400">전주고속터미널 11:00 카니발 픽업</p>
                </div>
              </div>
              <div className="flex items-start gap-3 bg-white rounded-xl p-4">
                <span className="text-lg">🚗</span>
                <div>
                  <p className="font-bold text-sm text-gray-900">자차</p>
                  <p className="text-xs text-gray-500 mt-0.5">서울 → 완주 <span className="font-bold text-blue-600">약 2시간 30분</span></p>
                  <p className="text-xs text-gray-400">무료 주차 · 네비: 전북 완주군 해월신왕길 92</p>
                </div>
              </div>
            </div>
            <p className="text-xs text-blue-500 font-semibold mt-4 text-center">💡 교통편 고민되시면 카톡으로 편하게 물어보세요!</p>
          </div>

          <div id="apply" className="mt-6 scroll-mt-20">
            <ApplyForm />
          </div>
        </section>

        {/* ─── 16. 후기 슬라이더 ─── */}
        <div id="reviews" className="scroll-mt-20">
          <ReviewSlider />
        </div>

        {/* ─── 17. FAQ ─── */}
        <section className="pb-14 sm:pb-16">
          <p className="text-xs font-bold text-primary text-center tracking-widest mb-2">FAQ</p>
          <h2 className="text-xl sm:text-2xl font-black text-gray-900 text-center mb-8">자주 묻는 질문</h2>
          <div className="space-y-3">
            {FAQS.map((faq, i) => (
              <FaqItem key={i} faq={faq} />
            ))}
          </div>
        </section>

        {/* ─── 18. 클로징 CTA ─── */}
        <section className="pb-12 sm:pb-16">
          <div className="rounded-2xl p-8 text-white text-center relative overflow-hidden">
            <img src={IMG.closing} alt="완주 숲 풍경" className="absolute inset-0 w-full h-full object-cover" />
            <div className="absolute inset-0 bg-black/65" />
            <div className="relative z-10">
              <Sparkles size={32} className="mx-auto text-amber-400" />
              <h3 className="text-xl sm:text-2xl font-black mt-4">
                완주 숲의 소리가<br /><span className="text-amber-400">당신의 음악이 되는 하루</span>
              </h3>
              <p className="text-white/60 text-sm mt-3 max-w-sm mx-auto">
                소리를 줍고, 음악을 만들고, 함께 듣는 6시간.<br />
                돌아가는 길, 플레이리스트에 나만의 곡이 남습니다.
              </p>
              <div className="flex items-center justify-center gap-4 mt-6">
                <div className="text-center">
                  <p className="text-3xl font-black text-white">{MAX_CAPACITY}명</p>
                  <p className="text-xs text-white/50 mt-1">한정 모집</p>
                </div>
                <div className="w-px h-12 bg-white/20" />
                <div className="text-center">
                  <p className="text-3xl font-black text-amber-400">3종</p>
                  <p className="text-xs text-white/50 mt-1">기념품</p>
                </div>
                <div className="w-px h-12 bg-white/20" />
                <div className="text-center">
                  <p className="text-3xl font-black text-white">{DISCOUNT_PERCENT}%</p>
                  <p className="text-xs text-white/50 mt-1">사전예약 특가</p>
                </div>
              </div>
              <p className="mt-6 text-sm text-white/70">
                <span className="line-through text-white/40">{originalFee}원</span>{" "}
                <span className="text-amber-400 font-black text-lg">{fee}원</span>
              </p>
              <a href="#apply" className="inline-flex items-center gap-2 mt-4 px-10 py-4 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-full font-black text-lg hover:opacity-90 transition-opacity shadow-lg shadow-amber-500/30">
                사전예약하기 <ArrowRight size={18} />
              </a>
              <p className="text-xs text-white/40 mt-3">사전예약 후 특가 안내 문자가 발송됩니다</p>
            </div>
          </div>
        </section>
      </div>

      <div className="h-[72px]" />
    </div>
  );
}
