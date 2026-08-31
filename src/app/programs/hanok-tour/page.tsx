"use client";

import { useState, useEffect } from "react";
import {
  Clock,
  Users,
  MapPin,
  ArrowRight,
  ChevronLeft,
  Check,
  Camera,
  Gift,
  Ticket,
  Utensils,
  Hammer,
  Coffee,
  Bus,
} from "lucide-react";
import Link from "next/link";

/* ───── 코스 2종 ─────
   주신 코스 가이드는 이동 포함 5시간 10분이다. 6시간 코스가 그 전체이고,
   4시간 코스는 공방 투어를 빼고 소반 체험을 60분으로 줄인 축약본이다.
   가격을 바꿀 땐 api/programs/hanok-tour/route.ts 의 COURSES 도 같이 고친다. */
const COURSES = [
  {
    key: "half",
    hours: 4,
    fee: 90_000,
    minParty: 1,
    ko: { label: "4시간 코스", tag: "핵심만", desc: "먹고, 쉬고, 만드는 세 가지" },
    en: { label: "4-Hour Course", tag: "The Essentials", desc: "Eat, rest, and make — the three core stops" },
  },
  {
    key: "full",
    hours: 6,
    fee: 99_000,
    minParty: 2,
    ko: { label: "6시간 원데이", tag: "전체 코스", desc: "공방 투어와 스냅 촬영까지" },
    en: { label: "6-Hour One Day", tag: "Full Course", desc: "Plus a studio tour and a photo session" },
  },
] as const;

const COUPON_MIN_PARTY = 3;
const COUPON_VALUE = 100_000;
const MAX_PARTY = 10;
const KAKAO_URL = "https://open.kakao.com/o/ssowhRlg";

/* 한옥 카페·두부마을 전용 촬영본이 아직 없어 펜션·주변 사진을 쓴다.
   TODO(sol): 1회차 진행 후 실제 코스 사진으로 교체 */
const IMG = {
  hero: "/img/exterior-main.jpg",
  meal: "/img/group-dining.jpg",
  cafe: "/img/exterior-side.jpg",
  studio: "/img/whiteboard.jpg",
  craft: "/img/living-room-wide.jpg",
  cta: "/img/nature-yard.jpg",
};

/* ───── 코스 일정 ─────
   full 전용 구간은 fullOnly 로 표시해 4시간 코스에서 흐리게 처리한다. */
const ITINERARY = [
  {
    icon: Bus, min: 30, fullOnly: false,
    ko: { t: "전주 한옥마을에서 픽업", d: "카니발 차량으로 모시러 갑니다. 짐은 숙소에 두고 오세요." },
    en: { t: "Pickup at Jeonju Hanok Village", d: "We pick you up by van. Leave your luggage at your stay." },
  },
  {
    icon: Utensils, min: 60, fullOnly: false,
    ko: { t: "두부마을에서 로컬 식사", d: "관광지 식당이 아니라 동네 사람들이 가는 두부집입니다. 그날 아침에 만든 두부로 차린 한 상." },
    en: { t: "Lunch in the Tofu Village", d: "Not a tourist restaurant — the tofu house locals actually go to. A full table set with tofu made that morning." },
  },
  {
    icon: Coffee, min: 60, fullOnly: false,
    ko: { t: "500평 한옥 카페에서 티타임", d: "한옥으로 지은 카페의 마루에 앉아 차 한 잔. 디저트는 빵이 아니라 약과입니다." },
    en: { t: "Tea in a 500-pyeong Hanok Cafe", d: "Sit on the wooden floor of a real hanok with a cup of tea. Dessert is yakgwa — a Korean honey pastry, not cake." },
  },
  {
    icon: MapPin, min: 30, fullOnly: true,
    ko: { t: "스토리팜 120평 공방 투어", d: "CNC 장비가 도는 목공방을 직접 보여드립니다. 잠시 뒤 만드실 소반이 어떻게 재단되는지도." },
    en: { t: "Storyfarm Woodworking Studio Tour", d: "A working 120-pyeong studio with CNC machines running — including how the soban you are about to build is cut." },
  },
  {
    icon: Hammer, min: 90, halfMin: 60, fullOnly: false,
    ko: { t: "전통 소반 만들기", d: "달팽이아지트 60평 공간에서 나만의 소반을 조립합니다. 완성한 소반은 가져가세요." },
    en: { t: "Build Your Own Traditional Soban", d: "Assemble a Korean low table in our 60-pyeong space. The soban you finish is yours to take home." },
  },
  {
    icon: Camera, min: 0, fullOnly: true,
    ko: { t: "스냅 사진 촬영", d: "코스 내내 사진을 찍어드립니다. 한옥 마루에서, 공방에서, 완성한 소반과 함께." },
    en: { t: "Snapshot Photo Service", d: "We photograph you along the way — on the hanok floor, in the studio, and with your finished soban." },
  },
  {
    icon: Bus, min: 30, fullOnly: false,
    ko: { t: "한옥마을로 복귀", d: "출발하신 자리에 다시 내려드립니다." },
    en: { t: "Back to Hanok Village", d: "We drop you off where we picked you up." },
  },
];

/* ───── 왜 이 코스인가 ───── */
const PILLARS = [
  {
    emoji: "🍲",
    ko: { t: "로컬 식사", d: "관광객용 메뉴가 아니라 동네 사람이 먹는 두부 한 상" },
    en: { t: "A Local Meal", d: "Not a tourist menu — the tofu table locals sit down to" },
  },
  {
    emoji: "🏯",
    ko: { t: "진짜 한옥", d: "재현이 아니라 실제로 한옥으로 지어 운영 중인 카페" },
    en: { t: "A Real Hanok", d: "Not a replica — a cafe actually built and run as a hanok" },
  },
  {
    emoji: "🪵",
    ko: { t: "내 손으로 만든 것", d: "사진만 남는 게 아니라 물건이 남습니다" },
    en: { t: "Something You Made", d: "You leave with an object, not just photos" },
  },
];

/* ───── 소반 키트에 대한 약속 ─────
   저가 키트로는 만족도가 안 나온다는 게 기획 단계의 결론이라
   그 판단을 그대로 페이지에 적는다. */
const QUALITY = {
  ko: [
    "저가 수입 키트를 쓰지 않습니다",
    "120평 공방에서 직접 재단한 원목을 씁니다",
    "완성품은 실제로 쓸 수 있는 물건입니다",
  ],
  en: [
    "We do not use cheap imported kits",
    "The wood is cut in our own 120-pyeong studio",
    "What you finish is a tray you can actually use",
  ],
};

const T = {
  ko: {
    nav: "달팽이아지트", inquiry: "문의", book: "예약하기",
    eyebrow: "외국인을 위한 전주 한국 문화 체험",
    h1a: "가장 한국적인 하루를", h1b: "통째로",
    sub: "먹고 · 쉬고 · 만들고 — 한옥마을에서 픽업해서 다시 모셔다드립니다",
    from: "1인", perPerson: "원부터",
    pickup: "한옥마을 픽업·복귀 포함",
    cta: "예약 문의하기",
    introA: "외국인 여행객이 한국에서 가장 해보고 싶어 하는 건",
    introB: "'한국적인 어떤 것'과 '한국적인 어떤 공간'입니다.",
    introC: "이 코스는 그 두 가지를 하루에 담았습니다.",
    pillarsTitle: "이 하루에 담긴", pillarsHl: "세 가지",
    itinTitle: "코스", itinHl: "일정",
    itinNote: "4시간 코스에서는 흐리게 표시된 구간이 빠지고, 소반 체험이 60분으로 진행됩니다",
    fullOnlyBadge: "6시간 코스 전용",
    priceTitle: "코스와", priceHl: "요금",
    priceNote: "픽업·식사·차·다과·소반 키트가 모두 포함된 금액입니다",
    minParty: "최소 인원",
    person: "인",
    couponTitle: "3인 이상 함께 오시면",
    couponDesc: "달팽이아지트 펜션에서 쓰실 수 있는 할인 쿠폰을 드립니다. 전주 근교에서 하루 더 묵고 가셔도 좋아요.",
    partnerTitle: "제휴 카페에서 오셨나요?",
    partnerDesc: "한옥마을 제휴 카페의 QR 코드로 예약하시면 10% 할인됩니다.",
    partnerApplied: "제휴 할인 10%가 적용되었습니다",
    qualityTitle: "소반 키트에 대한", qualityHl: "약속",
    formTitle: "예약", formHl: "문의",
    formNote: "가능 여부를 확인하고 24시간 안에 연락드립니다. 지금 결제하지 않습니다.",
    fName: "이름", fCountry: "국적", fEmail: "이메일", fMessenger: "메신저 ID",
    fMessengerPh: "카카오톡 / WhatsApp / WeChat", fPhone: "전화번호",
    fContactNote: "이메일·메신저·전화번호 중 하나만 적어주시면 됩니다",
    fCourse: "코스", fParty: "인원", fDate: "희망 날짜", fTime: "희망 시간",
    fRequests: "요청사항", fRequestsPh: "채식·알레르기·언어·기타 요청을 편하게 적어주세요",
    fConsent: "예약 안내를 위한 개인정보 수집·이용에 동의합니다.",
    submit: "예약 문의 보내기", submitting: "전송 중...",
    total: "총액", couponBadge: "펜션 쿠폰 10만원 대상",
    doneTitle: "예약 문의가 접수되었습니다",
    doneL1: "24시간 안에 연락드립니다",
    doneL2: "결과와 무관하게 꼭 회신드립니다",
    doneL3: "지금 입금하지 마세요 — 확정 후 안내드립니다",
    ok: "확인했어요",
    infoTitle: "안내",
    ctaTitle: "사진만 남는 여행 말고,", ctaTitle2: "만든 게 남는 하루",
  },
  en: {
    nav: "Dalpaengi Azit", inquiry: "Ask", book: "Book",
    eyebrow: "A Korean Culture Day Tour from Jeonju",
    h1a: "The most Korean day", h1b: "you can have",
    sub: "Eat · Rest · Make — picked up from Hanok Village and dropped back off",
    from: "From", perPerson: "per person",
    pickup: "Pickup & drop-off included",
    cta: "Request a Booking",
    introA: "What visitors most want in Korea is usually two things —",
    introB: "something Korean to do, and a Korean place to be in.",
    introC: "This course puts both into a single day.",
    pillarsTitle: "Three things in", pillarsHl: "one day",
    itinTitle: "The", itinHl: "Itinerary",
    itinNote: "The 4-hour course skips the greyed-out stops, and the soban session runs 60 minutes",
    fullOnlyBadge: "6-hour course only",
    priceTitle: "Courses &", priceHl: "Pricing",
    priceNote: "Pickup, lunch, tea, dessert and the soban kit are all included",
    minParty: "Minimum",
    person: " people",
    couponTitle: "Coming as a group of 3 or more?",
    couponDesc: "You get a discount coupon for Dalpaengi Azit, our pension nearby. Stay a night in the countryside outside Jeonju.",
    partnerTitle: "Came from a partner cafe?",
    partnerDesc: "Book through a partner cafe's QR code and get 10% off.",
    partnerApplied: "10% partner discount applied",
    qualityTitle: "Our promise about", qualityHl: "the kit",
    formTitle: "Request a", formHl: "Booking",
    formNote: "We check availability and reply within 24 hours. No payment is taken now.",
    fName: "Name", fCountry: "Country", fEmail: "Email", fMessenger: "Messenger ID",
    fMessengerPh: "KakaoTalk / WhatsApp / WeChat", fPhone: "Phone",
    fContactNote: "Just one of email, messenger or phone is enough",
    fCourse: "Course", fParty: "Party size", fDate: "Preferred date", fTime: "Preferred time",
    fRequests: "Requests", fRequestsPh: "Vegetarian, allergies, language, anything else",
    fConsent: "I agree to the collection of my details for booking purposes.",
    submit: "Send Booking Request", submitting: "Sending...",
    total: "Total", couponBadge: "Eligible for the KRW 100,000 pension coupon",
    doneTitle: "Your request has been received",
    doneL1: "We will reply within 24 hours",
    doneL2: "You will hear from us either way",
    doneL3: "Do not send any payment yet — we will guide you after confirming",
    ok: "Got it",
    infoTitle: "Good to know",
    ctaTitle: "Not a trip you only photograph —", ctaTitle2: "a day you take home",
  },
};

type Lang = "ko" | "en";

/* ───── 예약 폼 ───── */
function BookingForm({ lang, referral, referralName }: { lang: Lang; referral: string | null; referralName: string | null }) {
  const t = T[lang];
  const [name, setName] = useState("");
  const [country, setCountry] = useState("");
  const [email, setEmail] = useState("");
  const [messenger, setMessenger] = useState("");
  const [phone, setPhone] = useState("");
  const [course, setCourse] = useState<string>("half");
  const [partySize, setPartySize] = useState(2);
  const [preferredDate, setPreferredDate] = useState("");
  const [preferredTime, setPreferredTime] = useState("13:00");
  const [requests, setRequests] = useState("");
  const [privacyConsent, setPrivacyConsent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ ok: boolean; msg: string } | null>(null);
  const [done, setDone] = useState(false);

  const selected = COURSES.find((c) => c.key === course) ?? COURSES[0];
  const perPerson = referral ? Math.round((selected.fee * 0.9) / 10) * 10 : selected.fee;
  const total = perPerson * partySize;
  const couponEligible = partySize >= COUPON_MIN_PARTY;

  // 6시간 코스는 2인 이상이라, 코스를 바꿀 때 인원이 모자라면 같이 올려준다.
  const pickCourse = (key: string) => {
    setCourse(key);
    const c = COURSES.find((x) => x.key === key);
    if (c && partySize < c.minParty) setPartySize(c.minParty);
  };

  const submit = async () => {
    if (!name.trim()) return setResult({ ok: false, msg: lang === "ko" ? "이름을 입력해주세요." : "Please enter your name." });
    if (!email.trim() && !messenger.trim() && !phone.trim())
      return setResult({ ok: false, msg: t.fContactNote });
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
          preferredDate, preferredTime, requests, privacyConsent,
          referral, language: lang,
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
              <button
                onClick={() => setDone(false)}
                className="w-full py-3.5 bg-stone-800 text-white rounded-xl font-bold text-base hover:bg-stone-900 transition-colors"
              >
                {t.ok}
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="p-6 space-y-5">
        {/* 코스 선택 */}
        <div>
          <label className={labelClass}>{t.fCourse} <span className="text-red-500">*</span></label>
          <div className="flex flex-col gap-2">
            {COURSES.map((c) => {
              const on = course === c.key;
              const fee = referral ? Math.round((c.fee * 0.9) / 10) * 10 : c.fee;
              return (
                <button key={c.key} type="button" onClick={() => pickCourse(c.key)}
                  className={`w-full rounded-xl border-2 transition-all text-left px-4 py-3 ${
                    on ? "border-stone-700 bg-stone-50 shadow-md" : "border-gray-200 hover:border-gray-300"
                  }`}>
                  <div className="flex items-center gap-3">
                    <span className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                      on ? "border-stone-700 bg-stone-700" : "border-gray-300"
                    }`}>
                      {on && <span className="w-2 h-2 rounded-full bg-white" />}
                    </span>
                    <div className="flex-1 min-w-0">
                      <p className={`text-sm font-bold ${on ? "text-stone-900" : "text-gray-700"}`}>{c[lang].label}</p>
                      <p className="text-[11px] text-gray-500 mt-0.5">
                        {c[lang].desc}
                        {c.minParty > 1 && ` · ${t.minParty} ${c.minParty}${t.person}`}
                      </p>
                    </div>
                    <span className={`text-sm font-black flex-shrink-0 ${on ? "text-stone-800" : "text-gray-400"}`}>
                      {referral && (
                        <span className="block text-[10px] text-gray-400 line-through font-normal">
                          {c.fee.toLocaleString()}
                        </span>
                      )}
                      ₩{fee.toLocaleString()}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* 인원 · 날짜 */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className={labelClass}>{t.fParty} <span className="text-red-500">*</span></label>
            <div className="flex items-center gap-2">
              <button type="button" onClick={() => setPartySize((n) => Math.max(selected.minParty, n - 1))}
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

        <div>
          <label className={labelClass}>{t.fTime}</label>
          <div className="flex gap-2">
            {["10:00", "13:00", "15:00"].map((tm) => (
              <button key={tm} type="button" onClick={() => setPreferredTime(tm)}
                className={`flex-1 py-2.5 rounded-xl text-sm font-semibold border transition-all ${
                  preferredTime === tm ? "border-stone-700 bg-stone-50 text-stone-800" : "border-gray-200 text-gray-400 hover:bg-gray-50"
                }`}>{tm}</button>
            ))}
          </div>
        </div>

        {/* 금액 요약 */}
        <div className="rounded-2xl bg-stone-900 text-white p-4">
          <div className="flex items-center justify-between">
            <span className="text-xs text-white/60">
              ₩{perPerson.toLocaleString()} × {partySize}
            </span>
            <span className="text-2xl font-black">₩{total.toLocaleString()}</span>
          </div>
          {referral && (
            <p className="text-[11px] text-amber-300 font-bold mt-2 flex items-center gap-1">
              <Ticket size={12} /> {t.partnerApplied}
              {referralName ? ` · ${referralName}` : ""}
            </p>
          )}
          {couponEligible && (
            <p className="text-[11px] text-emerald-300 font-bold mt-1 flex items-center gap-1">
              <Gift size={12} /> {t.couponBadge}
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
          <span className="text-xs text-gray-600">
            <span className="font-bold text-red-500">*</span> {t.fConsent}
          </span>
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
  // 한국어 UI 가 필요한 건 솔과 국내 문의자다. 기본은 외국인이라 영어.
  const [lang, setLang] = useState<Lang>("en");
  const [referral, setReferral] = useState<string | null>(null);
  const [referralName, setReferralName] = useState<string | null>(null);

  /* ref 를 useSearchParams 로 읽으면 Suspense 경계가 생기면서 본문이
     서버 렌더링에서 빠진다. 이 페이지는 외국인 검색 유입이 목적이라
     HTML 에 본문이 반드시 들어 있어야 해서 window 에서 직접 읽는다. */
  useEffect(() => {
    const ref = new URLSearchParams(window.location.search).get("ref");
    fetch(`/api/programs/hanok-tour${ref ? `?ref=${encodeURIComponent(ref)}` : ""}`)
      .then((r) => r.json())
      .then((d) => {
        setReferral(d.referral ?? null);
        setReferralName(d.referralName ?? null);
      })
      .catch(() => {});
  }, []);

  const t = T[lang];
  const minFee = referral ? 81_000 : 90_000;

  return (
    <main className="min-h-screen bg-white">
      {/* 상단 내비 */}
      <div className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-gray-100">
        <div className="max-w-3xl mx-auto px-4 h-14 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-900 transition-colors">
            <ChevronLeft size={16} /> {t.nav}
          </Link>
          <div className="flex items-center gap-2">
            {/* 언어 토글 — 외국인 대상이라 기본은 EN */}
            <div className="flex rounded-full border border-gray-200 overflow-hidden text-xs font-bold">
              {(["en", "ko"] as const).map((l) => (
                <button key={l} onClick={() => setLang(l)}
                  className={`px-2.5 py-1.5 transition-colors ${
                    lang === l ? "bg-stone-800 text-white" : "text-gray-400 hover:bg-gray-50"
                  }`}>
                  {l.toUpperCase()}
                </button>
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
      <section className="relative min-h-[540px] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0">
          <img src={IMG.hero} alt="Korean culture day tour" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-b from-stone-950/80 via-stone-950/75 to-stone-950/95" />
        </div>
        <div className="relative z-10 max-w-3xl mx-auto px-4 py-20 text-center">
          <p className="text-amber-200/80 text-xs sm:text-sm font-bold tracking-[0.2em] uppercase mb-4">
            {t.eyebrow}
          </p>
          <p className="text-6xl mb-5">🏯</p>
          <h1 className="text-3xl sm:text-5xl font-black text-white leading-tight">
            {t.h1a}
            <br />
            <span className="text-amber-200">{t.h1b}</span>
          </h1>
          <p className="text-sm sm:text-lg text-white/70 mt-6 leading-relaxed">{t.sub}</p>

          <div className="flex flex-wrap justify-center gap-2 mt-8">
            <div className="flex items-center gap-1.5 bg-white/15 backdrop-blur-sm text-white px-4 py-2 rounded-full text-sm">
              <Clock size={14} /> 4h / 6h
            </div>
            <div className="flex items-center gap-1.5 bg-white/15 backdrop-blur-sm text-white px-4 py-2 rounded-full text-sm">
              <Users size={14} /> max {MAX_PARTY}
            </div>
            <div className="flex items-center gap-1.5 bg-white/15 backdrop-blur-sm text-white px-4 py-2 rounded-full text-sm">
              <Bus size={14} /> {t.pickup}
            </div>
          </div>

          <div className="mt-8 bg-white/10 backdrop-blur-md rounded-2xl px-6 py-5 border border-white/20 max-w-xs mx-auto">
            {referral && (
              <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-500 rounded-full mb-3">
                <Ticket size={12} className="text-white" />
                <span className="text-[11px] font-black text-white">
                  {referralName} · 10% OFF
                </span>
              </div>
            )}
            <p className="text-[11px] text-white/50 uppercase tracking-widest">{t.from}</p>
            <p className="text-4xl font-black text-white mt-1">
              ₩{minFee.toLocaleString()}
            </p>
            <p className="text-xs text-white/50 mt-1">{t.perPerson}</p>
          </div>

          <a href="#book"
            className="mt-7 inline-flex items-center gap-2 px-8 py-3.5 bg-amber-500 text-stone-950 rounded-full font-black text-base hover:bg-amber-400 transition-colors shadow-lg">
            {t.cta} <ArrowRight size={16} />
          </a>
        </div>
      </section>

      <div className="max-w-3xl mx-auto px-4 pb-24">
        {/* 인트로 */}
        <section className="py-12 sm:py-16 text-center">
          <p className="text-base sm:text-xl text-gray-700 leading-relaxed font-medium">
            {t.introA}
            <br className="hidden sm:block" /> {t.introB}
          </p>
          <p className="text-sm sm:text-base text-gray-500 mt-5">{t.introC}</p>
        </section>

        {/* 세 기둥 */}
        <section className="pb-12 sm:pb-16">
          <div className="text-center mb-8">
            <h2 className="text-xl sm:text-2xl font-black text-gray-900">
              {t.pillarsTitle} <span className="text-amber-600">{t.pillarsHl}</span>
            </h2>
          </div>
          <div className="grid gap-3 sm:grid-cols-3">
            {PILLARS.map((p, i) => (
              <div key={i} className="bg-white rounded-2xl border border-gray-200 p-5 text-center hover:shadow-md transition-all hover:-translate-y-0.5">
                <p className="text-3xl">{p.emoji}</p>
                <p className="font-black text-gray-900 text-sm mt-3">{p[lang].t}</p>
                <p className="text-xs text-gray-500 mt-1.5 leading-relaxed">{p[lang].d}</p>
              </div>
            ))}
          </div>
        </section>

        {/* 코스 일정 */}
        <section className="pb-12 sm:pb-16">
          <div className="text-center mb-8">
            <h2 className="text-xl sm:text-2xl font-black text-gray-900">
              {t.itinTitle} <span className="text-amber-600">{t.itinHl}</span>
            </h2>
            <p className="text-xs text-gray-500 mt-2 leading-relaxed">{t.itinNote}</p>
          </div>
          <div className="space-y-3">
            {ITINERARY.map((s, i) => {
              const Icon = s.icon;
              return (
                <div key={i} className={`rounded-2xl border p-4 sm:p-5 flex items-start gap-4 ${
                  s.fullOnly ? "border-dashed border-gray-200 bg-gray-50/60" : "border-gray-200 bg-white"
                }`}>
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
                    s.fullOnly ? "bg-gray-100 text-gray-400" : "bg-amber-50 text-amber-700"
                  }`}>
                    <Icon size={18} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className={`font-bold text-sm ${s.fullOnly ? "text-gray-500" : "text-gray-900"}`}>{s[lang].t}</p>
                      {s.min > 0 && (
                        <span className="px-2 py-0.5 bg-gray-100 text-gray-500 rounded-full text-[10px] font-bold">
                          {s.halfMin ? `${s.halfMin}–${s.min}` : s.min} min
                        </span>
                      )}
                      {s.fullOnly && (
                        <span className="px-2 py-0.5 bg-stone-800 text-white rounded-full text-[10px] font-bold">
                          {t.fullOnlyBadge}
                        </span>
                      )}
                    </div>
                    <p className={`text-xs mt-1.5 leading-relaxed ${s.fullOnly ? "text-gray-400" : "text-gray-600"}`}>
                      {s[lang].d}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* 요금 */}
        <section className="pb-12 sm:pb-16">
          <div className="text-center mb-8">
            <h2 className="text-xl sm:text-2xl font-black text-gray-900">
              {t.priceTitle} <span className="text-amber-600">{t.priceHl}</span>
            </h2>
            <p className="text-sm text-gray-500 mt-2">{t.priceNote}</p>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            {COURSES.map((c) => {
              const fee = referral ? Math.round((c.fee * 0.9) / 10) * 10 : c.fee;
              return (
                <div key={c.key} className="rounded-2xl border border-gray-200 bg-white p-5 flex flex-col">
                  <span className="self-start px-2.5 py-1 bg-stone-100 text-stone-600 rounded-full text-[11px] font-black">
                    {c[lang].tag}
                  </span>
                  <p className="text-base font-black text-gray-900 mt-3">{c[lang].label}</p>
                  <p className="text-xs text-gray-500 mt-1">{c[lang].desc}</p>
                  <div className="mt-4">
                    {referral && (
                      <span className="text-sm text-gray-400 line-through mr-2">₩{c.fee.toLocaleString()}</span>
                    )}
                    <span className="text-3xl font-black text-amber-600">₩{fee.toLocaleString()}</span>
                  </div>
                  <p className="text-[11px] text-gray-400 mt-1">
                    {t.perPerson}
                    {c.minParty > 1 ? ` · ${t.minParty} ${c.minParty}${t.person}` : ""}
                  </p>
                </div>
              );
            })}
          </div>

          {/* 3인 이상 쿠폰 */}
          <div className="mt-4 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 text-white p-5 sm:p-6">
            <div className="flex items-start gap-4">
              <Gift size={24} className="flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-black text-base">{t.couponTitle}</p>
                <p className="text-3xl font-black mt-1">₩{COUPON_VALUE.toLocaleString()}</p>
                <p className="text-xs text-white/80 mt-2 leading-relaxed">{t.couponDesc}</p>
              </div>
            </div>
          </div>

          {/* 제휴 카페 안내 */}
          <div className={`mt-3 rounded-2xl border p-5 ${
            referral ? "border-amber-300 bg-amber-50" : "border-gray-200 bg-gray-50"
          }`}>
            <div className="flex items-start gap-3">
              <Ticket size={20} className={referral ? "text-amber-600 flex-shrink-0 mt-0.5" : "text-gray-400 flex-shrink-0 mt-0.5"} />
              <div>
                <p className="font-bold text-sm text-gray-900">
                  {referral ? `${t.partnerApplied}${referralName ? ` — ${referralName}` : ""}` : t.partnerTitle}
                </p>
                <p className="text-xs text-gray-600 mt-1 leading-relaxed">{t.partnerDesc}</p>
              </div>
            </div>
          </div>
        </section>

        {/* 키트 품질 약속 */}
        <section className="pb-12 sm:pb-16">
          <div className="rounded-2xl border border-stone-200 overflow-hidden">
            <div className="relative h-40 overflow-hidden">
              <img src={IMG.craft} alt="soban" className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-stone-950/85 to-transparent" />
              <div className="absolute bottom-4 left-5">
                <p className="text-lg font-black text-white">
                  {t.qualityTitle} <span className="text-amber-300">{t.qualityHl}</span>
                </p>
              </div>
            </div>
            <div className="p-5 sm:p-6">
              <ul className="space-y-2.5">
                {QUALITY[lang].map((q, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-gray-700">
                    <Check size={16} className="text-amber-600 flex-shrink-0 mt-0.5" /> {q}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        {/* 예약 폼 */}
        <section id="book" className="pb-12 sm:pb-16 scroll-mt-20">
          <div className="text-center mb-8">
            <h2 className="text-xl sm:text-2xl font-black text-gray-900">
              {t.formTitle} <span className="text-amber-600">{t.formHl}</span>
            </h2>
          </div>
          <BookingForm lang={lang} referral={referral} referralName={referralName} />
        </section>

        {/* 안내 */}
        <section className="pb-12 sm:pb-16">
          <div className="bg-white rounded-2xl border border-gray-200 p-5 sm:p-6">
            <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-3">{t.infoTitle}</p>
            <ul className="text-xs text-gray-600 space-y-1.5 leading-relaxed">
              {lang === "ko" ? (
                <>
                  <li>🚐 전주 한옥마을에서 픽업하고 같은 자리에 복귀합니다.</li>
                  <li>👥 최대 {MAX_PARTY}명까지 함께 진행합니다.</li>
                  <li>🍽️ 채식·알레르기는 예약 시 알려주시면 맞춰드립니다.</li>
                  <li>💳 예약 확정 안내를 받으신 뒤에 결제하시면 됩니다.</li>
                  <li>🌧️ 실내 위주 코스라 비가 와도 진행됩니다.</li>
                </>
              ) : (
                <>
                  <li>🚐 Pickup and drop-off at Jeonju Hanok Village are included.</li>
                  <li>👥 Up to {MAX_PARTY} people per departure.</li>
                  <li>🍽️ Tell us about vegetarian needs or allergies when you book.</li>
                  <li>💳 Payment is arranged after we confirm your booking.</li>
                  <li>🌧️ The course runs rain or shine — most of it is indoors.</li>
                </>
              )}
            </ul>
          </div>
        </section>

        {/* CTA */}
        <section className="pb-8">
          <div className="relative rounded-2xl overflow-hidden">
            <img src={IMG.cta} alt="" className="w-full h-64 sm:h-72 object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-stone-950/90 via-stone-950/70 to-stone-950/40" />
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-6">
              <p className="text-4xl mb-3">🪵</p>
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
