"use client";

import { useState, useMemo } from "react";
import Image from "next/image";
import { Moon, Clock, Sun, Check, X, Users, MapPin, Utensils, GraduationCap } from "lucide-react";
import { useReservation } from "@/context/ReservationContext";
import { usePricing } from "@/context/SettingsContext";

const categories = [
  { id: "all", label: "전체" },
  { id: "pension", label: "펜션" },
  { id: "mt", label: "MT/단체" },
  { id: "family", label: "가족" },
  { id: "healing", label: "힐링" },
];

const PROGRAM_IDS = ["stay", "stay", "half", "daynight"] as const;

export default function Programs() {
  const { pricing } = usePricing();

  const programs = useMemo(() => [
    {
      icon: GraduationCap,
      title: "대학생 MT 패키지 (60명 수용가능)",
      duration: "1박 2일",
      price: pricing.stay,
      perPerson: Math.round(pricing.stay / 40),
      maxPeople: "제한없음",
      categories: ["pension", "mt"],
      tags: ["대학MT", "동아리", "대규모"],
      tagColors: ["bg-violet-100 text-violet-600", "bg-blue-100 text-blue-600", "bg-emerald-100 text-emerald-600"],
      gradient: "from-violet-500 to-indigo-500",
      image: "/images/bbq-night.jpg",
      features: [
        "독채 전체 사용 (인원 제한 없음)",
        "그릴 최대 6개 + 숯/토치 세트 제공",
        "넓은 야외 바베큐장",
        "캠프파이어 가능",
        "보드게임/레크레이션 공간",
        "넉넉한 주차장 (대형버스 가능)",
      ],
      description: "대학교 동아리 MT, 학과 MT에 최적화된 패키지! 인원 제한 없이 대규모 단체도 수용 가능합니다. 독채 전체를 사용하여 프라이빗하게 즐기세요. 그릴, 캠프파이어, 넓은 야외 공간까지 MT에 필요한 모든 것이 갖춰져 있습니다. 버스 렌트도 별도 요청 가능!",
      highlight: true,
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
      image: "/images/exterior-front.jpg",
      features: [
        "독채 전체 사용 (1박)",
        "넓은 거실 + 방 3개 + 테라스",
        "바베큐장 이용 가능",
        "넉넉한 주차장 완비",
        `추가 인원 1인 ${pricing.extraGuest.toLocaleString()}원`,
      ],
      description: "15명 기본 독채 숙박 패키지입니다. 가족모임, 지인모임, 워크샵 등 다양한 목적으로 이용 가능합니다. 자연 속 프라이빗한 공간에서 편안한 1박 2일을 보내세요.",
      highlight: true,
    },
    {
      icon: Clock,
      title: "3시간 단위 대여",
      duration: "3시간",
      price: pricing.half,
      perPerson: Math.round(pricing.half / 15),
      maxPeople: "제한없음",
      categories: ["pension", "family"],
      tags: ["단기대여", "미팅", "소모임"],
      tagColors: ["bg-blue-100 text-blue-600", "bg-purple-100 text-purple-600", "bg-sage text-primary"],
      gradient: "from-amber-500 to-orange-500",
      image: "/images/living-room.jpg",
      features: [
        "독채 3시간 이용",
        "오전/낮/오후/저녁 선택",
        "바베큐장 이용 가능",
        "주차 무료",
      ],
      description: "짧은 시간 효율적으로 모임이나 소규모 파티를 진행할 수 있는 패키지입니다. 3시간 단위로 원하는 시간대를 선택하세요.",
      highlight: false,
    },
    {
      icon: Sun,
      title: "주/야간 패키지",
      duration: "5시간",
      price: pricing.daynight,
      perPerson: Math.round(pricing.daynight / 15),
      maxPeople: "제한없음",
      categories: ["pension", "family", "healing"],
      tags: ["주간권", "야간권", "파티"],
      tagColors: ["bg-orange-100 text-orange-600", "bg-indigo-100 text-indigo-600", "bg-pink-100 text-pink-600"],
      gradient: "from-rose-500 to-pink-500",
      image: "/images/outdoor-night.jpg",
      features: [
        "독채 5시간 이용",
        "주간 (10:00~15:00) 또는 야간 (17:00~22:00)",
        "바베큐 또는 다과 준비 가능",
        "캠프파이어 (야간)",
      ],
      description: "5시간 동안 다양한 활동을 즐길 수 있는 주/야간 패키지입니다. 바베큐, 캠프파이어 등 풍성한 프로그램이 준비되어 있습니다.",
      highlight: false,
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
                  className="group bg-white rounded-3xl overflow-hidden border border-border hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
                >
                  {/* Image Area */}
                  <div className="relative h-48 overflow-hidden flex items-center justify-center">
                    <Image src={prog.image} alt={prog.title} fill className="object-cover" sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw" quality={50} />
                    <div className="absolute inset-0 bg-black/40" />
                    <div className="relative text-center text-white z-10">
                      <Icon size={40} className="mx-auto mb-2 opacity-80" />
                      <p className="text-lg font-bold">{prog.title}</p>
                    </div>
                    {prog.highlight && (
                      <div className="absolute top-3 left-3 bg-white/20 backdrop-blur-sm text-white text-xs font-bold px-3 py-1 rounded-full">
                        BEST
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
                    <div className="flex items-end gap-2 mb-4">
                      <span className="text-2xl font-bold text-text-dark">
                        {prog.price.toLocaleString()}
                      </span>
                      <span className="text-sm text-text-light mb-0.5">원</span>
                    </div>
                    <p className="text-xs text-text-light mb-5">
                      기본 15명 / 추가 인원 제한 없음
                    </p>

                    <button
                      onClick={() => setSelectedProgram(originalIndex)}
                      className="w-full py-3 rounded-xl font-semibold text-sm transition-all bg-primary/10 text-primary hover:bg-primary hover:text-white"
                    >
                      자세히 보기
                    </button>
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
              <Image src={popupProgram.image} alt={popupProgram.title} fill className="object-cover" sizes="500px" quality={60} />
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
              <div className="flex flex-wrap items-end gap-1 sm:gap-2 mb-6">
                <span className="text-2xl sm:text-3xl font-bold text-text-dark">
                  {popupProgram.price.toLocaleString()}
                </span>
                <span className="text-sm text-text-light mb-0.5 sm:mb-1">원</span>
                <span className="text-xs sm:text-sm text-text-light mb-0.5 sm:mb-1 ml-1">
                  (기본 15명 / 추가 1인 {pricing.extraGuest.toLocaleString()}원)
                </span>
              </div>

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
