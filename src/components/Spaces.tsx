"use client";

import { useState } from "react";
import { Users, Maximize, Bed, Bath, CookingPot, Sofa, DoorOpen, ShowerHead, TreePine, Shield } from "lucide-react";

const spaces = [
  {
    name: "넓은 거실 & 야외공간",
    capacity: "전체 이용",
    size: "30평+",
    desc: "60명 이상 수용 가능한 넓은 거실에 100인치 대형 TV, 전자레인지 4개, 정수기, 개별 난방기가 설치되어 있습니다. 마당 앞 야외 바베큐 공간에서 그릴 최대 6개 동시 이용 가능하며, 야외 식사 공간도 마련되어 있습니다.",
    amenities: ["100인치 TV", "전자레인지 4개", "정수기", "개별 난방기", "야외 바베큐 (최대 6개)", "야외 식사공간"],
    gradient: "from-emerald-500 to-teal-600",
    icon: "🏠",
  },
  {
    name: "방 4개",
    capacity: "각 방 10~15명",
    size: "각 8~12평",
    desc: "총 4개의 넓은 방이 준비되어 있습니다. 각 방마다 이불과 베개가 구비되어 있으며, 에어컨과 난방이 개별 조절 가능합니다. 단체 인원도 편하게 취침할 수 있습니다.",
    amenities: ["이불/베개 제공", "에어컨/난방", "콘센트 다수", "조명 개별조절"],
    gradient: "from-violet-500 to-purple-600",
    icon: "🛏️",
  },
  {
    name: "부엌",
    capacity: "조리 가능",
    size: "15평",
    desc: "넓은 부엌에서 단체 조리가 가능합니다. 냉장고, 가스렌지, 전자레인지, 식기류 등 기본 조리도구가 완비되어 있습니다. 바베큐장과 바로 연결됩니다.",
    amenities: ["대형 냉장고", "가스렌지", "전자레인지", "식기류 완비"],
    gradient: "from-amber-500 to-orange-600",
    icon: "🍳",
  },
  {
    name: "남녀 화장실 & 샤워",
    capacity: "샤워부스 각 4개",
    size: "남녀 분리",
    desc: "남녀 화장실이 완전 분리되어 있으며, 각각 샤워부스 4개씩 총 8개가 설치되어 있습니다. 대인원도 대기 없이 쾌적하게 이용 가능합니다. 온수 24시간 가능.",
    amenities: ["샤워부스 남4 여4", "온수 24시간", "드라이기 비치", "수건 제공"],
    gradient: "from-sky-500 to-blue-600",
    icon: "🚿",
  },
];

const features = [
  { icon: TreePine, label: "자연 속 독채 펜션" },
  { icon: Shield, label: "프라이빗 공간" },
  { icon: Users, label: "최대 60명 수용" },
];

const ICON_MAP = [Sofa, Bed, CookingPot, ShowerHead];

export default function Spaces() {
  const [active, setActive] = useState(0);

  return (
    <section id="spaces" className="py-16 sm:py-24 px-4 bg-white">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-6">
          <p className="text-primary text-sm font-semibold tracking-widest uppercase mb-3">
            SPACES
          </p>
          <h2 className="text-3xl sm:text-4xl font-bold text-text-dark mb-4">
            공간 둘러보기
          </h2>
          <p className="text-text-light max-w-lg mx-auto">
            독채 전체를 사용하는 프라이빗한 공간 구성
          </p>
        </div>

        {/* Feature badges */}
        <div className="flex flex-wrap justify-center gap-3 mb-12">
          {features.map((f, i) => (
            <div key={i} className="flex items-center gap-2 bg-sage/50 rounded-full px-4 py-2 text-sm text-text-mid">
              <f.icon size={14} className="text-primary" />
              {f.label}
            </div>
          ))}
        </div>

        {/* Tab buttons */}
        <div className="flex flex-wrap justify-center gap-3 mb-12">
          {spaces.map((space, i) => (
            <button
              key={i}
              onClick={() => setActive(i)}
              className={`px-5 py-2.5 rounded-full text-sm font-medium transition-all ${
                active === i
                  ? "bg-primary text-white shadow-md"
                  : "bg-sage text-text-mid hover:bg-sage-dark"
              }`}
            >
              <span className="mr-1.5">{space.icon}</span>
              {space.name}
            </button>
          ))}
        </div>

        {/* Active space detail */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
          {/* Visual */}
          <div className="relative">
            <div
              className={`relative h-72 sm:h-96 rounded-3xl bg-gradient-to-br ${spaces[active].gradient} flex items-center justify-center overflow-hidden transition-all duration-500`}
            >
              <div className="absolute inset-0 opacity-20">
                <div
                  className="w-full h-full"
                  style={{
                    backgroundImage:
                      "repeating-linear-gradient(45deg, transparent, transparent 35px, rgba(255,255,255,0.1) 35px, rgba(255,255,255,0.1) 70px)",
                  }}
                />
              </div>
              <div className="relative text-center text-white z-10">
                <p className="text-6xl mb-3">{spaces[active].icon}</p>
                <p className="text-2xl font-bold">{spaces[active].name}</p>
                <p className="text-white/70 text-sm mt-1">
                  {spaces[active].capacity} &middot; {spaces[active].size}
                </p>
              </div>

              {/* Navigation dots */}
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
                {spaces.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setActive(i)}
                    className={`w-2 h-2 rounded-full transition-all ${
                      active === i ? "bg-white w-6" : "bg-white/40"
                    }`}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Info */}
          <div key={active} className="animate-fade-in">
            <h3 className="text-2xl font-bold text-text-dark mb-2">
              {spaces[active].icon} {spaces[active].name}
            </h3>
            <div className="flex items-center gap-4 mb-4">
              <span className="flex items-center gap-1.5 text-sm text-text-light bg-sage rounded-full px-3 py-1">
                <Users size={14} /> {spaces[active].capacity}
              </span>
              <span className="flex items-center gap-1.5 text-sm text-text-light bg-sage rounded-full px-3 py-1">
                <Maximize size={14} /> {spaces[active].size}
              </span>
            </div>
            <p className="text-text-mid mb-8 leading-relaxed">
              {spaces[active].desc}
            </p>

            <p className="text-sm font-semibold text-text-dark mb-3">
              주요 시설
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-8">
              {spaces[active].amenities.map((a, j) => {
                const IconComp = ICON_MAP[active] || DoorOpen;
                return (
                  <div
                    key={j}
                    className="flex items-center gap-2.5 bg-sage/50 rounded-xl px-4 py-3 text-sm text-text-mid"
                  >
                    <IconComp size={14} className="text-primary flex-shrink-0" />
                    {a}
                  </div>
                );
              })}
            </div>

            {/* 전체 구조 요약 */}
            <div className="grid grid-cols-4 gap-2 mb-6">
              {spaces.map((s, i) => (
                <button
                  key={i}
                  onClick={() => setActive(i)}
                  className={`text-center p-3 rounded-xl transition-all ${
                    active === i
                      ? "bg-primary/10 border-2 border-primary"
                      : "bg-sage/30 border-2 border-transparent hover:border-primary/20"
                  }`}
                >
                  <span className="text-xl block mb-1">{s.icon}</span>
                  <span className={`text-[11px] font-medium ${active === i ? "text-primary" : "text-text-light"}`}>{s.name}</span>
                </button>
              ))}
            </div>

            <a
              href="#reservation"
              className="inline-block bg-primary text-white px-8 py-3.5 rounded-full text-sm font-semibold hover:bg-primary-light transition-all shadow-md hover:shadow-lg"
            >
              예약하기
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
