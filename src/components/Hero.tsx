"use client";

import { useState, useMemo, useEffect, useCallback, useRef } from "react";
import { ChevronDown, CalendarCheck, Moon, GraduationCap } from "lucide-react";

const HERO_IMAGES = [
  "/images/exterior-main.jpg",
  "/images/outdoor-night.jpg",
  "/images/exterior-front.jpg",
  "/images/bbq-area.jpg",
  "/images/living-room-wide.jpg",
  "/images/bbq-night.jpg",
];
import { useReservation } from "@/context/ReservationContext";

function dateToStr(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

const DAY_LABELS = ["일", "월", "화", "수", "목", "금", "토"];

const HERO_PROGRAMS = [
  { id: "stay" as const, label: "숙박 패키지", icon: Moon },
  { id: "stay" as const, label: "대학생 MT", icon: GraduationCap, isMT: true },
];

export default function Hero() {
  const { setSelectedProgramId, setSelectedCheckInDate, setIsMTPackage } = useReservation();
  const [heroImgIdx, setHeroImgIdx] = useState(0);
  const [bookedDates, setBookedDates] = useState<Set<string>>(new Set());

  // Hero background slideshow
  useEffect(() => {
    const timer = setInterval(() => {
      setHeroImgIdx((prev) => (prev + 1) % HERO_IMAGES.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);
  const [selectedHeroProgram, setSelectedHeroProgram] = useState(0); // 0: 숙박, 1: MT
  const [preferredDay, setPreferredDay] = useState(6); // 기본: 토요일

  const fetchBookedDates = useCallback(async () => {
    try {
      const res = await fetch("/api/calendar");
      const json = await res.json();
      const data = json.dates || [];

      const dates = new Set<string>();
      data.forEach((r: { reservation_date: string; checkout_date: string | null }) => {
        if (!r.reservation_date) return;
        const start = new Date(r.reservation_date);
        const end = r.checkout_date ? new Date(r.checkout_date) : new Date(r.reservation_date);
        if (!r.checkout_date) end.setDate(end.getDate() + 1);
        for (let d = new Date(start); d < end; d.setDate(d.getDate() + 1)) {
          dates.add(dateToStr(d));
        }
      });
      setBookedDates(dates);
    } catch (err) {
      console.error("예약 날짜 조회 오류:", err);
    }
  }, []);

  useEffect(() => {
    fetchBookedDates();
  }, [fetchBookedDates]);

  const today = new Date();
  const todayStr = dateToStr(today);
  const isTodayAvailable = !bookedDates.has(todayStr);

  // 선호 요일 기준 가능한 날짜 최대 4개
  const availableDates = useMemo(() => {
    const results: Date[] = [];
    const d = new Date();
    d.setDate(d.getDate() + 1);
    const diff = (preferredDay - d.getDay() + 7) % 7;
    d.setDate(d.getDate() + diff);

    for (let i = 0; i < 52 && results.length < 4; i++) {
      const ds = dateToStr(d);
      if (!bookedDates.has(ds)) {
        results.push(new Date(d));
      }
      d.setDate(d.getDate() + 7);
    }
    return results;
  }, [bookedDates, preferredDay]);

  const formatDate = (d: Date) =>
    `${d.getMonth() + 1}/${d.getDate()}(${DAY_LABELS[d.getDay()]})`;

  const handleDateClick = (d: Date) => {
    const prog = HERO_PROGRAMS[selectedHeroProgram];
    setSelectedProgramId(prog.id);
    setIsMTPackage(!!prog.isMT);
    setSelectedCheckInDate({
      year: d.getFullYear(),
      month: d.getMonth(),
      day: d.getDate(),
    });
    document.getElementById("reservation")?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background Slideshow */}
      {HERO_IMAGES.map((src, i) => (
        <div
          key={src}
          className={`absolute inset-0 bg-cover bg-center transition-opacity duration-[2000ms] ${
            i === heroImgIdx ? "opacity-100" : "opacity-0"
          }`}
          style={{ backgroundImage: `url('${src}')` }}
        />
      ))}
      <div className="absolute inset-0 bg-gradient-to-br from-primary-dark/90 via-primary-dark/80 to-primary-dark/70" />

      <div className="relative z-10 text-center px-4 max-w-4xl mx-auto">
        <div className="animate-fade-in-up">
          <p className="text-white/60 text-sm tracking-[0.3em] uppercase mb-6">
            Healing Stay &middot; Pension
          </p>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white leading-tight mb-6">
            서로다른 우리들의 이야기가
            <br />
            <span className="text-white/90">만들어지는 공간</span>
          </h1>
          <p className="text-white/70 text-xl sm:text-2xl mb-2 font-semibold">
            달팽이 아지트 펜션
          </p>
          <p className="text-white/50 text-sm mb-10 max-w-md mx-auto leading-relaxed">
            전북 완주의 자연 속에서 느리게, 깊이 쉬어가세요.
            <br />
            당신만의 힐링 프로그램이 준비되어 있습니다.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-fade-in-up delay-200 mb-10">
          <a
            href="#programs"
            className="bg-white text-primary-dark px-8 py-4 rounded-full font-semibold text-sm hover:bg-white/90 transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5"
          >
            프로그램 둘러보기
          </a>
          <a
            href="#reservation"
            className="border-2 border-white/40 text-white px-8 py-4 rounded-full font-semibold text-sm hover:bg-white/10 transition-all"
          >
            바로 예약하기
          </a>
        </div>

        {/* 빠른 예약 위젯 */}
        <div className="animate-fade-in delay-300">
          <div className="inline-block bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl px-5 sm:px-8 py-5 w-full max-w-md">

            {/* STEP 1: 프로그램 선택 */}
            <p className="text-white/40 text-[11px] tracking-wider uppercase mb-2">Step 1</p>
            <div className="flex gap-2 mb-4">
              {HERO_PROGRAMS.map((prog, i) => {
                const Icon = prog.icon;
                return (
                  <button
                    key={i}
                    onClick={() => setSelectedHeroProgram(i)}
                    className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-bold transition-all
                      ${selectedHeroProgram === i
                        ? "bg-white text-primary shadow-lg"
                        : "bg-white/10 text-white/60 hover:bg-white/20"}`}
                  >
                    <Icon size={14} />
                    {prog.label}
                  </button>
                );
              })}
            </div>

            {/* STEP 2: 선호 요일 */}
            <p className="text-white/40 text-[11px] tracking-wider uppercase mb-2">Step 2</p>
            <div className="flex items-center justify-center gap-2 mb-1">
              <CalendarCheck size={14} className="text-white/50" />
              <span className="text-white/60 text-xs">선호 요일</span>
            </div>
            <div className="flex justify-center gap-1.5 mb-4">
              {DAY_LABELS.map((label, i) => (
                <button key={label} onClick={() => setPreferredDay(i)}
                  className={`w-9 h-9 rounded-full text-xs font-bold transition-all
                    ${preferredDay === i
                      ? "bg-white text-primary shadow-lg scale-110"
                      : i === 0 ? "bg-white/10 text-red-300 hover:bg-white/20"
                      : i === 6 ? "bg-white/10 text-blue-300 hover:bg-white/20"
                      : "bg-white/10 text-white/60 hover:bg-white/20"}`}>
                  {label}
                </button>
              ))}
            </div>

            {/* 오늘 상태 */}
            <div className="flex items-center justify-center gap-2 mb-3">
              <span className="flex h-2 w-2 relative">
                <span className={`animate-ping absolute inline-flex h-full w-full rounded-full ${isTodayAvailable ? "bg-green-400" : "bg-red-400"} opacity-75`} />
                <span className={`relative inline-flex rounded-full h-2 w-2 ${isTodayAvailable ? "bg-green-400" : "bg-red-400"}`} />
              </span>
              <span className="text-white/80 text-xs">
                오늘 {isTodayAvailable ? <span className="text-green-300 font-semibold">예약 가능</span> : <span className="text-red-300 font-semibold">예약 마감</span>}
              </span>
            </div>

            {/* STEP 3: 가능한 날짜 선택 */}
            <div className="border-t border-white/10 pt-3">
              <p className="text-white/40 text-[11px] tracking-wider uppercase mb-1">Step 3</p>
              <p className="text-white/60 text-xs mb-2">
                {DAY_LABELS[preferredDay]}요일 예약 가능일 <span className="text-white/40">(클릭 시 예약으로 이동)</span>
              </p>
              {availableDates.length > 0 ? (
                <div className="flex flex-wrap justify-center gap-2">
                  {availableDates.map((d, i) => (
                    <button
                      key={i}
                      onClick={() => handleDateClick(d)}
                      className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all hover:-translate-y-0.5
                        ${i === 0
                          ? "bg-white text-primary shadow-md hover:shadow-lg"
                          : "bg-white/15 text-white hover:bg-white/25"}`}
                    >
                      {formatDate(d)}
                    </button>
                  ))}
                </div>
              ) : (
                <p className="text-white/40 text-xs">조회 중...</p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
        <ChevronDown className="text-white/40" size={28} />
      </div>
    </section>
  );
}
