"use client";

import { useState } from "react";
import { X, ChevronLeft, ChevronRight } from "lucide-react";

const categories = [
  { id: "all", label: "전체" },
  { id: "exterior", label: "외관/야외" },
  { id: "living", label: "거실" },
  { id: "room", label: "방" },
  { id: "kitchen", label: "부엌/식당" },
  { id: "bath", label: "화장실/샤워" },
  { id: "activity", label: "활동/모임" },
];

const photos = [
  // 외관/야외
  { src: "/images/exterior-main.jpg", cat: "exterior", label: "펜션 전경 (산 배경)" },
  { src: "/images/exterior-front.jpg", cat: "exterior", label: "본관 정면" },
  { src: "/images/exterior-side.jpg", cat: "exterior", label: "본관 측면" },
  { src: "/images/entrance.jpg", cat: "exterior", label: "입구" },
  { src: "/images/bbq-area.jpg", cat: "exterior", label: "야외 바베큐 공간" },
  { src: "/images/bbq-tables.jpg", cat: "exterior", label: "야외 테이블" },
  { src: "/images/nature-yard.jpg", cat: "exterior", label: "자연 속 마당" },
  // 거실
  { src: "/images/living-room.jpg", cat: "living", label: "거실 대형 TV" },
  { src: "/images/living-room-wide.jpg", cat: "living", label: "거실 전체" },
  { src: "/images/living-tv.jpg", cat: "living", label: "거실 (다른 앵글)" },
  { src: "/images/living-angle2.jpg", cat: "living", label: "거실 측면" },
  { src: "/images/whiteboard.jpg", cat: "living", label: "화이트보드 & 쿠션" },
  { src: "/images/games.jpg", cat: "living", label: "보드게임/놀이도구" },
  // 방
  { src: "/images/room.jpg", cat: "room", label: "방 (이불/창문)" },
  { src: "/images/room2.jpg", cat: "room", label: "방 (TV/이불)" },
  { src: "/images/room-1.jpg", cat: "room", label: "방 1" },
  { src: "/images/room-2.jpg", cat: "room", label: "방 2" },
  { src: "/images/room-3.jpg", cat: "room", label: "방 3" },
  { src: "/images/room-blue.jpg", cat: "room", label: "방 (블루톤)" },
  { src: "/images/vr-tour.jpg", cat: "room", label: "이불/침구 보관" },
  // 부엌/식당
  { src: "/images/kitchen.jpg", cat: "kitchen", label: "부엌 (타일)" },
  { src: "/images/kitchen-wide.jpg", cat: "kitchen", label: "부엌+식당 연결" },
  { src: "/images/kitchen-detail.jpg", cat: "kitchen", label: "부엌+식탁 전경" },
  { src: "/images/kitchen-dining.jpg", cat: "kitchen", label: "식당 전경" },
  { src: "/images/dining-room.jpg", cat: "kitchen", label: "대형 식탁" },
  { src: "/images/dining-wide.jpg", cat: "kitchen", label: "식당 (넓은 앵글)" },
  { src: "/images/window-view.jpg", cat: "kitchen", label: "창문 뷰" },
  // 화장실/샤워
  { src: "/images/shower.jpg", cat: "bath", label: "샤워부스" },
  { src: "/images/shower-2.jpg", cat: "bath", label: "샤워실 2" },
  { src: "/images/bathroom.jpg", cat: "bath", label: "화장실" },
  { src: "/images/toilet.jpg", cat: "bath", label: "화장실 (세면대)" },
  // 활동/모임
  { src: "/images/bbq-night.jpg", cat: "activity", label: "야간 바베큐 (MT)" },
  { src: "/images/outdoor-night.jpg", cat: "activity", label: "야외 캠프파이어" },
  { src: "/images/bbq-night-2.jpg", cat: "activity", label: "야간 모임" },
  { src: "/images/campfire.jpg", cat: "activity", label: "캠프파이어" },
  { src: "/images/group-indoor.jpg", cat: "activity", label: "단체 실내 모임" },
  { src: "/images/group-indoor-2.jpg", cat: "activity", label: "대가족 식사" },
  { src: "/images/group-dining.jpg", cat: "activity", label: "단체 식사" },
  { src: "/images/yoga.jpg", cat: "activity", label: "요가/명상" },
  { src: "/images/yoga-lying.jpg", cat: "activity", label: "힐링 프로그램" },
  { src: "/images/group-event.jpg", cat: "activity", label: "단체 행사" },
  { src: "/images/living-yoga.jpg", cat: "activity", label: "거실 요가 수업" },
];

export default function Gallery() {
  const [filter, setFilter] = useState("all");
  const [lightbox, setLightbox] = useState<number | null>(null);

  const filtered = filter === "all" ? photos : photos.filter((p) => p.cat === filter);

  const openLightbox = (idx: number) => setLightbox(idx);
  const closeLightbox = () => setLightbox(null);

  const goPrev = () => {
    if (lightbox === null) return;
    setLightbox((lightbox - 1 + filtered.length) % filtered.length);
  };
  const goNext = () => {
    if (lightbox === null) return;
    setLightbox((lightbox + 1) % filtered.length);
  };

  return (
    <>
      <section id="gallery" className="py-16 sm:py-24 px-4 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-10">
            <p className="text-primary text-sm font-semibold tracking-widest uppercase mb-3">
              GALLERY
            </p>
            <h2 className="text-3xl sm:text-4xl font-bold text-text-dark mb-4">
              사진으로 만나보세요
            </h2>
            <p className="text-text-light max-w-lg mx-auto">
              달팽이아지트의 다양한 공간과 활동을 사진으로 확인하세요
            </p>
          </div>

          {/* Filter */}
          <div className="flex flex-wrap justify-center gap-2 mb-10">
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setFilter(cat.id)}
                className={`px-5 py-2 rounded-full text-sm font-medium transition-all ${
                  filter === cat.id
                    ? "bg-primary text-white shadow-md"
                    : "bg-sage text-text-mid hover:bg-sage-dark"
                }`}
              >
                {cat.label}
                {cat.id !== "all" && (
                  <span className="ml-1 text-xs opacity-70">
                    ({photos.filter((p) => p.cat === cat.id).length})
                  </span>
                )}
              </button>
            ))}
          </div>

          {/* Photo Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
            {filtered.map((photo, i) => (
              <button
                key={photo.src}
                onClick={() => openLightbox(i)}
                className="group relative aspect-[4/3] rounded-2xl overflow-hidden cursor-pointer"
              >
                <img
                  src={photo.src}
                  alt={photo.label}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors duration-300" />
                <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <p className="text-white text-xs font-medium">{photo.label}</p>
                </div>
              </button>
            ))}
          </div>

          <div className="text-center mt-6">
            <p className="text-sm text-text-light">
              총 <span className="font-semibold text-primary">{filtered.length}</span>장의 사진
            </p>
          </div>
        </div>
      </section>

      {/* Lightbox */}
      {lightbox !== null && (
        <div className="fixed inset-0 z-[200] bg-black/95 flex items-center justify-center animate-fade-in">
          {/* Close */}
          <button
            onClick={closeLightbox}
            className="absolute top-4 right-4 w-10 h-10 rounded-full bg-white/10 text-white flex items-center justify-center hover:bg-white/20 transition-colors z-20"
          >
            <X size={20} />
          </button>

          {/* Counter */}
          <div className="absolute top-5 left-1/2 -translate-x-1/2 text-white/60 text-sm z-20">
            {lightbox + 1} / {filtered.length}
          </div>

          {/* Prev */}
          <button
            onClick={goPrev}
            className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white/10 text-white flex items-center justify-center hover:bg-white/20 transition-colors z-20"
          >
            <ChevronLeft size={24} />
          </button>

          {/* Image */}
          <div className="max-w-5xl max-h-[85vh] px-16">
            <img
              src={filtered[lightbox].src}
              alt={filtered[lightbox].label}
              className="max-w-full max-h-[80vh] object-contain rounded-lg"
            />
            <p className="text-center text-white/70 text-sm mt-3">{filtered[lightbox].label}</p>
          </div>

          {/* Next */}
          <button
            onClick={goNext}
            className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white/10 text-white flex items-center justify-center hover:bg-white/20 transition-colors z-20"
          >
            <ChevronRight size={24} />
          </button>

          {/* Click backdrop to close */}
          <div className="absolute inset-0 z-10" onClick={closeLightbox} />
        </div>
      )}
    </>
  );
}
