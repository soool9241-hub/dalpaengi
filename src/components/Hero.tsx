"use client";

import { useState, useMemo, useEffect, useCallback, useRef } from "react";
import { ChevronDown, CalendarCheck, Moon, GraduationCap, Clock } from "lucide-react";

const HERO_IMAGES = [
  "/img/exterior-main.jpg",
  "/img/outdoor-night.jpg",
  "/img/exterior-front.jpg",
  "/img/bbq-area.jpg",
  "/img/living-room-wide.jpg",
  "/img/bbq-night.jpg",
];
import { useReservation } from "@/context/ReservationContext";

function dateToStr(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

const DAY_LABELS = ["일", "월", "화", "수", "목", "금", "토"];

const HERO_PROGRAMS = [
  { id: "stay" as const, label: "숙박 패키지", icon: Moon },
  { id: "stay" as const, label: "대학생 MT", icon: GraduationCap, isMT: true },
  { id: "half" as const, label: "3시간 대여(평일)", icon: Clock },
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

  // 선호 요일 기준 가능한 날짜 최대 8개
  const availableDates = useMemo(() => {
    const results: Date[] = [];
    const d = new Date();
    d.setDate(d.getDate() + 1);
    const diff = (preferredDay - d.getDay() + 7) % 7;
    d.setDate(d.getDate() + diff);

    for (let i = 0; i < 52 && results.length < 8; i++) {
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
          <div className="flex items-center justify-center gap-2 mb-5 flex-wrap">
            <span className="bg-white/15 backdrop-blur-sm text-white/90 text-xs font-semibold px-3 py-1.5 rounded-full">전주역 10분</span>
            <span className="bg-white/15 backdrop-blur-sm text-white/90 text-xs font-semibold px-3 py-1.5 rounded-full">하루 1팀 독채</span>
          </div>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-white leading-tight mb-4">
            60평 독채 펜션
            <br />
            <span className="text-white/90">숙박/BBQ/조식/버스/수영장까지</span>
          </h1>
          <p className="text-white/70 text-xl sm:text-2xl mb-2 font-semibold">
            달팽이아지트펜션
          </p>
          <p className="text-green-300/90 text-base sm:text-lg font-bold mb-3 tracking-wide">30명 기준 1인 23,000원 — 시내 고기집보다 저렴해요</p>
          <div className="flex items-center justify-center gap-2 mb-4 flex-wrap">
            <span className="bg-white/10 text-white/70 text-xs font-medium px-3 py-1.5 rounded-full">숙소+BBQ+버스 올인원 패키지</span>
            <span className="bg-white/10 text-white/70 text-xs font-medium px-3 py-1.5 rounded-full">1박 70만원~</span>
            <span className="bg-white/10 text-white/70 text-xs font-medium px-3 py-1.5 rounded-full">MT · 가족모임 · 워크숍</span>
          </div>
          <p className="text-white/50 text-sm mb-10 max-w-md mx-auto leading-relaxed">
            전주역에서 차로 10분 · KTX 서울↔전주 1시간 40분
            <br />
            <span className="text-amber-300/80">⚠️ 퇴실 시 소양→전주 택시 잡기 어렵습니다! 자차 또는 버스 렌트 이용을 권장드려요.</span>
          </p>
        </div>

        <div className="flex flex-row items-center justify-center gap-3 animate-fade-in-up delay-200 mb-10">
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
            <p className="text-white/60 text-xs mb-3">
              {selectedHeroProgram === 0
                ? "가족모임·지인모임에 딱! 독채라서 눈치 볼 일 없어요"
                : selectedHeroProgram === 1
                ? "간사님 준비 부담 ZERO — 숙소/저녁식사/BBQ/버스렌트까지 올인원 서비스!"
                : "소모임·회의·촬영에 딱! 평일 3시간 40만원"}
            </p>

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
