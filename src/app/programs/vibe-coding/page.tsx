"use client";

import { useState } from "react";
import {
  ChevronDown,
  ChevronUp,
  ChevronLeft,
  MapPin,
  Users,
  Clock,
  ArrowRight,
  Phone,
  Code,
  Laptop,
  Rocket,
  Store,
  Briefcase,
  Palette,
  GraduationCap,
  Check,
  Zap,
  Globe,
  Database,
  MessageSquare,
  Shield,
  Layout,
  Settings,
  Send,
  X,
} from "lucide-react";
import Link from "next/link";

/* ───── 커리큘럼 Part 1~6 ───── */
const CURRICULUM = [
  {
    part: 1,
    title: "오프닝 — \"이게 진짜 된다\"",
    time: "13:10~13:40",
    duration: "30분",
    items: [
      "실제 운영 중인 서비스 3개 라이브 시연 (펜션 예약, 조립공간, 리트릿 신청)",
      "MVP 스코핑 — 테이블 멘토와 함께 아이디어 정리",
      "아이디어 없으면 템플릿 20종에서 선택",
    ],
    icon: <Rocket size={20} />,
    highlight: false,
  },
  {
    part: 2,
    title: "AI에게 말 잘하는 법",
    time: "13:40~14:00",
    duration: "20분",
    items: [
      "프롬프트 3원칙 (구체적으로 / 한번에 하나씩 / 예시 보여주기)",
      "에러 해결 프롬프트 패턴",
      "프롬프트 치트시트 배포",
    ],
    icon: <MessageSquare size={20} />,
    highlight: false,
  },
  {
    part: 3,
    title: "실습 — 내 랜딩페이지 만들기",
    time: "14:00~15:00",
    duration: "60분",
    items: [
      "AI에게 첫 요청 → 페이지 생성",
      "히어로, 소개, 후기 섹션 제작",
      "실시간 디자인 수정 연습",
      "모바일 확인",
    ],
    icon: <Layout size={20} />,
    highlight: true,
  },
  {
    part: 4,
    title: "실습 — 신청폼 + DB 연결",
    time: "15:20~16:10",
    duration: "50분",
    items: [
      "Supabase 테이블 만들기",
      "신청 폼 생성 & 커스터마이징",
      "폼 → DB 저장 테스트",
      "에러 해결 실습",
    ],
    icon: <Database size={20} />,
    highlight: true,
  },
  {
    part: 5,
    title: "실습 — 관리자 페이지 + SMS 알림",
    time: "16:10~17:00",
    duration: "50분",
    items: [
      "신청자 목록 테이블, 상태 변경",
      "Solapi 연동 자동 문자 발송",
      "\"실제 내 폰에 문자가 온다!\" 체험",
    ],
    icon: <Settings size={20} />,
    highlight: true,
  },
  {
    part: 6,
    title: "배포 & 런칭!",
    time: "17:15~17:45",
    duration: "30분",
    items: [
      "Vercel 배포 → 내 URL 생성",
      "폰으로 접속 확인",
      "SEO 기초 (구글 서치콘솔)",
      "유지보수 팁",
    ],
    icon: <Globe size={20} />,
    highlight: true,
  },
];

/* ───── 전체 타임테이블 ───── */
const TIMETABLE = [
  { time: "13:00~13:10", label: "체크인 & 웰컴 드링크", icon: "☕" },
  { time: "13:10~13:25", label: "[Part 1] 오프닝 — 실제 서비스 3개 라이브 시연", icon: "🎬" },
  { time: "13:25~13:40", label: "MVP 스코핑 — 아이디어 정리", icon: "🎯" },
  { time: "13:40~14:00", label: "[Part 2] AI에게 말 잘하는 법", icon: "💬" },
  { time: "14:00~15:00", label: "[Part 3] 실습 — 내 랜딩페이지 만들기", icon: "🖥️", highlight: true },
  { time: "15:00~15:20", label: "쉬는 시간 + 간식 (CNC 공방 미니 투어 선택)", icon: "🍪" },
  { time: "15:20~16:10", label: "[Part 4] 실습 — 신청폼 + DB 연결", icon: "🗄️", highlight: true },
  { time: "16:10~17:00", label: "[Part 5] 실습 — 관리자 페이지 + SMS 알림", icon: "⚙️", highlight: true },
  { time: "17:00~17:15", label: "쉬는 시간 (목공 키트 체험 선택)", icon: "🪵" },
  { time: "17:15~17:45", label: "[Part 6] 배포 & 런칭!", icon: "🚀", highlight: true },
  { time: "17:45~18:30", label: "Demo Day — 발표 & 서로의 서비스 체험", icon: "🎉" },
  { time: "18:30~19:00", label: "네트워킹 & 클로징", icon: "📸" },
];

/* ───── 차별화 포인트 ───── */
const DIFF_POINTS = [
  { emoji: "🏕️", title: "자연 속 메이커 펜션", desc: "서울 강남 빌딩이 아닙니다. 60평 독채 펜션 + 120평 CNC 공방에서" },
  { emoji: "💻", title: "이론 0% 실전 100%", desc: "PPT 강의 없음. 바로 만들기 시작. 실제 서비스 5개를 만든 강사가 직접" },
  { emoji: "👥", title: "테이블 멘토 밀착 지원", desc: "4인 1조 x 5팀, 테이블마다 멘토 배치. 막히면 바로 해결" },
  { emoji: "🎯", title: "각자 다른 결과물", desc: "따라하기 아닌, 내 아이디어로. 아이디어 없으면 템플릿 20종에서 선택" },
  { emoji: "🔧", title: "진짜 운영 가능 서비스", desc: "DB + 관리자 + SMS + SEO까지 6시간 안에 완성" },
  { emoji: "🔨", title: "디지털 + 피지컬", desc: "CNC 공방 투어 + 목공 체험 + 굿즈 제작 연계" },
  { emoji: "📋", title: "만든 후까지 설계", desc: "배포 후 SEO, 마케팅, 유지보수까지 4주 로드맵 제공" },
  { emoji: "📱", title: "사후 지원 영구", desc: "디스코드/카톡 Q&A 채널 + 1주 후 체크인 + 수료자 커뮤니티" },
];

/* ───── 아이디어 템플릿 20종 ───── */
const IDEAS = [
  { name: "카페 메뉴판 사이트", cat: "소상공인" },
  { name: "공방 체험 예약", cat: "소상공인" },
  { name: "펜션 예약 페이지", cat: "소상공인" },
  { name: "식당 주문 접수", cat: "소상공인" },
  { name: "강사 프로필 사이트", cat: "프리랜서" },
  { name: "포트폴리오 사이트", cat: "프리랜서" },
  { name: "온라인 클래스 안내", cat: "프리랜서" },
  { name: "사내 설문 도구", cat: "직장인" },
  { name: "팀 회고 보드", cat: "직장인" },
  { name: "출퇴근 기록", cat: "직장인" },
  { name: "뉴스레터 구독", cat: "크리에이터" },
  { name: "디지털 제품 판매", cat: "크리에이터" },
  { name: "스터디 모집 페이지", cat: "학생" },
  { name: "개인 브랜드 사이트", cat: "학생" },
  { name: "동호회 모임 안내", cat: "커뮤니티" },
  { name: "이벤트 접수 페이지", cat: "커뮤니티" },
  { name: "웨딩 초대장", cat: "복합" },
  { name: "반려동물 프로필", cat: "복합" },
  { name: "독서 기록 대시보드", cat: "복합" },
  { name: "습관 트래커", cat: "복합" },
];

/* ───── FAQ ───── */
const FAQS = [
  { q: "코딩을 전혀 몰라도 참가할 수 있나요?", a: "네! 완전 초보 환영합니다. AI에게 말로 설명하면 코드를 만들어줍니다." },
  { q: "노트북은 어떤 걸 가져가야 하나요?", a: "맥, 윈도우 모두 가능합니다. 충전기 필수!" },
  { q: "사전에 준비할 게 있나요?", a: "워크숍 전날 1:1 원격 세팅을 도와드립니다. 미리 걱정 안 하셔도 됩니다." },
  { q: "6시간 안에 진짜 완성할 수 있나요?", a: "네! 랜딩페이지 + 신청폼 + 관리자 + SMS까지 실제 배포 완료됩니다. 완성 못하면 다음 회차 무료 재수강 보장!" },
  { q: "환불은 되나요?", a: "7일 전 100%, 3일 전 50% 환불됩니다. 당일은 불가하나 다음 회차 무료 재수강 가능합니다." },
  { q: "식사가 포함되나요?", a: "간식과 음료가 포함됩니다. 점심은 워크숍 시작 전(13시)에 미리 드시고 오시면 됩니다." },
  { q: "만들다 완성 못하면요?", a: "URL 배포에 실패하면 다음 회차 무료 재수강을 보장합니다. 사후 Q&A 채널에서 지속 지원도 됩니다." },
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
  const [occupation, setOccupation] = useState("");
  const [idea, setIdea] = useState("");
  const [experience, setExperience] = useState("");
  const [howFound, setHowFound] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ ok: boolean; msg: string } | null>(null);

  const submit = async () => {
    if (!name.trim() || !phone.trim()) {
      setResult({ ok: false, msg: "이름과 연락처를 입력해주세요." });
      return;
    }
    setLoading(true);
    setResult(null);
    try {
      const res = await fetch("/api/programs/vibe-coding", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ program: "6시간", name, phone, age, occupation, idea, experience, how_found: howFound }),
      });
      const data = await res.json();
      if (res.ok) {
        setResult({ ok: true, msg: "신청이 완료되었습니다! 확인 문자가 발송됩니다." });
        setName(""); setPhone(""); setAge(""); setOccupation(""); setIdea(""); setExperience(""); setHowFound("");
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
      <div className="p-6 space-y-4">
        <div>
          <label className="text-xs font-semibold text-gray-600 block mb-1">희망 일자</label>
          <div className="px-3 py-2.5 rounded-xl border border-gray-200 text-sm text-gray-400 bg-gray-50">
            추후 공지 (신청 후 개별 안내드립니다)
          </div>
        </div>
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
            <label className="text-xs font-semibold text-gray-600 block mb-1">하시는 일</label>
            <input value={occupation} onChange={e => setOccupation(e.target.value)} placeholder="예: 카페 사장님" className={inputClass} />
          </div>
        </div>
        <div>
          <label className="text-xs font-semibold text-gray-600 block mb-1">만들고 싶은 서비스 한 줄 설명</label>
          <textarea value={idea} onChange={e => setIdea(e.target.value)} rows={2}
            placeholder="예: 우리 카페 메뉴판 + 예약 사이트"
            className={`${inputClass} resize-none`} />
        </div>
        <div>
          <label className="text-xs font-semibold text-gray-600 block mb-1">AI/코딩 경험</label>
          <div className="flex gap-2">
            {["없음", "조금 있음", "많이 사용"].map((opt) => (
              <button key={opt} type="button" onClick={() => setExperience(opt)}
                className={`flex-1 py-2.5 rounded-xl text-sm font-semibold border transition-all ${
                  experience === opt ? "border-primary bg-sage/30 text-primary" : "border-gray-200 text-gray-400 hover:bg-gray-50"
                }`}>{opt}</button>
            ))}
          </div>
        </div>
        <div>
          <label className="text-xs font-semibold text-gray-600 block mb-1">알게 된 경로</label>
          <div className="flex flex-wrap gap-2">
            {["인스타그램", "지인추천", "검색", "기타"].map((opt) => (
              <button key={opt} type="button" onClick={() => setHowFound(opt)}
                className={`px-4 py-2 rounded-xl text-sm font-semibold border transition-all ${
                  howFound === opt ? "border-primary bg-sage/30 text-primary" : "border-gray-200 text-gray-400 hover:bg-gray-50"
                }`}>{opt}</button>
            ))}
          </div>
        </div>
        <button onClick={submit} disabled={loading}
          className="w-full py-3.5 rounded-xl bg-primary text-white font-bold text-base hover:bg-primary-dark transition-colors disabled:opacity-50">
          {loading ? "신청 중..." : "워크숍 신청하기"}
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
export default function VibeCodingPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* 상단 내비 */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-md shadow-sm">
        <div className="max-w-5xl mx-auto px-4 h-14 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 text-gray-700 hover:text-primary transition-colors">
            <ChevronLeft size={18} />
            <span className="text-sm font-medium">달팽이아지트</span>
          </Link>
          <a href="#apply" className="bg-primary text-white px-5 py-2 rounded-full text-sm font-semibold hover:bg-primary-dark transition-all">
            신청하기
          </a>
        </div>
      </nav>

      {/* ─── 1. 히어로 ─── */}
      <section className="relative pt-14">
        <div className="relative min-h-[70vh] overflow-hidden bg-gradient-to-br from-primary-dark via-primary to-emerald-900">
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-20 left-10 text-6xl sm:text-8xl font-mono text-white">&lt;/&gt;</div>
            <div className="absolute top-40 right-10 text-4xl sm:text-6xl font-mono text-white">{"{ }"}</div>
            <div className="absolute bottom-32 left-1/4 text-5xl sm:text-7xl font-mono text-white">AI</div>
            <div className="absolute bottom-20 right-1/4 text-3xl sm:text-5xl font-mono text-white">URL</div>
          </div>
          <div className="relative z-10 h-full flex flex-col items-center justify-center text-center px-4 py-20 sm:py-28">
            <span className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 text-white/90 text-sm font-medium mb-6">
              <Rocket size={14} /> 아이디어만 가져오세요. URL은 갖고 돌아갑니다.
            </span>

            <h1 className="text-4xl sm:text-6xl font-black text-white leading-tight">
              바이브코딩 워크숍
            </h1>
            <p className="text-lg sm:text-xl text-white/70 mt-4 max-w-lg font-medium leading-relaxed">
              코딩 한 줄 몰라도, AI와 대화하며<br />내 서비스를 만들고 배포하는 하루
            </p>

            <div className="flex flex-wrap items-center justify-center gap-3 mt-8">
              <div className="flex items-center gap-1.5 bg-white/15 backdrop-blur-sm text-white px-4 py-2 rounded-full text-sm">
                <MapPin size={14} /> 달팽이아지트펜션
              </div>
              <div className="flex items-center gap-1.5 bg-white/15 backdrop-blur-sm text-white px-4 py-2 rounded-full text-sm">
                <Users size={14} /> 정원 20명
              </div>
              <div className="flex items-center gap-1.5 bg-white/15 backdrop-blur-sm text-white px-4 py-2 rounded-full text-sm">
                <Clock size={14} /> 13:00~19:00 (6시간)
              </div>
            </div>

            <a href="#apply" className="mt-8 inline-flex items-center gap-2 px-8 py-4 bg-white text-primary rounded-full font-bold text-base hover:bg-sage transition-all shadow-lg shadow-primary-dark/30">
              워크숍 신청하기 <ArrowRight size={16} />
            </a>
          </div>
        </div>
      </section>

      {/* ─── 숫자로 보는 워크숍 (likelion-style stats bar) ─── */}
      <section className="bg-gray-50 border-b border-gray-100">
        <div className="max-w-4xl mx-auto px-4 py-10 sm:py-14">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 text-center">
            {[
              { num: "6시간", label: "올인원 커리큘럼", sub: "이론 0% 실습 100%" },
              { num: "20명", label: "소수 정원", sub: "4인 1조 밀착 멘토링" },
              { num: "5개+", label: "실제 운영 서비스", sub: "강사가 직접 만들어 운영 중" },
              { num: "100%", label: "배포 완료율", sub: "실패 시 무료 재수강" },
            ].map((s, i) => (
              <div key={i}>
                <p className="text-3xl sm:text-4xl font-black text-primary">{s.num}</p>
                <p className="text-sm font-bold text-gray-900 mt-1">{s.label}</p>
                <p className="text-xs text-gray-400 mt-0.5">{s.sub}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── 학습 프로세스 (likelion-style step) ─── */}
      <section className="bg-white border-b border-gray-100">
        <div className="max-w-3xl mx-auto px-4 py-14 sm:py-16">
          <p className="text-xs font-bold text-primary text-center tracking-widest mb-2">LEARNING PROCESS</p>
          <h2 className="text-2xl sm:text-3xl font-black text-gray-900 text-center mb-12">워크숍 참여 흐름</h2>
          <div className="relative">
            {/* vertical line */}
            <div className="absolute left-6 sm:left-8 top-0 bottom-0 w-0.5 bg-sage hidden sm:block" />
            <div className="space-y-6 sm:space-y-8">
              {[
                { step: "01", title: "사전 세팅", desc: "워크숍 전날 1:1 원격으로 개발 환경을 세팅해드립니다. 노트북만 준비하세요.", color: "bg-sage text-primary" },
                { step: "02", title: "아이디어 → MVP 스코핑", desc: "테이블 멘토와 함께 만들고 싶은 서비스를 구체화합니다. 아이디어가 없다면 템플릿 20종에서 선택!", color: "bg-emerald-100 text-emerald-700" },
                { step: "03", title: "AI와 대화하며 제작", desc: "프롬프트로 랜딩페이지 → 신청폼 → DB → 관리자 → SMS까지 직접 만듭니다.", color: "bg-blue-100 text-blue-600" },
                { step: "04", title: "배포 & 런칭", desc: "내 URL로 실제 배포! 폰으로 접속 확인하고 SEO 기초까지 마무리합니다.", color: "bg-emerald-100 text-emerald-600" },
                { step: "05", title: "사후 지원", desc: "4주 로드맵 + 디스코드/카톡 Q&A 채널 + 1주 후 체크인으로 지속 성장합니다.", color: "bg-amber-100 text-amber-600" },
              ].map((s, i) => (
                <div key={i} className="flex items-start gap-4 sm:gap-6">
                  <div className={`w-12 h-12 sm:w-16 sm:h-16 rounded-2xl ${s.color} flex items-center justify-center flex-shrink-0 font-black text-lg sm:text-xl relative z-10`}>
                    {s.step}
                  </div>
                  <div className="pt-1 sm:pt-3">
                    <p className="font-black text-gray-900 text-base sm:text-lg">{s.title}</p>
                    <p className="text-sm text-gray-500 mt-1 leading-relaxed">{s.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <div className="max-w-3xl mx-auto px-4 pb-24">

        {/* ─── 2. 이런 분께 추천 ─── */}
        <section className="py-16 sm:py-20">
          <h2 className="text-2xl sm:text-3xl font-black text-gray-900 text-center mb-4">이런 분께 추천해요</h2>
          <p className="text-sm text-gray-500 text-center mb-10">하나라도 해당되면 이 워크숍이 답입니다</p>
          <div className="space-y-3 max-w-xl mx-auto">
            {[
              "아이디어는 있는데, 개발자 없이 만들 수가 없다",
              "외주 맡기자니 비용이 부담, 노코드는 한계가 있다",
              "AI가 코딩해준다는데 어떻게 시작해야 할지 모르겠다",
              "구글폼 말고 내 브랜드에 맞는 사이트를 갖고 싶다",
              "사이드 프로젝트를 '오늘' 런칭하고 싶다",
              "예약/신청 페이지가 필요한 소상공인 사장님",
              "포트폴리오/수강신청 사이트를 만들고 싶은 프리랜서/강사",
            ].map((text, i) => (
              <div key={i} className="flex items-start gap-3 px-4 py-3 rounded-xl hover:bg-gray-50 transition-colors">
                <Check size={18} className="text-primary flex-shrink-0 mt-0.5" />
                <p className="text-sm sm:text-base text-gray-700 font-medium">{text}</p>
              </div>
            ))}
          </div>
        </section>

        <div className="h-px bg-gray-100" />

        {/* ─── Before → After (likelion-style) ─── */}
        <section className="py-16 sm:py-20">
          <p className="text-xs font-bold text-primary text-center tracking-widest mb-2">BEFORE → AFTER</p>
          <h2 className="text-2xl sm:text-3xl font-black text-gray-900 text-center mb-10">6시간이 바꾸는 것</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="bg-gray-100 rounded-2xl p-6 border border-gray-200">
              <p className="text-xs font-black text-gray-400 tracking-widest mb-4">BEFORE</p>
              <div className="space-y-3">
                {[
                  "아이디어만 있고, 만들 수 없는 상태",
                  "외주 견적만 받아보다 포기",
                  "노코드 도구 한계에 좌절",
                  "AI가 코딩한다는데 시작법을 모름",
                  "구글폼으로 임시 운영 중",
                ].map((t, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-gray-300 text-white flex items-center justify-center flex-shrink-0"><X size={12} /></span>
                    <span className="text-sm text-gray-500">{t}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="bg-sage/30 rounded-2xl p-6 border border-sage-dark">
              <p className="text-xs font-black text-primary tracking-widest mb-4">AFTER</p>
              <div className="space-y-3">
                {[
                  "내 URL로 배포된 실제 서비스 보유",
                  "신청폼 + DB + 관리자 페이지 운영",
                  "SMS 자동 발송 시스템 완비",
                  "AI 프롬프트 실전 스킬 체득",
                  "4주 로드맵으로 지속 성장 가능",
                ].map((t, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-primary text-white flex items-center justify-center flex-shrink-0"><Check size={12} /></span>
                    <span className="text-sm text-gray-800 font-medium">{t}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <div className="h-px bg-gray-100" />

        {/* ─── 3. 이 워크숍에서 얻는 것 ─── */}
        <section className="py-16 sm:py-20">
          <p className="text-xs font-bold text-primary text-center tracking-widest mb-2">OUTCOMES</p>
          <h2 className="text-2xl sm:text-3xl font-black text-gray-900 text-center mb-4">6시간 후, 이 모든 것을 갖고 돌아갑니다</h2>
          <p className="text-sm text-gray-500 text-center mb-10">진짜 운영 가능한 서비스 풀세트</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[
              { icon: <Globe size={24} className="text-primary" />, title: "내 URL로 배포된 웹사이트", desc: "Vercel 배포, 도메인 연결, 모바일 최적화" },
              { icon: <Layout size={24} className="text-primary" />, title: "랜딩페이지 + 신청폼", desc: "히어로, 소개, 후기, 신청 폼까지 완성" },
              { icon: <Database size={24} className="text-primary" />, title: "Supabase DB 연동", desc: "신청 데이터 실시간 저장, 관리자 페이지" },
              { icon: <Send size={24} className="text-primary" />, title: "SMS 자동 발송", desc: "Solapi 연동, 신청 시 자동 문자 알림" },
              { icon: <Zap size={24} className="text-primary" />, title: "AI 프롬프트 실전 감각", desc: "프롬프트 치트시트 + 에러 해결 패턴" },
              { icon: <Shield size={24} className="text-primary" />, title: "\"만든 후\" 4주 로드맵", desc: "SEO, 마케팅, 유지보수까지 사후 가이드" },
            ].map((item, i) => (
              <div key={i} className="bg-gray-50 rounded-2xl p-6 hover:shadow-md transition-shadow">
                <div className="w-12 h-12 rounded-xl bg-sage flex items-center justify-center mb-4">
                  {item.icon}
                </div>
                <p className="font-bold text-gray-900 text-base">{item.title}</p>
                <p className="text-sm text-gray-500 mt-1">{item.desc}</p>
              </div>
            ))}
          </div>
        </section>

        <div className="h-px bg-gray-100" />

        {/* ─── 4. 커리큘럼 Part 1~6 ─── */}
        <section className="py-16 sm:py-20">
          <p className="text-xs font-bold text-primary text-center tracking-widest mb-2">CURRICULUM</p>
          <h2 className="text-2xl sm:text-3xl font-black text-gray-900 text-center mb-4">커리큘럼</h2>
          <p className="text-sm text-gray-500 text-center mb-12">13:00~19:00 / 6시간 / 점심 별도</p>

          <div className="space-y-5">
            {CURRICULUM.map((c) => (
              <div key={c.part} className={`rounded-2xl border p-5 sm:p-6 transition-shadow hover:shadow-md ${c.highlight ? "border-sage-dark bg-sage/30/50" : "border-gray-200 bg-white"}`}>
                <div className="flex items-center gap-3 mb-3">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${c.highlight ? "bg-primary text-white" : "bg-gray-100 text-gray-600"}`}>
                    {c.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className={`text-xs font-black px-2 py-0.5 rounded-full ${c.highlight ? "bg-primary text-white" : "bg-gray-200 text-gray-600"}`}>Part {c.part}</span>
                      {c.highlight && <span className="text-[10px] font-bold text-primary bg-sage px-2 py-0.5 rounded-full">HANDS-ON</span>}
                    </div>
                    <p className="font-bold text-gray-900 text-sm sm:text-base mt-1">{c.title}</p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="text-xs text-gray-400">{c.time}</p>
                    <p className="text-xs font-bold text-gray-600">{c.duration}</p>
                  </div>
                </div>
                <ul className="space-y-1.5 ml-[52px]">
                  {c.items.map((item, j) => (
                    <li key={j} className="flex items-start gap-2">
                      <span className="w-1 h-1 rounded-full bg-gray-400 mt-2 flex-shrink-0" />
                      <span className="text-xs sm:text-sm text-gray-600">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          {/* 상세 타임테이블 토글 */}
          <details className="mt-8 group">
            <summary className="cursor-pointer text-sm font-bold text-primary text-center hover:text-primary transition-colors list-none flex items-center justify-center gap-1">
              <ChevronDown size={16} className="group-open:rotate-180 transition-transform" />
              전체 타임테이블 보기
            </summary>
            <div className="mt-4 space-y-2">
              {TIMETABLE.map((item, i) => (
                <div key={i} className={`flex items-center gap-3 rounded-xl border px-4 py-3 ${item.highlight ? "bg-sage/30 border-sage-dark" : "bg-white border-gray-200"}`}>
                  <span className="text-xl flex-shrink-0">{item.icon}</span>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-gray-900 text-sm">{item.label}</p>
                  </div>
                  <span className="text-xs text-gray-400 flex-shrink-0">{item.time}</span>
                </div>
              ))}
            </div>
          </details>
        </section>

        <div className="h-px bg-gray-100" />

        {/* ─── 5. 왜 달팽이아지트인가? ─── */}
        <section className="py-16 sm:py-20">
          <p className="text-xs font-bold text-primary text-center tracking-widest mb-2">VENUE</p>
          <h2 className="text-2xl sm:text-3xl font-black text-gray-900 text-center mb-3">왜 달팽이아지트인가?</h2>
          <p className="text-sm text-gray-500 text-center mb-10">메이커 펜션의 3중 무기</p>
          <div className="space-y-4">
            <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-2xl border border-green-200 p-6">
              <div className="flex items-start gap-3">
                <span className="text-3xl">🏕️</span>
                <div>
                  <p className="font-black text-gray-900 text-base">펜션 (60평 독채)</p>
                  <p className="text-sm text-gray-600 mt-1 leading-relaxed">자연 속 코딩 환경 + 수영장/족욕 리프레시 + 1박2일 패키지 가능</p>
                </div>
              </div>
            </div>
            <div className="bg-gradient-to-r from-amber-50 to-orange-50 rounded-2xl border border-amber-200 p-6">
              <div className="flex items-start gap-3">
                <span className="text-3xl">🔧</span>
                <div>
                  <p className="font-black text-gray-900 text-base">CNC 공방 (120평)</p>
                  <p className="text-sm text-gray-600 mt-1 leading-relaxed">목공 체험 키트 + CNC 굿즈 제작 시연 + 디지털 서비스 + 실물 제품 = 완전한 비즈니스</p>
                </div>
              </div>
            </div>
            <div className="bg-gradient-to-r from-sage/30 to-emerald-50 rounded-2xl border border-sage-dark p-6">
              <div className="flex items-start gap-3">
                <span className="text-3xl">💻</span>
                <div>
                  <p className="font-black text-gray-900 text-base">실전 운영 경험</p>
                  <p className="text-sm text-gray-600 mt-1 leading-relaxed">바이브코딩으로 만든 실제 서비스 5개+ 운영 중 (펜션 예약, 조립공간, 리트릿 신청 등) / 에어비앤비 5.0 / 7년 호스팅</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <div className="h-px bg-gray-100" />

        {/* ─── 6. 차별화 포인트 ─── */}
        <section className="py-16 sm:py-20">
          <p className="text-xs font-bold text-primary text-center tracking-widest mb-2">WHY DIFFERENT</p>
          <h2 className="text-2xl sm:text-3xl font-black text-gray-900 text-center mb-10">우리 워크숍이 다른 이유</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {DIFF_POINTS.map((d, i) => (
              <div key={i} className="bg-gray-50 rounded-2xl p-5 hover:shadow-md transition-shadow">
                <span className="text-2xl">{d.emoji}</span>
                <p className="font-bold text-gray-900 mt-2 text-sm">{d.title}</p>
                <p className="text-xs text-gray-500 mt-1">{d.desc}</p>
              </div>
            ))}
          </div>
        </section>

        <div className="h-px bg-gray-100" />

        {/* ─── 7. 만들 수 있는 것들 — 템플릿 20종 ─── */}
        <section className="py-16 sm:py-20">
          <p className="text-xs font-bold text-primary text-center tracking-widest mb-2">TEMPLATES</p>
          <h2 className="text-2xl sm:text-3xl font-black text-gray-900 text-center mb-3">만들 수 있는 것들</h2>
          <p className="text-sm text-gray-500 text-center mb-10">아이디어가 없어도 OK! 템플릿 20종에서 골라 바로 시작</p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {IDEAS.map((idea, i) => (
              <div key={i} className="bg-gray-50 rounded-xl border border-gray-100 p-3 hover:shadow-md transition-all hover:-translate-y-0.5">
                <span className="text-[10px] font-bold text-primary-light">{idea.cat}</span>
                <p className="font-bold text-gray-900 text-xs mt-0.5">{idea.name}</p>
              </div>
            ))}
          </div>
        </section>

        <div className="h-px bg-gray-100" />

        {/* ─── 8. 가격 안내 ─── */}
        <section className="py-16 sm:py-20">
          <p className="text-xs font-bold text-primary text-center tracking-widest mb-2">PRICING</p>
          <h2 className="text-2xl sm:text-3xl font-black text-gray-900 text-center mb-10">가격 안내</h2>

          {/* 단일 가격 카드 */}
          <div className="max-w-md mx-auto">
            <div className="bg-white rounded-2xl border-2 border-primary-light overflow-hidden shadow-lg">
              <div className="bg-primary text-white px-6 py-6 text-center">
                <p className="text-sm font-bold text-emerald-200">바이브코딩 워크숍</p>
                <p className="text-4xl font-black mt-2">290,000<span className="text-lg font-bold">원</span></p>
                <div className="flex items-center justify-center gap-1.5 mt-3 bg-white/20 px-4 py-1.5 rounded-full text-sm mx-auto w-fit">
                  <Clock size={14} /> 13:00~19:00 (6시간)
                </div>
              </div>
              <div className="p-6">
                <p className="text-xs font-bold text-gray-600 mb-3">포함 항목</p>
                <div className="space-y-2">
                  {["간식 + 음료", "사전 1:1 세팅", "프롬프트 치트시트", "\"만든 후\" 4주 로드맵", "CNC 공방 투어", "사후 Q&A 채널", "수료증"].map((item) => (
                    <div key={item} className="flex items-center gap-2">
                      <Check size={14} className="text-primary flex-shrink-0" />
                      <span className="text-sm text-gray-700">{item}</span>
                    </div>
                  ))}
                </div>
                <a href="#apply" className="mt-6 w-full inline-flex items-center justify-center gap-2 py-3.5 bg-primary text-white rounded-xl font-bold text-base hover:bg-primary-dark transition-colors">
                  워크숍 신청하기 <ArrowRight size={14} />
                </a>
              </div>
            </div>
          </div>

          {/* 할인 안내 */}
          <div className="mt-8 bg-gray-50 rounded-2xl p-6 border border-gray-100 max-w-md mx-auto">
            <p className="text-sm font-black text-gray-900 mb-4 text-center">할인 혜택</p>
            <div className="grid grid-cols-2 gap-3 text-center">
              <div className="bg-white rounded-xl p-3 border border-gray-100">
                <p className="text-2xl font-black text-primary">20%</p>
                <p className="text-xs text-gray-500 mt-1">얼리버드 (2주 전)</p>
              </div>
              <div className="bg-white rounded-xl p-3 border border-gray-100">
                <p className="text-2xl font-black text-primary">15%</p>
                <p className="text-xs text-gray-500 mt-1">2인 이상 동반</p>
              </div>
              <div className="bg-white rounded-xl p-3 border border-gray-100">
                <p className="text-2xl font-black text-primary">20%</p>
                <p className="text-xs text-gray-500 mt-1">달팽이아지트 숙박 이용자</p>
              </div>
              <div className="bg-white rounded-xl p-3 border border-gray-100">
                <p className="text-2xl font-black text-primary">30%</p>
                <p className="text-xs text-gray-500 mt-1">재수강</p>
              </div>
            </div>
            <p className="text-[11px] text-center text-primary-light font-semibold mt-4">URL 배포 실패 시 다음 회차 무료 재수강 보장</p>
          </div>
        </section>

        <div className="h-px bg-gray-100" />

        {/* ─── 9. 이끄미 소개 ─── */}
        <section className="py-16 sm:py-20">
          <p className="text-xs font-bold text-primary text-center tracking-widest mb-2">INSTRUCTOR</p>
          <h2 className="text-2xl sm:text-3xl font-black text-gray-900 text-center mb-3">이끄미</h2>
          <p className="text-sm text-gray-500 text-center mb-10">이 워크숍을 이끄는 사람</p>
          <div className="bg-gray-50 rounded-2xl border border-gray-200 p-6 max-w-lg mx-auto">
            <div className="flex items-center gap-4 mb-4">
              <img src="/img/leader-sol.jpg" alt="솔(Sol)" className="w-20 h-20 rounded-full object-cover flex-shrink-0 border-2 border-sage-dark shadow-sm" />
              <div>
                <p className="text-lg font-black text-gray-900">솔(Sol) <span className="text-sm font-medium text-gray-500">이끄미</span></p>
                <p className="text-xs font-semibold text-gray-500">달팽이아지트펜션 대표</p>
                <span className="inline-block mt-1 px-2.5 py-1 rounded-full bg-sage text-primary text-xs font-bold">바이브코딩으로 실제 서비스 5개+ 운영 중</span>
              </div>
            </div>
            <p className="text-sm text-gray-700 leading-relaxed">
              &ldquo;펜션 예약 시스템, 조립공간 예약, 리트릿 신청 페이지 등을 모두 AI와 대화하며 직접 만들었습니다. 코딩을 몰라도 됩니다. 저도 비개발자니까요.&rdquo;
            </p>
          </div>
        </section>

        <div className="h-px bg-gray-100" />

        {/* ─── 10. 신청폼 ─── */}
        <section className="py-16 sm:py-20">
          <h2 className="text-2xl sm:text-3xl font-black text-gray-900 text-center mb-10">워크숍 신청</h2>
          <div id="apply" className="scroll-mt-20 max-w-lg mx-auto">
            <ApplyForm />
          </div>
        </section>

        <div className="h-px bg-gray-100" />

        {/* ─── 11. FAQ ─── */}
        <section className="py-16 sm:py-20">
          <p className="text-xs font-bold text-primary text-center tracking-widest mb-2">FAQ</p>
          <h2 className="text-2xl sm:text-3xl font-black text-gray-900 text-center mb-10">자주 묻는 질문</h2>
          <div className="space-y-3 max-w-2xl mx-auto">
            {FAQS.map((faq, i) => (
              <FaqItem key={i} faq={faq} />
            ))}
          </div>
        </section>

        <div className="h-px bg-gray-100" />

        {/* ─── 12. 하단 CTA ─── */}
        <section className="py-16 sm:py-20">
          <div className="rounded-2xl p-8 sm:p-12 text-white text-center relative overflow-hidden bg-gradient-to-br from-primary-dark via-primary to-emerald-900">
            <div className="absolute inset-0 opacity-10">
              <div className="absolute top-4 left-8 text-6xl font-mono">&lt;/&gt;</div>
              <div className="absolute bottom-4 right-8 text-6xl font-mono">{"{ }"}</div>
            </div>
            <div className="relative z-10">
              <Code size={32} className="mx-auto text-emerald-300" />
              <h3 className="text-xl sm:text-2xl font-black mt-4">
                아이디어만 가져오세요.<br />
                <span className="text-emerald-300">URL은 갖고 돌아갑니다.</span>
              </h3>
              <p className="text-sm text-white/60 mt-3">코딩 한 줄 몰라도, 자연 속 펜션에서, AI와 대화하며</p>
              <p className="text-white/40 text-xs mt-2">13:00~19:00 / 6시간 / 290,000원</p>
              <a href="#apply" className="inline-flex items-center gap-2 mt-6 px-8 py-3.5 bg-white text-primary rounded-full font-bold text-sm hover:bg-sage/30 transition-colors shadow-lg">
                워크숍 신청하기 <ArrowRight size={14} />
              </a>
            </div>
          </div>
        </section>

        {/* 문의 */}
        <section className="pb-8 text-center">
          <p className="text-sm text-gray-500">문의사항이 있으시면</p>
          <a href="tel:010-5314-0146" className="inline-flex items-center gap-1.5 mt-2 text-primary font-bold text-base">
            <Phone size={16} /> 010-5314-0146
          </a>
          <p className="text-xs text-gray-400 mt-2">전북 완주군 소양면 해월신왕길 92 / 달팽이아지트펜션</p>
        </section>
      </div>
    </div>
  );
}
