"use client";

import { useState } from "react";
import { Moon, Clock, Sun, Check, X, Users, MapPin, Utensils } from "lucide-react";
import { useReservation } from "@/context/ReservationContext";

const categories = [
  { id: "all", label: "전체" },
  { id: "pension", label: "펜션" },
  { id: "healing", label: "힐링" },
  { id: "education", label: "교육" },
  { id: "family", label: "가족" },
  { id: "health", label: "건강" },
];

const PROGRAM_IDS = ["stay", "half", "daynight"] as const;

const programs = [
  {
    icon: Moon,
    title: "숙박객 전용 패키지",
    duration: "1박 2일",
    price: 700000,
    perPerson: 46667,
    maxPeople: 15,
    categories: ["pension", "healing"],
    tags: ["숙박", "조식포함", "프리미엄"],
    tagColors: ["bg-primary/10 text-primary", "bg-amber-100 text-amber-700", "bg-rose-100 text-rose-600"],
    gradient: "from-primary to-primary-light",
    image: "bg-gradient-to-br from-emerald-700 to-teal-600",
    features: [
      "디럭스룸 1박",
      "조식 & 석식 포함",
      "바베큐 세트 제공",
      "숲속 산책 가이드",
      "명상 프로그램",
    ],
    description: "조용한 자연 속에서 1박 2일 동안 온전한 휴식을 즐기세요. 디럭스룸에서의 편안한 숙박과 함께 건강한 조식, 바베큐 석식, 숲속 산책 가이드, 명상 프로그램까지 모든 것이 포함된 프리미엄 패키지입니다.",
    highlight: true,
  },
  {
    icon: Clock,
    title: "3시간 단위 대여",
    duration: "3시간",
    price: 300000,
    perPerson: 20000,
    maxPeople: 15,
    categories: ["pension", "education"],
    tags: ["단기대여", "미팅", "휴식"],
    tagColors: ["bg-blue-100 text-blue-600", "bg-purple-100 text-purple-600", "bg-sage text-primary"],
    gradient: "from-amber-500 to-orange-500",
    image: "bg-gradient-to-br from-amber-600 to-orange-500",
    features: [
      "회의실 또는 다이닝룸",
      "빔프로젝터 & 음향",
      "음료 서비스",
      "주차 무료",
    ],
    description: "짧은 시간 안에 효율적인 모임이나 워크숍을 진행할 수 있는 패키지입니다. 완벽한 시설과 음료 서비스가 포함되어 있습니다.",
    highlight: false,
  },
  {
    icon: Sun,
    title: "주/야간 패키지",
    duration: "5시간",
    price: 400000,
    perPerson: 26667,
    maxPeople: 15,
    categories: ["pension", "family", "health"],
    tags: ["주간권", "야간권", "파티"],
    tagColors: ["bg-orange-100 text-orange-600", "bg-indigo-100 text-indigo-600", "bg-pink-100 text-pink-600"],
    gradient: "from-rose-500 to-pink-500",
    image: "bg-gradient-to-br from-rose-600 to-pink-500",
    features: [
      "스탠다드룸 이용",
      "바베큐 또는 다과",
      "보드게임 대여",
      "캠프파이어 (야간)",
    ],
    description: "5시간 동안 다양한 활동을 즐길 수 있는 주/야간 패키지입니다. 바베큐, 캠프파이어, 보드게임 등 풍성한 프로그램이 준비되어 있습니다.",
    highlight: false,
  },
];

export default function Programs() {
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
                  <div className={`relative h-48 ${prog.image} flex items-center justify-center`}>
                    <div className="absolute inset-0 bg-black/10" />
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
                      1인당 {Math.round(prog.price / prog.maxPeople).toLocaleString()}원
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
            <div className={`relative h-44 ${popupProgram.image} rounded-t-3xl flex items-center justify-center`}>
              <div className="absolute inset-0 bg-black/20 rounded-t-3xl" />
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

            <div className="p-8">
              {/* Tags */}
              <div className="flex flex-wrap gap-1.5 mb-4">
                {popupProgram.tags.map((tag, j) => (
                  <span key={j} className={`text-xs px-2.5 py-1 rounded-full font-medium ${popupProgram.tagColors[j]}`}>
                    {tag}
                  </span>
                ))}
              </div>

              {/* Price */}
              <div className="flex items-end gap-2 mb-6">
                <span className="text-3xl font-bold text-text-dark">
                  {popupProgram.price.toLocaleString()}
                </span>
                <span className="text-sm text-text-light mb-1">원</span>
                <span className="text-sm text-text-light mb-1 ml-2">
                  (1인당 {Math.round(popupProgram.price / popupProgram.maxPeople).toLocaleString()}원)
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
                  <p className="text-sm font-semibold text-text-dark">{popupProgram.maxPeople}명</p>
                </div>
                <div className="bg-sage/30 rounded-xl p-3 text-center">
                  <Clock size={16} className="mx-auto text-primary mb-1" />
                  <p className="text-xs text-text-light">소요 시간</p>
                  <p className="text-sm font-semibold text-text-dark">{popupProgram.duration}</p>
                </div>
                <div className="bg-sage/30 rounded-xl p-3 text-center">
                  <MapPin size={16} className="mx-auto text-primary mb-1" />
                  <p className="text-xs text-text-light">장소</p>
                  <p className="text-sm font-semibold text-text-dark">평창</p>
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
