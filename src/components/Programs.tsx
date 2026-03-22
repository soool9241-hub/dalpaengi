"use client";

import { useState, useMemo } from "react";
import { Moon, Clock, Sun, Check, X, Users, MapPin, Utensils, GraduationCap, Boxes, Heart } from "lucide-react";
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

const PROGRAM_IDS = ["stay", "stay", "half", "daynight", "jolib", "healing"] as const;

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
      image: "/img/exterior-front.jpg",
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
      image: "/img/nature-yard.jpg",
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
                  className="group bg-white rounded-3xl overflow-hidden border border-border hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
                >
                  {/* Image Area */}
                  <div className="relative h-48 overflow-hidden flex items-center justify-center">
                    <img src={prog.image} alt={prog.title} className="absolute inset-0 w-full h-full object-cover" loading="lazy" />
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
                    {prog.isEvent && (
                      <div className="absolute top-3 left-3 bg-red-500/90 backdrop-blur-sm text-white text-xs font-bold px-3 py-1 rounded-full">
                        EVENT 무료
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
                    {prog.isEvent ? (
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
