"use client";

import { useState, useMemo, useEffect } from "react";
import { ChevronLeft, ChevronRight, Plus, Minus, ShoppingCart, Calendar, Users, X, Moon, Clock, Sun } from "lucide-react";
import { useReservation } from "@/context/ReservationContext";

const MEAT_OPTIONS = [
  { id: "moksal", name: "목살", price: 50000, unit: "5인분" },
  { id: "gabrisal", name: "가브리살", price: 50000, unit: "5인분" },
  { id: "hangjungsal", name: "항정살", price: 50000, unit: "5인분" },
  { id: "samgyeopsal", name: "삼겹살", price: 50000, unit: "5인분" },
];

type ProgramType = "stay" | "half" | "daynight";

const HALF_TIME_SLOTS = [
  { id: "09-12", label: "오전", time: "09:00 ~ 12:00" },
  { id: "12-15", label: "낮", time: "12:00 ~ 15:00" },
  { id: "15-18", label: "오후", time: "15:00 ~ 18:00" },
  { id: "18-21", label: "저녁", time: "18:00 ~ 21:00" },
];

const DAYNIGHT_TIME_SLOTS = [
  { id: "day", label: "주간", time: "10:00 ~ 15:00", emoji: "☀️" },
  { id: "night", label: "야간", time: "17:00 ~ 22:00", emoji: "🌙" },
];

const PROGRAMS: Record<ProgramType, { label: string; icon: typeof Moon; basePrice: number; unit: string; rangeMode: boolean }> = {
  stay: { label: "숙박", icon: Moon, basePrice: 700000, unit: "박", rangeMode: true },
  half: { label: "3시간 대여", icon: Clock, basePrice: 300000, unit: "회", rangeMode: false },
  daynight: { label: "주/야간 패키지", icon: Sun, basePrice: 400000, unit: "회", rangeMode: false },
};

const BASE_PEOPLE = 15;
const EXTRA_GUEST_PRICE = 10000;
const BBQ_GRILL_PRICE = 30000;
const GAS_RANGE_PRICE = 20000;
const BREAKFAST_PRICE = 10000;

export default function Reservation() {
  const { selectedProgramId } = useReservation();

  const today = new Date();
  const [currentYear, setCurrentYear] = useState(today.getFullYear());
  const [currentMonth, setCurrentMonth] = useState(today.getMonth());

  // Program selection
  const [programType, setProgramType] = useState<ProgramType>("stay");

  // Time slot selection
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<string | null>(null);

  // Sync from context
  useEffect(() => {
    if (selectedProgramId) {
      setProgramType(selectedProgramId);
      setCheckIn(null);
      setCheckOut(null);
      setSelectedDate(null);
      setSelectedTimeSlot(null);
    }
  }, [selectedProgramId]);

  const program = PROGRAMS[programType];

  // Date range (for stay)
  const [checkIn, setCheckIn] = useState<{ year: number; month: number; day: number } | null>(null);
  const [checkOut, setCheckOut] = useState<{ year: number; month: number; day: number } | null>(null);

  // Single date (for half / daynight)
  const [selectedDate, setSelectedDate] = useState<{ year: number; month: number; day: number } | null>(null);

  const [extraGuests, setExtraGuests] = useState(0);
  const [bbqGrills, setBbqGrills] = useState(0);
  const [gasRanges, setGasRanges] = useState(0);
  const [breakfastCount, setBreakfastCount] = useState(0);
  const [selectedMeats, setSelectedMeats] = useState<Record<string, number>>({});
  const [showConfirm, setShowConfirm] = useState(false);

  const totalGuests = BASE_PEOPLE + extraGuests;
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  const firstDayOfWeek = new Date(currentYear, currentMonth, 1).getDay();

  const monthNames = [
    "1월", "2월", "3월", "4월", "5월", "6월",
    "7월", "8월", "9월", "10월", "11월", "12월",
  ];
  const dayNames = ["일", "월", "화", "수", "목", "금", "토"];

  // Calculate nights for stay program
  const nights = useMemo(() => {
    if (!program.rangeMode || !checkIn || !checkOut) return 1;
    const d1 = new Date(checkIn.year, checkIn.month, checkIn.day);
    const d2 = new Date(checkOut.year, checkOut.month, checkOut.day);
    const diff = Math.round((d2.getTime() - d1.getTime()) / (1000 * 60 * 60 * 24));
    return Math.max(1, diff);
  }, [checkIn, checkOut, program.rangeMode]);

  const handlePrevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear((y) => y - 1);
    } else {
      setCurrentMonth((m) => m - 1);
    }
  };

  const handleNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear((y) => y + 1);
    } else {
      setCurrentMonth((m) => m + 1);
    }
  };

  const handleDateClick = (day: number) => {
    const clicked = { year: currentYear, month: currentMonth, day };

    if (!program.rangeMode) {
      setSelectedDate(clicked);
      return;
    }

    // Range mode (stay)
    if (!checkIn || (checkIn && checkOut)) {
      setCheckIn(clicked);
      setCheckOut(null);
    } else {
      const d1 = new Date(checkIn.year, checkIn.month, checkIn.day);
      const d2 = new Date(clicked.year, clicked.month, clicked.day);
      if (d2 <= d1) {
        setCheckIn(clicked);
        setCheckOut(null);
      } else {
        setCheckOut(clicked);
      }
    }
  };

  const handleProgramChange = (type: ProgramType) => {
    setProgramType(type);
    setCheckIn(null);
    setCheckOut(null);
    setSelectedDate(null);
    setSelectedTimeSlot(null);
  };

  const isInRange = (day: number) => {
    if (!program.rangeMode || !checkIn || !checkOut) return false;
    const current = new Date(currentYear, currentMonth, day).getTime();
    const start = new Date(checkIn.year, checkIn.month, checkIn.day).getTime();
    const end = new Date(checkOut.year, checkOut.month, checkOut.day).getTime();
    return current > start && current < end;
  };

  const isCheckIn = (day: number) => {
    if (!checkIn) return false;
    return checkIn.year === currentYear && checkIn.month === currentMonth && checkIn.day === day;
  };

  const isCheckOut = (day: number) => {
    if (!checkOut) return false;
    return checkOut.year === currentYear && checkOut.month === currentMonth && checkOut.day === day;
  };

  const isSingleSelected = (day: number) => {
    if (!selectedDate) return false;
    return selectedDate.year === currentYear && selectedDate.month === currentMonth && selectedDate.day === day;
  };

  const isPastDate = (day: number) => {
    const date = new Date(currentYear, currentMonth, day);
    const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    return date < todayStart;
  };

  const handleMeatChange = (id: string, delta: number) => {
    setSelectedMeats((prev) => {
      const current = prev[id] || 0;
      const next = Math.max(0, current + delta);
      if (next === 0) {
        const copy = { ...prev };
        delete copy[id];
        return copy;
      }
      return { ...prev, [id]: next };
    });
  };

  const totalPrice = useMemo(() => {
    let total = program.basePrice * nights;
    total += extraGuests * EXTRA_GUEST_PRICE;
    total += bbqGrills * BBQ_GRILL_PRICE;
    total += gasRanges * GAS_RANGE_PRICE;
    total += breakfastCount * BREAKFAST_PRICE;
    for (const opt of MEAT_OPTIONS) {
      const qty = selectedMeats[opt.id] || 0;
      total += qty * opt.price;
    }
    return total;
  }, [program.basePrice, nights, extraGuests, bbqGrills, gasRanges, breakfastCount, selectedMeats]);

  const pricePerPerson = useMemo(() => {
    return Math.round(totalPrice / totalGuests);
  }, [totalPrice, totalGuests]);

  const formatPrice = (price: number) =>
    price.toLocaleString("ko-KR") + "원";

  const calendarDays: (number | null)[] = [];
  for (let i = 0; i < firstDayOfWeek; i++) {
    calendarDays.push(null);
  }
  for (let d = 1; d <= daysInMonth; d++) {
    calendarDays.push(d);
  }

  const formatFullDate = (d: { year: number; month: number; day: number }) =>
    `${d.year}년 ${d.month + 1}월 ${d.day}일`;

  // Get selected time label for display
  const getTimeSlotLabel = () => {
    if (!selectedTimeSlot) return null;
    if (programType === "half") {
      const slot = HALF_TIME_SLOTS.find((s) => s.id === selectedTimeSlot);
      return slot ? `${slot.label} (${slot.time})` : null;
    }
    if (programType === "daynight") {
      const slot = DAYNIGHT_TIME_SLOTS.find((s) => s.id === selectedTimeSlot);
      return slot ? `${slot.label} (${slot.time})` : null;
    }
    return null;
  };

  return (
    <>
      <section id="reservation" className="py-24 bg-white">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-12">
            <p className="text-primary text-sm font-semibold tracking-widest uppercase mb-3">
              RESERVATION
            </p>
            <h2 className="text-3xl md:text-4xl font-bold text-text-dark mb-4">
              프로그램 예약
            </h2>
            <p className="text-text-light">
              원하시는 날짜와 프로그램을 선택하여 예약해주세요
            </p>
          </div>

          {/* Program Tabs */}
          <div className="flex flex-col sm:flex-row gap-3 mb-8">
            {(Object.entries(PROGRAMS) as [ProgramType, typeof PROGRAMS[ProgramType]][]).map(([key, prog]) => {
              const Icon = prog.icon;
              const isActive = programType === key;
              return (
                <button
                  key={key}
                  onClick={() => handleProgramChange(key)}
                  className={`flex-1 flex items-center gap-3 p-4 rounded-2xl border-2 transition-all ${
                    isActive
                      ? "border-primary bg-primary/5 shadow-md"
                      : "border-border bg-white hover:border-primary/30"
                  }`}
                >
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                    isActive ? "bg-primary text-white" : "bg-sage text-text-light"
                  }`}>
                    <Icon size={20} />
                  </div>
                  <div className="text-left">
                    <p className={`font-semibold text-sm ${isActive ? "text-primary" : "text-text-dark"}`}>
                      {prog.label}
                    </p>
                    <p className="text-xs text-text-light">
                      {formatPrice(prog.basePrice)}/{prog.unit}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Calendar */}
            <div className="bg-background rounded-2xl shadow-sm border border-border p-6">
              <div className="flex items-center gap-2 mb-2">
                <Calendar size={18} className="text-primary" />
                <h3 className="text-lg font-semibold text-text-dark">
                  {program.rangeMode ? "체크인 / 체크아웃 선택" : "날짜 선택"}
                </h3>
              </div>
              {program.rangeMode && (
                <p className="text-xs text-text-light mb-4">
                  첫 번째 클릭 = 체크인, 두 번째 클릭 = 체크아웃
                </p>
              )}
              <div className="flex items-center justify-between mb-6">
                <button
                  onClick={handlePrevMonth}
                  className="p-2 rounded-full hover:bg-sage transition-colors text-text-dark"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <h3 className="text-lg font-semibold text-text-dark">
                  {currentYear}년 {monthNames[currentMonth]}
                </h3>
                <button
                  onClick={handleNextMonth}
                  className="p-2 rounded-full hover:bg-sage transition-colors text-text-dark"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>

              <div className="grid grid-cols-7 gap-1 mb-2">
                {dayNames.map((name, i) => (
                  <div
                    key={name}
                    className={`text-center text-sm font-medium py-2 ${
                      i === 0 ? "text-red-400" : i === 6 ? "text-blue-400" : "text-text-light"
                    }`}
                  >
                    {name}
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-7 gap-1">
                {calendarDays.map((day, idx) => {
                  if (day === null) {
                    return <div key={`empty-${idx}`} />;
                  }
                  const past = isPastDate(day);
                  const dayOfWeek = (firstDayOfWeek + day - 1) % 7;

                  const isCI = isCheckIn(day);
                  const isCO = isCheckOut(day);
                  const inRange = isInRange(day);
                  const isSingle = isSingleSelected(day);
                  const isSelected = isCI || isCO || isSingle;

                  return (
                    <button
                      key={day}
                      onClick={() => handleDateClick(day)}
                      disabled={past}
                      className={`
                        py-2.5 rounded-xl text-sm font-medium transition-all relative
                        ${past
                          ? "text-text-light/30 cursor-not-allowed"
                          : isSelected
                          ? "bg-primary text-white shadow-md"
                          : inRange
                          ? "bg-primary/15 text-primary"
                          : dayOfWeek === 0
                          ? "text-red-400 hover:bg-sage"
                          : dayOfWeek === 6
                          ? "text-blue-400 hover:bg-sage"
                          : "text-text-dark hover:bg-sage"
                        }
                      `}
                    >
                      {day}
                      {isCI && <span className="absolute -bottom-0.5 left-1/2 -translate-x-1/2 text-[8px] text-white/80">IN</span>}
                      {isCO && <span className="absolute -bottom-0.5 left-1/2 -translate-x-1/2 text-[8px] text-white/80">OUT</span>}
                    </button>
                  );
                })}
              </div>

              {/* Date selection summary */}
              {program.rangeMode && checkIn && (
                <div className="mt-4 p-3 bg-primary/5 border border-primary/20 rounded-xl text-center">
                  <p className="text-sm text-text-mid">
                    체크인:{" "}
                    <span className="font-semibold text-primary">
                      {formatFullDate(checkIn)}
                    </span>
                    {checkOut && (
                      <>
                        {" → "}체크아웃:{" "}
                        <span className="font-semibold text-primary">
                          {formatFullDate(checkOut)}
                        </span>
                        <span className="ml-2 text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full font-bold">
                          {nights}박
                        </span>
                      </>
                    )}
                  </p>
                </div>
              )}
              {!program.rangeMode && selectedDate && (
                <div className="mt-4 p-3 bg-primary/5 border border-primary/20 rounded-xl text-center">
                  <p className="text-sm text-text-mid">
                    선택한 날짜:{" "}
                    <span className="font-semibold text-primary">
                      {formatFullDate(selectedDate)}
                    </span>
                  </p>
                </div>
              )}

              {/* Time Slot Selection for 3시간 대여 */}
              {programType === "half" && (
                <div className="mt-5">
                  <div className="flex items-center gap-2 mb-3">
                    <Clock size={16} className="text-primary" />
                    <h4 className="text-sm font-semibold text-text-dark">시간대 선택</h4>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    {HALF_TIME_SLOTS.map((slot) => {
                      const isActive = selectedTimeSlot === slot.id;
                      return (
                        <button
                          key={slot.id}
                          onClick={() => setSelectedTimeSlot(slot.id)}
                          className={`p-3 rounded-xl border-2 text-center transition-all ${
                            isActive
                              ? "border-primary bg-primary/5 shadow-sm"
                              : "border-border bg-white hover:border-primary/30"
                          }`}
                        >
                          <p className={`text-sm font-semibold ${isActive ? "text-primary" : "text-text-dark"}`}>
                            {slot.label}
                          </p>
                          <p className="text-xs text-text-light mt-0.5">{slot.time}</p>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Time Slot Selection for 주/야간 패키지 */}
              {programType === "daynight" && (
                <div className="mt-5">
                  <div className="flex items-center gap-2 mb-3">
                    <Sun size={16} className="text-primary" />
                    <h4 className="text-sm font-semibold text-text-dark">시간대 선택</h4>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    {DAYNIGHT_TIME_SLOTS.map((slot) => {
                      const isActive = selectedTimeSlot === slot.id;
                      return (
                        <button
                          key={slot.id}
                          onClick={() => setSelectedTimeSlot(slot.id)}
                          className={`p-4 rounded-xl border-2 text-center transition-all ${
                            isActive
                              ? "border-primary bg-primary/5 shadow-sm"
                              : "border-border bg-white hover:border-primary/30"
                          }`}
                        >
                          <span className="text-2xl block mb-1">{slot.emoji}</span>
                          <p className={`text-sm font-semibold ${isActive ? "text-primary" : "text-text-dark"}`}>
                            {slot.label}
                          </p>
                          <p className="text-xs text-text-light mt-0.5">{slot.time}</p>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* Options */}
            <div className="space-y-4">
              {/* Base Program */}
              <div className="bg-background rounded-2xl shadow-sm border border-border p-6">
                <div className="flex items-center gap-2 mb-4">
                  <Users size={18} className="text-primary" />
                  <h3 className="text-lg font-semibold text-text-dark">기본 프로그램</h3>
                </div>
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <p className="font-medium text-text-dark">총 예약인원</p>
                    <p className="text-sm text-text-light">{BASE_PEOPLE}인 기본</p>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold text-text-dark">{totalGuests}인</p>
                    <p className="text-xs text-text-light">1인당 {formatPrice(pricePerPerson)}</p>
                  </div>
                </div>
                {program.rangeMode && checkIn && checkOut && (
                  <div className="mt-2 pt-2 border-t border-border">
                    <p className="text-sm text-text-mid">
                      {program.label} {formatPrice(program.basePrice)} × {nights}박 = <span className="font-semibold text-primary">{formatPrice(program.basePrice * nights)}</span>
                    </p>
                  </div>
                )}
              </div>

              {/* Extra Options */}
              <div className="bg-background rounded-2xl shadow-sm border border-border p-6">
                <h3 className="text-base font-semibold text-text-dark mb-4">추가 옵션</h3>
                <div className="space-y-4">
                  {/* Extra People */}
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-text-dark text-sm">추가 인원</p>
                      <p className="text-xs text-text-light">1인 {formatPrice(EXTRA_GUEST_PRICE)}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => setExtraGuests((g) => Math.max(0, g - 1))}
                        className="w-8 h-8 rounded-full border border-border flex items-center justify-center hover:bg-sage transition-colors"
                      >
                        <Minus className="w-3.5 h-3.5 text-text-mid" />
                      </button>
                      <span className="w-8 text-center font-semibold text-text-dark text-sm">{extraGuests}</span>
                      <button
                        onClick={() => setExtraGuests((g) => Math.min(30, g + 1))}
                        className="w-8 h-8 rounded-full border border-border flex items-center justify-center hover:bg-sage transition-colors"
                      >
                        <Plus className="w-3.5 h-3.5 text-text-mid" />
                      </button>
                    </div>
                  </div>

                  <hr className="border-border" />

                  {/* BBQ Grills */}
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-text-dark text-sm">바베큐 세트</p>
                      <p className="text-xs text-text-light">그릴당 {formatPrice(BBQ_GRILL_PRICE)}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => setBbqGrills((g) => Math.max(0, g - 1))}
                        className="w-8 h-8 rounded-full border border-border flex items-center justify-center hover:bg-sage transition-colors"
                      >
                        <Minus className="w-3.5 h-3.5 text-text-mid" />
                      </button>
                      <span className="w-8 text-center font-semibold text-text-dark text-sm">{bbqGrills}</span>
                      <button
                        onClick={() => setBbqGrills((g) => Math.min(10, g + 1))}
                        className="w-8 h-8 rounded-full border border-border flex items-center justify-center hover:bg-sage transition-colors"
                      >
                        <Plus className="w-3.5 h-3.5 text-text-mid" />
                      </button>
                    </div>
                  </div>

                  <hr className="border-border" />

                  {/* Meat Options */}
                  {MEAT_OPTIONS.map((opt) => (
                    <div key={opt.id} className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-text-dark text-sm">{opt.name}</p>
                        <p className="text-xs text-text-light">{opt.unit}당 {formatPrice(opt.price)}</p>
                      </div>
                      <div className="flex items-center gap-3">
                        <button
                          onClick={() => handleMeatChange(opt.id, -1)}
                          className="w-8 h-8 rounded-full border border-border flex items-center justify-center hover:bg-sage transition-colors"
                        >
                          <Minus className="w-3.5 h-3.5 text-text-mid" />
                        </button>
                        <span className="w-8 text-center font-semibold text-text-dark text-sm">{selectedMeats[opt.id] || 0}</span>
                        <button
                          onClick={() => handleMeatChange(opt.id, 1)}
                          className="w-8 h-8 rounded-full border border-border flex items-center justify-center hover:bg-sage transition-colors"
                        >
                          <Plus className="w-3.5 h-3.5 text-text-mid" />
                        </button>
                      </div>
                    </div>
                  ))}

                  <hr className="border-border" />

                  {/* Gas Range */}
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-text-dark text-sm">가스렌지</p>
                      <p className="text-xs text-text-light">개당 {formatPrice(GAS_RANGE_PRICE)} (최대 5개)</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => setGasRanges((g) => Math.max(0, g - 1))}
                        className="w-8 h-8 rounded-full border border-border flex items-center justify-center hover:bg-sage transition-colors"
                      >
                        <Minus className="w-3.5 h-3.5 text-text-mid" />
                      </button>
                      <span className="w-8 text-center font-semibold text-text-dark text-sm">{gasRanges}</span>
                      <button
                        onClick={() => setGasRanges((g) => Math.min(5, g + 1))}
                        className="w-8 h-8 rounded-full border border-border flex items-center justify-center hover:bg-sage transition-colors"
                      >
                        <Plus className="w-3.5 h-3.5 text-text-mid" />
                      </button>
                    </div>
                  </div>

                  <hr className="border-border" />

                  {/* Breakfast */}
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-text-dark text-sm">조식 추가</p>
                      <p className="text-xs text-text-light">1인당 {formatPrice(BREAKFAST_PRICE)}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => setBreakfastCount((g) => Math.max(0, g - 1))}
                        className="w-8 h-8 rounded-full border border-border flex items-center justify-center hover:bg-sage transition-colors"
                      >
                        <Minus className="w-3.5 h-3.5 text-text-mid" />
                      </button>
                      <span className="w-8 text-center font-semibold text-text-dark text-sm">{breakfastCount}</span>
                      <button
                        onClick={() => setBreakfastCount((g) => Math.min(totalGuests, g + 1))}
                        className="w-8 h-8 rounded-full border border-border flex items-center justify-center hover:bg-sage transition-colors"
                      >
                        <Plus className="w-3.5 h-3.5 text-text-mid" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Price Summary */}
          <div className="mt-8 bg-background rounded-2xl shadow-sm border border-border p-6">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <ShoppingCart className="w-5 h-5 text-primary" />
                  <h3 className="text-lg font-semibold text-text-dark">요금 요약</h3>
                </div>
                <div className="text-sm text-text-mid space-y-0.5">
                  <p>
                    {program.label} ({formatPrice(program.basePrice)}/{program.unit}
                    {program.rangeMode && nights > 1 ? ` × ${nights}박` : ""}
                    ): {formatPrice(program.basePrice * nights)}
                  </p>
                  {getTimeSlotLabel() && (
                    <p>시간대: {getTimeSlotLabel()}</p>
                  )}
                  {extraGuests > 0 && (
                    <p>추가 인원 ({extraGuests}명): {formatPrice(extraGuests * EXTRA_GUEST_PRICE)}</p>
                  )}
                  {bbqGrills > 0 && (
                    <p>바베큐 세트 ({bbqGrills}개): {formatPrice(bbqGrills * BBQ_GRILL_PRICE)}</p>
                  )}
                  {MEAT_OPTIONS.filter((o) => selectedMeats[o.id]).map((o) => (
                    <p key={o.id}>
                      {o.name} x{selectedMeats[o.id]}: {formatPrice(selectedMeats[o.id] * o.price)}
                    </p>
                  ))}
                  {gasRanges > 0 && (
                    <p>가스렌지 ({gasRanges}개): {formatPrice(gasRanges * GAS_RANGE_PRICE)}</p>
                  )}
                  {breakfastCount > 0 && (
                    <p>조식 ({breakfastCount}명): {formatPrice(breakfastCount * BREAKFAST_PRICE)}</p>
                  )}
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm text-text-light">총 결제 금액</p>
                <p className="text-3xl font-bold text-primary">{formatPrice(totalPrice)}</p>
                <p className="text-sm text-text-mid mt-1">
                  1인당 약 <span className="font-semibold text-primary">{formatPrice(pricePerPerson)}</span>
                </p>
              </div>
            </div>
            <button
              onClick={() => setShowConfirm(true)}
              className="mt-6 w-full py-4 bg-primary text-white rounded-2xl font-semibold text-lg hover:bg-primary-light transition-colors shadow-md hover:shadow-lg"
            >
              예약하기
            </button>
          </div>
        </div>
      </section>

      {/* Reservation Confirm Popup */}
      {showConfirm && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 animate-fade-in">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setShowConfirm(false)} />
          <div className="relative bg-white rounded-3xl max-w-md w-full max-h-[90vh] overflow-y-auto shadow-2xl animate-scale-in p-8">
            <button
              onClick={() => setShowConfirm(false)}
              className="absolute top-4 right-4 w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-colors"
            >
              <X size={16} />
            </button>

            <div className="text-center mb-6">
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                <ShoppingCart size={28} className="text-primary" />
              </div>
              <h3 className="text-xl font-bold text-text-dark">예약 확인</h3>
              <p className="text-sm text-text-light mt-1">아래 내용을 확인해주세요</p>
            </div>

            <div className="space-y-3 mb-6">
              <div className="flex justify-between text-sm">
                <span className="text-text-light">프로그램</span>
                <span className="font-medium text-text-dark">{program.label}</span>
              </div>
              {program.rangeMode && checkIn && checkOut && (
                <div className="flex justify-between text-sm">
                  <span className="text-text-light">날짜</span>
                  <span className="font-medium text-text-dark">
                    {formatFullDate(checkIn)} ~ {formatFullDate(checkOut)} ({nights}박)
                  </span>
                </div>
              )}
              {!program.rangeMode && selectedDate && (
                <div className="flex justify-between text-sm">
                  <span className="text-text-light">날짜</span>
                  <span className="font-medium text-text-dark">{formatFullDate(selectedDate)}</span>
                </div>
              )}
              {getTimeSlotLabel() && (
                <div className="flex justify-between text-sm">
                  <span className="text-text-light">시간대</span>
                  <span className="font-medium text-text-dark">{getTimeSlotLabel()}</span>
                </div>
              )}
              <div className="flex justify-between text-sm">
                <span className="text-text-light">인원</span>
                <span className="font-medium text-text-dark">{totalGuests}명</span>
              </div>
              <hr className="border-border" />
              <div className="flex justify-between text-sm">
                <span className="text-text-light">{program.label}</span>
                <span className="font-medium text-text-dark">{formatPrice(program.basePrice * nights)}</span>
              </div>
              {extraGuests > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-text-light">추가 인원</span>
                  <span className="font-medium text-text-dark">{formatPrice(extraGuests * EXTRA_GUEST_PRICE)}</span>
                </div>
              )}
              {bbqGrills > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-text-light">바베큐 세트</span>
                  <span className="font-medium text-text-dark">{formatPrice(bbqGrills * BBQ_GRILL_PRICE)}</span>
                </div>
              )}
              {MEAT_OPTIONS.filter((o) => selectedMeats[o.id]).map((o) => (
                <div key={o.id} className="flex justify-between text-sm">
                  <span className="text-text-light">{o.name} x{selectedMeats[o.id]}</span>
                  <span className="font-medium text-text-dark">{formatPrice(selectedMeats[o.id] * o.price)}</span>
                </div>
              ))}
              {gasRanges > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-text-light">가스렌지</span>
                  <span className="font-medium text-text-dark">{formatPrice(gasRanges * GAS_RANGE_PRICE)}</span>
                </div>
              )}
              {breakfastCount > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-text-light">조식</span>
                  <span className="font-medium text-text-dark">{formatPrice(breakfastCount * BREAKFAST_PRICE)}</span>
                </div>
              )}
              <hr className="border-border" />
              <div className="flex justify-between">
                <span className="font-semibold text-text-dark">총 결제 금액</span>
                <span className="font-bold text-primary text-lg">{formatPrice(totalPrice)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-text-light">1인당</span>
                <span className="font-medium text-primary">{formatPrice(pricePerPerson)}</span>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setShowConfirm(false)}
                className="flex-1 py-3 border-2 border-border rounded-xl font-semibold text-sm text-text-mid hover:bg-sage transition-colors"
              >
                취소
              </button>
              <button
                onClick={() => {
                  setShowConfirm(false);
                  alert("예약이 완료되었습니다! 확인 메일을 보내드리겠습니다.");
                }}
                className="flex-1 py-3 bg-primary text-white rounded-xl font-semibold text-sm hover:bg-primary-light transition-colors"
              >
                예약 확정
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
