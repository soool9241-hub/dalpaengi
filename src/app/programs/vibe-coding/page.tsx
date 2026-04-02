"use client";

import { useState, useRef } from "react";
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
  User,
} from "lucide-react";
import Link from "next/link";

/* ───── A코스 타임테이블 ───── */
const COURSE_A = [
  { time: "09:30", label: "도착 & 웰컴 드링크", icon: "☕" },
  { time: "09:40", label: "오프닝: \"이게 진짜 된다\" — 펜션예약·조립공간·청소체크리스트 3개 서비스 라이브 시연", icon: "🎬", duration: "15분" },
  { time: "09:55", label: "MVP 스코핑 — 테이블 멘토와 함께 아이디어를 4시간 크기로 정리", icon: "🎯", duration: "15분" },
  { time: "10:10", label: "AI에게 말 잘하는 법 — 프롬프트 3원칙", icon: "💬", duration: "20분" },
  { time: "10:30", label: "실습 1: 내 랜딩페이지 만들기", icon: "🖥️", duration: "60분", highlight: true },
  { time: "11:30", label: "쉬는 시간 + 간식", icon: "🍪", duration: "20분" },
  { time: "11:50", label: "실습 2: 신청폼 + DB 연결", icon: "🗄️", duration: "40분", highlight: true },
  { time: "12:30", label: "실습 3: 배포! 내 URL 생성", icon: "🚀", duration: "20분", highlight: true },
  { time: "12:50", label: "Demo Day (테이블별 대표 30초 발표) + \"만든 후 가이드\" 배포 + 클로징", icon: "🎉", duration: "20분" },
];

const COURSE_B = [
  { time: "09:00", label: "도착 & 조식", icon: "🍳" },
  { time: "09:20", label: "오프닝 — 풀스택 서비스 라이브 시연", icon: "🎬", duration: "10분" },
  { time: "09:30", label: "MVP 스코핑", icon: "🎯", duration: "15분" },
  { time: "09:45", label: "AI 프롬프트 마스터", icon: "💬", duration: "30분" },
  { time: "10:15", label: "실습 1: 랜딩페이지 제작", icon: "🖥️", duration: "75분", highlight: true },
  { time: "11:30", label: "쉬는 시간 (CNC 공방 미니 투어)", icon: "🏭", duration: "15분" },
  { time: "11:45", label: "실습 2: 신청 시스템 구축", icon: "🗄️", duration: "75분", highlight: true },
  { time: "13:00", label: "점심: 항아리 BBQ", icon: "🥩" },
  { time: "14:00", label: "실습 3: 관리자 페이지", icon: "⚙️", duration: "75분", highlight: true },
  { time: "15:15", label: "쉬는 시간 (목공 키트 체험)", icon: "🪵", duration: "15분" },
  { time: "15:30", label: "실습 4: SMS 알림 연동", icon: "📱", duration: "45분", highlight: true },
  { time: "16:15", label: "실습 5: 배포 & SEO 기초", icon: "🚀", duration: "30분", highlight: true },
  { time: "16:45", label: "Demo Day (테이블별 대표 1분 발표) + \"만든 후\" 4주 로드맵 배포 + 클로징", icon: "🎉", duration: "25분" },
  { time: "17:30", label: "(선택) CNC 공방 풀 투어 + 굿즈 제작 시연", icon: "🏭" },
];

/* ───── 차별화 포인트 ───── */
const DIFF_POINTS = [
  { emoji: "🏕️", title: "자연 속 메이커 펜션", desc: "서울 강남 빌딩이 아닙니다. 60평 독채 펜션 + 120평 CNC 공방에서" },
  { emoji: "💻", title: "이론 0% 실전 100%", desc: "PPT 강의 없음. 바로 만들기 시작. 실제 서비스 5개를 만든 강사가 직접" },
  { emoji: "👥", title: "테이블 멘토 밀착 지원", desc: "4인 1조 × 5팀, 테이블마다 멘토 배치. 막히면 바로 해결" },
  { emoji: "🎯", title: "각자 다른 결과물", desc: "따라하기 아닌, 내 아이디어로. 아이디어 없으면 템플릿 20종에서 선택" },
  { emoji: "🔧", title: "진짜 운영 가능 서비스", desc: "DB + 관리자 + SMS + SEO까지 완성 (B코스)" },
  { emoji: "🔨", title: "디지털 + 피지컬", desc: "CNC 공방 투어 + 목공 체험 + 굿즈 제작 연계 (B코스)" },
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
  { q: "A코스와 B코스 차이가 뭔가요?", a: "A코스는 랜딩+신청폼+배포, B코스는 거기에 관리자 페이지+SMS 알림+SEO까지 추가됩니다." },
  { q: "환불은 되나요?", a: "7일 전 100%, 3일 전 50% 환불됩니다. 당일은 불가하나 다음 회차 무료 재수강 가능합니다." },
  { q: "식사가 포함되나요?", a: "A코스는 간식+음료, B코스는 조식+항아리BBQ 점심+간식+음료가 포함됩니다." },
  { q: "만들다 완성 못하면요?", a: "URL 배포에 실패하면 다음 회차 무료 재수강을 보장합니다." },
  { q: "주차 가능한가요?", a: "네, 펜션 내 무료 주차 가능합니다." },
];

/* ───── FAQ 아코디언 ───── */
function FaqItem({ faq }: { faq: { q: string; a: string } }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden transition-shadow hover:shadow-md">
      <button onClick={() => setOpen(!open)} className="w-full text-left px-5 sm:px-6 py-5 flex items-center gap-4">
        <span className="flex-shrink-0 w-8 h-8 rounded-full bg-violet-100 text-violet-600 flex items-center justify-center font-bold text-sm">Q</span>
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
  const [program, setProgram] = useState("");
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
    if (!program) {
      setResult({ ok: false, msg: "코스를 선택해주세요." });
      return;
    }
    setLoading(true);
    setResult(null);
    try {
      const res = await fetch("/api/programs/vibe-coding", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ program, name, phone, age, occupation, idea, experience, how_found: howFound }),
      });
      const data = await res.json();
      if (res.ok) {
        setResult({ ok: true, msg: "신청이 완료되었습니다! 확인 문자가 발송됩니다." });
        setProgram(""); setName(""); setPhone(""); setAge(""); setOccupation(""); setIdea(""); setExperience(""); setHowFound("");
      } else {
        setResult({ ok: false, msg: data.error || "신청 실패" });
      }
    } catch {
      setResult({ ok: false, msg: "네트워크 오류" });
    }
    setLoading(false);
  };

  const inputClass = "w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/20";

  return (
    <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
      <div className="p-6 space-y-4">
        <div>
          <label className="text-xs font-semibold text-gray-600 block mb-1">코스 선택 *</label>
          <select value={program} onChange={e => setProgram(e.target.value)} className={inputClass}>
            <option value="">코스를 선택해주세요</option>
            <option value="A코스">A코스 — 반나절 4시간 (15만원)</option>
            <option value="B코스">B코스 — 풀데이 8시간 (25만원)</option>
          </select>
        </div>
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
                  experience === opt ? "border-violet-500 bg-violet-50 text-violet-600" : "border-gray-200 text-gray-400 hover:bg-gray-50"
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
                  howFound === opt ? "border-violet-500 bg-violet-50 text-violet-600" : "border-gray-200 text-gray-400 hover:bg-gray-50"
                }`}>{opt}</button>
            ))}
          </div>
        </div>
        <button onClick={submit} disabled={loading}
          className="w-full py-3.5 rounded-xl bg-violet-600 text-white font-bold text-base hover:bg-violet-700 transition-colors disabled:opacity-50">
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
  const [activeCourse, setActiveCourse] = useState<"A" | "B">("A");

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 상단 내비 */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-md shadow-sm">
        <div className="max-w-5xl mx-auto px-4 h-14 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 text-gray-700 hover:text-violet-600 transition-colors">
            <ChevronLeft size={18} />
            <span className="text-sm font-medium">달팽이아지트</span>
          </Link>
          <a href="#apply" className="bg-violet-600 text-white px-5 py-2 rounded-full text-sm font-semibold hover:bg-violet-700 transition-all">
            신청하기
          </a>
        </div>
      </nav>

      {/* 히어로 */}
      <section className="relative pt-14">
        <div className="relative min-h-[70vh] overflow-hidden bg-gradient-to-br from-violet-900 via-indigo-800 to-blue-900">
          {/* 배경 패턴 */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-20 left-10 text-6xl sm:text-8xl font-mono text-white">&lt;/&gt;</div>
            <div className="absolute top-40 right-10 text-4xl sm:text-6xl font-mono text-white">{ }</div>
            <div className="absolute bottom-32 left-1/4 text-5xl sm:text-7xl font-mono text-white">AI</div>
            <div className="absolute bottom-20 right-1/4 text-3xl sm:text-5xl font-mono text-white">URL</div>
          </div>
          <div className="relative z-10 h-full flex flex-col items-center justify-center text-center px-4 py-20 sm:py-28">
            {/* 슬로건 뱃지 */}
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
                <Clock size={14} /> A코스 4시간 / B코스 8시간
              </div>
            </div>

            <a href="#apply" className="mt-8 inline-flex items-center gap-2 px-8 py-4 bg-white text-violet-700 rounded-full font-bold text-base hover:bg-violet-50 transition-all shadow-lg shadow-violet-900/30">
              워크숍 신청하기 <ArrowRight size={16} />
            </a>
          </div>
        </div>
      </section>

      <div className="max-w-3xl mx-auto px-4 pb-24">

        {/* 인트로 */}
        <section className="py-12 sm:py-16 text-center">
          <p className="text-lg sm:text-xl text-gray-700 leading-relaxed font-medium">
            아이디어는 있는데,<br />만들 줄 몰라 멈춰 있었다면.
          </p>
          <p className="text-lg sm:text-xl text-violet-600 font-bold mt-6 leading-relaxed">
            AI와 대화하며<br />오늘 하루 만에 런칭하세요.
          </p>
          <p className="text-sm text-gray-500 mt-6 max-w-md mx-auto">
            도구: Claude Code (AI 코딩 어시스턴트)<br />대상: 비개발자 / 코딩 경험 없는 누구나
          </p>
          <div className="mt-8 inline-block px-5 py-2.5 bg-violet-50 border border-violet-200 rounded-xl">
            <p className="text-xs font-bold text-violet-700">전주·전북권 유일의 오프라인 바이브코딩 워크숍</p>
          </div>
        </section>

        {/* 4가지 원칙 */}
        <section className="pb-12 sm:pb-16">
          <div className="grid grid-cols-2 gap-3">
            {[
              { num: "01", title: "배우지 말고 만들어라", desc: "AI를 공부하는 시간 대신, AI로 직접 만드는 시간" },
              { num: "02", title: "내 것을 만들어라", desc: "투두앱 따라하기가 아닌, 본인의 아이디어로 진짜 서비스" },
              { num: "03", title: "오늘 런칭하라", desc: "배포까지 완료하고 URL을 갖고 퇴장" },
              { num: "04", title: "만든 후를 설계하라", desc: "SEO, 마케팅, 유지보수까지 안내" },
            ].map((p, i) => (
              <div key={i} className="bg-white rounded-2xl border border-gray-200 p-4 hover:shadow-md transition-shadow">
                <span className="text-[10px] font-black text-violet-400">{p.num}</span>
                <p className="font-bold text-gray-900 text-sm mt-1">{p.title}</p>
                <p className="text-[11px] text-gray-500 mt-1">{p.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* 이런 분께 추천 */}
        <section className="pb-12 sm:pb-16">
          <h2 className="text-xl sm:text-2xl font-black text-gray-900 text-center mb-8">이런 분께 추천해요</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[
              { icon: <Store size={24} className="text-violet-500" />, title: "소상공인", desc: "예약/신청 페이지 필요한 펜션·카페·공방 사장님" },
              { icon: <Briefcase size={24} className="text-blue-500" />, title: "프리랜서 / 강사", desc: "수강신청·포트폴리오 사이트 만들고 싶은 분" },
              { icon: <Laptop size={24} className="text-indigo-500" />, title: "직장인", desc: "사이드 프로젝트 아이디어는 있는데 만들 줄 모르는 분" },
              { icon: <Palette size={24} className="text-pink-500" />, title: "크리에이터", desc: "구글폼 대신 내 브랜드 사이트 갖고 싶은 분" },
              { icon: <GraduationCap size={24} className="text-emerald-500" />, title: "대학생", desc: "AI 시대 실전 스킬을 쌓고 싶은 분" },
            ].map((item, i) => (
              <div key={i} className="bg-white rounded-2xl border border-gray-200 p-5 flex items-start gap-4 hover:shadow-md transition-shadow">
                <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-gray-50 flex items-center justify-center">
                  {item.icon}
                </div>
                <div>
                  <p className="font-bold text-gray-900 text-sm">{item.title}</p>
                  <p className="text-xs text-gray-500 mt-1">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* 메이커 펜션 3중 무기 */}
        <section className="pb-12 sm:pb-16">
          <h2 className="text-xl sm:text-2xl font-black text-gray-900 text-center mb-3">왜 달팽이아지트인가?</h2>
          <p className="text-sm text-gray-500 text-center mb-8">경쟁사에 없는 3중 무기</p>
          <div className="space-y-3">
            <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-2xl border border-green-200 p-5">
              <div className="flex items-start gap-3">
                <span className="text-2xl">🏕️</span>
                <div>
                  <p className="font-black text-gray-900 text-sm">펜션 (60평 독채)</p>
                  <p className="text-xs text-gray-600 mt-1 leading-relaxed">자연 속 코딩 환경 + 항아리 BBQ 점심 + 수영장·족욕 리프레시 + 1박2일 패키지 가능</p>
                </div>
              </div>
            </div>
            <div className="bg-gradient-to-r from-amber-50 to-orange-50 rounded-2xl border border-amber-200 p-5">
              <div className="flex items-start gap-3">
                <span className="text-2xl">🔧</span>
                <div>
                  <p className="font-black text-gray-900 text-sm">CNC 공방 (120평)</p>
                  <p className="text-xs text-gray-600 mt-1 leading-relaxed">목공 체험 키트 + CNC 굿즈 제작 시연 + 디지털 서비스 + 실물 제품 = 완전한 비즈니스</p>
                </div>
              </div>
            </div>
            <div className="bg-gradient-to-r from-violet-50 to-indigo-50 rounded-2xl border border-violet-200 p-5">
              <div className="flex items-start gap-3">
                <span className="text-2xl">💻</span>
                <div>
                  <p className="font-black text-gray-900 text-sm">실전 운영 경험</p>
                  <p className="text-xs text-gray-600 mt-1 leading-relaxed">바이브코딩으로 만든 실제 서비스 5개+ 운영 중 (펜션 예약, 조립공간, 리트릿 신청 등) · 에어비앤비 5.0 · 7년 호스팅</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 우리 워크숍이 다른 이유 */}
        <section className="pb-12 sm:pb-16">
          <h2 className="text-xl sm:text-2xl font-black text-gray-900 text-center mb-8">우리 워크숍이 다른 이유</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {DIFF_POINTS.map((d, i) => (
              <div key={i} className="bg-white rounded-2xl border border-gray-200 p-5 hover:shadow-md transition-shadow">
                <span className="text-2xl">{d.emoji}</span>
                <p className="font-bold text-gray-900 mt-2 text-sm">{d.title}</p>
                <p className="text-xs text-gray-500 mt-1">{d.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* 코스 안내 — 탭 전환 */}
        <section className="pb-12 sm:pb-16">
          <h2 className="text-xl sm:text-2xl font-black text-gray-900 text-center mb-6">코스 안내</h2>

          {/* 탭 버튼 */}
          <div className="flex gap-2 mb-5">
            <button onClick={() => setActiveCourse("A")}
              className={`flex-1 py-3 rounded-xl text-sm font-bold transition-all ${activeCourse === "A" ? "bg-violet-600 text-white shadow-md" : "bg-gray-100 text-gray-500 hover:bg-gray-200"}`}>
              A코스 · 반나절 4시간
            </button>
            <button onClick={() => setActiveCourse("B")}
              className={`flex-1 py-3 rounded-xl text-sm font-bold transition-all ${activeCourse === "B" ? "bg-indigo-600 text-white shadow-md" : "bg-gray-100 text-gray-500 hover:bg-gray-200"}`}>
              B코스 · 풀데이 8시간
            </button>
          </div>

          {/* 코스 설명 */}
          <div className="bg-white rounded-2xl border border-gray-200 p-5 mb-4">
            {activeCourse === "A" ? (
              <>
                <div className="flex items-center gap-2 mb-2">
                  <span className="px-3 py-1 rounded-full bg-violet-100 text-violet-700 text-xs font-bold">A코스</span>
                  <span className="text-sm font-bold text-gray-900">내 서비스 런칭데이</span>
                </div>
                <p className="text-2xl font-black text-violet-600">150,000원</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {["간식+음료", "사전 1:1 세팅", "프롬프트 치트시트", "사후 Q&A 채널", "수료증"].map((item) => (
                    <span key={item} className="px-2.5 py-1 rounded-full bg-violet-50 text-violet-600 text-xs font-medium">{item}</span>
                  ))}
                </div>
                <div className="mt-3 p-3 bg-gray-50 rounded-xl">
                  <p className="text-xs font-bold text-gray-600 mb-1">산출물</p>
                  <p className="text-sm text-gray-700">실제 배포된 웹사이트 URL, Supabase DB, AI 프롬프트 실전 감각</p>
                </div>
              </>
            ) : (
              <>
                <div className="flex items-center gap-2 mb-2">
                  <span className="px-3 py-1 rounded-full bg-indigo-100 text-indigo-700 text-xs font-bold">B코스</span>
                  <span className="text-sm font-bold text-gray-900">풀스택 원데이</span>
                </div>
                <p className="text-2xl font-black text-indigo-600">250,000원</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {["조식+항아리BBQ점심+간식+음료", "사전 1:1 세팅", "CNC 공방 투어", "프롬프트 치트시트+로드맵", "사후 Q&A 채널", "수료증"].map((item) => (
                    <span key={item} className="px-2.5 py-1 rounded-full bg-indigo-50 text-indigo-600 text-xs font-medium">{item}</span>
                  ))}
                </div>
                <div className="mt-3 p-3 bg-gray-50 rounded-xl">
                  <p className="text-xs font-bold text-gray-600 mb-1">산출물</p>
                  <p className="text-sm text-gray-700">랜딩+신청폼+관리자+SMS+SEO = 실제 운영 가능 서비스</p>
                </div>
                <div className="mt-2 p-3 bg-indigo-50 rounded-xl">
                  <p className="text-xs font-bold text-indigo-600 mb-1">"만든 후" 4주 로드맵</p>
                  <p className="text-[11px] text-indigo-500">Week1: URL 공유 → Week2: 구글 인덱싱 확인 → Week3: 피드백 반영 → Week4: 심화반 연결</p>
                </div>
              </>
            )}
          </div>

          {/* 타임라인 */}
          <div className="space-y-2.5">
            {(activeCourse === "A" ? COURSE_A : COURSE_B).map((item, i) => (
              <div key={i} className={`flex items-center gap-3 rounded-xl border px-4 py-3 ${item.highlight ? "bg-violet-50 border-violet-200" : "bg-white border-gray-200"}`}>
                <span className="text-xl flex-shrink-0">{item.icon}</span>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-gray-900 text-sm">{item.label}</p>
                  <p className="text-[11px] text-gray-400 mt-0.5">{item.time}</p>
                </div>
                {item.duration && (
                  <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full flex-shrink-0 ${item.highlight ? "bg-violet-200 text-violet-700" : "bg-gray-100 text-gray-500"}`}>
                    {item.duration}
                  </span>
                )}
              </div>
            ))}
          </div>
        </section>

        {/* 만들 수 있는 것들 — 템플릿 20종 */}
        <section className="pb-12 sm:pb-16">
          <h2 className="text-xl sm:text-2xl font-black text-gray-900 text-center mb-3">만들 수 있는 것들</h2>
          <p className="text-sm text-gray-500 text-center mb-8">아이디어가 없어도 OK! 템플릿 20종에서 골라 바로 시작</p>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
            {IDEAS.map((idea, i) => (
              <div key={i} className="bg-white rounded-xl border border-gray-200 p-3 hover:shadow-md transition-all hover:-translate-y-0.5">
                <span className="text-[10px] font-bold text-violet-400">{idea.cat}</span>
                <p className="font-bold text-gray-900 text-xs mt-0.5">{idea.name}</p>
              </div>
            ))}
          </div>
        </section>

        {/* 가격 안내 */}
        <section className="pb-12 sm:pb-16">
          <h2 className="text-xl sm:text-2xl font-black text-gray-900 text-center mb-8">가격 안내</h2>
          <div className="space-y-4">
            {/* A코스 카드 */}
            <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
              <div className="bg-violet-600 text-white px-6 py-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-bold text-violet-200">A코스 · 반나절</p>
                    <p className="text-2xl font-black mt-1">150,000원</p>
                  </div>
                  <div className="flex items-center gap-1.5 bg-white/20 px-3 py-1.5 rounded-full text-sm">
                    <Clock size={14} /> 4시간
                  </div>
                </div>
              </div>
              <div className="p-5">
                <div className="flex flex-wrap gap-2">
                  {["간식+음료", "사전 1:1 세팅", "프롬프트 치트시트", "사후 Q&A 채널", "수료증"].map((item) => (
                    <span key={item} className="px-2.5 py-1 rounded-full bg-gray-100 text-gray-600 text-xs font-medium">{item}</span>
                  ))}
                </div>
              </div>
            </div>
            {/* B코스 카드 */}
            <div className="bg-white rounded-2xl border-2 border-indigo-300 overflow-hidden relative">
              <div className="absolute top-3 right-3 px-2.5 py-1 bg-amber-400 text-amber-900 text-xs font-black rounded-full">BEST</div>
              <div className="bg-indigo-600 text-white px-6 py-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-bold text-indigo-200">B코스 · 풀데이</p>
                    <p className="text-2xl font-black mt-1">250,000원</p>
                  </div>
                  <div className="flex items-center gap-1.5 bg-white/20 px-3 py-1.5 rounded-full text-sm">
                    <Clock size={14} /> 8시간
                  </div>
                </div>
              </div>
              <div className="p-5">
                <div className="flex flex-wrap gap-2">
                  {["조식+BBQ점심+간식+음료", "사전 1:1 세팅", "CNC 공방 투어", "치트시트+로드맵", "사후 Q&A 채널", "수료증"].map((item) => (
                    <span key={item} className="px-2.5 py-1 rounded-full bg-gray-100 text-gray-600 text-xs font-medium">{item}</span>
                  ))}
                </div>
              </div>
            </div>
          </div>
          {/* 할인 안내 */}
          <div className="mt-6 bg-gradient-to-r from-violet-50 to-indigo-50 rounded-2xl p-5 border border-violet-200">
            <p className="text-sm font-black text-gray-900 mb-3 text-center">할인 혜택</p>
            <div className="grid grid-cols-2 gap-3 text-center">
              <div className="bg-white rounded-xl p-3">
                <p className="text-2xl font-black text-violet-600">20%</p>
                <p className="text-xs text-gray-500 mt-1">얼리버드 (2주 전)</p>
              </div>
              <div className="bg-white rounded-xl p-3">
                <p className="text-2xl font-black text-indigo-600">15%</p>
                <p className="text-xs text-gray-500 mt-1">2인 이상 동반</p>
              </div>
              <div className="bg-white rounded-xl p-3">
                <p className="text-2xl font-black text-blue-600">20%</p>
                <p className="text-xs text-gray-500 mt-1">달팽이아지트 숙박 이용자</p>
              </div>
              <div className="bg-white rounded-xl p-3">
                <p className="text-2xl font-black text-emerald-600">30%</p>
                <p className="text-xs text-gray-500 mt-1">재수강</p>
              </div>
            </div>
            <p className="text-[11px] text-center text-violet-500 font-semibold mt-3">URL 배포 실패 시 다음 회차 무료 재수강 보장</p>
          </div>
        </section>

        {/* 이끄미 소개 */}
        <section className="pb-12 sm:pb-16">
          <h2 className="text-xl sm:text-2xl font-black text-gray-900 text-center mb-3">이끄미</h2>
          <p className="text-sm text-gray-500 text-center mb-8">이 워크숍을 이끄는 사람</p>
          <div className="bg-white rounded-2xl border border-violet-200 p-5">
            <div className="flex items-center gap-4 mb-4">
              <img src="/img/leader-sol.jpg" alt="솔(Sol)" className="w-20 h-20 rounded-full object-cover flex-shrink-0 border-2 border-violet-200 shadow-sm" />
              <div>
                <p className="text-lg font-black text-gray-900">솔(Sol) <span className="text-sm font-medium text-gray-500">이끄미</span></p>
                <p className="text-xs font-semibold text-gray-500">달팽이아지트펜션 대표</p>
                <span className="inline-block mt-1 px-2.5 py-1 rounded-full bg-violet-100 text-violet-700 text-xs font-bold">바이브코딩으로 실제 서비스 5개+ 운영 중</span>
              </div>
            </div>
            <p className="text-sm text-gray-700 leading-relaxed">
              &ldquo;펜션 예약 시스템, 조립공간 예약, 리트릿 신청 페이지 등을 모두 AI와 대화하며 직접 만들었습니다. 코딩을 몰라도 됩니다. 저도 비개발자니까요.&rdquo;
            </p>
          </div>
        </section>

        {/* 신청 폼 */}
        <section className="pb-12 sm:pb-16">
          <h2 className="text-xl sm:text-2xl font-black text-gray-900 text-center mb-8">워크숍 신청</h2>
          <div id="apply" className="scroll-mt-20">
            <ApplyForm />
          </div>
        </section>

        {/* FAQ */}
        <section className="pb-12 sm:pb-16">
          <h2 className="text-xl sm:text-2xl font-black text-gray-900 text-center mb-8">자주 묻는 질문</h2>
          <div className="space-y-3">
            {FAQS.map((faq, i) => (
              <FaqItem key={i} faq={faq} />
            ))}
          </div>
        </section>

        {/* 하단 CTA */}
        <section className="pb-12 sm:pb-16">
          <div className="rounded-2xl p-8 text-white text-center relative overflow-hidden bg-gradient-to-br from-violet-900 via-indigo-800 to-blue-900">
            <div className="absolute inset-0 opacity-10">
              <div className="absolute top-4 left-8 text-6xl font-mono">&lt;/&gt;</div>
              <div className="absolute bottom-4 right-8 text-6xl font-mono">{ }</div>
            </div>
            <div className="relative z-10">
              <Code size={32} className="mx-auto text-violet-300" />
              <h3 className="text-xl sm:text-2xl font-black mt-4">
                아이디어만 가져오세요.<br />
                <span className="text-violet-300">URL은 갖고 돌아갑니다.</span>
              </h3>
              <p className="text-sm text-white/60 mt-3">코딩 한 줄 몰라도, 자연 속 펜션에서, AI와 대화하며</p>
              <a href="#apply" className="inline-flex items-center gap-2 mt-6 px-8 py-3.5 bg-white text-violet-700 rounded-full font-bold text-sm hover:bg-violet-50 transition-colors shadow-lg">
                워크숍 신청하기 <ArrowRight size={14} />
              </a>
            </div>
          </div>
        </section>

        {/* 문의 */}
        <section className="pb-8 text-center">
          <p className="text-sm text-gray-500">문의사항이 있으시면</p>
          <a href="tel:010-5314-0146" className="inline-flex items-center gap-1.5 mt-2 text-violet-600 font-bold text-base">
            <Phone size={16} /> 010-5314-0146
          </a>
          <p className="text-xs text-gray-400 mt-2">전북 완주군 소양면 해월신왕길 92 · 달팽이아지트펜션</p>
        </section>
      </div>
    </div>
  );
}
