"use client";

import { useState, useEffect } from "react";
import {
  ChevronDown,
  ChevronUp,
  ChevronLeft,
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

/* ───── 프로그램 고정값 ───── */
const FEE = 99_000;
const MAX_CAPACITY = 20;
const MIN_CAPACITY = 10;
const EVENT_DATE = "2026-09-06T12:00:00+09:00";
const KAKAO_URL = "https://open.kakao.com/o/ssowhRlg";

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

/* ───── 주요 프로그램 ───── */
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
    tag: "AI 음악창작",
    desc: "채집한 소리를 재료로 나만의 곡을 창작합니다",
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

/* ───── 타임테이블 ───── */
const TIMETABLE = [
  { time: "12:00~13:00", label: "웰컴 & 점심식사", icon: "🍚" },
  { time: "13:00~15:00", label: "소리 자연채집 (숲 소리산책·녹음)", icon: "🌿", tag: "2시간", color: "bg-emerald-100 text-emerald-800" },
  { time: "15:00~15:20", label: "쉬는 시간 + 간식", icon: "☕" },
  { time: "15:20~17:00", label: "소리로 음악 만들기 (AI 음악창작)", icon: "🎵", tag: "1시간 40분", color: "bg-blue-100 text-blue-800" },
  { time: "17:00~18:00", label: "결과물 공유회 (감상·나눔 + 기념품)", icon: "🎉" },
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

const DISCOUNTS = [
  { rate: "20%", cond: "얼리버드 (2주 전)" },
  { rate: "15%", cond: "2인 이상 동반" },
  { rate: "20%", cond: "달팽이아지트 숙박 이용자" },
  { rate: "특별", cond: "봄 리트릿 참가자 우대" },
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
    items: ["스마트폰 (Suno 앱 설치·무료가입 완료)", "편한 운동화", "이어폰 (선택)"],
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
    programs: ["AI 음악창작", "결과물 공유회"],
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

/* ───── FAQ ───── */
const FAQS = [
  { q: "음악을 전혀 못 만들어도 참가할 수 있나요?", a: "네, AI가 도와주니 누구나 가능합니다. 악기도 악보도 필요 없어요." },
  { q: "스마트폰만 있으면 되나요?", a: "네. Suno 앱 설치·무료가입만 미리 해오시면 됩니다. 녹음키트와 태블릿은 저희가 준비합니다." },
  { q: "만든 곡은 제가 갖나요?", a: "네, 각자 본인 계정으로 만들기 때문에 곡의 권리는 본인 소유입니다." },
  { q: "Suno 유료 결제를 해야 하나요?", a: "무료 체험으로도 충분히 만들 수 있습니다. 곡을 소장·상업적으로 활용하려면 Pro(월 약 1.3만원) 결제가 필요하고, 이건 각자 선택입니다." },
  { q: "비가 오면 어떻게 되나요?", a: "실내 소리채집과 대체 프로그램으로 진행합니다. 비 오는 날의 소리도 좋은 재료가 됩니다." },
  { q: "점심이 포함되나요?", a: "네, 완주 로컬 점심이 참가비에 포함되어 있습니다." },
  { q: "아이도 참가할 수 있나요?", a: "초등학생 이상 가족 참가 가능합니다." },
  { q: "주차 가능한가요?", a: "네, 펜션 내 무료 주차 가능합니다." },
];

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

/* ───── 신청 폼 ───── */
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
          setResult({ ok: true, msg: "신청이 완료되었습니다! 결제·준비물 안내 문자가 발송됩니다." });
        }
      } else {
        setResult({ ok: false, msg: data.error || "신청 실패" });
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
              <h3 className="text-2xl font-black">아쉽게도 마감되었어요</h3>
              <p className="text-sm text-white/90 mt-2">{MAX_CAPACITY}명 선착순이 이미 채워졌습니다</p>
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
          {loading ? "신청 중..." : "소리산책 리트릿 신청하기"}
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
              신청하기
            </a>
          </div>
        </div>
      </nav>

      {/* ─── 1. 히어로 ─── */}
      <section className="relative pt-14">
        <div className="relative h-[74vh] min-h-[520px] overflow-hidden">
          <img src={IMG.hero} alt="완주 숲 소리산책" className="absolute inset-0 w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/45 to-black/75" />
          <div className="relative z-10 h-full flex flex-col items-center justify-center text-center px-4">
            <span className="text-4xl mb-4">🎵</span>
            <h1 className="text-3xl sm:text-5xl font-black text-white leading-tight">
              9월 6일, 완주 숲의 소리로<br />나만의 음악을 만드는 하루
            </h1>
            <p className="text-lg sm:text-xl text-white/80 mt-3 font-medium">소리채집 · AI 음악창작 · 공유회</p>
            <p className="text-sm sm:text-base text-amber-300 mt-2 font-bold">
              {MAX_CAPACITY}명 한정 · 점심+프로그램+기념품 전부 포함
            </p>

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
              <span className="text-3xl font-black text-white">{fee}원</span>
              <p className="text-xs text-white/50 mt-1.5">6시간 올인원 · 선착순 {MAX_CAPACITY}명</p>
              {dday !== null && dday > 0 && (
                <p className="text-xs font-bold text-amber-300 mt-2">D-{dday}</p>
              )}
            </div>

            <div className="flex items-center gap-2 mt-6">
              <a href="#apply" className="px-6 py-3 bg-primary text-white rounded-full font-bold text-sm hover:bg-primary-light transition-colors">
                신청하기
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
          {!status.closed && status.remaining < MAX_CAPACITY && (
            <p className="text-center text-xs font-bold text-amber-600 mt-6">
              🎧 현재 {status.current}명 신청 · 남은 자리 {status.remaining}석
            </p>
          )}
          {status.closed && (
            <p className="text-center text-xs font-bold text-rose-600 mt-6">
              🎵 선착순 {MAX_CAPACITY}명 마감 — 지금 신청하시면 대기자로 등록됩니다
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

        {/* ─── 5. 주요 프로그램 ─── */}
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

        {/* ─── 6. 타임테이블 ─── */}
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
        </section>

        {/* ─── 7. VALUE PACKAGE ─── */}
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
              <p className="text-sm text-gray-500">참가비</p>
              <p className="text-4xl font-black text-primary mt-1">{fee}원</p>
            </div>
            <a href="#apply" className="inline-flex items-center gap-2 mt-4 px-6 py-3 bg-primary text-white rounded-full font-bold text-sm hover:bg-primary-light transition-colors">
              지금 바로 신청하기 <ArrowRight size={14} />
            </a>
          </div>
        </section>

        {/* ─── 8. 가격 안내 ─── */}
        <section className="pb-14 sm:pb-16">
          <p className="text-xs font-bold text-primary text-center tracking-widest mb-2">PRICING</p>
          <h2 className="text-xl sm:text-2xl font-black text-gray-900 text-center mb-8">가격 안내</h2>

          <div className="max-w-md mx-auto">
            <div className="bg-white rounded-2xl border-2 border-primary-light overflow-hidden shadow-lg">
              <div className="bg-primary text-white px-6 py-6 text-center">
                <p className="text-sm font-bold text-emerald-200">달팽이 소리산책 리트릿</p>
                <p className="text-4xl font-black mt-2">{fee}<span className="text-lg font-bold">원</span></p>
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
                  리트릿 신청하기 <ArrowRight size={14} />
                </a>
              </div>
            </div>
          </div>

          {/* 할인 안내 */}
          <div className="mt-8 bg-gray-50 rounded-2xl p-6 border border-gray-100 max-w-md mx-auto">
            <p className="text-sm font-black text-gray-900 mb-4 text-center">할인 혜택</p>
            <div className="grid grid-cols-2 gap-3 text-center">
              {DISCOUNTS.map((d, i) => (
                <div key={i} className="bg-white rounded-xl p-3 border border-gray-100">
                  <p className="text-2xl font-black text-primary">{d.rate}</p>
                  <p className="text-xs text-gray-500 mt-1">{d.cond}</p>
                </div>
              ))}
            </div>
            <p className="text-[11px] text-center text-gray-400 font-semibold mt-4">
              할인은 중복 적용되지 않으며, 신청 후 문자로 안내드립니다
            </p>
          </div>
        </section>

        {/* ─── 9. 준비물 안내 ─── */}
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
          <div className="mt-4 bg-white rounded-2xl border border-gray-200 p-5">
            <p className="text-sm font-bold text-gray-900 mb-2">💡 Suno 결제, 꼭 해야 하나요?</p>
            <p className="text-xs text-gray-600 leading-relaxed">
              무료 체험으로도 곡을 만들 수 있습니다. 만든 곡을 소장·활용하려면 Pro(월 약 1.3만원) 결제가 필요하고,
              이건 각자 선택입니다. <span className="font-semibold text-primary">어떤 경우든 만든 곡의 권리는 본인 소유</span>입니다.
            </p>
          </div>
        </section>

        {/* ─── 10. 왜 달팽이아지트인가 ─── */}
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

        {/* ─── 11. 이끄미 ─── */}
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

        {/* ─── 12. 참가 안내 + 신청폼 ─── */}
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
                <p className="text-xs text-gray-500">선착순 마감 · 최소 {MIN_CAPACITY}명 개최</p>
              </div>
              <div>
                <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">참가비</p>
                <p className="text-sm font-semibold text-gray-900 mt-1">
                  <span className="text-primary text-lg font-black">{fee}원</span>
                </p>
                <p className="text-xs text-gray-500">6시간 올인원</p>
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

        {/* ─── 13. FAQ ─── */}
        <section className="pb-14 sm:pb-16">
          <p className="text-xs font-bold text-primary text-center tracking-widest mb-2">FAQ</p>
          <h2 className="text-xl sm:text-2xl font-black text-gray-900 text-center mb-8">자주 묻는 질문</h2>
          <div className="space-y-3">
            {FAQS.map((faq, i) => (
              <FaqItem key={i} faq={faq} />
            ))}
          </div>
        </section>

        {/* ─── 14. 클로징 CTA ─── */}
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
                  <p className="text-3xl font-black text-white">6시간</p>
                  <p className="text-xs text-white/50 mt-1">올인원</p>
                </div>
              </div>
              <a href="#apply" className="inline-flex items-center gap-2 mt-8 px-10 py-4 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-full font-black text-lg hover:opacity-90 transition-opacity shadow-lg shadow-amber-500/30">
                함께 시작하기 <ArrowRight size={18} />
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
