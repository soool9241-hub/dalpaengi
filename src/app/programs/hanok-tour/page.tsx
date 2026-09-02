"use client";

import { useState, useEffect } from "react";
import {
  Clock,
  Users,
  MapPin,
  ArrowRight,
  ChevronLeft,
  Check,
  Ticket,
  Utensils,
  Bus,
  Gift,
  CloudSun,
  Home,
} from "lucide-react";
import Link from "next/link";

/* ───── 공통 조건 ─────
   네 상품 모두 12:00 한옥마을 집결, 1인 99,000원, 10~15명 단체.
   달라지는 건 오후 체험뿐이라, 한 페이지에서 상품만 고르는 구조로 짰다. */
const FEE = 99_000;
const MIN_PARTY = 10;
const MAX_PARTY = 15;
const KAKAO_URL = "https://open.kakao.com/o/ssowhRlg";

/* 각 장소의 전용 촬영본이 아직 없어 펜션·주변 사진을 쓴다.
   TODO(sol): 파일럿 진행 후 실제 코스 사진으로 교체 */
const IMG = {
  hero: "/img/exterior-main.jpg",
  A: "/img/living-room-wide.jpg",
  B: "/img/nature-yard.jpg",
  C: "/img/kitchen-dining.jpg",
  D: "/img/living-tv.jpg",
  cta: "/img/exterior-side.jpg",
};

/* ───── 상품 4종 ─────
   일정의 min 은 표시용이 아니라 실제 소요 시간이다. move:true 는 이동 구간.
   가격·일정을 바꿀 땐 api/programs/hanok-tour/route.ts 의 COURSES 도 같이 고친다.
   D 는 아직 제목이 확정되지 않아 작업 제목을 쓰고 있다. */
const COURSES = [
  {
    key: "A",
    emoji: "🪵",
    img: IMG.A,
    end: "17:35",
    outdoor: false,
    ko: {
      name: "내 손으로 만드는 한국 밥상",
      short: "전통 소반 만들기",
      tagline: "직접 만든 소반을 들고 돌아갑니다",
      takeaway: "완성한 소반 1점",
    },
    en: {
      name: "Make Your Own Korean Table",
      short: "Traditional soban making",
      tagline: "Go home with a table you built yourself",
      takeaway: "The soban you made",
    },
    plan: [
      { time: "12:00", min: 0, move: false, ko: "전주 한옥마을 집결 · 오리엔테이션", en: "Meet & greet — Jeonju Hanok Village" },
      { time: "12:00", min: 30, move: true, ko: "두부마을로 이동", en: "Transfer to Tofu Village" },
      { time: "12:30", min: 60, move: false, ko: "두부마을 로컬 한상 식사", en: "Local tofu set lunch" },
      { time: "13:30", min: 5, move: true, ko: "카페 티롤로 이동", en: "Transfer to Cafe Tirol" },
      { time: "13:35", min: 60, move: false, ko: "한옥 카페 체험 · 전통차", en: "Hanok cafe — traditional Korean tea" },
      { time: "14:35", min: 10, move: true, ko: "스토리팜으로 이동", en: "Transfer to StoryFarm" },
      { time: "14:45", min: 30, move: false, ko: "120평 CNC 공방 투어", en: "CNC woodworking studio tour (400㎡)" },
      { time: "15:15", min: 5, move: true, ko: "달팽이아지트로 도보 이동", en: "Walk to Dalpaengi Azit" },
      { time: "15:20", min: 90, move: false, ko: "전통 소반 만들기", en: "Make your own soban" },
      { time: "16:50", min: 15, move: false, ko: "이름 각인 · 보자기 포장 · 기념촬영", en: "Name engraving, wrapping & photos" },
      { time: "17:05", min: 30, move: true, ko: "전주 한옥마을 복귀", en: "Return to Hanok Village" },
    ],
    includes: {
      ko: ["두부마을 로컬 식사", "카페 티롤 전통차", "120평 CNC 공방 투어", "전통 소반 만들기 90분", "완성 소반 1인 1점", "한옥마을 왕복 차량"],
      en: ["Local tofu set lunch", "Traditional tea at Cafe Tirol", "CNC workshop tour", "90-min soban making class", "Your finished soban to keep", "Round-trip transfer"],
    },
    extras: {
      ko: ["소반 이름 레이저 각인", "보자기 포장", "영문 조립설명서 + QR 영상", "공방 인증샷 촬영"],
      en: ["Laser name engraving", "Bojagi cloth wrapping", "English instructions + QR video", "Workshop photo session"],
    },
  },
  {
    key: "B",
    emoji: "🌾",
    img: IMG.B,
    end: "17:05",
    outdoor: true,
    ko: {
      name: "완주 로컬 하루",
      short: "고택 · 촬영지 · 호수 트레킹",
      tagline: "관광지 말고, 완주 사람들이 다니는 길",
      takeaway: "사진과 걸음",
    },
    en: {
      name: "Wanju Slow Day",
      short: "Hanok house, filming spots, lakeside",
      tagline: "Not the tourist route — the roads locals walk",
      takeaway: "Photos and a long walk",
    },
    plan: [
      { time: "12:00", min: 0, move: false, ko: "전주 한옥마을 집결 · 오리엔테이션", en: "Meet & greet — Jeonju Hanok Village" },
      { time: "12:00", min: 30, move: true, ko: "두부마을로 이동", en: "Transfer to Tofu Village" },
      { time: "12:30", min: 60, move: false, ko: "두부마을 로컬 한상 식사", en: "Local tofu set lunch" },
      { time: "13:30", min: 5, move: true, ko: "카페 티롤로 이동", en: "Transfer to Cafe Tirol" },
      { time: "13:35", min: 60, move: false, ko: "한옥 카페 체험 · 전통차", en: "Hanok cafe — traditional Korean tea" },
      { time: "14:35", min: 30, move: false, ko: "소양 고택 투어", en: "Historic hanok house tour" },
      { time: "15:05", min: 30, move: false, ko: "K-콘텐츠 촬영지 투어", en: "K-content filming location tour" },
      { time: "15:35", min: 60, move: false, ko: "호수뷰 산책 · 트레킹", en: "Lakeside walk" },
      { time: "16:35", min: 30, move: true, ko: "전주 한옥마을 복귀", en: "Return to Hanok Village" },
    ],
    includes: {
      ko: ["두부마을 로컬 식사", "카페 티롤 전통차", "소양 고택 가이드 투어", "K-콘텐츠 촬영지 투어", "호수뷰 산책", "한옥마을 왕복 차량"],
      en: ["Local tofu set lunch", "Traditional tea at Cafe Tirol", "Guided historic hanok tour", "K-content filming location tour", "Lakeside walk", "Round-trip transfer"],
    },
    extras: { ko: [], en: [] },
  },
  {
    key: "C",
    emoji: "🍡",
    img: IMG.C,
    end: "17:35",
    outdoor: false,
    ko: {
      name: "손으로 빚는 한국의 다과",
      short: "다과 · 다식 만들기",
      tagline: "직접 빚은 다식으로 차 한 잔까지",
      takeaway: "포장한 다식 한 상자",
    },
    en: {
      name: "Make Korean Tea Sweets",
      short: "Dasik & tea sweets class",
      tagline: "Shape them, then drink tea with what you made",
      takeaway: "A box of your own dasik",
    },
    plan: [
      { time: "12:00", min: 0, move: false, ko: "전주 한옥마을 집결 · 오리엔테이션", en: "Meet & greet — Jeonju Hanok Village" },
      { time: "12:00", min: 30, move: true, ko: "두부마을로 이동", en: "Transfer to Tofu Village" },
      { time: "12:30", min: 60, move: false, ko: "두부마을 로컬 한상 식사", en: "Local tofu set lunch" },
      { time: "13:30", min: 5, move: true, ko: "카페 티롤로 이동", en: "Transfer to Cafe Tirol" },
      { time: "13:35", min: 60, move: false, ko: "한옥 카페 체험 · 전통차", en: "Hanok cafe — traditional Korean tea" },
      { time: "14:35", min: 30, move: true, ko: "초록의소양으로 이동", en: "Transfer to Chorok-ui Soyang" },
      { time: "15:05", min: 90, move: false, ko: "다과 · 다식 만들기", en: "Dasik & tea sweets making class" },
      { time: "16:35", min: 30, move: false, ko: "직접 만든 다식으로 티타임", en: "Tea time with what you made" },
      { time: "17:05", min: 30, move: true, ko: "전주 한옥마을 복귀", en: "Return to Hanok Village" },
    ],
    includes: {
      ko: ["두부마을 로컬 식사", "카페 티롤 전통차", "다과·다식 만들기 90분", "완성 다식 포장 1인분", "티타임 30분", "한옥마을 왕복 차량"],
      en: ["Local tofu set lunch", "Traditional tea at Cafe Tirol", "90-min dasik making class", "Your sweets boxed to take home", "30-min tea time", "Round-trip transfer"],
    },
    extras: { ko: [], en: [] },
  },
  {
    key: "D",
    emoji: "🎧",
    img: IMG.D,
    end: "18:00",
    outdoor: false,
    ko: {
      name: "전주 소리 집중 힐링",
      short: "음향 감상 · 소리채집",
      tagline: "눈을 감으면 들리는 것들을 모아옵니다",
      takeaway: "직접 채집한 소리",
    },
    en: {
      name: "A Day of Korean Sound",
      short: "Listening hall & field recording",
      tagline: "Close your eyes and collect what you hear",
      takeaway: "The sounds you recorded",
    },
    plan: [
      { time: "12:00", min: 0, move: false, ko: "전주 한옥마을 집결 · 오리엔테이션", en: "Meet & greet — Jeonju Hanok Village" },
      { time: "12:00", min: 30, move: true, ko: "두부마을로 이동", en: "Transfer to Tofu Village" },
      { time: "12:30", min: 60, move: false, ko: "두부마을 로컬 한상 식사", en: "Local tofu set lunch" },
      { time: "13:30", min: 30, move: true, ko: "소리나무 카페로 이동", en: "Transfer to Sorinamu Cafe" },
      { time: "14:00", min: 90, move: false, ko: "소리나무 카페 투어 · 헤아리움 100평 음향 감상실 · 진공관앰프 제작공방", en: "Sorinamu cafe tour, Hearium listening hall (330㎡) & vacuum-tube amp workshop" },
      { time: "15:30", min: 30, move: true, ko: "달팽이아지트로 이동", en: "Transfer to Dalpaengi Azit" },
      { time: "16:00", min: 90, move: false, ko: "소리채집 프로그램", en: "Field recording program" },
      { time: "17:30", min: 30, move: true, ko: "전주 한옥마을 복귀", en: "Return to Hanok Village" },
    ],
    includes: {
      ko: ["두부마을 로컬 식사", "소리나무 카페 투어", "진공관앰프 제작공방 견학", "헤아리움 음향 감상실 입장", "소리채집 프로그램 90분", "한옥마을 왕복 차량"],
      en: ["Local tofu set lunch", "Sorinamu cafe tour", "Vacuum-tube amp workshop visit", "Hearium listening hall entry", "90-min field recording program", "Round-trip transfer"],
    },
    extras: { ko: [], en: [] },
  },
] as const;

/* 네 상품이 공통으로 깔고 가는 것 */
const COMMON = [
  { icon: Utensils, ko: { t: "두부마을 로컬 한상", d: "관광지 식당이 아니라 동네 사람들이 가는 두부집" }, en: { t: "Local tofu set lunch", d: "Not a tourist restaurant — where locals actually eat" } },
  { icon: Bus, ko: { t: "한옥마을 왕복 차량", d: "12시에 모시러 가고, 같은 자리에 내려드립니다" }, en: { t: "Round-trip transfer", d: "Picked up at noon, dropped back at the same spot" } },
  { icon: Users, ko: { t: "영어 가이드 동행", d: "6시간 내내 함께 다닙니다" }, en: { t: "English-speaking guide", d: "With you for the full six hours" } },
];

const T = {
  ko: {
    nav: "달팽이아지트", inquiry: "문의", book: "예약",
    eyebrow: "전주·완주 외국인 로컬 체험",
    h1a: "같은 하루를", h1b: "네 가지 방법으로",
    sub: "정오에 한옥마을에서 만나 여섯 시간, 완주를 걷습니다",
    perPerson: "1인",
    cta: "예약 문의하기",
    commonTitle: "네 코스가", commonHl: "공통으로 드리는 것",
    pickTitle: "오후를", pickHl: "무엇으로 채울까요",
    pickNote: "네 가지 중 하나를 고르세요. 오전은 모두 같습니다.",
    selected: "선택됨",
    planTitle: "일정",
    includeTitle: "포함 사항",
    extraTitle: "추가 특전",
    takeaway: "가져가는 것",
    outdoorNote: "야외 중심 코스라 날씨 영향을 받습니다",
    compareTitle: "네 코스", compareHl: "한눈에",
    cName: "코스", cEnd: "종료", cTake: "가져가는 것", cWeather: "날씨",
    weatherOk: "실내 중심", weatherRisk: "야외 중심",
    formTitle: "예약", formHl: "문의",
    formNote: "차량과 협력처 일정을 확인하고 24시간 안에 연락드립니다. 지금 결제하지 않습니다.",
    fCourse: "상품 선택", fName: "대표자 이름", fCountry: "국적",
    fEmail: "이메일", fMessenger: "메신저 ID", fMessengerPh: "카카오톡 / WhatsApp / WeChat",
    fPhone: "전화번호", fContactNote: "이메일·메신저·전화번호 중 하나만 적어주시면 됩니다",
    fParty: "인원", fDate: "희망 날짜",
    fRequests: "요청사항", fRequestsPh: "채식·할랄·알레르기·언어 등 편하게 적어주세요",
    fConsent: "예약 안내를 위한 개인정보 수집·이용에 동의합니다.",
    partyNote: `이 투어는 ${MIN_PARTY}~${MAX_PARTY}명 단체로 운영됩니다`,
    submit: "예약 문의 보내기", submitting: "전송 중...",
    total: "총액",
    partnerApplied: "제휴처를 통해 오셨습니다",
    doneTitle: "예약 문의가 접수되었습니다",
    doneL1: "차량·협력처 확인 후 24시간 안에 연락드립니다",
    doneL2: "결과와 무관하게 꼭 회신드립니다",
    doneL3: "지금 입금하지 마세요 — 확정 후 안내드립니다",
    ok: "확인했어요",
    infoTitle: "안내",
    ctaTitle: "정오에 만나서,", ctaTitle2: "해가 기울 때 돌아옵니다",
  },
  en: {
    nav: "Dalpaengi Azit", inquiry: "Ask", book: "Book",
    eyebrow: "Local Experiences in Jeonju & Wanju",
    h1a: "One day,", h1b: "four ways to spend it",
    sub: "We meet at noon in Hanok Village and spend six hours in Wanju",
    perPerson: "per person",
    cta: "Request a Booking",
    commonTitle: "What every course", commonHl: "includes",
    pickTitle: "How do you want to", pickHl: "spend the afternoon",
    pickNote: "Pick one of four. The morning is the same in all of them.",
    selected: "Selected",
    planTitle: "Schedule",
    includeTitle: "What's included",
    extraTitle: "Extra touches",
    takeaway: "You take home",
    outdoorNote: "Mostly outdoors — weather affects this course",
    compareTitle: "All four", compareHl: "side by side",
    cName: "Course", cEnd: "Ends", cTake: "Take home", cWeather: "Weather",
    weatherOk: "Mostly indoors", weatherRisk: "Mostly outdoors",
    formTitle: "Request a", formHl: "Booking",
    formNote: "We confirm vehicle and partner availability, then reply within 24 hours. No payment now.",
    fCourse: "Choose a course", fName: "Lead traveller's name", fCountry: "Country",
    fEmail: "Email", fMessenger: "Messenger ID", fMessengerPh: "KakaoTalk / WhatsApp / WeChat",
    fPhone: "Phone", fContactNote: "Just one of email, messenger or phone is enough",
    fParty: "Group size", fDate: "Preferred date",
    fRequests: "Requests", fRequestsPh: "Vegetarian, halal, allergies, language — anything",
    fConsent: "I agree to the collection of my details for booking purposes.",
    partyNote: `This tour runs for groups of ${MIN_PARTY}–${MAX_PARTY}`,
    submit: "Send Booking Request", submitting: "Sending...",
    total: "Total",
    partnerApplied: "You came through a partner",
    doneTitle: "Your request has been received",
    doneL1: "We reply within 24 hours after checking availability",
    doneL2: "You will hear from us either way",
    doneL3: "Do not send any payment yet",
    ok: "Got it",
    infoTitle: "Good to know",
    ctaTitle: "Meet at noon,", ctaTitle2: "back before sunset",
  },
};

type Lang = "ko" | "en";
type Course = (typeof COURSES)[number];

/* ───── 예약 폼 ───── */
function BookingForm({
  lang, course, setCourse, referral, referralName,
}: {
  lang: Lang; course: string; setCourse: (k: string) => void;
  referral: string | null; referralName: string | null;
}) {
  const t = T[lang];
  const [name, setName] = useState("");
  const [country, setCountry] = useState("");
  const [email, setEmail] = useState("");
  const [messenger, setMessenger] = useState("");
  const [phone, setPhone] = useState("");
  const [partySize, setPartySize] = useState(MIN_PARTY);
  const [preferredDate, setPreferredDate] = useState("");
  const [requests, setRequests] = useState("");
  const [privacyConsent, setPrivacyConsent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ ok: boolean; msg: string } | null>(null);
  const [done, setDone] = useState(false);

  const selected = (COURSES.find((c) => c.key === course) ?? COURSES[0]) as Course;
  const total = FEE * partySize;

  const submit = async () => {
    if (!name.trim()) return setResult({ ok: false, msg: lang === "ko" ? "이름을 입력해주세요." : "Please enter your name." });
    if (!email.trim() && !messenger.trim() && !phone.trim()) return setResult({ ok: false, msg: t.fContactNote });
    if (!preferredDate) return setResult({ ok: false, msg: lang === "ko" ? "희망 날짜를 선택해주세요." : "Please choose a date." });
    if (!privacyConsent) return setResult({ ok: false, msg: t.fConsent });

    setLoading(true);
    setResult(null);
    try {
      const res = await fetch("/api/programs/hanok-tour", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name, country, email, messenger, phone, course, partySize,
          preferredDate, requests, privacyConsent, referral, language: lang,
        }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setName(""); setCountry(""); setEmail(""); setMessenger(""); setPhone("");
        setPreferredDate(""); setRequests(""); setPrivacyConsent(false);
        setDone(true);
      } else {
        setResult({ ok: false, msg: data.error || "Failed" });
      }
    } catch {
      setResult({ ok: false, msg: lang === "ko" ? "네트워크 오류" : "Network error" });
    }
    setLoading(false);
  };

  const inputClass =
    "w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-stone-500/20 focus:border-stone-400";
  const labelClass = "text-xs font-semibold text-gray-600 block mb-1";

  return (
    <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
      {done && (
        <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white rounded-3xl max-w-sm w-full overflow-hidden shadow-2xl">
            <div className="bg-gradient-to-br from-stone-700 to-stone-900 text-white px-6 py-8 text-center">
              <p className="text-5xl mb-3">🏯</p>
              <p className="text-xl font-black">{t.doneTitle}</p>
            </div>
            <div className="p-6">
              <ul className="text-sm text-gray-700 space-y-2 leading-relaxed bg-stone-50 rounded-2xl p-4 mb-4">
                <li>• {t.doneL1}</li>
                <li>• {t.doneL2}</li>
                <li>• {t.doneL3}</li>
              </ul>
              <button onClick={() => setDone(false)}
                className="w-full py-3.5 bg-stone-800 text-white rounded-xl font-bold text-base hover:bg-stone-900 transition-colors">
                {t.ok}
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="p-6 space-y-5">
        {/* 상품 선택 — 위 섹션과 같은 상태를 공유한다 */}
        <div>
          <label className={labelClass}>{t.fCourse} <span className="text-red-500">*</span></label>
          <div className="grid grid-cols-2 gap-2">
            {COURSES.map((c) => {
              const on = course === c.key;
              return (
                <button key={c.key} type="button" onClick={() => setCourse(c.key)}
                  className={`rounded-xl border-2 px-3 py-2.5 text-left transition-all ${
                    on ? "border-stone-800 bg-stone-50 shadow-sm" : "border-gray-200 hover:border-gray-300"
                  }`}>
                  <span className="text-lg">{c.emoji}</span>
                  <p className={`text-[11px] font-bold mt-1 leading-tight ${on ? "text-stone-900" : "text-gray-500"}`}>
                    {c.key}. {c[lang].short}
                  </p>
                </button>
              );
            })}
          </div>
          <p className="text-[11px] text-gray-500 mt-2">
            {selected.emoji} {selected[lang].name} · 12:00–{selected.end}
          </p>
        </div>

        {/* 인원 · 날짜 */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className={labelClass}>{t.fParty} <span className="text-red-500">*</span></label>
            <div className="flex items-center gap-2">
              <button type="button" onClick={() => setPartySize((n) => Math.max(MIN_PARTY, n - 1))}
                className="w-9 h-10 rounded-xl border border-gray-200 font-black text-gray-500 hover:bg-gray-50">−</button>
              <span className="flex-1 text-center text-lg font-black text-stone-800">{partySize}</span>
              <button type="button" onClick={() => setPartySize((n) => Math.min(MAX_PARTY, n + 1))}
                className="w-9 h-10 rounded-xl border border-gray-200 font-black text-gray-500 hover:bg-gray-50">+</button>
            </div>
          </div>
          <div>
            <label className={labelClass}>{t.fDate} <span className="text-red-500">*</span></label>
            <input type="date" value={preferredDate} onChange={(e) => setPreferredDate(e.target.value)} className={inputClass} />
          </div>
        </div>
        <p className="text-[11px] text-gray-400 -mt-3">{t.partyNote}</p>

        {/* 금액 */}
        <div className="rounded-2xl bg-stone-900 text-white p-4">
          <div className="flex items-center justify-between">
            <span className="text-xs text-white/60">₩{FEE.toLocaleString()} × {partySize}</span>
            <span className="text-2xl font-black">₩{total.toLocaleString()}</span>
          </div>
          {referral && (
            <p className="text-[11px] text-amber-300 font-bold mt-2 flex items-center gap-1">
              <Ticket size={12} /> {t.partnerApplied}{referralName ? ` · ${referralName}` : ""}
            </p>
          )}
        </div>

        {/* 연락처 */}
        <div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelClass}>{t.fName} <span className="text-red-500">*</span></label>
              <input value={name} onChange={(e) => setName(e.target.value)} className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>{t.fCountry}</label>
              <input value={country} onChange={(e) => setCountry(e.target.value)} placeholder="e.g. Singapore" className={inputClass} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3 mt-3">
            <div>
              <label className={labelClass}>{t.fEmail}</label>
              <input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>{t.fMessenger}</label>
              <input value={messenger} onChange={(e) => setMessenger(e.target.value)} placeholder={t.fMessengerPh} className={inputClass} />
            </div>
          </div>
          <div className="mt-3">
            <label className={labelClass}>{t.fPhone}</label>
            <input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+82 10 1234 5678" className={inputClass} />
          </div>
          <p className="text-[11px] text-gray-400 mt-1.5">{t.fContactNote}</p>
        </div>

        <div>
          <label className={labelClass}>{t.fRequests}</label>
          <textarea value={requests} onChange={(e) => setRequests(e.target.value)} rows={3}
            placeholder={t.fRequestsPh} className={`${inputClass} resize-none`} />
        </div>

        <label className="flex items-start gap-2 cursor-pointer">
          <input type="checkbox" checked={privacyConsent} onChange={(e) => setPrivacyConsent(e.target.checked)}
            className="mt-0.5 w-4 h-4 rounded border-gray-300 text-stone-700 focus:ring-stone-500/20" />
          <span className="text-xs text-gray-600"><span className="font-bold text-red-500">*</span> {t.fConsent}</span>
        </label>

        <button onClick={submit} disabled={loading}
          className="w-full py-3.5 rounded-xl text-white font-bold text-base transition-opacity disabled:opacity-50 bg-gradient-to-r from-stone-700 to-stone-900 hover:opacity-90">
          {loading ? t.submitting : t.submit}
        </button>
        <p className="text-center text-[11px] text-gray-400">{t.formNote}</p>
        {result && (
          <p className={`text-center text-sm font-semibold ${result.ok ? "text-green-600" : "text-red-500"}`}>{result.msg}</p>
        )}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════ */
export default function HanokTourPage() {
  // 외국인 대상이라 기본은 영어. 한국어는 솔과 국내 문의자용.
  const [lang, setLang] = useState<Lang>("en");
  const [course, setCourse] = useState<string>("A");
  const [referral, setReferral] = useState<string | null>(null);
  const [referralName, setReferralName] = useState<string | null>(null);

  /* ref 를 useSearchParams 로 읽으면 Suspense 경계가 생기면서 본문이 서버 렌더링에서
     빠진다. 외국인 검색 유입이 목적이라 HTML 에 본문이 반드시 있어야 해서 직접 읽는다. */
  useEffect(() => {
    const ref = new URLSearchParams(window.location.search).get("ref");
    if (!ref) return;
    fetch(`/api/programs/hanok-tour?ref=${encodeURIComponent(ref)}`)
      .then((r) => r.json())
      .then((d) => {
        setReferral(d.referral ?? null);
        setReferralName(d.referralName ?? null);
      })
      .catch(() => {});
  }, []);

  const t = T[lang];
  const selected = (COURSES.find((c) => c.key === course) ?? COURSES[0]) as Course;

  return (
    <main className="min-h-screen bg-white">
      {/* 상단 내비 */}
      <div className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-gray-100">
        <div className="max-w-3xl mx-auto px-4 h-14 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-900 transition-colors">
            <ChevronLeft size={16} /> {t.nav}
          </Link>
          <div className="flex items-center gap-2">
            <div className="flex rounded-full border border-gray-200 overflow-hidden text-xs font-bold">
              {(["en", "ko"] as const).map((l) => (
                <button key={l} onClick={() => setLang(l)}
                  className={`px-2.5 py-1.5 transition-colors ${
                    lang === l ? "bg-stone-800 text-white" : "text-gray-400 hover:bg-gray-50"
                  }`}>{l.toUpperCase()}</button>
              ))}
            </div>
            <a href={KAKAO_URL} target="_blank" rel="noopener noreferrer"
              className="px-3 py-2 bg-[#FEE500] text-[#3C1E1E] rounded-full text-xs font-bold hover:brightness-95 transition-all">
              {t.inquiry}
            </a>
            <a href="#book" className="px-4 py-2 bg-stone-800 text-white rounded-full text-xs font-bold hover:bg-stone-900 transition-colors">
              {t.book}
            </a>
          </div>
        </div>
      </div>

      {/* 히어로 */}
      <section className="relative min-h-[520px] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0">
          <img src={IMG.hero} alt="Jeonju Wanju local experience" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-b from-stone-950/80 via-stone-950/75 to-stone-950/95" />
        </div>
        <div className="relative z-10 max-w-3xl mx-auto px-4 py-20 text-center">
          <p className="text-amber-200/80 text-xs sm:text-sm font-bold tracking-[0.2em] uppercase mb-4">{t.eyebrow}</p>
          <p className="text-5xl mb-5">🏯</p>
          <h1 className="text-3xl sm:text-5xl font-black text-white leading-tight">
            {t.h1a}
            <br />
            <span className="text-amber-200">{t.h1b}</span>
          </h1>
          <p className="text-sm sm:text-lg text-white/70 mt-6 leading-relaxed">{t.sub}</p>

          <div className="flex flex-wrap justify-center gap-2 mt-8">
            <div className="flex items-center gap-1.5 bg-white/15 backdrop-blur-sm text-white px-4 py-2 rounded-full text-sm">
              <Clock size={14} /> 12:00–18:00
            </div>
            <div className="flex items-center gap-1.5 bg-white/15 backdrop-blur-sm text-white px-4 py-2 rounded-full text-sm">
              <Users size={14} /> {MIN_PARTY}–{MAX_PARTY}
            </div>
            <div className="flex items-center gap-1.5 bg-white/15 backdrop-blur-sm text-white px-4 py-2 rounded-full text-sm">
              <MapPin size={14} /> Jeonju Hanok Village
            </div>
          </div>

          {/* 상품 4종 요약 */}
          <div className="mt-8 grid grid-cols-4 gap-2 max-w-md mx-auto">
            {COURSES.map((c) => (
              <a key={c.key} href="#pick"
                className="rounded-xl bg-white/10 border border-white/15 px-1.5 py-3 hover:bg-white/20 transition-colors">
                <p className="text-xl leading-none">{c.emoji}</p>
                <p className="text-[10px] text-white/60 mt-1.5 font-bold">{c.key}</p>
              </a>
            ))}
          </div>

          <div className="mt-6">
            <p className="text-4xl font-black text-white">₩{FEE.toLocaleString()}</p>
            <p className="text-xs text-white/50 mt-1">{t.perPerson}</p>
          </div>

          <a href="#book"
            className="mt-7 inline-flex items-center gap-2 px-8 py-3.5 bg-amber-500 text-stone-950 rounded-full font-black text-base hover:bg-amber-400 transition-colors shadow-lg">
            {t.cta} <ArrowRight size={16} />
          </a>
        </div>
      </section>

      <div className="max-w-3xl mx-auto px-4 pb-24">
        {/* 공통 포함 */}
        <section className="py-12 sm:py-16">
          <div className="text-center mb-8">
            <h2 className="text-xl sm:text-2xl font-black text-gray-900">
              {t.commonTitle} <span className="text-amber-600">{t.commonHl}</span>
            </h2>
          </div>
          <div className="grid gap-3 sm:grid-cols-3">
            {COMMON.map((c, i) => {
              const Icon = c.icon;
              return (
                <div key={i} className="bg-white rounded-2xl border border-gray-200 p-5 text-center">
                  <div className="w-11 h-11 rounded-xl bg-amber-50 flex items-center justify-center mx-auto">
                    <Icon size={20} className="text-amber-700" />
                  </div>
                  <p className="font-black text-gray-900 text-sm mt-3">{c[lang].t}</p>
                  <p className="text-xs text-gray-500 mt-1.5 leading-relaxed">{c[lang].d}</p>
                </div>
              );
            })}
          </div>
        </section>

        {/* 상품 선택 */}
        <section id="pick" className="pb-12 sm:pb-16 scroll-mt-20">
          <div className="text-center mb-8">
            <h2 className="text-xl sm:text-2xl font-black text-gray-900">
              {t.pickTitle} <span className="text-amber-600">{t.pickHl}</span>
            </h2>
            <p className="text-sm text-gray-500 mt-2">{t.pickNote}</p>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            {COURSES.map((c) => {
              const on = course === c.key;
              return (
                <button key={c.key} type="button" onClick={() => setCourse(c.key)}
                  className={`relative rounded-2xl overflow-hidden text-left transition-all border-2 ${
                    on ? "border-stone-800 shadow-lg" : "border-transparent hover:shadow-md"
                  }`}>
                  <div className="relative h-32 overflow-hidden">
                    <img src={c.img} alt={c[lang].name} className="w-full h-full object-cover" />
                    <div className={`absolute inset-0 ${on ? "bg-stone-950/55" : "bg-stone-950/70"}`} />
                    <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-3">
                      <span className="text-3xl">{c.emoji}</span>
                      <p className="text-white font-black text-sm mt-1.5 leading-tight">{c[lang].name}</p>
                      <p className="text-white/60 text-[11px] mt-0.5">{c[lang].short}</p>
                    </div>
                    <span className="absolute top-2 left-2 w-6 h-6 rounded-full bg-white/90 text-stone-800 text-[11px] font-black flex items-center justify-center">
                      {c.key}
                    </span>
                    {on && (
                      <span className="absolute top-2 right-2 px-2 py-0.5 bg-amber-500 text-stone-950 rounded-full text-[10px] font-black">
                        {t.selected}
                      </span>
                    )}
                  </div>
                  <div className={`p-3.5 ${on ? "bg-stone-50" : "bg-white"}`}>
                    <p className="text-xs text-gray-600 leading-relaxed">{c[lang].tagline}</p>
                    <div className="flex items-center gap-2 mt-2 flex-wrap">
                      <span className="text-[10px] px-2 py-0.5 bg-gray-100 text-gray-500 rounded-full font-bold">
                        12:00–{c.end}
                      </span>
                      {c.outdoor && (
                        <span className="text-[10px] px-2 py-0.5 bg-sky-100 text-sky-700 rounded-full font-bold">
                          {t.weatherRisk}
                        </span>
                      )}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </section>

        {/* 선택한 상품 상세 */}
        <section className="pb-12 sm:pb-16">
          <div className="rounded-2xl border-2 border-stone-800 overflow-hidden">
            <div className="relative h-44 overflow-hidden">
              <img src={selected.img} alt={selected[lang].name} className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-stone-950/90 to-stone-950/40" />
              <div className="absolute bottom-4 left-5 right-5">
                <p className="text-[11px] font-black text-amber-300 tracking-widest">
                  {selected.key} · 12:00–{selected.end}
                </p>
                <p className="text-xl sm:text-2xl font-black text-white mt-1">
                  {selected.emoji} {selected[lang].name}
                </p>
              </div>
            </div>

            <div className="p-5 sm:p-6 space-y-6">
              {selected.outdoor && (
                <div className="flex items-start gap-2 bg-sky-50 border border-sky-100 rounded-xl p-3">
                  <CloudSun size={16} className="text-sky-600 flex-shrink-0 mt-0.5" />
                  <p className="text-xs text-sky-800">{t.outdoorNote}</p>
                </div>
              )}

              {/* 일정 */}
              <div>
                <p className="text-[11px] font-black text-gray-400 uppercase tracking-wider mb-3">{t.planTitle}</p>
                <div className="space-y-1">
                  {selected.plan.map((s, i) => (
                    <div key={i} className={`flex items-start gap-3 rounded-lg px-3 py-2 ${
                      s.move ? "bg-gray-50" : "bg-amber-50/60"
                    }`}>
                      <span className={`text-[11px] font-black tabular-nums flex-shrink-0 w-11 pt-0.5 ${
                        s.move ? "text-gray-400" : "text-amber-700"
                      }`}>{s.time}</span>
                      <p className={`text-xs leading-relaxed flex-1 ${s.move ? "text-gray-400" : "text-gray-800 font-medium"}`}>
                        {s[lang]}
                      </p>
                      {s.min > 0 && (
                        <span className={`text-[10px] font-bold flex-shrink-0 pt-0.5 ${s.move ? "text-gray-300" : "text-amber-600"}`}>
                          {s.min}m
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* 포함 사항 */}
              <div>
                <p className="text-[11px] font-black text-gray-400 uppercase tracking-wider mb-3">{t.includeTitle}</p>
                <ul className="grid sm:grid-cols-2 gap-x-4 gap-y-2">
                  {selected.includes[lang].map((it) => (
                    <li key={it} className="flex items-start gap-2 text-xs text-gray-700">
                      <Check size={14} className="text-amber-600 flex-shrink-0 mt-0.5" /> {it}
                    </li>
                  ))}
                </ul>
              </div>

              {/* 추가 특전 */}
              {selected.extras[lang].length > 0 && (
                <div>
                  <p className="text-[11px] font-black text-gray-400 uppercase tracking-wider mb-3">{t.extraTitle}</p>
                  <div className="flex flex-wrap gap-2">
                    {selected.extras[lang].map((it) => (
                      <span key={it} className="px-3 py-1.5 rounded-full bg-amber-50 border border-amber-100 text-xs text-amber-800 font-medium">
                        <Gift size={11} className="inline mr-1 -mt-0.5" />{it}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* 가져가는 것 */}
              <div className="flex items-center gap-3 bg-stone-900 text-white rounded-xl px-4 py-3">
                <Home size={16} className="text-amber-300 flex-shrink-0" />
                <div>
                  <p className="text-[10px] text-white/50 uppercase tracking-widest">{t.takeaway}</p>
                  <p className="text-sm font-bold">{selected[lang].takeaway}</p>
                </div>
              </div>

              <a href="#book"
                className="flex items-center justify-center gap-2 w-full py-3 rounded-xl bg-amber-500 text-stone-950 font-black text-sm hover:bg-amber-400 transition-colors">
                {t.cta} <ArrowRight size={14} />
              </a>
            </div>
          </div>
        </section>

        {/* 비교표 */}
        <section className="pb-12 sm:pb-16">
          <div className="text-center mb-8">
            <h2 className="text-xl sm:text-2xl font-black text-gray-900">
              {t.compareTitle} <span className="text-amber-600">{t.compareHl}</span>
            </h2>
          </div>
          <div className="rounded-2xl border border-gray-200 overflow-x-auto">
            <table className="w-full text-left min-w-[520px]">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th className="px-3 py-2.5 text-[11px] font-black text-gray-400 uppercase">{t.cName}</th>
                  <th className="px-3 py-2.5 text-[11px] font-black text-gray-400 uppercase">{t.cEnd}</th>
                  <th className="px-3 py-2.5 text-[11px] font-black text-gray-400 uppercase">{t.cTake}</th>
                  <th className="px-3 py-2.5 text-[11px] font-black text-gray-400 uppercase">{t.cWeather}</th>
                </tr>
              </thead>
              <tbody>
                {COURSES.map((c, i) => (
                  <tr key={c.key} onClick={() => setCourse(c.key)}
                    className={`cursor-pointer transition-colors ${i > 0 ? "border-t border-gray-100" : ""} ${
                      course === c.key ? "bg-amber-50" : "hover:bg-gray-50"
                    }`}>
                    <td className="px-3 py-3">
                      <p className="text-xs font-bold text-gray-900">{c.emoji} {c[lang].name}</p>
                      <p className="text-[11px] text-gray-400 mt-0.5">{c.key} · {c[lang].short}</p>
                    </td>
                    <td className="px-3 py-3 text-xs text-gray-600 tabular-nums">{c.end}</td>
                    <td className="px-3 py-3 text-xs text-gray-600">{c[lang].takeaway}</td>
                    <td className="px-3 py-3">
                      <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                        c.outdoor ? "bg-sky-100 text-sky-700" : "bg-emerald-100 text-emerald-700"
                      }`}>
                        {c.outdoor ? t.weatherRisk : t.weatherOk}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* 예약 폼 */}
        <section id="book" className="pb-12 sm:pb-16 scroll-mt-20">
          <div className="text-center mb-8">
            <h2 className="text-xl sm:text-2xl font-black text-gray-900">
              {t.formTitle} <span className="text-amber-600">{t.formHl}</span>
            </h2>
          </div>
          <BookingForm lang={lang} course={course} setCourse={setCourse} referral={referral} referralName={referralName} />
        </section>

        {/* 안내 */}
        <section className="pb-12 sm:pb-16">
          <div className="bg-white rounded-2xl border border-gray-200 p-5 sm:p-6">
            <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-3">{t.infoTitle}</p>
            <ul className="text-xs text-gray-600 space-y-1.5 leading-relaxed">
              {lang === "ko" ? (
                <>
                  <li>🚐 전주 한옥마을에서 12:00 집결하고 같은 자리에서 해산합니다.</li>
                  <li>👥 {MIN_PARTY}~{MAX_PARTY}명 단체로 운영됩니다.</li>
                  <li>🍽️ 채식·할랄·알레르기는 예약 시 알려주시면 협력 식당과 조율합니다.</li>
                  <li>💳 예약 확정 안내를 받으신 뒤에 결제하시면 됩니다.</li>
                  <li>🧾 개인 경비, 추가 음료, 여행자보험은 포함되지 않습니다.</li>
                </>
              ) : (
                <>
                  <li>🚐 We meet at 12:00 in Jeonju Hanok Village and finish at the same spot.</li>
                  <li>👥 Runs for groups of {MIN_PARTY}–{MAX_PARTY} people.</li>
                  <li>🍽️ Tell us about vegetarian, halal or allergy needs when you book.</li>
                  <li>💳 Payment is arranged after we confirm your booking.</li>
                  <li>🧾 Personal expenses, extra drinks and travel insurance are not included.</li>
                </>
              )}
            </ul>
          </div>
        </section>

        {/* CTA */}
        <section className="pb-8">
          <div className="relative rounded-2xl overflow-hidden">
            <img src={IMG.cta} alt="" className="w-full h-64 object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-stone-950/90 via-stone-950/70 to-stone-950/40" />
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-6">
              <p className="text-4xl mb-3">🏯</p>
              <p className="text-xl sm:text-2xl font-black text-white leading-snug">
                {t.ctaTitle}
                <br />
                <span className="text-amber-300">{t.ctaTitle2}</span>
              </p>
              <a href="#book"
                className="mt-6 inline-flex items-center gap-2 px-8 py-3.5 bg-amber-500 text-stone-950 rounded-full font-black text-base hover:bg-amber-400 transition-colors shadow-lg">
                {t.cta} <ArrowRight size={16} />
              </a>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
