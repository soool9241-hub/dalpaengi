"use client";

import { useState, useMemo } from "react";
import { Moon, Clock, Sun, Check, X, Users, MapPin, Utensils, GraduationCap, Boxes, Heart, Leaf, Code, BookOpen, Film } from "lucide-react";
import Link from "next/link";
import { useReservation } from "@/context/ReservationContext";
import { usePricing } from "@/context/SettingsContext";

const categories = [
  { id: "all", label: "전체" },
  { id: "pension", label: "펜션" },
  { id: "mt", label: "MT/단체" },
  { id: "family", label: "가족" },
  { id: "healing", label: "힐링" },
  { id: "membership", label: "멤버십 전용" },
];

const PROGRAM_IDS = ["stay", "stay", "stay", "stay", "half", "daynight", "jolib", "healing"] as const;

export default function Programs() {
  const { pricing } = usePricing();

  const programs = useMemo(() => [
    {
      icon: Film,
      title: "🎬 JIFF STAY (전주국제영화제 특가)",
      duration: "1박 (4.29~5.8)",
      price: 560000,
      priceLabel: "560,000원",
      originalPrice: 700000,
      perPerson: 560000,
      maxPeople: "하루 1팀",
      categories: ["pension", "mt", "healing", "family"],
      tags: ["🎬 영화제", "20% OFF", "한정"],
      tagColors: ["bg-yellow-100 text-yellow-700", "bg-red-100 text-red-600", "bg-orange-100 text-orange-600"],
      gradient: "from-yellow-500 to-amber-600",
      image: "/img/outdoor-night.jpg",
      features: [
        "60평 독채 하루 1팀",
        "BBQ 그릴 3개 무료",
        "숯불 목살 5인분 무료",
        "애플사이더 5병 무료",
        "현물 혜택 19만원 무료 제공",
      ],
      extras: [],
      description: "전주국제영화제 기간 한정 특가! 영화의거리에서 차로 12분. 영화 다 보고 별 보러 오세요. 독채에서 BBQ와 함께 영화 감상 토크를.",
      highlight: true,
      isJiff: true,
    },
    {
      icon: GraduationCap,
      title: "대학생 MT 패키지 (60명 수용가능)",
      duration: "1박 2일",
      price: pricing.stay,
      perPerson: Math.round(pricing.stay / 40),
      maxPeople: "제한없음",
      categories: ["pension", "mt"],
      tags: ["추천", "대학MT", "대규모"],
      tagColors: ["bg-red-100 text-red-600", "bg-violet-100 text-violet-600", "bg-emerald-100 text-emerald-600"],
      gradient: "from-violet-500 to-indigo-500",
      image: "/img/bbq-night.jpg",
      features: [
        "독채 전체 사용 (인원 제한 없음)",
        "넓은 야외 바베큐장",
        "보드게임/레크레이션 공간",
        "넉넉한 주차장 (대형버스 가능)",
      ],
      extras: [
        "그릴 (개당 30,000원 / 최대 6개)",
        "저녁 식사 1인 10,000원 (숯불목살1인+쌈장+쌈무+쌈채소+햇반 제공)",
        "버스 렌트 가능",
      ],
      description: "대학교 동아리 MT, 학과 MT에 최적화된 패키지! 인원 제한 없이 대규모 단체도 수용 가능합니다. 독채 전체를 사용하여 프라이빗하게 즐기세요. 넓은 야외 공간과 다양한 추가 옵션으로 MT에 필요한 모든 것이 갖춰져 있습니다.",
      highlight: true,
    },
    {
      icon: Code,
      title: "바이브코딩 워크숍",
      duration: "6시간 (13:00~19:00)",
      price: 290000,
      priceLabel: "290,000원",
      originalPrice: 500000,
      perPerson: 290000,
      maxPeople: "20명 한정",
      categories: ["pension", "mt", "healing", "family", "membership"],
      tags: ["NEW", "바이브코딩", "모집중"],
      tagColors: ["bg-violet-100 text-violet-600", "bg-indigo-100 text-indigo-600", "bg-green-100 text-green-600"],
      gradient: "from-violet-500 to-indigo-500",
      image: "/img/living-room-wide.jpg",
      features: [
        "AI와 대화하며 내 웹사이트 직접 제작",
        "코딩 경험 전혀 불필요 (완전 초보 환영)",
        "랜딩페이지 + 신청폼 + DB + 관리자 + SMS",
        "실제 URL 배포까지 완료",
        "사전 1:1 원격 세팅 지원",
        "사후 Q&A 채널 영구 접근",
      ],
      extras: [],
      description: "코딩 한 줄 몰라도, 자연 속 펜션에서 AI와 대화하며 내 서비스를 만들고 배포하는 6시간. 아이디어만 가져오세요. URL은 갖고 돌아갑니다.",
      highlight: true,
      isVibeCoding: true,
      soldOut: false,
    },
    {
      icon: BookOpen,
      title: "달팽이 멤버십 스터디",
      duration: "월 정기 모임",
      price: 0,
      priceLabel: "무료",
      perPerson: 0,
      maxPeople: "제한 없음",
      categories: ["membership", "healing", "pension", "mt", "family"],
      tags: ["NEW", "멤버십", "모집중"],
      tagColors: ["bg-emerald-100 text-emerald-600", "bg-amber-100 text-amber-600", "bg-green-100 text-green-600"],
      gradient: "from-emerald-500 to-teal-500",
      image: "/img/group-indoor.jpg",
      features: [
        "함께 성장하는 스터디 커뮤니티",
        "자연 속 펜션에서 진행",
        "다양한 분야의 멤버 네트워킹",
        "정기 오프라인 모임",
        "온라인 커뮤니티 상시 운영",
      ],
      extras: [],
      description: "120평 CNC 공방과 60평 펜션을 AI로 실제 자동화하고 있는 대표가 수익모델부터 마케팅 시스템까지 함께 만듭니다. 이론이 아닌, 지금 돌아가고 있는 시스템을 공유합니다.",
      highlight: false,
      isMembership: true,
    },
    {
      icon: Leaf,
      title: "완주하다 봄 리트릿",
      duration: "1박 2일 (4.18~19)",
      price: 50000,
      priceLabel: "얼리버드 5만원",
      originalPrice: 200000,
      perPerson: 50000,
      maxPeople: "20명 한정",
      categories: ["healing", "pension", "mt", "family", "membership"],
      tags: ["리트릿", "얼리버드", "한정"],
      tagColors: ["bg-green-100 text-green-600", "bg-amber-100 text-amber-600", "bg-red-100 text-red-600"],
      gradient: "from-green-500 to-emerald-500",
      image: "/img/nature-yard.jpg",
      features: [
        "1박 2일 숙박 (달팽이아지트)",
        "3끼 식사 & 간식 제공",
        "프로그램 4~5타임 (운동/명상/저널링/대화)",
        "웰컴키트 증정",
        "20명 한정 · 선착순 마감",
      ],
      extras: [],
      description: "겨울 동안 움츠렸던 몸, 멈춰 있던 마음, 흐려졌던 의식을 봄의 리듬에 맞춰 다시 깨우는 1박 2일 리셋 캠프. 프리랜서, 1인 사업자, 창작자 등 자기 삶을 완주하고 싶은 사람들을 위한 프로그램입니다.",
      highlight: true,
      isRetreat: true,
    },
    {
      icon: Moon,
      title: "숙박 패키지",
      duration: "1박 2일",
      price: pricing.stay,
      perPerson: Math.round(pricing.stay / 15),
      maxPeople: "제한없음",
      categories: ["pension", "healing", "family"],
      tags: ["숙박", "독채", "15명기본"],
      tagColors: ["bg-primary/10 text-primary", "bg-amber-100 text-amber-700", "bg-rose-100 text-rose-600"],
      gradient: "from-primary to-primary-light",
      image: "/img/exterior-front.jpg",
      features: [
        "독채 전체 사용 (1박)",
        "넓은 거실 + 방 3개 + 테라스",
        "바베큐장 이용 가능",
        "넉넉한 주차장 완비",
        `추가 인원 1인 ${pricing.extraGuest.toLocaleString()}원`,
      ],
      extras: [],
      description: "15명 기본 독채 숙박 패키지입니다. 가족모임, 지인모임, 워크샵 등 다양한 목적으로 이용 가능합니다. 자연 속 프라이빗한 공간에서 편안한 1박 2일을 보내세요.",
      highlight: true,
    },
    {
      icon: Clock,
      title: "3시간 대여(평일만 가능)",
      duration: "3시간/타임",
      price: pricing.half,
      perPerson: Math.round(pricing.half / 15),
      maxPeople: "제한없음",
      categories: ["pension", "family"],
      tags: ["단기대여", "복수선택", "소모임"],
      tagColors: ["bg-blue-100 text-blue-600", "bg-purple-100 text-purple-600", "bg-sage text-primary"],
      gradient: "from-amber-500 to-orange-500",
      image: "/img/living-room.jpg",
      features: [
        "평일(월~금)만 예약 가능",
        "독채 3시간 이용 (1타임)",
        "오전/낮/오후/저녁 중 최대 3타임 선택",
        `추가 타임당 ${(pricing.halfExtra ?? 200000).toLocaleString()}원`,
        "바베큐장 이용 가능",
      ],
      extras: [],
      description: "짧은 시간 효율적으로 모임이나 소규모 파티를 진행할 수 있는 패키지입니다. 3시간 단위로 원하는 시간대를 복수 선택할 수 있습니다.",
      highlight: false,
    },
    {
      icon: Sun,
      title: "주/야간 패키지(평일만 가능)",
      duration: "5시간/타임",
      price: pricing.daynight,
      perPerson: Math.round(pricing.daynight / 15),
      maxPeople: "제한없음",
      categories: ["pension", "family", "healing"],
      tags: ["주간권", "야간권", "복수선택"],
      tagColors: ["bg-orange-100 text-orange-600", "bg-indigo-100 text-indigo-600", "bg-pink-100 text-pink-600"],
      gradient: "from-rose-500 to-pink-500",
      image: "/img/outdoor-night.jpg",
      features: [
        "평일(월~금)만 예약 가능",
        "독채 5시간 이용 (1타임)",
        "주간 (10:00~15:00) / 야간 (17:00~22:00) 복수 선택",
        "바베큐 또는 다과 준비 가능",
        "캠프파이어 (야간)",
      ],
      extras: [],
      description: "5시간 동안 다양한 활동을 즐길 수 있는 주/야간 패키지입니다. 주간+야간 복수 선택도 가능합니다. 바베큐, 캠프파이어 등 풍성한 프로그램이 준비되어 있습니다.",
      highlight: false,
    },
    {
      icon: Boxes,
      title: "나만의 아지트 만들기(목공체험)",
      duration: "2시간 (2타임 운영)",
      price: 30000,
      priceLabel: "30,000원/인",
      originalPrice: 30000,
      perPerson: 30000,
      maxPeople: "회당 6명",
      categories: ["membership"],
      tags: ["멤버십전용", "목공체험", "SOLD OUT"],
      tagColors: ["bg-teal-100 text-teal-600", "bg-cyan-100 text-cyan-600", "bg-red-100 text-red-600"],
      gradient: "from-teal-500 to-cyan-500",
      image: "/img/exterior-side.jpg",
      features: [
        "나만의 아지트를 직접 만드는 목공 체험",
        "탭앤슬롯(끼워맞춤) 방식 — 도구/접착제 불필요",
        "상자, 집, 자동차 등 다양한 형태 제작",
        "운영 시간: 14:00~16:00 / 16:00~18:00 (2타임)",
        "어린이 안전 설계 (보호자 동반)",
        "체험 후 50,000원 상당 무료 체험 바우처 증정",
      ],
      extras: [],
      description: "나만의 아지트를 직접 만들어보는 목공 체험입니다. 정밀 커팅된 나무 조각을 끼워 맞춰 상자, 집, 자동차 등을 만들어볼 수 있습니다. 도구 없이도 단단하게 조립되는 탭앤슬롯 방식으로, 어린이도 안전하게 참여 가능합니다. 체험 후 50,000원 상당 무료 체험 바우처를 드립니다! 1인 30,000원",
      highlight: false,
      isEvent: false,
    },
    {
      icon: Heart,
      title: "힐링캠프 1박2일",
      duration: "1박 2일",
      price: 290000,
      priceLabel: "1인 290,000원",
      perPerson: 290000,
      maxPeople: "10~15명",
      categories: ["healing"],
      tags: ["힐링", "명상", "웰니스"],
      tagColors: ["bg-emerald-100 text-emerald-600", "bg-purple-100 text-purple-600", "bg-rose-100 text-rose-600"],
      gradient: "from-emerald-500 to-teal-500",
      image: "/img/yoga.jpg",
      features: [
        "1박 2일 (오후 3시 입실 ~ 익일 11시 퇴실)",
        "힐링 프로그램 4종 제공 (필라테스/명상/자기탐색/싱잉볼 등)",
        "석식 (소양 맛집 화심두부마을) + 건강한 조식 제공",
        "오소소 카페 둘렛길 걷기 명상 (아침 산책)",
        "느슨한 네트워킹 · 별보기 · 자연 속 힐링",
        "최소 10명 ~ 최대 15명",
      ],
      extras: [],
      description: "바쁘고 지친 일상에서 잠시 벗어나, 자연과 함께 몸과 마음을 돌보는 1박 2일 힐링캠프입니다. 필라테스(엉덩이와 호흡), 바하바나 & 만트라 명상, 자기탐색 글쓰기(불타는 나의 욕망), 싱잉볼 테라피 등 알찬 프로그램으로 구성됩니다. 소양 맛집에서의 식사와 오성제 둘렛길 걷기 명상까지, 자연 속에서 나를 돌아보는 특별한 시간을 선물하세요.",
      highlight: false,
      isHealing: true,
    },
  ], [pricing]);
  const [activeCategory, setActiveCategory] = useState("all");
  const [selectedProgram, setSelectedProgram] = useState<number | null>(null);
  const { setSelectedProgramId } = useReservation();

  const filteredPrograms =
    activeCategory === "all"
      ? programs
      : programs.filter((p) => p.categories.includes(activeCategory));

  const popupProgram = selectedProgram !== null ? programs[selectedProgram] : null;

  return (
    <>
      <section id="programs" className="py-24 px-4 bg-background">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <p className="text-primary text-sm font-semibold tracking-widest uppercase mb-3">
              PROGRAMS
            </p>
            <h2 className="text-3xl sm:text-4xl font-bold text-text-dark mb-4">
              주요 프로그램
            </h2>
            <p className="text-text-light max-w-lg mx-auto">
              다양한 목적에 맞는 프로그램을 선택해보세요.
              <br />
              모든 프로그램은 자연 속 힐링 공간에서 진행됩니다.
            </p>
          </div>

          {/* Category Filter */}
          <div className="flex flex-wrap justify-center gap-2 mb-12">
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={`px-5 py-2 rounded-full text-sm font-medium transition-all ${
                  activeCategory === cat.id
                    ? "bg-primary text-white shadow-md"
                    : "bg-white text-text-mid hover:bg-sage border border-border"
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>

          {/* Program Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredPrograms.map((prog, i) => {
              const Icon = prog.icon;
              const originalIndex = programs.indexOf(prog);
              return (
                <div
                  key={originalIndex}
                  className={`group rounded-3xl overflow-hidden transition-all duration-300 hover:-translate-y-1 ${
                    prog.isRetreat
                      ? "bg-gradient-to-b from-green-50 to-white ring-2 ring-primary shadow-lg hover:shadow-2xl md:col-span-2 lg:col-span-1"
                      : "bg-white border border-border hover:shadow-xl"
                  }`}
                >
                  {/* Image Area */}
                  <div className={`relative overflow-hidden flex items-center justify-center ${prog.isRetreat ? "h-56" : "h-48"}`}>
                    <img src={prog.image} alt={prog.title} className="absolute inset-0 w-full h-full object-cover" loading="lazy" />
                    <div className={`absolute inset-0 ${prog.isRetreat ? "bg-gradient-to-b from-primary/60 to-black/50" : "bg-black/40"}`} />
                    <div className="relative text-center text-white z-10">
                      {prog.isRetreat && <span className="text-4xl block mb-2">🌱</span>}
                      {!prog.isRetreat && <Icon size={40} className="mx-auto mb-2 opacity-80" />}
                      <p className={`font-bold ${prog.isRetreat ? "text-xl" : "text-lg"}`}>{prog.title}</p>
                      {prog.isRetreat && <p className="text-white/70 text-sm mt-1">몸, 마음, 의식을 깨우는 1박 2일</p>}
                    </div>
                    {prog.isJiff && (
                      <div className="absolute top-3 left-3 bg-yellow-500 text-black text-xs font-bold px-3 py-1.5 rounded-full animate-pulse shadow-md">
                        🎬 영화제 특가
                      </div>
                    )}
                    {prog.isRetreat && (
                      <div className="absolute top-3 left-3 bg-red-500 text-white text-xs font-bold px-3 py-1.5 rounded-full animate-pulse shadow-md">
                        🔥 추천 프로그램
                      </div>
                    )}
                    {prog.isVibeCoding && (
                      <div className="absolute top-3 left-3 bg-primary text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-md">
                        💻 NEW 프로그램
                      </div>
                    )}
                    {prog.isMembership && (
                      <div className="absolute top-3 left-3 bg-emerald-600 text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-md">
                        📚 멤버십
                      </div>
                    )}
                    {prog.soldOut && (
                      <div className="absolute inset-0 bg-black/50 flex items-center justify-center z-20">
                        <span className="bg-red-600 text-white text-lg font-black px-6 py-2 rounded-full -rotate-12 shadow-xl">SOLD OUT</span>
                      </div>
                    )}
                    {prog.highlight && !prog.isRetreat && (
                      <div className="absolute top-3 left-3 bg-white/20 backdrop-blur-sm text-white text-xs font-bold px-3 py-1 rounded-full">
                        BEST
                      </div>
                    )}
                    {prog.isEvent && (
                      <div className="absolute top-3 left-3 bg-red-500/90 backdrop-blur-sm text-white text-xs font-bold px-3 py-1 rounded-full">
                        EVENT 무료
                      </div>
                    )}
                    {prog.isJiff && (
                      <div className="absolute top-3 right-3 bg-yellow-400 text-black text-xs font-bold px-3 py-1.5 rounded-full shadow">
                        4.29~5.8
                      </div>
                    )}
                    {prog.isRetreat && (
                      <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm text-primary text-xs font-bold px-3 py-1.5 rounded-full shadow">
                        4.18(토)~19(일)
                      </div>
                    )}
                    {prog.isVibeCoding && (
                      <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm text-primary text-xs font-bold px-3 py-1.5 rounded-full shadow">
                        일정 추후 공지
                      </div>
                    )}
                    {prog.isMembership && (
                      <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm text-emerald-700 text-xs font-bold px-3 py-1.5 rounded-full shadow">
                        상시 모집
                      </div>
                    )}
                  </div>

                  {/* Content */}
                  <div className="p-6">
                    {/* Tags */}
                    <div className="flex flex-wrap gap-1.5 mb-4">
                      {prog.tags.map((tag, j) => (
                        <span
                          key={j}
                          className={`text-xs px-2.5 py-1 rounded-full font-medium ${prog.tagColors[j]}`}
                        >
                          {tag}
                        </span>
                      ))}
                    </div>

                    <h3 className="text-lg font-bold text-text-dark mb-1">
                      {prog.title}
                    </h3>
                    <p className="text-sm text-text-light mb-4">{prog.duration}</p>

                    {/* Price */}
                    {prog.isJiff ? (
                      <>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-sm text-gray-400 line-through">{(prog.originalPrice ?? 0).toLocaleString()}원</span>
                          <span className="text-xs bg-yellow-500 text-black px-2 py-0.5 rounded-full font-bold">20% OFF</span>
                        </div>
                        <div className="flex items-baseline gap-1.5 mb-2">
                          <span className="text-3xl font-black text-amber-600">{prog.price.toLocaleString()}</span>
                          <span className="text-sm text-text-light">원</span>
                        </div>
                        <p className="text-xs font-bold text-amber-600 mb-5">
                          🎬 10일 한정 · 현물 19만원 무료
                        </p>
                      </>
                    ) : prog.isRetreat ? (
                      <>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-sm text-gray-400 line-through">{(prog.originalPrice ?? 0).toLocaleString()}원</span>
                          <span className="text-xs bg-red-500 text-white px-2 py-0.5 rounded-full font-bold">69% OFF</span>
                        </div>
                        <div className="flex items-baseline gap-1.5 mb-2">
                          <span className="text-3xl font-black text-primary">{prog.price.toLocaleString()}</span>
                          <span className="text-sm text-text-light">원/인</span>
                        </div>
                        <p className="text-xs font-bold text-red-500 mb-5">
                          🔥 얼리버드 특가 · 20명 한정!
                        </p>
                      </>
                    ) : prog.isVibeCoding ? (
                      <>
                        <div className="flex items-baseline gap-1.5 mb-1">
                          <span className="text-2xl font-black text-primary">{prog.price.toLocaleString()}</span>
                          <span className="text-sm text-text-light">원</span>
                        </div>
                        <p className="text-xs text-text-light mb-5">
                          6시간 · 20명 한정
                        </p>
                      </>
                    ) : prog.isMembership ? (
                      <>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-2xl font-black text-emerald-600">무료</span>
                          <span className="text-xs bg-emerald-100 text-emerald-600 px-2 py-0.5 rounded-full font-bold">신청 무료</span>
                        </div>
                        <p className="text-xs text-text-light mb-5">
                          가입비 없이 멤버십 혜택을 받아보세요
                        </p>
                      </>
                    ) : prog.isEvent ? (
                      <>
                        <div className="flex items-end gap-2 mb-1">
                          <span className="text-sm text-text-light line-through">{(prog.originalPrice ?? 0).toLocaleString()}원/인</span>
                        </div>
                        <div className="flex items-center gap-2 mb-4">
                          <span className="text-2xl font-bold text-red-500">무료</span>
                          <span className="text-xs bg-red-100 text-red-600 px-2 py-0.5 rounded-full font-semibold">초기 이벤트</span>
                        </div>
                        <p className="text-xs text-text-light mb-5">
                          회당 최대 6명 / 1회 20분
                        </p>
                      </>
                    ) : prog.isHealing ? (
                      <>
                        <div className="flex items-end gap-2 mb-4">
                          <span className="text-2xl font-bold text-text-dark">
                            {prog.price.toLocaleString()}
                          </span>
                          <span className="text-sm text-text-light mb-0.5">원/인</span>
                        </div>
                        <p className="text-xs text-text-light mb-5">
                          최소 10명 ~ 최대 15명 / 1박 2일
                        </p>
                      </>
                    ) : (
                      <>
                        <div className="flex items-end gap-2 mb-4">
                          <span className="text-2xl font-bold text-text-dark">
                            {prog.price.toLocaleString()}
                          </span>
                          <span className="text-sm text-text-light mb-0.5">원</span>
                        </div>
                        <p className="text-xs text-text-light mb-5">
                          기본 15명 / 추가 인원 제한 없음
                        </p>
                      </>
                    )}

                    {prog.isJiff ? (
                      <Link
                        href="/programs/jiff"
                        className="block w-full py-3 rounded-xl font-semibold text-sm transition-all bg-amber-500/10 text-amber-600 hover:bg-amber-500 hover:text-white text-center"
                      >
                        🎬 JIFF STAY 자세히 보기 →
                      </Link>
                    ) : prog.isRetreat ? (
                      <Link
                        href="/programs/spring-retreat"
                        className="block w-full py-3 rounded-xl font-semibold text-sm transition-all bg-primary/10 text-primary hover:bg-primary hover:text-white text-center"
                      >
                        추가혜택 확인 →
                      </Link>
                    ) : prog.isVibeCoding ? (
                      <Link
                        href="/programs/vibe-coding"
                        className={`block w-full py-3 rounded-xl font-semibold text-sm transition-all text-center ${
                          prog.soldOut
                            ? "bg-gray-200 text-gray-500 cursor-not-allowed"
                            : "bg-primary/10 text-primary hover:bg-primary hover:text-white"
                        }`}
                      >
                        {prog.soldOut ? "마감 — 상세보기 →" : "상세보기 →"}
                      </Link>
                    ) : prog.isMembership ? (
                      <div className="space-y-2">
                        <a
                          href="https://web-snail1.vercel.app/"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="block w-full py-3 rounded-xl font-semibold text-sm transition-all text-center bg-primary/10 text-primary hover:bg-primary hover:text-white"
                        >
                          멤버십 살펴보기 →
                        </a>
                        <a
                          href="https://web-snail1.vercel.app/"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="block w-full py-3 rounded-xl font-semibold text-sm transition-all text-center bg-primary/10 text-primary hover:bg-primary hover:text-white"
                        >
                          📮 무료 레터 먼저 구독
                        </a>
                      </div>
                    ) : (
                      <button
                        onClick={() => setSelectedProgram(originalIndex)}
                        className="w-full py-3 rounded-xl font-semibold text-sm transition-all bg-primary/10 text-primary hover:bg-primary hover:text-white"
                      >
                        자세히 보기
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Program Detail Popup */}
      {popupProgram && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 animate-fade-in">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setSelectedProgram(null)} />
          <div className="relative bg-white rounded-3xl max-w-lg w-full max-h-[90vh] overflow-y-auto shadow-2xl animate-scale-in">
            {/* Header */}
            <div className="relative h-44 rounded-t-3xl flex items-center justify-center overflow-hidden">
              <img src={popupProgram.image} alt={popupProgram.title} className="absolute inset-0 w-full h-full object-cover" />
              <div className="absolute inset-0 bg-black/40 rounded-t-3xl" />
              <div className="relative text-center text-white z-10">
                <popupProgram.icon size={36} className="mx-auto mb-2 opacity-90" />
                <h3 className="text-2xl font-bold">{popupProgram.title}</h3>
                <p className="text-white/70 text-sm mt-1">{popupProgram.duration}</p>
              </div>
              <button
                onClick={() => setSelectedProgram(null)}
                className="absolute top-4 right-4 w-8 h-8 rounded-full bg-black/20 backdrop-blur-sm flex items-center justify-center text-white hover:bg-black/40 transition-colors z-10"
              >
                <X size={16} />
              </button>
            </div>

            <div className="p-5 sm:p-8">
              {/* Tags */}
              <div className="flex flex-wrap gap-1.5 mb-4">
                {popupProgram.tags.map((tag, j) => (
                  <span key={j} className={`text-xs px-2.5 py-1 rounded-full font-medium ${popupProgram.tagColors[j]}`}>
                    {tag}
                  </span>
                ))}
              </div>

              {/* Price */}
              {popupProgram.isEvent ? (
                <div className="mb-6">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-sm text-text-light line-through">{(popupProgram.originalPrice ?? 0).toLocaleString()}원/인</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-2xl sm:text-3xl font-bold text-red-500">무료</span>
                    <span className="text-xs bg-red-100 text-red-600 px-2.5 py-1 rounded-full font-semibold">초기 이벤트</span>
                  </div>
                  <p className="text-xs text-text-light mt-2">정가 현금 5,000원 / 카드 5,500원 · 회당 최대 6명 · 1회 20분</p>
                </div>
              ) : popupProgram.isHealing ? (
                <div className="mb-6">
                  <div className="flex flex-wrap items-end gap-1 sm:gap-2">
                    <span className="text-2xl sm:text-3xl font-bold text-text-dark">
                      {popupProgram.price.toLocaleString()}
                    </span>
                    <span className="text-sm text-text-light mb-0.5 sm:mb-1">원/인</span>
                  </div>
                  <p className="text-xs text-text-light mt-2">최소 10명 ~ 최대 15명 · 1박 2일 (15:00 입실 ~ 익일 11:00 퇴실)</p>
                  <div className="mt-3 p-3 bg-emerald-50 border border-emerald-200 rounded-xl">
                    <p className="text-xs font-semibold text-emerald-700 mb-1">1박 2일 타임테이블</p>
                    <div className="text-xs text-emerald-600 space-y-0.5">
                      <p><span className="font-semibold">DAY 1</span></p>
                      <p>15:00 입실 · 웰컴티/다과 · 자기소개</p>
                      <p>15:30 프로그램① 필라테스 (엉덩이와 호흡)</p>
                      <p>16:30 프로그램② 바하바나 & 만트라 명상</p>
                      <p>18:00 석식 (소양 맛집 화심두부마을)</p>
                      <p>20:00 프로그램③ 자기탐색 글쓰기 + 불멍</p>
                      <p>21:00 프로그램④ 싱잉볼 테라피 체험</p>
                      <p>22:00~ 자유 네트워킹 · 별보기</p>
                      <p className="mt-1"><span className="font-semibold">DAY 2</span></p>
                      <p>08:00 건강한 조식</p>
                      <p>09:00 프로그램⑤ 걷기 명상 (오소소 둘렛길)</p>
                      <p>11:00 퇴실</p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex flex-wrap items-end gap-1 sm:gap-2 mb-6">
                  <span className="text-2xl sm:text-3xl font-bold text-text-dark">
                    {popupProgram.price.toLocaleString()}
                  </span>
                  <span className="text-sm text-text-light mb-0.5 sm:mb-1">원</span>
                  <span className="text-xs sm:text-sm text-text-light mb-0.5 sm:mb-1 ml-1">
                    (기본 15명 / 추가 1인 {pricing.extraGuest.toLocaleString()}원)
                  </span>
                </div>
              )}

              {/* Description */}
              <p className="text-text-mid text-sm leading-relaxed mb-6">
                {popupProgram.description}
              </p>

              {/* Features */}
              <div className="mb-6">
                <p className="text-sm font-semibold text-text-dark mb-3">포함 사항</p>
                <div className="space-y-2">
                  {popupProgram.features.map((feat, i) => (
                    <div key={i} className="flex items-center gap-3 bg-sage/50 rounded-xl px-4 py-3 text-sm text-text-mid">
                      <Check size={14} className="text-primary flex-shrink-0" />
                      {feat}
                    </div>
                  ))}
                </div>
              </div>

              {/* Extras */}
              {popupProgram.extras.length > 0 && (
                <div className="mb-6">
                  <p className="text-sm font-semibold text-text-dark mb-3">추가 가능</p>
                  <div className="space-y-2">
                    {popupProgram.extras.map((ext, i) => (
                      <div key={i} className="flex items-center gap-3 bg-amber-50 rounded-xl px-4 py-3 text-sm text-text-mid">
                        <span className="text-amber-500 flex-shrink-0 font-bold text-xs">+</span>
                        {ext}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Info */}
              <div className="grid grid-cols-3 gap-3 mb-6">
                <div className="bg-sage/30 rounded-xl p-3 text-center">
                  <Users size={16} className="mx-auto text-primary mb-1" />
                  <p className="text-xs text-text-light">최대 인원</p>
                  <p className="text-sm font-semibold text-text-dark">{popupProgram.maxPeople}</p>
                </div>
                <div className="bg-sage/30 rounded-xl p-3 text-center">
                  <Clock size={16} className="mx-auto text-primary mb-1" />
                  <p className="text-xs text-text-light">소요 시간</p>
                  <p className="text-sm font-semibold text-text-dark">{popupProgram.duration}</p>
                </div>
                <div className="bg-sage/30 rounded-xl p-3 text-center">
                  <MapPin size={16} className="mx-auto text-primary mb-1" />
                  <p className="text-xs text-text-light">장소</p>
                  <p className="text-sm font-semibold text-text-dark">완주</p>
                </div>
              </div>

              <button
                onClick={() => {
                  if (selectedProgram !== null) {
                    setSelectedProgramId(PROGRAM_IDS[selectedProgram]);
                  }
                  setSelectedProgram(null);
                  document.getElementById("reservation")?.scrollIntoView({ behavior: "smooth" });
                }}
                className="block w-full bg-primary text-white text-center py-4 rounded-2xl font-semibold hover:bg-primary-light transition-colors"
              >
                이 프로그램 예약하기
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
