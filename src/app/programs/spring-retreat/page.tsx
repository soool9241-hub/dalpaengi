"use client";

import { useState } from "react";
import {
  ChevronDown,
  ChevronUp,
  Calendar,
  MapPin,
  Users,
  Clock,
  Leaf,
  Heart,
  Lightbulb,
  ArrowRight,
  Phone,
  ChevronLeft,
} from "lucide-react";
import Link from "next/link";

/* ───── 타임테이블 데이터 ───── */
const DAY1 = [
  { time: "14:00", label: "집결 & 체크인", icon: "🏡" },
  { time: "15:00~17:00", label: "감각깨우기 - 감각을 깨우는 움직임", icon: "💪", tag: "마루", color: "bg-green-100 text-green-800" },
  { time: "17:00~19:00", label: "저널링 & 나눔 - 나의 방향 점검", icon: "📝", tag: "세경", color: "bg-blue-100 text-blue-800" },
  { time: "19:00~20:30", label: "저녁식사", icon: "🍽" },
  { time: "21:00~22:00", label: "대화 & 명상 - 솔직한 대화, 자애명상", icon: "🧘", tag: "예진", color: "bg-purple-100 text-purple-800" },
];

const DAY2 = [
  { time: "07:00", label: "아침식사", icon: "☀️" },
  { time: "08:00~10:00", label: "저널링 & 감사일기 - 올해의 씨앗 심기", icon: "🌱", tag: "잎새", color: "bg-amber-100 text-amber-800" },
  { time: "09:00~11:00", label: "아침 산책 & 운동 - 안 쓰던 근육 깨우기", icon: "🚶", tag: "마루", color: "bg-green-100 text-green-800" },
  { time: "11:00", label: "체크아웃", icon: "👋" },
  { time: "12:00", label: "점심식사 & 마무리", icon: "🍚" },
];

/* ───── 프로그램 상세 ───── */
const PROGRAMS = [
  {
    num: 1,
    title: "감각깨우기",
    sub: "내 몸의 외부감각을 깨우는 시간",
    leader: "마루",
    time: "첫째날 15:00~17:00",
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
    title: "저널링 & 나눔",
    sub: "나의 방향 점검, 참가자들과 솔직한 이야기",
    leader: "세경",
    time: "첫째날 17:00~19:00",
    desc: "지금 내가 잘 가고 있는지 점검하고, 올해의 큰 그림 밑그림을 뚜렷하게 그려보는 시간",
    details: [
      "나의 현재 방향 돌아보기",
      "참가자들과 솔직한 이야기 나눔",
      "올해 나의 키워드 정하기",
    ],
  },
  {
    num: 3,
    title: "대화 & 명상",
    sub: "낯선 사람과 나누는 솔직한 대화",
    leader: "예진",
    time: "첫째날 21:00~22:00",
    desc: "나는 누구인가, 무엇을 하는 사람인가, 왜 하는가 — 걷기 명상과 1대1 대화를 통해 내 안의 이야기를 꺼내는 시간",
    details: [
      "Who · What · Where · How · When · Why 카드",
      "걷기 명상 — 각자 생각하는 시간",
      "1대1 돌아가며 이야기 나누기",
      "듣기명상 — 공감과 경청",
      "자애명상으로 마무리",
    ],
  },
  {
    num: 4,
    title: "저널링 & 감사일기",
    sub: "올해의 씨앗 심기",
    leader: "잎새",
    time: "둘째날 08:00~10:00",
    desc: "지난 밤 소화한 일들이 무의식에 어떻게 남겨졌는지 풀어보고, 지금 내 주위의 모든 것에 진심으로 감사하는 시간",
    details: [
      "아침 저널링",
      "감사일기 작성",
      "올해의 씨앗 심기 — 나의 다짐",
    ],
  },
  {
    num: 5,
    title: "아침 산책 & 운동",
    sub: "안 쓰던 근육 깨우기",
    leader: "마루",
    time: "둘째날 09:00~11:00",
    desc: "내부감각과 고유수용감각을 탐색하며, 가벼운 놀이와 움직임으로 몸 안의 미묘한 감각을 느껴보는 활동",
    details: [
      "걷고 뛰는 바디스캔 (내부감각)",
      "눈 감고 걷기 — 외부→내부 감각 전환",
      "젠가를 활용한 신체놀이",
      "테니스 공을 활용한 신체놀이",
      "마무리 바디스캔",
    ],
  },
];

/* ───── 컴포넌트 ───── */
function ProgramAccordion({ p }: { p: typeof PROGRAMS[0] }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden transition-shadow hover:shadow-md">
      <button onClick={() => setOpen(!open)} className="w-full text-left px-5 py-4 flex items-center gap-4">
        <span className="flex-shrink-0 w-9 h-9 rounded-full bg-primary text-white flex items-center justify-center font-bold text-sm">
          {p.num}
        </span>
        <div className="flex-1 min-w-0">
          <p className="font-bold text-gray-900">{p.title}</p>
          <p className="text-sm text-gray-500 truncate">{p.sub}</p>
        </div>
        <span className="text-xs text-primary font-semibold whitespace-nowrap hidden sm:block">{p.leader}</span>
        {open ? <ChevronUp size={18} className="text-gray-400" /> : <ChevronDown size={18} className="text-gray-400" />}
      </button>
      {open && (
        <div className="px-5 pb-5 border-t border-gray-100 pt-4 animate-fade-in">
          <div className="flex items-center gap-2 text-xs text-gray-500 mb-2">
            <Clock size={12} /> {p.time} <span className="ml-2 px-2 py-0.5 rounded-full bg-primary/10 text-primary font-semibold">{p.leader}</span>
          </div>
          <p className="text-sm text-gray-700 mb-3">{p.desc}</p>
          <ul className="space-y-1.5">
            {p.details.map((d, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-gray-600">
                <span className="text-primary mt-0.5">&#x2022;</span> {d}
              </li>
            ))}
          </ul>
        </div>
      )}
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
          <a
            href="#apply"
            className="bg-primary text-white px-5 py-2 rounded-full text-sm font-semibold hover:bg-primary-light transition-all"
          >
            신청하기
          </a>
        </div>
      </nav>

      {/* 히어로 */}
      <section className="relative pt-14">
        <div className="relative h-[70vh] min-h-[480px] overflow-hidden">
          <img
            src="/img/nature-yard.jpg"
            alt="달팽이아지트 자연 전경"
            className="absolute inset-0 w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-black/40 to-black/70" />
          <div className="relative z-10 h-full flex flex-col items-center justify-center text-center px-4">
            <span className="text-4xl mb-4">🌱</span>
            <h1 className="text-3xl sm:text-5xl font-black text-white leading-tight">
              완주하다 봄 리트릿
            </h1>
            <p className="text-lg sm:text-xl text-white/80 mt-3 font-medium">
              Spring Awakening Retreat
            </p>
            <p className="text-sm sm:text-base text-white/60 mt-2 max-w-md">
              몸, 마음, 의식을 깨우는 1박 2일
            </p>

            <div className="flex flex-wrap items-center justify-center gap-3 mt-8">
              <div className="flex items-center gap-1.5 bg-white/20 backdrop-blur-sm text-white px-4 py-2 rounded-full text-sm">
                <Calendar size={14} /> 2026.4.18(토)~19(일)
              </div>
              <div className="flex items-center gap-1.5 bg-white/20 backdrop-blur-sm text-white px-4 py-2 rounded-full text-sm">
                <MapPin size={14} /> 달팽이아지트 (전북 완주)
              </div>
              <div className="flex items-center gap-1.5 bg-white/20 backdrop-blur-sm text-white px-4 py-2 rounded-full text-sm">
                <Users size={14} /> 20명 한정
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="max-w-3xl mx-auto px-4 pb-24">

        {/* 인트로 */}
        <section className="py-12 sm:py-16 text-center">
          <p className="text-lg sm:text-xl text-gray-700 leading-relaxed font-medium">
            겨울 동안 움츠렸던 몸,<br />
            멈춰 있던 마음,<br />
            흐려졌던 의식.
          </p>
          <p className="text-lg sm:text-xl text-primary font-bold mt-6 leading-relaxed">
            봄의 리듬에 맞춰<br />
            다시 깨어나는 시간.
          </p>
          <p className="text-sm text-gray-500 mt-6 max-w-md mx-auto">
            자기 삶을 완주하고 싶은 사람들을 위한<br />
            몸 · 마음 · 의식 리셋 캠프
          </p>
        </section>

        {/* 이런 분께 추천 */}
        <section className="pb-12 sm:pb-16">
          <h2 className="text-xl sm:text-2xl font-black text-gray-900 text-center mb-8">
            이런 분께 추천합니다
          </h2>
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

        {/* 3가지 키워드 */}
        <section className="pb-12 sm:pb-16">
          <h2 className="text-xl sm:text-2xl font-black text-gray-900 text-center mb-8">
            몸 · 마음 · 의식을 깨우는 시간
          </h2>
          <div className="space-y-4">
            {[
              {
                icon: <Leaf size={24} className="text-green-600" />,
                label: "몸",
                color: "bg-green-50 border-green-200",
                input: "건강한 식사",
                output: "감각을 깨우는 움직임, 안 쓰던 근육 깨우기",
              },
              {
                icon: <Heart size={24} className="text-rose-500" />,
                label: "마음",
                color: "bg-rose-50 border-rose-200",
                input: "몽글몽글해지는 자애명상",
                output: "낯선 사람과 나누는 솔직한 대화, 감사일기",
              },
              {
                icon: <Lightbulb size={24} className="text-amber-500" />,
                label: "의식",
                color: "bg-amber-50 border-amber-200",
                input: "참가자들과 솔직한 나눔",
                output: "나의 방향 점검, 올해의 씨앗 심기",
              },
            ].map((k, i) => (
              <div key={i} className={`rounded-2xl border p-5 ${k.color}`}>
                <div className="flex items-center gap-3 mb-3">
                  {k.icon}
                  <span className="text-lg font-black text-gray-900">{k.label}</span>
                </div>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">인풋</p>
                    <p className="text-gray-700">{k.input}</p>
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">아웃풋</p>
                    <p className="text-gray-700">{k.output}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* 타임테이블 */}
        <section className="pb-12 sm:pb-16">
          <h2 className="text-xl sm:text-2xl font-black text-gray-900 text-center mb-8">
            1박 2일 타임테이블
          </h2>

          {/* Day 1 */}
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

          {/* Day 2 */}
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
          <h2 className="text-xl sm:text-2xl font-black text-gray-900 text-center mb-8">
            프로그램 상세
          </h2>
          <div className="space-y-3">
            {PROGRAMS.map((p) => (
              <ProgramAccordion key={p.num} p={p} />
            ))}
          </div>
        </section>

        {/* 계절 로드맵 */}
        <section className="pb-12 sm:pb-16">
          <h2 className="text-xl sm:text-2xl font-black text-gray-900 text-center mb-8">
            완주하다 시즌 로드맵
          </h2>
          <div className="grid grid-cols-4 gap-2 sm:gap-4">
            {[
              { season: "봄", month: "4월", theme: "깨우기\n움트기", eng: "awake", emoji: "🌱", active: true },
              { season: "여름", month: "7월", theme: "몰입", eng: "flow", emoji: "🌿" },
              { season: "가을", month: "10월", theme: "수확", eng: "harvest", emoji: "🍂" },
              { season: "겨울", month: "1월", theme: "돌아보기\n정리", eng: "reflection", emoji: "❄️" },
            ].map((s, i) => (
              <div
                key={i}
                className={`rounded-2xl p-4 text-center transition-shadow ${
                  s.active
                    ? "bg-primary text-white shadow-lg ring-2 ring-primary/30"
                    : "bg-white border border-gray-200 text-gray-600"
                }`}
              >
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
          <h2 className="text-xl sm:text-2xl font-black text-gray-900 text-center mb-8">
            참가 안내
          </h2>
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
                  <p className="text-sm font-semibold text-gray-900 mt-1">달팽이아지트</p>
                  <p className="text-xs text-gray-500">전북 완주군</p>
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
                  <p className="text-xs text-red-500 font-semibold">얼리버드 특가</p>
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

            {/* CTA */}
            <div className="bg-primary p-6">
              <a
                href="tel:010-8531-9531"
                className="flex items-center justify-center gap-2 w-full py-3.5 bg-white text-primary rounded-xl font-bold text-base hover:bg-gray-50 transition-colors"
              >
                <Phone size={18} />
                전화 문의 · 신청하기
              </a>
              <p className="text-center text-white/60 text-xs mt-3">
                010-8531-9531 · 선착순 20명 마감
              </p>
            </div>
          </div>
        </section>

        {/* 리트릿에서 얻는 것 */}
        <section className="pb-12 sm:pb-16">
          <h2 className="text-xl sm:text-2xl font-black text-gray-900 text-center mb-8">
            리트릿에서 얻는 것
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[
              { num: "01", title: "리셋", desc: "계속 달려온 사람에게\n잠시 멈추는 시간" },
              { num: "02", title: "방향 점검", desc: "지금 내가 잘 가고 있는지\n점검하는 시간" },
              { num: "03", title: "같은 사람들", desc: "혼자가 아니라는 것을\n느끼는 시간" },
              { num: "04", title: "자연 속 감각 회복", desc: "산속 펜션에서\n1박 2일" },
            ].map((item) => (
              <div key={item.num} className="bg-white rounded-2xl border border-gray-200 p-5 flex gap-4">
                <span className="text-3xl font-black text-primary/20">{item.num}</span>
                <div>
                  <p className="font-bold text-gray-900">{item.title}</p>
                  <p className="text-sm text-gray-500 mt-1 whitespace-pre-line">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* 하단 CTA */}
        <section className="pb-8 text-center">
          <div className="bg-gradient-to-br from-primary to-primary-light rounded-2xl p-8 text-white">
            <span className="text-4xl">🌱</span>
            <h3 className="text-xl font-black mt-4">봄, 다시 깨어나는 시간</h3>
            <p className="text-white/70 text-sm mt-2">2026.4.18(토)~19(일) · 달팽이아지트</p>
            <a
              href="tel:010-8531-9531"
              className="inline-flex items-center gap-2 mt-6 px-8 py-3.5 bg-white text-primary rounded-full font-bold hover:bg-gray-50 transition-colors"
            >
              신청하기 <ArrowRight size={16} />
            </a>
          </div>
        </section>

      </div>
    </div>
  );
}
