"use client";

import { useState, useRef, useEffect } from "react";
import {
  ChevronDown,
  ChevronUp,
  Calendar,
  MapPin,
  Users,
  Clock,
  ArrowRight,
  Phone,
  ChevronLeft,
  ChevronRight,
  Sparkles,
} from "lucide-react";
import Link from "next/link";

/* ───── 타임테이블 데이터 ───── */
const DAY1 = [
  { time: "14:00", label: "집결 & 체크인", icon: "🏡" },
  { time: "15:00~17:00", label: "움직임으로 감각 깨우기 (스트레칭·바디스캔·뮤직샤워)", icon: "💪", tag: "마루", color: "bg-green-100 text-green-800" },
  { time: "17:00~19:00", label: "목표 → 실행 계획 설계 워크숍 (만다라트·게이미피케이션)", icon: "🎯", tag: "세경", color: "bg-blue-100 text-blue-800" },
  { time: "19:00~20:30", label: "저녁식사", icon: "🍽" },
  { time: "21:00~23:00", label: "삶의 방향 점검 & 자애명상 (1대1 대화, 자애명상)", icon: "🧭", tag: "예진", color: "bg-purple-100 text-purple-800" },
];

const DAY2 = [
  { time: "07:00", label: "아침식사", icon: "☀️" },
  { time: "08:00~09:00", label: "모닝페이지 & 감사일기 (아침 자유 글쓰기)", icon: "🌱", tag: "잎새", color: "bg-amber-100 text-amber-800" },
  { time: "09:00~11:00", label: "아침 산책 & 신체놀이 (바디스캔, 젠가, 테니스공 놀이)", icon: "🚶", tag: "마루", color: "bg-green-100 text-green-800" },
  { time: "11:00", label: "체크아웃", icon: "👋" },
  { time: "12:00", label: "점심식사 & 마무리", icon: "🍚" },
];

/* ───── 프로그램 상세 ───── */
const PROGRAMS = [
  {
    num: 1,
    title: "움직임으로 감각 깨우기",
    sub: "스트레칭 · 바디스캔 · 뮤직샤워로 오감을 깨우는 시간",
    leader: "마루",
    time: "첫째날 15:00~17:00",
    img: "/img/program-1.jpg",
    desc: "오감에 집중하여 움직이고, 밖에서 들어오는 자극을 감지하여 환경을 이해하는 감각을 느껴보는 활동",
    details: [
      "스트레칭 & 아이스브레이킹",
      "공간탐색 · 사람탐색",
      "바디스캔 (외부감각)",
      "감각깨우기 & 눈 감고 걷기",
      "뮤직샤워",
    ],
  },
  {
    num: 2,
    title: "실행을 만드는 계획 설계 워크숍",
    sub: "게이미피케이션 × 만다라트로 올해의 실행 계획 만들기",
    leader: "세경",
    time: "첫째날 17:00~19:00",
    img: "/img/program-2.jpg",
    desc: "게이미피케이션과 만다라트 기법을 결합하여, 올해의 목표를 구체적인 실행 계획으로 만들어가는 워크숍",
    details: [
      "게이미피케이션 기반 목표 설정",
      "만다라트 기법으로 세부 목표 분해",
      "참가자들과 계획 나눔",
      "실행 가능한 액션 플랜 도출",
    ],
  },
  {
    num: 3,
    title: "삶의 방향 점검 & 자애명상",
    sub: "1대1 대화 · 자애명상으로 내 삶의 나침반을 찾는 시간",
    leader: "예진",
    time: "첫째날 21:00~23:00",
    img: "/img/program-3.jpg",
    desc: "Who · What · Where · How · When · Why — 6가지 질문을 통해 내 삶의 방향을 점검하고, 블롭트리와 자애명상으로 마음을 열어가는 시간",
    details: [
      "블롭트리 — 나의 현재 감정 탐색",
      "OECD 자기주도적 학습 성찰 질문 카드",
      "걷기 명상 — 각자 생각하는 시간",
      "1대1 돌아가며 이야기 나누기",
      "듣기명상 — 공감과 경청",
      "자애명상으로 마무리",
    ],
  },
  {
    num: 4,
    title: "모닝페이지 & 감사일기",
    sub: "아침 자유 글쓰기 · 감사일기",
    leader: "잎새",
    time: "둘째날 08:00~09:00",
    img: "/img/program-4.jpg",
    desc: "지난 밤 소화한 일들이 무의식에 어떻게 남겨졌는지 풀어보고, 지금 내 주위의 모든 것에 진심으로 감사하는 시간",
    details: [
      "모닝페이지 — 아침 자유 글쓰기",
      "감사일기 작성",
    ],
  },
  {
    num: 5,
    title: "아침 산책 & 신체놀이",
    sub: "바디스캔 · 젠가 · 테니스공 놀이",
    leader: "마루",
    time: "둘째날 09:00~11:00",
    img: "/img/program-5.jpg",
    desc: "아침 산책과 함께 몸을 깨우고, 바디스캔과 신체놀이로 몸 안의 감각을 탐색하는 활동",
    details: [
      "걷고 뛰는 바디스캔 (내부감각)",
      "눈 감고 걷기 — 외부→내부 감각 전환",
      "젠가를 활용한 신체놀이",
      "테니스 공을 활용한 신체놀이",
      "마무리 바디스캔",
    ],
  },
];

/* ───── 이끄미 데이터 ───── */
const LEADERS = [
  {
    name: "마루",
    role: "움직임 · 아침 산책 · 신체놀이 담당",
    emoji: "💪",
    color: "bg-green-50 border-green-200",
    tagColor: "bg-green-100 text-green-800",
    img: "/img/leader-maru.jpg",
    desc: "함께 움직이는 즐거움을 나누고자 움직임 소모임 MROOM을 운영하고 있습니다. 몸의 감각을 깨우고, 타인과 연결되는 경험을 안내합니다.",
    programs: ["움직임으로 감각 깨우기", "아침 산책 & 신체놀이"],
  },
  {
    name: "세경",
    role: "만다라트 · 게이미피케이션 워크숍 담당",
    emoji: "🎯",
    color: "bg-blue-50 border-blue-200",
    tagColor: "bg-blue-100 text-blue-800",
    img: "/img/leader-sekyung.jpg",
    desc: "만다라트와 게이미피케이션 기법으로 목표를 구체적인 실행 계획으로 바꿔주는 워크숍 이끄미",
    programs: ["목표 → 실행 계획 설계 워크숍"],
  },
  {
    name: "예진",
    role: "1대1 대화 · 걷기명상 · 자애명상 담당",
    emoji: "🧭",
    color: "bg-purple-50 border-purple-200",
    tagColor: "bg-purple-100 text-purple-800",
    img: "/img/leader-yejin.jpg",
    desc: "6가지 질문 카드 · 1대1 대화 · 걷기명상 · 자애명상을 이끌며 삶의 방향을 되짚어주는 명상 이끄미",
    programs: ["삶의 방향 점검 & 자애명상"],
  },
  {
    name: "잎새",
    role: "모닝페이지 · 감사일기 · 저널링 담당",
    emoji: "🌱",
    color: "bg-amber-50 border-amber-200",
    tagColor: "bg-amber-100 text-amber-800",
    img: "/img/leader-ipsae.jpg",
    desc: "내 안에서 일어나는 일들을 탐구하고 질문합니다. 꿈, 자유, 안정, 공간을 키워드로 올해 새로운 터닝포인트를 만들기 위한 다양한 실험을 하고 있습니다.",
    programs: ["모닝페이지 & 감사일기"],
  },
];

/* ───── 5단계 과정 데이터 ───── */
const MAIN_PROGRAMS = [
  { num: 1, title: "움직임으로 감각 깨우기", tag: "스트레칭 · 바디스캔 · 뮤직샤워", desc: "오감에 집중하며 몸을 움직여, 굳어 있던 감각을 다시 열어갑니다", emoji: "✨", color: "bg-green-50 border-green-200 text-green-700", img: "/img/program-1.jpg" },
  { num: 2, title: "실행을 만드는 계획 설계 워크숍", tag: "만다라트 · 게이미피케이션 워크숍", desc: "꿈으로 끝나던 목표를, 구체적인 실행 계획으로 만들어갑니다", emoji: "🎯", color: "bg-blue-50 border-blue-200 text-blue-700", img: "/img/program-2.jpg" },
  { num: 3, title: "삶의 방향 점검 & 자애명상", tag: "1대1 대화 · 자애명상", desc: "낯선 사람과 솔직한 이야기를 나누고, 자애명상으로 서로를 비춥니다", emoji: "🌙", color: "bg-purple-50 border-purple-200 text-purple-700", img: "/img/program-3.jpg" },
  { num: 4, title: "모닝페이지 & 감사일기", tag: "아침 자유 글쓰기 · 감사일기", desc: "아침 자유 글쓰기로 머릿속을 비우고, 감사일기로 다시 중심을 잡습니다", emoji: "🌅", color: "bg-amber-50 border-amber-200 text-amber-700", img: "/img/program-4.jpg" },
  { num: 5, title: "아침 산책 & 신체놀이", tag: "바디스캔 · 젠가 · 테니스공 놀이", desc: "아침 산책과 함께 몸을 깨우고, 신체놀이로 몸 안의 감각을 탐색합니다", emoji: "🍃", color: "bg-emerald-50 border-emerald-200 text-emerald-700", img: "/img/program-5.jpg" },
];

/* ───── 컴포넌트 ───── */
function ProgramAccordion({ p }: { p: typeof PROGRAMS[0] }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden transition-shadow hover:shadow-md">
      <button onClick={() => setOpen(!open)} className="w-full text-left px-5 sm:px-6 py-5 flex items-center gap-4">
        <span className="flex-shrink-0 w-11 h-11 rounded-full bg-primary text-white flex items-center justify-center font-bold text-base">
          {p.num}
        </span>
        <div className="flex-1 min-w-0">
          <p className="font-bold text-gray-900 text-lg">{p.title}</p>
          <p className="text-sm sm:text-base text-gray-500 truncate">{p.sub}</p>
        </div>
        <span className="text-sm text-primary font-semibold whitespace-nowrap hidden sm:block">{p.leader}</span>
        {open ? <ChevronUp size={20} className="text-gray-400" /> : <ChevronDown size={20} className="text-gray-400" />}
      </button>
      {open && (
        <div className="px-5 sm:px-6 pb-6 border-t border-gray-100 pt-5 animate-fade-in">
          {p.img && (
            <div className="rounded-xl overflow-hidden mb-4">
              <img src={p.img} alt={p.title} className="w-full h-48 sm:h-56 object-cover" />
            </div>
          )}
          <div className="flex items-center gap-2 text-sm text-gray-500 mb-3">
            <Clock size={14} /> {p.time} <span className="ml-2 px-2.5 py-1 rounded-full bg-primary/10 text-primary font-semibold text-sm">{p.leader}</span>
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

/* ───── 후기 슬라이더 (2개씩, 2초 자동) ───── */
function ReviewSlider() {
  const total = 5;
  const [current, setCurrent] = useState(0);
  const touchStart = useRef(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const next = () => setCurrent((c) => (c + 1) % total);
  const prev = () => setCurrent((c) => (c === 0 ? total - 1 : c - 1));
  const getIdx = (offset: number) => (current + offset) % total;

  useEffect(() => {
    timerRef.current = setInterval(next, 2000);
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [current]);

  const pause = () => { if (timerRef.current) clearInterval(timerRef.current); };
  const resume = () => { timerRef.current = setInterval(next, 2000); };

  return (
    <section className="pb-12 sm:pb-16">
      <h2 className="text-xl sm:text-2xl font-black text-gray-900 text-center mb-2">참가자 후기</h2>
      <p className="text-sm text-gray-500 text-center mb-8">지난 리트릿에 참가한 분들의 실제 후기입니다</p>
      <div className="relative"
        onMouseEnter={pause} onMouseLeave={resume}
        onTouchStart={(e) => { pause(); touchStart.current = e.touches[0].clientX; }}
        onTouchEnd={(e) => {
          const diff = touchStart.current - e.changedTouches[0].clientX;
          if (diff > 50) next();
          else if (diff < -50) prev();
          resume();
        }}
      >
        <div className="flex gap-3 justify-center">
          {[0, 1].map((offset) => (
            <div key={offset} className="w-[45%] sm:w-[35%] flex-shrink-0 rounded-2xl overflow-hidden border border-gray-200 bg-white shadow-sm">
              <img
                src={`/img/review-${getIdx(offset) + 1}.jpg`}
                alt={`리트릿 참가자 후기 ${getIdx(offset) + 1}`}
                className="w-full h-auto"
              />
            </div>
          ))}
        </div>
        <button onClick={() => { pause(); prev(); resume(); }} className="absolute left-1 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white/80 backdrop-blur-sm shadow-md flex items-center justify-center hover:bg-white transition-colors">
          <ChevronLeft size={16} className="text-gray-700" />
        </button>
        <button onClick={() => { pause(); next(); resume(); }} className="absolute right-1 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white/80 backdrop-blur-sm shadow-md flex items-center justify-center hover:bg-white transition-colors">
          <ChevronRight size={16} className="text-gray-700" />
        </button>
        <div className="flex items-center justify-center gap-2 mt-4">
          {Array.from({ length: total }).map((_, i) => (
            <button key={i} onClick={() => { pause(); setCurrent(i); resume(); }}
              className={`w-2.5 h-2.5 rounded-full transition-all ${i === current ? "bg-primary scale-110" : "bg-gray-300"}`} />
          ))}
        </div>
      </div>
    </section>
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
  const [photoConsent, setPhotoConsent] = useState(true);
  const [transport, setTransport] = useState("");
  const [region, setRegion] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ ok: boolean; msg: string } | null>(null);
  const [count, setCount] = useState(0);
  const MAX = 20;

  useState(() => {
    fetch("/api/programs/retreat").then(r => r.json()).then(d => setCount(d.count || 0)).catch(() => {});
  });

  const submit = async () => {
    if (!name.trim() || !phone.trim()) { setResult({ ok: false, msg: "이름과 연락처를 입력해주세요." }); return; }
    setLoading(true);
    setResult(null);
    try {
      const res = await fetch("/api/programs/retreat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, phone, age, gender, occupation, reason, photoConsent, transport, region }),
      });
      const data = await res.json();
      if (res.ok) {
        setResult({ ok: true, msg: `신청 완료! (${data.count}/${data.max}명)` });
        setCount(data.count);
        setName(""); setPhone(""); setAge(""); setGender(""); setOccupation(""); setReason(""); setPhotoConsent(false); setTransport(""); setRegion("");
      } else {
        setResult({ ok: false, msg: data.error || "신청 실패" });
      }
    } catch {
      setResult({ ok: false, msg: "네트워크 오류" });
    }
    setLoading(false);
  };

  const remaining = MAX - count;
  const inputClass = "w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20";

  return (
    <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
      <div className="p-6 space-y-4">
        {remaining > 0 ? (
          <>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-semibold text-gray-600 block mb-1">이름 *</label>
                <input value={name} onChange={e => setName(e.target.value)} placeholder="홍길동" className={inputClass} />
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-600 block mb-1">연락처 *</label>
                <input value={phone} onChange={e => setPhone(e.target.value)} placeholder="010-1234-5678" className={inputClass} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-semibold text-gray-600 block mb-1">나이</label>
                <input value={age} onChange={e => setAge(e.target.value)} placeholder="예: 28" className={inputClass} />
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-600 block mb-1">성별</label>
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
              <label className="text-xs font-semibold text-gray-600 block mb-1">현재 하시는 일</label>
              <p className="text-[11px] text-gray-400 mb-1.5">직무와 업종을 자유롭게 소개해 주세요. (예: 프리랜서, 직장인, 크리에이터, 강사, 기획자 등)</p>
              <input value={occupation} onChange={e => setOccupation(e.target.value)} placeholder="예: 프리랜서 디자이너" className={inputClass} />
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-600 block mb-1">신청 이유 / 기대하는 점</label>
              <textarea value={reason} onChange={e => setReason(e.target.value)} rows={3}
                placeholder="리트릿에 참가하고 싶은 이유나 기대하는 점을 자유롭게 적어주세요."
                className={`${inputClass} resize-none`} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-semibold text-gray-600 block mb-1">이동 방법</label>
                <div className="flex gap-2">
                  {["대중교통", "자차"].map((t) => (
                    <button key={t} type="button" onClick={() => setTransport(t)}
                      className={`flex-1 py-2.5 rounded-xl text-sm font-semibold border transition-all ${
                        transport === t ? "border-primary bg-primary/10 text-primary" : "border-gray-200 text-gray-400 hover:bg-gray-50"
                      }`}>{t}</button>
                  ))}
                </div>
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-600 block mb-1">지역 (시/군 단위)</label>
                <input value={region} onChange={e => setRegion(e.target.value)} placeholder="예: 서울 강남구" className={inputClass} />
              </div>
            </div>
            <div>
              <label className="flex items-start gap-2 cursor-pointer">
                <input type="checkbox" checked={photoConsent} onChange={e => setPhotoConsent(e.target.checked)}
                  className="mt-0.5 w-4 h-4 rounded border-gray-300 text-primary focus:ring-primary/20" />
                <span className="text-xs text-gray-600">
                  리트릿 중 촬영되는 사진/영상이 홍보 목적으로 활용될 수 있음에 동의합니다.
                </span>
              </label>
            </div>
            <button onClick={submit} disabled={loading}
              className="w-full py-3.5 rounded-xl bg-primary text-white font-bold text-base hover:bg-primary-light transition-colors disabled:opacity-50">
              {loading ? "신청 중..." : "봄 리트릿 신청하기"}
            </button>
          </>
        ) : (
          <div className="text-center py-4">
            <p className="text-lg font-bold text-red-500">마감되었습니다</p>
            <p className="text-sm text-gray-500 mt-1">대기 신청은 전화로 문의해주세요</p>
            <a href="tel:010-5314-0146" className="inline-flex items-center gap-1 mt-3 text-primary text-sm font-semibold">
              <Phone size={14} /> 010-5314-0146
            </a>
          </div>
        )}
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
export default function SpringRetreatPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* 상단 내비 */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-md shadow-sm">
        <div className="max-w-5xl mx-auto px-4 h-14 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 text-gray-700 hover:text-primary transition-colors">
            <ChevronLeft size={18} />
            <span className="text-sm font-medium">달팽이아지트</span>
          </Link>
          <a href="#apply" className="bg-primary text-white px-5 py-2 rounded-full text-sm font-semibold hover:bg-primary-light transition-all">
            신청하기
          </a>
        </div>
      </nav>

      {/* 히어로 */}
      <section className="relative pt-14">
        <div className="relative h-[70vh] min-h-[480px] overflow-hidden">
          <img src="/img/retreat-hero.jpg" alt="완주하다 봄 리트릿" className="absolute inset-0 w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-black/40 to-black/70" />
          <div className="relative z-10 h-full flex flex-col items-center justify-center text-center px-4">
            <span className="text-4xl mb-4">🌱</span>
            <h1 className="text-3xl sm:text-5xl font-black text-white leading-tight">완주하다 봄 리트릿</h1>
            <p className="text-lg sm:text-xl text-white/80 mt-3 font-medium">나를 다시 자라나게 하는 1박 2일</p>
            <p className="text-sm sm:text-base text-white/60 mt-2 max-w-md">운동 · 목표설계 워크숍 · 명상 · 저널링 · 네트워킹</p>

            <div className="flex flex-wrap items-center justify-center gap-3 mt-6">
              <div className="flex items-center gap-1.5 bg-white/20 backdrop-blur-sm text-white px-4 py-2 rounded-full text-sm">
                <Calendar size={14} /> 2026.4.18(토)~19(일)
              </div>
              <div className="flex items-center gap-1.5 bg-white/20 backdrop-blur-sm text-white px-4 py-2 rounded-full text-sm">
                <MapPin size={14} /> 달팽이아지트 + 펜션 (전북 완주)
              </div>
              <div className="flex items-center gap-1.5 bg-white/20 backdrop-blur-sm text-white px-4 py-2 rounded-full text-sm">
                <Users size={14} /> 20명 한정
              </div>
            </div>
            <div className="mt-6 bg-white/10 backdrop-blur-md rounded-2xl px-6 py-4 border border-white/20">
              <div className="flex items-center justify-center gap-3">
                <span className="text-lg line-through text-white/40">200,000원</span>
                <span className="text-3xl font-black text-white">90,000원</span>
                <span className="px-2.5 py-1 bg-red-500 text-white text-xs font-black rounded-full">55% OFF</span>
              </div>
              <p className="text-xs text-white/50 mt-1.5">얼리버드 특가 · 선착순 20명 마감</p>
            </div>
          </div>
        </div>
      </section>

      <div className="max-w-3xl mx-auto px-4 pb-24">

        {/* 인트로 */}
        <section className="py-12 sm:py-16 text-center">
          <p className="text-lg sm:text-xl text-gray-700 leading-relaxed font-medium">
            겨울 동안 움츠렸던 몸,<br />멈춰 있던 마음,<br />흐려졌던 의식.
          </p>
          <p className="text-lg sm:text-xl text-primary font-bold mt-6 leading-relaxed">
            봄의 리듬에 맞춰<br />다시 깨어나는 시간.
          </p>
          <p className="text-sm text-gray-500 mt-6 max-w-md mx-auto">
            자기 삶을 완주하고 싶은 사람들을 위한<br />운동 · 계획설계 · 명상 · 글쓰기 리트릿
          </p>
        </section>

        {/* 이런 분께 추천 */}
        <section className="pb-12 sm:pb-16">
          <h2 className="text-xl sm:text-2xl font-black text-gray-900 text-center mb-8">이런 분께 추천합니다</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[
              { icon: "😮‍💨", title: "내가 잘 가고 있는지\n모르겠는 분", desc: "계속 달리는데 방향이 맞는지 확인하고 싶은 분" },
              { icon: "🧭", title: "방향이 헷갈리는 분", desc: "성공보다 의미, 속도보다 균형을 원하는 분" },
              { icon: "🤝", title: "혼자라 외로운 분", desc: "비슷한 고민을 가진 사람들과 함께하고 싶은 분" },
            ].map((item, i) => (
              <div key={i} className="bg-white rounded-2xl border border-gray-200 p-6 text-center hover:shadow-md transition-shadow">
                <span className="text-3xl">{item.icon}</span>
                <p className="font-bold text-gray-900 mt-3 whitespace-pre-line text-sm">{item.title}</p>
                <p className="text-xs text-gray-500 mt-2">{item.desc}</p>
              </div>
            ))}
          </div>
          <div className="mt-6 bg-sage/50 rounded-2xl p-5">
            <p className="text-sm text-gray-700 font-medium text-center">
              프리랜서, 1인 사업자, 브랜드 운영자, 창작자, 코치/강사, 로컬 창업자 등<br />
              <span className="text-primary font-bold">자기 일을 만들어가며 끝까지 잘 완주하고 싶은 사람</span>
            </p>
          </div>
        </section>

        {/* 나를 다시 자라나게 하는 5단계 과정 */}
        <section className="pb-12 sm:pb-16">
          <h2 className="text-xl sm:text-2xl font-black text-gray-900 text-center mb-8">주요 프로그램</h2>
          <div className="space-y-4">
            {MAIN_PROGRAMS.map((step, i) => (
              <div key={i} className={`rounded-2xl border ${step.color} relative overflow-hidden`}>
                <div className="relative h-48 sm:h-56 overflow-hidden">
                  <img src={step.img} alt={step.title} className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
                  <div className="absolute top-3 left-3 w-9 h-9 rounded-full bg-white/90 flex items-center justify-center font-black text-base">
                    {step.num}
                  </div>
                  <div className="absolute bottom-3 left-4 right-4">
                    <div className="flex items-center gap-2">
                      <span className="text-lg">{step.emoji}</span>
                      <h3 className="font-black text-white text-base sm:text-lg drop-shadow-md">{step.title}</h3>
                    </div>
                  </div>
                </div>
                <div className="p-4">
                  <p className="text-xs font-semibold text-primary/70">{step.tag}</p>
                  <p className="text-sm text-gray-600 mt-1.5 leading-relaxed">{step.desc}</p>
                </div>
                {i < MAIN_PROGRAMS.length - 1 && (
                  <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 text-gray-300">
                    <ChevronDown size={20} />
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>

        {/* 가격 임팩트 배너 */}
        <section className="pb-12 sm:pb-16">
          <div className="bg-gradient-to-r from-red-500 to-orange-500 rounded-2xl p-6 sm:p-8 text-white text-center relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-full opacity-10">
              <div className="absolute top-4 left-8 text-6xl rotate-12">%</div>
              <div className="absolute bottom-4 right-8 text-6xl -rotate-12">%</div>
            </div>
            <div className="relative z-10">
              <p className="text-sm font-bold text-white/80 uppercase tracking-wider">Early Bird Special</p>
              <div className="flex items-center justify-center gap-3 mt-3">
                <span className="text-2xl sm:text-3xl line-through text-white/50 font-bold">200,000원</span>
                <ArrowRight size={24} className="text-white/60" />
                <span className="text-4xl sm:text-5xl font-black">90,000원</span>
              </div>
              <div className="inline-block mt-3 px-4 py-1.5 bg-white/20 backdrop-blur-sm rounded-full">
                <span className="text-lg font-black">55% OFF</span>
                <span className="text-sm ml-2 text-white/80">· 11만원 절약</span>
              </div>
              <p className="text-sm text-white/70 mt-3">20명 선착순 마감</p>
            </div>
          </div>
        </section>

        {/* 9만원에 얻어가는 10가지 혜택 */}
        <section className="pb-12 sm:pb-16">
          <div className="text-center mb-8">
            <p className="text-sm font-bold text-red-500 uppercase tracking-wider mb-2">VALUE PACKAGE</p>
            <h2 className="text-xl sm:text-2xl font-black text-gray-900">
              9만원에 얻어가는 <span className="text-primary">10가지 혜택</span>
            </h2>
            <p className="text-sm text-gray-500 mt-2">이 모든 것이 한 번의 참가비에 포함됩니다</p>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-2 gap-3">
            {[
              { icon: "🏡", title: "1박 숙박", desc: "산속 펜션 1박", value: "9만원 상당" },
              { icon: "🍽", title: "완주 로컬 밥상", desc: "3끼 식사 제공", value: "3만원 상당" },
              { icon: "💪", title: "감각깨우기", desc: "전문 이끄미 세션", value: "10만원 상당" },
              { icon: "🎯", title: "실행을 만드는 계획 설계 워크숍", desc: "게이미피케이션 · 만다라트", value: "10만원 상당" },
              { icon: "🧭", title: "삶의 방향 점검 & 명상", desc: "자애명상 · 걷기명상 · 대화", value: "10만원 상당" },
              { icon: "🎁", title: "웰컴키트", desc: "일상으로 이어가는 선물 세트", value: "정성 가득" },
              { icon: "🍵", title: "간식 & 음료", desc: "차, 과일, 다과 제공", value: "덤!" },
              { icon: "🌿", title: "자연 힐링", desc: "완주 산속 자연 치유", value: "덤!" },
              { icon: "🤝", title: "네트워킹", desc: "같은 고민 동료 20명", value: "측정불가 가치!" },
              { icon: "🌱", title: "삶의 방향 설계", desc: "올해의 로드맵 완성", value: "측정불가!" },
            ].map((b, i) => (
              <div key={i} className="bg-white rounded-xl border border-gray-200 p-4 hover:shadow-md transition-all hover:-translate-y-0.5 group">
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
              총 <span className="text-primary">42만원</span> 이상의 가치 <span className="text-sm text-gray-500">+ 측정불가 혜택</span>
            </p>
            <div className="mt-4 space-y-1">
              <p className="text-base text-gray-500">정가 <span className="line-through font-semibold">20만원</span></p>
              <p className="text-sm text-gray-500">얼리버드 특가 적용 시</p>
              <p className="text-4xl font-black text-red-500 mt-1">9만원 !!</p>
            </div>
            <a href="#apply" className="inline-flex items-center gap-2 mt-4 px-6 py-3 bg-primary text-white rounded-full font-bold text-sm hover:bg-primary-light transition-colors">
              지금 바로 신청하기 <ArrowRight size={14} />
            </a>
          </div>
        </section>

        {/* 타임테이블 */}
        <section className="pb-12 sm:pb-16">
          <h2 className="text-xl sm:text-2xl font-black text-gray-900 text-center mb-8">1박 2일 타임테이블</h2>

          <div className="mb-8">
            <div className="flex items-center gap-2 mb-4">
              <span className="px-3 py-1 rounded-full bg-primary text-white text-xs font-bold">DAY 1</span>
              <span className="text-sm font-semibold text-gray-700">4.18(토)</span>
            </div>
            <div className="space-y-3">
              {DAY1.map((item, i) => (
                <div key={i} className="flex items-center gap-4 bg-white rounded-xl border border-gray-200 px-4 py-3 hover:shadow-sm transition-shadow">
                  <span className="text-2xl flex-shrink-0">{item.icon}</span>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-gray-900 text-sm">{item.label}</p>
                    <p className="text-xs text-gray-500">{item.time}</p>
                  </div>
                  {item.tag && (
                    <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full ${item.color}`}>{item.tag}</span>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div>
            <div className="flex items-center gap-2 mb-4">
              <span className="px-3 py-1 rounded-full bg-accent text-white text-xs font-bold">DAY 2</span>
              <span className="text-sm font-semibold text-gray-700">4.19(일)</span>
            </div>
            <div className="space-y-3">
              {DAY2.map((item, i) => (
                <div key={i} className="flex items-center gap-4 bg-white rounded-xl border border-gray-200 px-4 py-3 hover:shadow-sm transition-shadow">
                  <span className="text-2xl flex-shrink-0">{item.icon}</span>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-gray-900 text-sm">{item.label}</p>
                    <p className="text-xs text-gray-500">{item.time}</p>
                  </div>
                  {item.tag && (
                    <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full ${item.color}`}>{item.tag}</span>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* 프로그램 상세 */}
        <section className="pb-12 sm:pb-16">
          <h2 className="text-xl sm:text-2xl font-black text-gray-900 text-center mb-8">프로그램 상세</h2>
          <div className="space-y-4">
            {PROGRAMS.map((p) => (
              <ProgramAccordion key={p.num} p={p} />
            ))}
          </div>
        </section>

        {/* 이끄미 소개 */}
        <section className="pb-12 sm:pb-16">
          <h2 className="text-xl sm:text-2xl font-black text-gray-900 text-center mb-3">이 시간을 함께 여는 이끄미</h2>
          <p className="text-sm text-gray-500 text-center mb-8">이 여정은 이끄미들과 함께 만들어집니다</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {LEADERS.map((l, i) => (
              <div key={i} className={`rounded-2xl border p-5 ${l.color}`}>
                <div className="flex items-center gap-3 mb-3">
                  {l.img ? (
                    <img src={l.img} alt={l.name} className="w-20 h-20 rounded-full object-cover flex-shrink-0 border-2 border-white shadow-sm" />
                  ) : (
                    <div className="w-20 h-20 rounded-full bg-gray-200 flex items-center justify-center flex-shrink-0 border-2 border-white shadow-sm">
                      <span className="text-3xl">{l.emoji}</span>
                    </div>
                  )}
                  <div>
                    <p className="text-lg font-black text-gray-900">{l.name} <span className="text-sm font-medium text-gray-500">이끄미</span></p>
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

        {/* 계절 로드맵 */}
        <section className="pb-12 sm:pb-16">
          <h2 className="text-xl sm:text-2xl font-black text-gray-900 text-center mb-8">완주하다 시즌 로드맵</h2>
          <div className="grid grid-cols-4 gap-2 sm:gap-4">
            {[
              { season: "봄", month: "4월", theme: "깨우기\n움트기", eng: "awake", emoji: "🌱", active: true },
              { season: "여름", month: "7월", theme: "몰입", eng: "flow", emoji: "🌿" },
              { season: "가을", month: "10월", theme: "수확", eng: "harvest", emoji: "🍂" },
              { season: "겨울", month: "1월", theme: "돌아보기\n정리", eng: "reflection", emoji: "❄️" },
            ].map((s, i) => (
              <div key={i} className={`rounded-2xl p-4 text-center transition-shadow ${s.active ? "bg-primary text-white shadow-lg ring-2 ring-primary/30" : "bg-white border border-gray-200 text-gray-600"}`}>
                <span className="text-2xl">{s.emoji}</span>
                <p className={`text-lg font-black mt-2 ${s.active ? "text-white" : "text-gray-900"}`}>{s.season}</p>
                <p className={`text-xs font-semibold mt-1 ${s.active ? "text-white/80" : "text-gray-500"}`}>{s.month}</p>
                <p className={`text-[11px] mt-2 whitespace-pre-line leading-snug ${s.active ? "text-white/70" : "text-gray-400"}`}>{s.theme}</p>
                <p className={`text-[10px] mt-1 italic ${s.active ? "text-white/50" : "text-gray-300"}`}>{s.eng}</p>
              </div>
            ))}
          </div>
        </section>

        {/* 참가 안내 */}
        <section id="apply" className="pb-12 sm:pb-16">
          <h2 className="text-xl sm:text-2xl font-black text-gray-900 text-center mb-8">참가 안내</h2>
          <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">일시</p>
                  <p className="text-sm font-semibold text-gray-900 mt-1">2026.4.18(토) ~ 19(일)</p>
                  <p className="text-xs text-gray-500">1박 2일</p>
                </div>
                <div>
                  <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">장소</p>
                  <p className="text-sm font-semibold text-gray-900 mt-1">달팽이아지트 + 펜션</p>
                  <p className="text-xs text-gray-500">전북 완주군 해월신왕길 92</p>
                </div>
                <div>
                  <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">인원</p>
                  <p className="text-sm font-semibold text-gray-900 mt-1">20명 한정</p>
                  <p className="text-xs text-gray-500">선착순 마감</p>
                </div>
                <div>
                  <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">참가비</p>
                  <p className="text-sm font-semibold text-gray-900 mt-1">
                    <span className="line-through text-gray-400 mr-1">20만원</span>
                    <span className="text-primary text-lg font-black">9만원</span>
                  </p>
                  <p className="text-xs text-red-500 font-semibold">55% OFF 얼리버드 특가</p>
                </div>
              </div>
              <div className="border-t border-gray-100 pt-4">
                <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-2">포함 내용</p>
                <div className="flex flex-wrap gap-2">
                  {["1박 2일 숙박", "3끼 식사 & 간식", "프로그램 4~5타임", "웰컴키트"].map((item) => (
                    <span key={item} className="px-3 py-1.5 rounded-full bg-sage text-sm text-gray-700 font-medium">{item}</span>
                  ))}
                </div>
              </div>
            </div>
          </div>
          <div className="mt-6">
            <ApplyForm />
          </div>
        </section>

        {/* 참가자 실제 후기 — 슬라이더 */}
        <ReviewSlider />

        {/* 경험 중심 CTA */}
        <section className="pb-12 sm:pb-16">
          <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl p-8 text-white text-center relative overflow-hidden">
            <div className="absolute inset-0 opacity-5">
              <div className="absolute top-0 left-0 w-40 h-40 bg-primary rounded-full -translate-x-1/2 -translate-y-1/2" />
              <div className="absolute bottom-0 right-0 w-60 h-60 bg-primary rounded-full translate-x-1/3 translate-y-1/3" />
            </div>
            <div className="relative z-10">
              <Sparkles size={32} className="mx-auto text-amber-400" />
              <h3 className="text-xl sm:text-2xl font-black mt-4">
                이 경험으로<br /><span className="text-amber-400">당신의 방향에 터닝포인트가 되기를</span>
              </h3>
              <p className="text-white/60 text-sm mt-3 max-w-sm mx-auto">
                몸을 깨우고, 계획을 세우고, 마음을 나누는 1박 2일.<br />돌아가는 길, 발걸음이 달라집니다.
              </p>
              <div className="flex items-center justify-center gap-4 mt-6">
                <div className="text-center">
                  <p className="text-3xl font-black text-white">20명</p>
                  <p className="text-xs text-white/50 mt-1">한정 모집</p>
                </div>
                <div className="w-px h-12 bg-white/20" />
                <div className="text-center">
                  <p className="text-3xl font-black text-amber-400">5가지</p>
                  <p className="text-xs text-white/50 mt-1">프로그램</p>
                </div>
                <div className="w-px h-12 bg-white/20" />
                <div className="text-center">
                  <p className="text-3xl font-black text-white">1박2일</p>
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

        {/* 하단 최종 CTA */}
        <section className="pb-8 text-center">
          <div className="bg-gradient-to-br from-primary to-primary-light rounded-2xl p-8 text-white">
            <span className="text-4xl">🌱</span>
            <h3 className="text-xl font-black mt-4">봄, 다시 깨어나는 시간</h3>
            <p className="text-white/70 text-sm mt-2">2026.4.18(토)~19(일) · 달팽이아지트 + 펜션 · 20명 한정</p>
            <div className="flex items-center justify-center gap-2 mt-3">
              <span className="text-lg line-through text-white/40">200,000원</span>
              <span className="text-2xl font-black text-white">90,000원</span>
            </div>
            <a href="#apply" className="inline-flex items-center gap-2 mt-6 px-8 py-3.5 bg-white text-primary rounded-full font-bold hover:bg-gray-50 transition-colors">
              나도 함께하기 <ArrowRight size={16} />
            </a>
          </div>
        </section>

      </div>

      {/* 모바일 하단 고정 CTA */}
      <div className="fixed bottom-0 left-0 right-0 z-50 sm:hidden bg-white border-t border-gray-200 px-4 py-3 shadow-[0_-4px_20px_rgba(0,0,0,0.1)]">
        <a href="#apply" className="flex items-center justify-center gap-2 w-full py-3.5 bg-primary text-white rounded-xl font-bold text-base hover:bg-primary-light transition-colors">
          지금 바로 함께하기! <ArrowRight size={16} />
        </a>
      </div>
      <div className="h-[72px] sm:hidden" />
    </div>
  );
}
