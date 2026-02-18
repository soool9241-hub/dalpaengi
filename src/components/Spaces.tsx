"use client";

import { useState } from "react";
import { Users, Maximize, Wifi, Car, Coffee, Utensils, Eye, Shield, TreePine } from "lucide-react";

const spaces = [
  {
    name: "회의실",
    capacity: "최대 20인",
    size: "60평",
    desc: "빔프로젝터, 화이트보드, 음향 시스템 완비. 워크숍, 세미나에 최적화된 공간입니다.",
    amenities: ["빔프로젝터", "음향시스템", "화이트보드", "Wi-Fi"],
    gradient: "from-blue-500 to-indigo-600",
  },
  {
    name: "스탠다드룸",
    capacity: "2인실",
    size: "15평",
    desc: "아늑한 2인 객실. 통유리 창을 통해 숲속 풍경을 감상할 수 있습니다.",
    amenities: ["퀸베드", "개별 욕실", "미니바", "에어컨"],
    gradient: "from-emerald-500 to-teal-600",
  },
  {
    name: "디럭스룸",
    capacity: "2~3인실",
    size: "25평",
    desc: "넓은 거실과 테라스가 있는 프리미엄 객실. 가족 단위에 추천합니다.",
    amenities: ["킹베드", "테라스", "거실", "욕조"],
    gradient: "from-amber-500 to-orange-600",
  },
  {
    name: "다이닝룸",
    capacity: "최대 30인",
    size: "40평",
    desc: "단체 식사와 파티를 위한 넓은 공간. 바베큐 시설과 연결되어 있습니다.",
    amenities: ["테이블 6개", "바베큐 연결", "냉장고", "식기류"],
    gradient: "from-rose-500 to-pink-600",
  },
];

const features = [
  { icon: Eye, label: "360° VR 투어 제공" },
  { icon: TreePine, label: "전 객실 자연 조망" },
  { icon: Shield, label: "프라이빗 공간" },
];

export default function Spaces() {
  const [active, setActive] = useState(0);

  return (
    <section id="spaces" className="py-16 sm:py-24 px-4 bg-white">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-6">
          <p className="text-primary text-sm font-semibold tracking-widest uppercase mb-3">
            HEALING SPACES
          </p>
          <h2 className="text-3xl sm:text-4xl font-bold text-text-dark mb-4">
            힐링 스페이스 둘러보기
          </h2>
          <p className="text-text-light max-w-lg mx-auto">
            지친 일상에서 하나씩 벗어날 수 있는 특별한 공간
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
              className={`px-6 py-2.5 rounded-full text-sm font-medium transition-all ${
                active === i
                  ? "bg-primary text-white shadow-md"
                  : "bg-sage text-text-mid hover:bg-sage-dark"
              }`}
            >
              {space.name}
            </button>
          ))}
        </div>

        {/* Active space detail */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
          {/* Visual - VR Tour Area */}
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
                <p className="text-6xl font-bold opacity-20 mb-2">
                  {String(active + 1).padStart(2, "0")}
                </p>
                <p className="text-2xl font-bold">{spaces[active].name}</p>
                <p className="text-white/70 text-sm mt-1">
                  {spaces[active].capacity} &middot; {spaces[active].size}
                </p>
              </div>

              {/* 360 VR badge */}
              <div className="absolute top-4 right-4 bg-white/20 backdrop-blur-sm rounded-full px-4 py-2 text-white text-xs font-medium flex items-center gap-1.5">
                <Eye size={14} />
                360° VR 투어
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
              {spaces[active].name}
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
            <div className="grid grid-cols-2 gap-3 mb-8">
              {spaces[active].amenities.map((a, j) => (
                <div
                  key={j}
                  className="flex items-center gap-2.5 bg-sage/50 rounded-xl px-4 py-3 text-sm text-text-mid"
                >
                  {j === 0 && <Coffee size={14} className="text-primary flex-shrink-0" />}
                  {j === 1 && <Wifi size={14} className="text-primary flex-shrink-0" />}
                  {j === 2 && <Utensils size={14} className="text-primary flex-shrink-0" />}
                  {j === 3 && <Car size={14} className="text-primary flex-shrink-0" />}
                  {a}
                </div>
              ))}
            </div>

            <a
              href="#reservation"
              className="inline-block bg-primary text-white px-8 py-3.5 rounded-full text-sm font-semibold hover:bg-primary-light transition-all shadow-md hover:shadow-lg"
            >
              이 공간 예약하기
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
