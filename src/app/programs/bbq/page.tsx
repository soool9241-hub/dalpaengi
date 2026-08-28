"use client";

import { useState, useEffect } from "react";
import {
  Calendar,
  MapPin,
  Users,
  Clock,
  ArrowRight,
  ChevronLeft,
  Sparkles,
  MessageCircle,
  Train,
  Check,
  Flame,
} from "lucide-react";
import Link from "next/link";

/* ───── 회차 정보 ─────
   월 1회 정기 모임이다. 다음 회차를 열 때 여기 네 개와
   api/programs/bbq/route.ts 의 PROGRAM / EVENT_TEXT 를 같이 바꾼다. */
const ROUND_LABEL = "0회";
const EVENT_DATE = "2026-09-08T19:00:00+09:00";
const EVENT_TEXT = "2026.9.8(화)";
const EVENT_TIME = "19:00~22:00";

const MAX_CAPACITY = 6;

/* ───── 참가 코스 3종 ─────
   1교시(바베큐)와 2교시(스터디)를 따로 신청할 수 있게 쪼갰다.
   full 은 두 코스를 합친 금액이라 묶음 할인은 없다 — 대신 "다 하는 쪽"으로
   자연스럽게 기울도록 추천 배지만 단다.
   가격을 바꿀 땐 api/programs/bbq/route.ts 의 COURSES 도 같이 고친다. */
const COURSES = [
  {
    key: "bbq",
    emoji: "🍖",
    label: "항아리 바베큐만",
    sub: "1교시",
    time: "19:00~20:00",
    duration: "1시간",
    fee: 30_000,
    desc: "훈연 고기와 술 한잔, 딱 그것만",
    includes: ["항아리 훈연 바베큐", "주류 & 음료", "펜션 대관료"],
    recommended: false,
  },
  {
    key: "full",
    emoji: "🍖🤖",
    label: "바베큐 + AI 스터디",
    sub: "1교시 + 2교시",
    time: "19:00~22:00",
    duration: "3시간",
    fee: 60_000,
    desc: "먹고, 배우고, 만들어보는 풀코스",
    includes: ["항아리 훈연 바베큐", "주류 & 음료", "펜션 대관료", "AI 자동수익 워크숍"],
    recommended: true,
  },
  {
    key: "study",
    emoji: "🤖",
    label: "AI 스터디만",
    sub: "2교시",
    time: "20:00~22:00",
    duration: "2시간",
    fee: 30_000,
    desc: "저녁 먹고 와서 공부만",
    includes: ["AI 자동수익 워크숍", "음료 & 다과", "펜션 대관료"],
    recommended: false,
  },
] as const;

const MIN_FEE = 30_000;
const MAX_FEE = 60_000;

const KAKAO_URL = "https://open.kakao.com/o/ssowhRlg";
const VENUE_ADDR = "전북 완주군 소양면 해월신왕길 92";

/* 항아리 바베큐 전용 촬영본이 아직 없어 펜션 기존 바베큐 사진을 쓴다.
   TODO(sol): 0회 진행 후 실제 항아리 사진으로 교체 */
const IMG = {
  hero: "/img/bbq-night.jpg",
  pot: "/img/bbq-outdoor.jpg",
  study: "/img/living-tv.jpg",
  cta: "/img/campfire.jpg",
};

/* ───── 두 개의 교시 ───── */
const SESSIONS = [
  {
    num: "1교시",
    time: "19:00~20:00",
    emoji: "🍖",
    title: "항아리 바베큐",
    tag: "미식클럽 대장과 함께",
    desc: "항아리 속에서 장시간 훈연해 육즙은 가득하고 기름기는 쏙 빠진 고기. 직화로 굽는 게 아니라 항아리 안 열기로 익히기 때문에 겉은 바삭하고 속은 촉촉합니다. 보기만 해도 군침 도는 그 비주얼, 직접 확인해보세요.",
    img: IMG.pot,
    color: "border-amber-200 bg-amber-50/50",
  },
  {
    num: "2교시",
    time: "20:00~22:00",
    emoji: "🤖",
    title: "자동 수익 시스템 만들기",
    tag: "AI 수익화 인사이트 공유",
    desc: "배부르게 먹은 다음, 실제로 굴러가고 있는 자동 수익 구조를 뜯어봅니다. 어떤 서비스를 어떻게 만들었고 무엇이 먹혔는지 — 슬라이드 발표가 아니라 화면 켜놓고 같이 만져보는 시간입니다.",
    img: IMG.study,
    color: "border-blue-200 bg-blue-50/50",
  },
];

/* ───── 이런 분 환영 ───── */
const WELCOME = [
  { icon: "🤤", title: "항아리 바베큐가\n궁금하신 분", desc: "입에서 살살 녹는 훈연 고기, 말로만 듣던 그 맛" },
  { icon: "💰", title: "자동 수익 시스템이\n궁금하신 분", desc: "AI로 수익 구조 만드는 법을 실제 사례로 듣고 싶은 분" },
  { icon: "🤝", title: "새로운 동네 친구를\n만나고 싶은 분", desc: "소양의 고즈넉한 분위기에서 편하게 소통하고 싶은 분" },
];

/* ───── 회비에 포함된 것 ─────
   금액 환산("N만원 상당")은 쓰지 않는다. 계산기를 켜게 만들면
   "그 돈이면 딴 데서도" 로 빠지기 때문. 대신 무엇이 좋은지를 적는다. */
const INCLUDED = [
  { icon: "🍖", title: "항아리 훈연 바베큐", desc: "장시간 훈연한 고기, 배부르게", value: "이게 메인" },
  { icon: "🍺", title: "주류 & 음료", desc: "술·음료 별도 계산 없음", value: "추가금 0" },
  { icon: "🏡", title: "펜션 통째 대관", desc: "넓은 공간을 여섯이서", value: "눈치 볼 일 없음" },
  { icon: "🤖", title: "AI 자동수익 워크숍", desc: "2시간, 실제 사례 기반", value: "따라 만들어봄" },
  { icon: "🌌", title: "소양의 밤공기", desc: "산속 마당, 불멍 가능", value: "도시엔 없는 것" },
  { icon: "🚐", title: "전주역·터미널 픽업", desc: "차 없어도 오실 수 있어요", value: "뚜벅이 환영" },
];

/* ───── 왜 6명인가 ───── */
const WHY_SIX = [
  "고기가 나오는 속도와 먹는 속도가 맞는 인원",
  "한 테이블에서 전원이 대화가 되는 인원",
  "2교시에 각자 질문을 다 할 수 있는 인원",
];

/* ───── 잔여석 카운터 훅 ───── */
function useBbqStatus() {
  const [status, setStatus] = useState({ current: 0, remaining: MAX_CAPACITY, max: MAX_CAPACITY, closed: false });
  useEffect(() => {
    fetch("/api/programs/bbq")
      .then((r) => r.json())
      .then((d) => setStatus(d))
      .catch(() => {});
  }, []);
  return status;
}

/* ───── D-day 계산 ───── */
function getDday() {
  const target = new Date(EVENT_DATE);
  const now = new Date();
  const diff = Math.ceil((target.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
  return diff > 0 ? diff : 0;
}

/* ───── 신청 폼 ───── */
function ApplyForm() {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [age, setAge] = useState("");
  const [gender, setGender] = useState("");
  const [occupation, setOccupation] = useState("");
  const [reason, setReason] = useState("");
  const [photoConsent, setPhotoConsent] = useState(false);
  const [transport, setTransport] = useState("");
  const [region, setRegion] = useState("");
  // 대부분 풀코스를 고르므로 기본 선택으로 열어둔다.
  const [course, setCourse] = useState<string>("full");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ ok: boolean; msg: string } | null>(null);
  const [waitlistModal, setWaitlistModal] = useState<{ show: boolean; number: number }>({ show: false, number: 0 });

  const submit = async () => {
    if (!course) { setResult({ ok: false, msg: "참가 코스를 선택해주세요." }); return; }
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
      const res = await fetch("/api/programs/bbq", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, phone, age, gender, occupation, reason, photoConsent, transport, region, course }),
      });
      const data = await res.json();

      if (res.ok && data.success) {
        setName(""); setPhone(""); setAge(""); setGender(""); setOccupation(""); setReason(""); setPhotoConsent(false); setTransport(""); setRegion(""); setCourse("full");
        if (data.waitlisted === true) {
          const num = Number(data.waitlistNumber) || 1;
          setWaitlistModal({ show: true, number: num });
          setResult({ ok: true, msg: `🍖 아쉽게도 마감되었습니다! 대기자 ${num}번으로 등록되었어요.` });
        } else {
          setResult({ ok: true, msg: "신청이 완료되었습니다! 확인 문자가 발송됩니다." });
        }
      } else {
        setResult({ ok: false, msg: data.error || "신청 실패" });
      }
    } catch {
      setResult({ ok: false, msg: "네트워크 오류" });
    }
    setLoading(false);
  };

  const inputClass = "w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/20";
  const selectedCourse = COURSES.find((c) => c.key === course) ?? COURSES[1];

  return (
    <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
      {/* 마감 안내 모달 */}
      {waitlistModal.show && (
        <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white rounded-3xl max-w-sm w-full overflow-hidden shadow-2xl">
            <div className="bg-gradient-to-br from-amber-500 to-orange-600 text-white px-6 py-8 text-center">
              <div className="text-5xl mb-3">🍖</div>
              <p className="text-xs font-bold tracking-widest opacity-90 mb-1">SOLD OUT</p>
              <h3 className="text-2xl font-black">아쉽게도 마감되었어요</h3>
              <p className="text-sm text-white/90 mt-2">{MAX_CAPACITY}명 선착순이 이미 채워졌습니다</p>
            </div>
            <div className="p-6 space-y-4">
              <div className="bg-amber-50 border-2 border-amber-200 rounded-2xl p-5 text-center">
                <p className="text-xs font-bold text-amber-600 tracking-wide mb-1">대기자 번호</p>
                <p className="text-5xl font-black text-amber-600">{waitlistModal.number}<span className="text-2xl">번</span></p>
                <p className="text-xs text-gray-500 mt-2">대기자 명단에 등록 완료 ✅</p>
              </div>
              <div className="bg-gray-50 rounded-xl p-4 space-y-2">
                <p className="text-sm font-bold text-gray-900">🔥 이렇게 진행됩니다</p>
                <ul className="text-xs text-gray-600 space-y-1 leading-relaxed">
                  <li>• 취소자 발생 시 <span className="font-bold text-amber-600">순번대로</span> 연락드립니다</li>
                  <li>• 다음 회차는 <span className="font-bold text-amber-600">한 달 뒤</span> — 가장 먼저 안내드립니다</li>
                  <li>• 입력하신 연락처로 문자가 발송되었어요</li>
                </ul>
              </div>
              <button
                onClick={() => setWaitlistModal({ show: false, number: 0 })}
                className="w-full py-3.5 bg-amber-600 text-white rounded-xl font-bold text-base hover:bg-amber-700 transition-colors"
              >
                확인했어요
              </button>
            </div>
          </div>
        </div>
      )}
      <div className="p-6 space-y-4">
        {/* 코스 선택 — 금액이 여기서 정해지므로 폼 맨 위에 둔다 */}
        <div>
          <label className="text-xs font-semibold text-gray-600 block mb-2">참가 코스 <span className="text-red-500">*</span></label>
          <div className="flex flex-col gap-2">
            {COURSES.map((c) => (
              <button key={c.key} type="button" onClick={() => setCourse(c.key)}
                className={`w-full rounded-xl border-2 transition-all text-left px-4 py-3 ${
                  course === c.key ? "border-amber-500 bg-amber-50 shadow-md" : "border-gray-200 hover:border-gray-300"
                }`}>
                <div className="flex items-center gap-3">
                  <span className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                    course === c.key ? "border-amber-500 bg-amber-500" : "border-gray-300"
                  }`}>
                    {course === c.key && <span className="w-2 h-2 rounded-full bg-white" />}
                  </span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className={`text-sm font-bold ${course === c.key ? "text-amber-700" : "text-gray-700"}`}>
                        {c.emoji} {c.label}
                      </span>
                      {c.recommended && (
                        <span className="px-1.5 py-0.5 bg-gray-900 text-white rounded text-[10px] font-black">추천</span>
                      )}
                    </div>
                    <p className="text-[11px] text-gray-500 mt-0.5">{c.sub} · {c.time} ({c.duration})</p>
                  </div>
                  <span className={`text-base font-black flex-shrink-0 ${course === c.key ? "text-amber-600" : "text-gray-400"}`}>
                    {c.fee.toLocaleString("ko-KR")}원
                  </span>
                </div>
              </button>
            ))}
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-xs font-semibold text-gray-600 block mb-1">이름 <span className="text-red-500">*</span></label>
            <input value={name} onChange={e => setName(e.target.value)} placeholder="홍길동" className={inputClass} />
          </div>
          <div>
            <label className="text-xs font-semibold text-gray-600 block mb-1">연락처 <span className="text-red-500">*</span></label>
            <input value={phone} onChange={e => setPhone(e.target.value)} placeholder="010-1234-5678" className={inputClass} />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-xs font-semibold text-gray-600 block mb-1">나이 <span className="text-red-500">*</span></label>
            <input value={age} onChange={e => setAge(e.target.value)} placeholder="예: 34" className={inputClass} />
          </div>
          <div>
            <label className="text-xs font-semibold text-gray-600 block mb-1">성별 <span className="text-red-500">*</span></label>
            <div className="flex gap-2">
              {["남성", "여성"].map((g) => (
                <button key={g} type="button" onClick={() => setGender(g)}
                  className={`flex-1 py-2.5 rounded-xl text-sm font-semibold border transition-all ${
                    gender === g ? "border-amber-500 bg-amber-500/10 text-amber-700" : "border-gray-200 text-gray-400 hover:bg-gray-50"
                  }`}>{g}</button>
              ))}
            </div>
          </div>
        </div>
        <div>
          <label className="text-xs font-semibold text-gray-600 block mb-1">현재 하시는 일 <span className="text-red-500">*</span></label>
          <input value={occupation} onChange={e => setOccupation(e.target.value)} placeholder="예: 온라인 쇼핑몰 운영" className={inputClass} />
        </div>
        <div>
          <label className="text-xs font-semibold text-gray-600 block mb-1">신청 이유 / 기대하는 점 <span className="text-red-500">*</span></label>
          <textarea value={reason} onChange={e => setReason(e.target.value)} rows={3}
            placeholder="항아리 바베큐가 궁금해서 / 자동수익 시스템 이야기를 듣고 싶어서 등 편하게 적어주세요."
            className={`${inputClass} resize-none`} />
        </div>
        <div>
          <label className="text-xs font-semibold text-gray-600 block mb-1">지역 (시/군 단위) <span className="text-red-500">*</span></label>
          <input value={region} onChange={e => setRegion(e.target.value)} placeholder="예: 완주군" className={inputClass} />
        </div>
        <div>
          <label className="text-xs font-semibold text-gray-600 block mb-1">이동 방법 <span className="text-red-500">*</span></label>
          <div className="flex flex-col gap-2">
            {[
              { value: "전주고속터미널", label: "뚜벅이전용 — 전주고속터미널", time: course === "study" ? "19:10" : "18:10", pickup: true },
              { value: "전주역", label: "뚜벅이전용 — 전주역", time: course === "study" ? "19:30" : "18:30", pickup: true },
              { value: "자차", label: "개별이동 — 자차이용", time: course === "study" ? "19:50" : "18:50", pickup: false },
            ].map((t) => (
              <button key={t.value} type="button" onClick={() => setTransport(t.value)}
                className={`w-full rounded-xl border-2 transition-all text-left overflow-hidden ${
                  transport === t.value ? "border-amber-500 bg-amber-50 shadow-md" : "border-gray-200 hover:border-gray-300"
                }`}>
                <div className="flex items-center gap-3 px-4 py-3">
                  <span className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                    transport === t.value ? "border-amber-500 bg-amber-500" : "border-gray-300"
                  }`}>
                    {transport === t.value && <span className="w-2 h-2 rounded-full bg-white" />}
                  </span>
                  <div className="flex-1">
                    <p className={`text-sm font-bold ${transport === t.value ? "text-amber-700" : "text-gray-700"}`}>{t.label}</p>
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
            <div className="mt-2 p-3 bg-gradient-to-r from-amber-100 to-orange-50 border border-amber-300 rounded-xl">
              <p className="text-sm font-black text-amber-700">🚐 카니발로 친절히 모시러 갑니다!</p>
              <p className="text-xs text-gray-600 mt-1">
                <span className="font-bold text-amber-600">{transport}</span>에서{" "}
                <span className="font-bold text-amber-600">
                  {transport === "전주고속터미널"
                    ? (course === "study" ? "19:10" : "18:10")
                    : (course === "study" ? "19:30" : "18:30")}
                </span>에 집결 — 확정 후 상세 안내 드립니다
              </p>
            </div>
          )}
        </div>
        <div>
          <label className="flex items-start gap-2 cursor-pointer">
            <input type="checkbox" checked={photoConsent} onChange={e => setPhotoConsent(e.target.checked)}
              className="mt-0.5 w-4 h-4 rounded border-gray-300 text-amber-600 focus:ring-amber-500/20" />
            <span className="text-xs text-gray-600">
              <span className="font-bold text-red-500">*</span> 모임 중 촬영되는 사진/영상이 홍보 목적으로 활용될 수 있음에 동의합니다. (필수)
            </span>
          </label>
        </div>
        <button onClick={submit} disabled={loading}
          className="w-full py-3.5 rounded-xl text-white font-bold text-base transition-opacity disabled:opacity-50 bg-gradient-to-r from-amber-500 to-orange-600 hover:opacity-90">
          {loading
            ? "신청 중..."
            : `${selectedCourse.emoji} ${selectedCourse.fee.toLocaleString("ko-KR")}원으로 신청하기`}
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

/* ───── 메인 페이지 ───── */
export default function BbqPage() {
  const status = useBbqStatus();
  const dday = getDday();

  return (
    <div className="min-h-screen bg-background">
      {/* 상단 내비 */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-md shadow-sm">
        <div className="max-w-5xl mx-auto px-4 h-14 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 text-gray-700 hover:text-amber-600 transition-colors">
            <ChevronLeft size={18} />
            <span className="text-sm font-medium">달팽이아지트</span>
          </Link>
          <div className="flex items-center gap-2">
            <a href={KAKAO_URL} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 bg-[#FEE500] text-[#3C1E1E] px-3 py-2 rounded-full text-xs font-bold hover:brightness-95 transition-all">
              <MessageCircle size={12} /> 카톡문의
            </a>
            <a href="#apply" className="bg-gradient-to-r from-amber-500 to-orange-600 text-white px-4 py-2 rounded-full text-xs font-semibold hover:opacity-90 transition-all">
              신청하기
            </a>
          </div>
        </div>
      </nav>

      {/* 히어로 */}
      <section className="relative pt-14">
        <div className="relative min-h-[78vh] overflow-hidden">
          <img src={IMG.hero} alt="항아리 바베큐 모임" className="absolute inset-0 w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/50 to-black/80" />
          <div className="relative z-10 min-h-[78vh] flex flex-col items-center justify-center text-center px-4 py-14 sm:py-16">
            <p className="flex items-center gap-2.5 text-xs sm:text-sm text-white/55 tracking-[0.2em] mb-5">
              <span className="w-6 sm:w-10 h-px bg-white/25" />
              혼자 알기 아까운 맛
              <span className="w-6 sm:w-10 h-px bg-white/25" />
            </p>
            <span className="text-4xl mb-4">🍖</span>
            <h1 className="text-3xl sm:text-5xl font-black text-white leading-tight">
              항아리에서 훈연한 고기,<br />같이 먹을 사람 {MAX_CAPACITY}명
            </h1>
            <p className="text-lg sm:text-xl text-white/80 mt-3 font-medium">
              1교시 항아리 바베큐 · 2교시 AI 자동수익
            </p>
            <p className="text-sm sm:text-base text-amber-300 mt-2 font-bold">
              육즙은 가득, 기름기는 쏙 — 고기·술·대관료 전부 포함
            </p>

            <div className="flex flex-wrap items-center justify-center gap-3 mt-6">
              <div className="flex items-center gap-1.5 bg-white/20 backdrop-blur-sm text-white px-4 py-2 rounded-full text-sm">
                <Calendar size={14} /> {EVENT_TEXT} 저녁
              </div>
              <div className="flex items-center gap-1.5 bg-white/20 backdrop-blur-sm text-white px-4 py-2 rounded-full text-sm">
                <Clock size={14} /> {EVENT_TIME} (3시간)
              </div>
              <div className="flex items-center gap-1.5 bg-white/20 backdrop-blur-sm text-white px-4 py-2 rounded-full text-sm">
                <Users size={14} /> {MAX_CAPACITY}명 한정
              </div>
            </div>
            <p className="text-xs text-white/50 mt-3 flex items-center gap-1">
              <MapPin size={12} /> 소양 달팽이아지트 · 전주역/터미널 픽업 있음
            </p>

            {/* 코스 가격 요약 — 원하는 만큼만 골라 오세요 */}
            <div className="mt-6 bg-white/10 backdrop-blur-md rounded-2xl px-5 py-5 border border-white/20">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-gradient-to-r from-amber-500 to-orange-600 rounded-full mb-3">
                <Flame size={12} className="text-white" />
                <span className="text-[11px] font-black text-white tracking-wide">{ROUND_LABEL} · 원하는 코스만 골라서</span>
              </div>
              <div className="grid grid-cols-3 gap-2">
                {COURSES.map((c) => (
                  <div key={c.key} className={`rounded-xl px-2 py-3 border ${
                    c.recommended ? "bg-amber-500/25 border-amber-300/60" : "bg-white/5 border-white/15"
                  }`}>
                    <p className="text-base leading-none">{c.emoji}</p>
                    <p className="text-[11px] text-white/70 mt-1.5 leading-tight">{c.sub}</p>
                    <p className="text-lg font-black text-white mt-0.5 whitespace-nowrap">
                      {(c.fee / 10_000).toLocaleString("ko-KR")}<span className="text-xs font-bold">만원</span>
                    </p>
                    <p className="text-[10px] text-white/50 mt-0.5">{c.duration}</p>
                  </div>
                ))}
              </div>
              <p className="text-xs text-white/50 mt-3">
                선착순 {MAX_CAPACITY}명 한정{dday > 0 ? <> · <span className="text-amber-300 font-bold">D-{dday}</span></> : null}
              </p>
            </div>

            <a href="#apply" className="mt-6 inline-flex items-center gap-2 px-8 py-3.5 bg-gradient-to-r from-amber-500 to-orange-600 text-white rounded-full font-black text-base hover:opacity-90 transition-opacity shadow-lg shadow-orange-900/40">
              신청하기 <ArrowRight size={16} />
            </a>
          </div>
        </div>
      </section>

      <div className="max-w-3xl mx-auto px-4 pb-24">

        {/* 인트로 */}
        <section className="py-12 sm:py-16 text-center">
          <p className="text-lg sm:text-xl text-gray-700 leading-relaxed font-medium">
            굽는 게 아니라,<br />항아리 안에서 익힙니다.
          </p>
          <p className="text-lg sm:text-xl text-amber-600 font-bold mt-6 leading-relaxed">
            장시간 훈연해<br />육즙은 가득하고 기름기는 쏙.
          </p>
          <p className="text-sm text-gray-500 mt-6 max-w-md mx-auto leading-relaxed">
            보기만 해도 군침 도는 비주얼과 맛,<br />
            <span className="font-bold text-gray-700">혼자만 알기 아까워서</span> 모임 엽니다.
          </p>
          <div className="mt-8 inline-flex items-center gap-2 px-4 py-2 bg-amber-50 border border-amber-200 rounded-full">
            <span className="text-sm">🍽</span>
            <span className="text-xs font-bold text-amber-700">미식클럽 대장이 직접 굽습니다</span>
          </div>
        </section>

        {/* 이런 분 환영 */}
        <section className="pb-12 sm:pb-16">
          <h2 className="text-xl sm:text-2xl font-black text-gray-900 text-center mb-8">✨ 이런 분들을 환영해요 ✨</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {WELCOME.map((item, i) => (
              <div key={i} className="bg-white rounded-2xl border border-gray-200 p-6 text-center hover:shadow-md transition-shadow">
                <span className="text-3xl">{item.icon}</span>
                <p className="font-bold text-gray-900 mt-3 whitespace-pre-line text-sm">{item.title}</p>
                <p className="text-xs text-gray-500 mt-2 leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* 타임테이블 — 2교시 구성 */}
        <section className="pb-12 sm:pb-16">
          <div className="text-center mb-8">
            <p className="text-sm font-bold text-amber-600 uppercase tracking-wider mb-2">TIMETABLE</p>
            <h2 className="text-xl sm:text-2xl font-black text-gray-900">3시간, <span className="text-amber-600">두 개의 교시</span></h2>
            <p className="text-sm text-gray-500 mt-2">먼저 배부르게 먹고, 그다음 머리를 채웁니다</p>
            <p className="text-xs text-amber-600 font-bold mt-2">💡 두 교시 중 원하는 것만 신청하셔도 됩니다</p>
          </div>
          <div className="space-y-4">
            {SESSIONS.map((s, i) => (
              <div key={i} className={`rounded-2xl border overflow-hidden ${s.color}`}>
                <div className="relative h-48 sm:h-56 overflow-hidden">
                  <img src={s.img} alt={s.title} className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                  <div className="absolute top-3 left-3 px-3 py-1.5 rounded-full bg-white/90 font-black text-xs">
                    {s.num}
                  </div>
                  <div className="absolute top-3 right-3 px-3 py-1.5 rounded-full bg-black/50 backdrop-blur-sm text-white font-bold text-xs">
                    {s.time}
                  </div>
                  <div className="absolute bottom-3 left-4 right-4">
                    <div className="flex items-center gap-2">
                      <span className="text-xl">{s.emoji}</span>
                      <h3 className="font-black text-white text-lg sm:text-xl drop-shadow-md">{s.title}</h3>
                    </div>
                  </div>
                </div>
                <div className="p-5">
                  <p className="text-xs font-semibold text-amber-600">{s.tag}</p>
                  <p className="text-sm text-gray-600 mt-1.5 leading-relaxed">{s.desc}</p>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-4 bg-blue-50 border border-blue-100 rounded-2xl p-4 text-center">
            <p className="text-xs text-blue-700 font-semibold">
              💻 2교시에 노트북이나 태블릿을 가져오시면 바로 따라 만들어보실 수 있어요 (선택)
            </p>
          </div>
        </section>

        {/* 참가비 — 코스 3종 */}
        <section className="pb-12 sm:pb-16">
          <div className="text-center mb-8">
            <p className="text-sm font-bold text-amber-600 uppercase tracking-wider mb-2">참가비</p>
            <h2 className="text-xl sm:text-2xl font-black text-gray-900">
              오고 싶은 <span className="text-amber-600">시간만큼만</span> 오세요
            </h2>
            <p className="text-sm text-gray-500 mt-2">
              1교시·2교시를 따로 신청하실 수 있어요. 당일 추가로 내실 돈은 없습니다.
            </p>
          </div>
          <div className="grid gap-3 sm:grid-cols-3">
            {COURSES.map((c) => (
              <div key={c.key} className={`relative rounded-2xl p-5 flex flex-col ${
                c.recommended
                  ? "bg-gradient-to-br from-amber-500 to-orange-600 text-white shadow-lg shadow-orange-200"
                  : "bg-white border border-gray-200"
              }`}>
                {c.recommended && (
                  <span className="absolute -top-2.5 left-1/2 -translate-x-1/2 px-3 py-1 bg-gray-900 text-white rounded-full text-[11px] font-black whitespace-nowrap">
                    ⭐ 이 코스를 가장 많이 고르세요
                  </span>
                )}
                <p className="text-2xl">{c.emoji}</p>
                <p className={`text-sm font-black mt-2 ${c.recommended ? "text-white" : "text-gray-900"}`}>{c.label}</p>
                <p className={`text-xs mt-0.5 ${c.recommended ? "text-white/70" : "text-gray-500"}`}>
                  {c.sub} · {c.time} ({c.duration})
                </p>
                <p className={`text-3xl font-black mt-3 ${c.recommended ? "text-white" : "text-amber-600"}`}>
                  {c.fee.toLocaleString("ko-KR")}<span className="text-base font-bold">원</span>
                </p>
                <p className={`text-xs mt-2 ${c.recommended ? "text-white/80" : "text-gray-500"}`}>{c.desc}</p>
                <ul className={`mt-3 pt-3 border-t space-y-1.5 flex-1 ${c.recommended ? "border-white/25" : "border-gray-100"}`}>
                  {c.includes.map((inc) => (
                    <li key={inc} className={`flex items-start gap-1.5 text-xs ${c.recommended ? "text-white/90" : "text-gray-600"}`}>
                      <Check size={13} className="flex-shrink-0 mt-0.5" /> {inc}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          <p className="text-center text-sm text-gray-500 mt-5">
            선착순 {MAX_CAPACITY}명 · 현재{" "}
            <span className="font-black text-amber-600">{status.current}/{MAX_CAPACITY}명</span>
          </p>
        </section>

        {/* 회비에 포함된 것 */}
        <section className="pb-12 sm:pb-16">
          <div className="text-center mb-8">
            <p className="text-sm font-bold text-amber-600 uppercase tracking-wider mb-2">WHAT YOU GET</p>
            <h2 className="text-xl sm:text-2xl font-black text-gray-900">
              풀코스에 포함된 <span className="text-amber-600">6가지</span>
            </h2>
            <p className="text-sm text-gray-500 mt-2">바베큐만·스터디만 신청하시면 해당 교시 항목만 포함됩니다</p>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {INCLUDED.map((b, i) => (
              <div key={i} className="bg-white rounded-xl border border-gray-200 p-4 hover:shadow-md transition-all hover:-translate-y-0.5">
                <div className="flex items-start gap-3">
                  <span className="text-2xl flex-shrink-0">{b.icon}</span>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-gray-900 text-sm">{b.title}</p>
                    <p className="text-xs text-gray-500 mt-0.5">{b.desc}</p>
                    <p className="text-xs font-bold text-amber-600 mt-1">{b.value}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-6 bg-gradient-to-br from-amber-50 to-orange-50 rounded-2xl p-6 border border-amber-200">
            <p className="text-xs font-bold text-amber-600 uppercase tracking-wider text-center">WHY {MAX_CAPACITY}</p>
            <h3 className="text-lg sm:text-xl font-black text-gray-900 mt-2 text-center leading-snug">
              항아리 하나에<br />딱 맞는 인원입니다
            </h3>
            <div className="mt-5 space-y-2.5 max-w-sm mx-auto">
              {WHY_SIX.map((t, i) => (
                <div key={i} className="flex items-start gap-2.5">
                  <Check size={16} className="text-amber-600 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-gray-700 leading-relaxed">{t}</p>
                </div>
              ))}
            </div>
            <p className="text-xs text-gray-500 text-center mt-5">
              더 받을 수 있어도 안 받습니다. {MAX_CAPACITY}명이 이 모임의 정원이에요.
            </p>
            <div className="text-center">
              <a href="#apply" className="inline-flex items-center gap-2 mt-5 px-6 py-3 bg-gradient-to-r from-amber-500 to-orange-600 text-white rounded-full font-bold text-sm hover:opacity-90 transition-opacity">
                지금 신청하기 <ArrowRight size={14} />
              </a>
            </div>
          </div>
        </section>

        {/* 모임 안내 */}
        <section className="pb-12 sm:pb-16">
          <h2 className="text-xl sm:text-2xl font-black text-gray-900 text-center mb-8">모임 안내</h2>
          <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">일시</p>
                  <p className="text-sm font-semibold text-gray-900 mt-1">{EVENT_TEXT} {EVENT_TIME}</p>
                  <p className="text-xs text-gray-500">{ROUND_LABEL} · 이후 월 1회 정기</p>
                </div>
                <div>
                  <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">장소</p>
                  <p className="text-sm font-semibold text-gray-900 mt-1">달팽이아지트펜션</p>
                  <p className="text-xs text-gray-500">{VENUE_ADDR}</p>
                </div>
                <div>
                  <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">인원</p>
                  <p className="text-sm font-semibold text-gray-900 mt-1">{MAX_CAPACITY}명 한정</p>
                  <p className="text-xs text-gray-500">선착순 마감</p>
                </div>
                <div>
                  <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">회비</p>
                  <p className="text-sm font-semibold text-gray-900 mt-1">
                    <span className="text-amber-600 text-lg font-black">
                      {MIN_FEE.toLocaleString("ko-KR")}~{MAX_FEE.toLocaleString("ko-KR")}원
                    </span>
                  </p>
                  <p className="text-xs text-gray-500">선택한 코스에 따라</p>
                </div>
              </div>
              <div className="border-t border-gray-100 pt-4">
                <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-2">포함 내용</p>
                <div className="flex flex-wrap gap-2">
                  {["항아리 훈연 바베큐", "주류 & 음료", "펜션 대관료", "AI 자동수익 워크숍"].map((item) => (
                    <span key={item} className="px-3 py-1.5 rounded-full bg-amber-50 border border-amber-100 text-sm text-gray-700 font-medium">{item}</span>
                  ))}
                </div>
              </div>
              <div className="border-t border-gray-100 pt-4">
                <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-2">참고사항</p>
                <ul className="text-xs text-gray-600 space-y-1.5 leading-relaxed">
                  <li>🚗 펜션에 주차 공간 넉넉합니다.</li>
                  <li>🚐 차 없으셔도 전주역·고속터미널에서 픽업해드립니다.</li>
                  <li>💳 입금 확인 후 신청이 최종 확정됩니다.</li>
                  <li>🔁 월 1회 정기 모임이며, 일정은 변동될 수 있습니다.</li>
                </ul>
              </div>
            </div>
          </div>

          {/* 교통편 */}
          <div className="mt-8 bg-blue-50 rounded-2xl p-6 border border-blue-100">
            <div className="flex items-center gap-2 mb-4">
              <Train size={20} className="text-blue-600" />
              <h3 className="font-black text-gray-900">전주 밖에서 오시나요?</h3>
            </div>
            <div className="space-y-3">
              <div className="flex items-start gap-3 bg-white rounded-xl p-4">
                <span className="text-lg">🚄</span>
                <div>
                  <p className="font-bold text-sm text-gray-900">KTX (추천)</p>
                  <p className="text-xs text-gray-500 mt-0.5">용산역 → 전주역 <span className="font-bold text-blue-600">1시간 30분</span></p>
                  <p className="text-xs text-gray-400">전주역 18:30 집결 — 카니발로 픽업</p>
                </div>
              </div>
              <div className="flex items-start gap-3 bg-white rounded-xl p-4">
                <span className="text-lg">🚌</span>
                <div>
                  <p className="font-bold text-sm text-gray-900">고속버스</p>
                  <p className="text-xs text-gray-500 mt-0.5">센트럴시티 → 전주 <span className="font-bold text-blue-600">2시간 40분</span></p>
                  <p className="text-xs text-gray-400">전주고속터미널 18:10 집결 — 카니발로 픽업</p>
                </div>
              </div>
              <div className="flex items-start gap-3 bg-white rounded-xl p-4">
                <span className="text-lg">🚗</span>
                <div>
                  <p className="font-bold text-sm text-gray-900">자차</p>
                  <p className="text-xs text-gray-500 mt-0.5">펜션 18:50 직접 도착 · <span className="font-bold text-blue-600">무료 주차</span></p>
                  <p className="text-xs text-gray-400">네비: {VENUE_ADDR}</p>
                </div>
              </div>
            </div>
            <p className="text-xs text-blue-500 font-semibold mt-4 text-center">💡 교통편 고민되시면 카톡으로 편하게 물어보세요!</p>
          </div>

          <div id="apply" className="mt-6 scroll-mt-20">
            <ApplyForm />
          </div>
        </section>

        {/* 경험 중심 CTA */}
        <section className="pb-12 sm:pb-16">
          <div className="rounded-2xl p-8 text-white text-center relative overflow-hidden">
            <img src={IMG.cta} alt="달팽이아지트 밤 풍경" className="absolute inset-0 w-full h-full object-cover" />
            <div className="absolute inset-0 bg-black/65" />
            <div className="relative z-10">
              <Sparkles size={32} className="mx-auto text-amber-400" />
              <h3 className="text-xl sm:text-2xl font-black mt-4">
                맛있게 먹고,<br /><span className="text-amber-400">돈 버는 이야기까지 하고 가세요</span>
              </h3>
              <p className="text-white/60 text-sm mt-3 max-w-sm mx-auto leading-relaxed">
                소양 산속에서 항아리 열리는 세 시간.<br />처음 본 사이여도 고기 앞에선 금방 친해집니다.
              </p>
              <div className="flex items-center justify-center gap-4 mt-6">
                <div className="text-center">
                  <p className="text-3xl font-black text-white">{MAX_CAPACITY}명</p>
                  <p className="text-xs text-white/50 mt-1">한정 모집</p>
                </div>
                <div className="w-px h-12 bg-white/20" />
                <div className="text-center">
                  <p className="text-3xl font-black text-amber-400">2교시</p>
                  <p className="text-xs text-white/50 mt-1">먹고 · 배우고</p>
                </div>
                <div className="w-px h-12 bg-white/20" />
                <div className="text-center">
                  <p className="text-3xl font-black text-white">3시간</p>
                  <p className="text-xs text-white/50 mt-1">올인원</p>
                </div>
              </div>
              <a href="#apply" className="inline-flex items-center gap-2 mt-8 px-10 py-4 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-full font-black text-lg hover:opacity-90 transition-opacity shadow-lg shadow-amber-500/30">
                함께 먹으러 가기 <ArrowRight size={18} />
              </a>
              <p className="text-xs text-white/40 mt-3">신청 후 안내 문자가 발송됩니다</p>
            </div>
          </div>
        </section>

      </div>

      <div className="h-[72px]" />
    </div>
  );
}
