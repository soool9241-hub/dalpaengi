"use client";

import { useState, useMemo, useEffect } from "react";
import { ChevronLeft, ChevronRight, Plus, Minus, ShoppingCart, Calendar, Users, X, Moon, Clock, Sun, Bus } from "lucide-react";
import { useReservation } from "@/context/ReservationContext";

const DINNER_PRICE = 10000;
const WOODCRAFT_PRICE = 20000;

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

export default function Reservation() {
  const { selectedProgramId } = useReservation();

  const today = new Date();
  const [currentYear, setCurrentYear] = useState(today.getFullYear());
  const [currentMonth, setCurrentMonth] = useState(today.getMonth());

  const [programType, setProgramType] = useState<ProgramType>("stay");
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<string | null>(null);

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

  const [checkIn, setCheckIn] = useState<{ year: number; month: number; day: number } | null>(null);
  const [checkOut, setCheckOut] = useState<{ year: number; month: number; day: number } | null>(null);
  const [selectedDate, setSelectedDate] = useState<{ year: number; month: number; day: number } | null>(null);

  const [extraGuests, setExtraGuests] = useState(0);
  const [bbqGrills, setBbqGrills] = useState(0);
  const [gasRanges, setGasRanges] = useState(0);
  const [dinnerCount, setDinnerCount] = useState(0);
  const [woodcraftCount, setWoodcraftCount] = useState(0);
  const [showConfirm, setShowConfirm] = useState(false);

  // Bus rental
  const [showBusForm, setShowBusForm] = useState(false);
  const [busForm, setBusForm] = useState({
    managerName: "",
    managerPhone: "",
    pickupPlace: "",
    pickupPeople: "",
    pickupTime: "",
    dropoffManagerName: "",
    dropoffManagerPhone: "",
    dropoffPlace: "",
    dropoffPeople: "",
    dropoffTime: "",
  });
  const [busRequested, setBusRequested] = useState(false);

  const totalGuests = BASE_PEOPLE + extraGuests;
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  const firstDayOfWeek = new Date(currentYear, currentMonth, 1).getDay();

  const monthNames = [
    "1월", "2월", "3월", "4월", "5월", "6월",
    "7월", "8월", "9월", "10월", "11월", "12월",
  ];
  const dayNames = ["일", "월", "화", "수", "목", "금", "토"];

  const nights = useMemo(() => {
    if (!program.rangeMode || !checkIn || !checkOut) return 1;
    const d1 = new Date(checkIn.year, checkIn.month, checkIn.day);
    const d2 = new Date(checkOut.year, checkOut.month, checkOut.day);
    const diff = Math.round((d2.getTime() - d1.getTime()) / (1000 * 60 * 60 * 24));
    return Math.max(1, diff);
  }, [checkIn, checkOut, program.rangeMode]);

  const handlePrevMonth = () => {
    if (currentMonth === 0) { setCurrentMonth(11); setCurrentYear((y) => y - 1); }
    else { setCurrentMonth((m) => m - 1); }
  };
  const handleNextMonth = () => {
    if (currentMonth === 11) { setCurrentMonth(0); setCurrentYear((y) => y + 1); }
    else { setCurrentMonth((m) => m + 1); }
  };

  const handleDateClick = (day: number) => {
    const clicked = { year: currentYear, month: currentMonth, day };
    if (!program.rangeMode) { setSelectedDate(clicked); return; }
    if (!checkIn || (checkIn && checkOut)) { setCheckIn(clicked); setCheckOut(null); }
    else {
      const d1 = new Date(checkIn.year, checkIn.month, checkIn.day);
      const d2 = new Date(clicked.year, clicked.month, clicked.day);
      if (d2 <= d1) { setCheckIn(clicked); setCheckOut(null); }
      else { setCheckOut(clicked); }
    }
  };

  const handleProgramChange = (type: ProgramType) => {
    setProgramType(type);
    setCheckIn(null); setCheckOut(null); setSelectedDate(null); setSelectedTimeSlot(null);
  };

  const isInRange = (day: number) => {
    if (!program.rangeMode || !checkIn || !checkOut) return false;
    const current = new Date(currentYear, currentMonth, day).getTime();
    const start = new Date(checkIn.year, checkIn.month, checkIn.day).getTime();
    const end = new Date(checkOut.year, checkOut.month, checkOut.day).getTime();
    return current > start && current < end;
  };
  const isCheckIn = (day: number) => checkIn?.year === currentYear && checkIn?.month === currentMonth && checkIn?.day === day;
  const isCheckOut = (day: number) => checkOut?.year === currentYear && checkOut?.month === currentMonth && checkOut?.day === day;
  const isSingleSelected = (day: number) => selectedDate?.year === currentYear && selectedDate?.month === currentMonth && selectedDate?.day === day;
  const isPastDate = (day: number) => new Date(currentYear, currentMonth, day) < new Date(today.getFullYear(), today.getMonth(), today.getDate());

  const totalPrice = useMemo(() => {
    let total = program.basePrice * nights;
    total += extraGuests * EXTRA_GUEST_PRICE;
    total += bbqGrills * BBQ_GRILL_PRICE;
    total += gasRanges * GAS_RANGE_PRICE;
    total += dinnerCount * DINNER_PRICE;
    total += woodcraftCount * WOODCRAFT_PRICE;
    return total;
  }, [program.basePrice, nights, extraGuests, bbqGrills, gasRanges, dinnerCount, woodcraftCount]);

  const pricePerPerson = useMemo(() => Math.round(totalPrice / totalGuests), [totalPrice, totalGuests]);

  const formatPrice = (price: number) => price.toLocaleString("ko-KR") + "원";

  const calendarDays: (number | null)[] = [];
  for (let i = 0; i < firstDayOfWeek; i++) calendarDays.push(null);
  for (let d = 1; d <= daysInMonth; d++) calendarDays.push(d);

  const formatFullDate = (d: { year: number; month: number; day: number }) => `${d.year}년 ${d.month + 1}월 ${d.day}일`;

  const getTimeSlotLabel = () => {
    if (!selectedTimeSlot) return null;
    if (programType === "half") { const s = HALF_TIME_SLOTS.find((s) => s.id === selectedTimeSlot); return s ? `${s.label} (${s.time})` : null; }
    if (programType === "daynight") { const s = DAYNIGHT_TIME_SLOTS.find((s) => s.id === selectedTimeSlot); return s ? `${s.label} (${s.time})` : null; }
    return null;
  };

  // Counter component for DRY
  const Counter = ({ label, desc, value, onDec, onInc }: { label: string; desc: string; value: number; onDec: () => void; onInc: () => void }) => (
    <div className="flex items-center justify-between">
      <div>
        <p className="font-medium text-text-dark text-sm">{label}</p>
        <p className="text-xs text-text-light">{desc}</p>
      </div>
      <div className="flex items-center gap-3">
        <button onClick={onDec} className="w-8 h-8 rounded-full border border-border flex items-center justify-center hover:bg-sage transition-colors">
          <Minus className="w-3.5 h-3.5 text-text-mid" />
        </button>
        <span className="w-8 text-center font-semibold text-text-dark text-sm">{value}</span>
        <button onClick={onInc} className="w-8 h-8 rounded-full border border-border flex items-center justify-center hover:bg-sage transition-colors">
          <Plus className="w-3.5 h-3.5 text-text-mid" />
        </button>
      </div>
    </div>
  );

  return (
    <>
      <section id="reservation" className="py-16 sm:py-24 bg-white">
        <div className="max-w-6xl mx-auto px-4 overflow-hidden">
          <div className="text-center mb-12">
            <p className="text-primary text-sm font-semibold tracking-widest uppercase mb-3">RESERVATION</p>
            <h2 className="text-3xl md:text-4xl font-bold text-text-dark mb-4">프로그램 예약</h2>
            <p className="text-text-light">원하시는 날짜와 프로그램을 선택하여 예약해주세요</p>
          </div>

          {/* Program Tabs */}
          <div className="flex flex-col sm:flex-row gap-3 mb-8">
            {(Object.entries(PROGRAMS) as [ProgramType, typeof PROGRAMS[ProgramType]][]).map(([key, prog]) => {
              const Icon = prog.icon;
              const isActive = programType === key;
              return (
                <button key={key} onClick={() => handleProgramChange(key)}
                  className={`flex-1 flex items-center gap-3 p-4 rounded-2xl border-2 transition-all ${isActive ? "border-primary bg-primary/5 shadow-md" : "border-border bg-white hover:border-primary/30"}`}>
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${isActive ? "bg-primary text-white" : "bg-sage text-text-light"}`}>
                    <Icon size={20} />
                  </div>
                  <div className="text-left">
                    <p className={`font-semibold text-sm ${isActive ? "text-primary" : "text-text-dark"}`}>{prog.label}</p>
                    <p className="text-xs text-text-light">{formatPrice(prog.basePrice)}/{prog.unit}</p>
                  </div>
                </button>
              );
            })}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Calendar */}
            <div className="bg-background rounded-2xl shadow-sm border border-border p-4 sm:p-6">
              <div className="flex items-center gap-2 mb-2">
                <Calendar size={18} className="text-primary" />
                <h3 className="text-lg font-semibold text-text-dark">{program.rangeMode ? "체크인 / 체크아웃 선택" : "날짜 선택"}</h3>
              </div>
              {program.rangeMode && <p className="text-xs text-text-light mb-4">첫 번째 클릭 = 체크인, 두 번째 클릭 = 체크아웃</p>}
              <div className="flex items-center justify-between mb-6">
                <button onClick={handlePrevMonth} className="p-2 rounded-full hover:bg-sage transition-colors text-text-dark"><ChevronLeft className="w-5 h-5" /></button>
                <h3 className="text-lg font-semibold text-text-dark">{currentYear}년 {monthNames[currentMonth]}</h3>
                <button onClick={handleNextMonth} className="p-2 rounded-full hover:bg-sage transition-colors text-text-dark"><ChevronRight className="w-5 h-5" /></button>
              </div>

              <div className="grid grid-cols-7 gap-1 mb-2">
                {dayNames.map((name, i) => (
                  <div key={name} className={`text-center text-sm font-medium py-2 ${i === 0 ? "text-red-400" : i === 6 ? "text-blue-400" : "text-text-light"}`}>{name}</div>
                ))}
              </div>
              <div className="grid grid-cols-7 gap-1">
                {calendarDays.map((day, idx) => {
                  if (day === null) return <div key={`empty-${idx}`} />;
                  const past = isPastDate(day);
                  const dayOfWeek = (firstDayOfWeek + day - 1) % 7;
                  const isCI = isCheckIn(day); const isCO = isCheckOut(day);
                  const inRange = isInRange(day); const isSingle = isSingleSelected(day);
                  const isSelected = isCI || isCO || isSingle;
                  return (
                    <button key={day} onClick={() => handleDateClick(day)} disabled={past}
                      className={`py-2.5 rounded-xl text-sm font-medium transition-all relative
                        ${past ? "text-text-light/30 cursor-not-allowed" : isSelected ? "bg-primary text-white shadow-md" : inRange ? "bg-primary/15 text-primary" : dayOfWeek === 0 ? "text-red-400 hover:bg-sage" : dayOfWeek === 6 ? "text-blue-400 hover:bg-sage" : "text-text-dark hover:bg-sage"}`}>
                      {day}
                      {isCI && <span className="absolute -bottom-0.5 left-1/2 -translate-x-1/2 text-[8px] text-white/80">IN</span>}
                      {isCO && <span className="absolute -bottom-0.5 left-1/2 -translate-x-1/2 text-[8px] text-white/80">OUT</span>}
                    </button>
                  );
                })}
              </div>

              {/* Date summary */}
              {program.rangeMode && checkIn && (
                <div className="mt-4 p-3 bg-primary/5 border border-primary/20 rounded-xl text-center">
                  <div className="flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-0 text-sm text-text-mid">
                    <span>체크인: <span className="font-semibold text-primary">{formatFullDate(checkIn)}</span></span>
                    {checkOut && (<>
                      <span className="hidden sm:inline">{" → "}</span>
                      <span className="sm:hidden text-text-light text-xs">↓</span>
                      <span>체크아웃: <span className="font-semibold text-primary">{formatFullDate(checkOut)}</span></span>
                      <span className="ml-2 text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full font-bold">{nights}박</span>
                    </>)}
                  </div>
                </div>
              )}
              {!program.rangeMode && selectedDate && (
                <div className="mt-4 p-3 bg-primary/5 border border-primary/20 rounded-xl text-center">
                  <p className="text-sm text-text-mid">선택한 날짜: <span className="font-semibold text-primary">{formatFullDate(selectedDate)}</span></p>
                </div>
              )}

              {/* Time Slots */}
              {programType === "half" && (
                <div className="mt-5">
                  <div className="flex items-center gap-2 mb-3"><Clock size={16} className="text-primary" /><h4 className="text-sm font-semibold text-text-dark">시간대 선택</h4></div>
                  <div className="grid grid-cols-2 gap-2">
                    {HALF_TIME_SLOTS.map((slot) => (
                      <button key={slot.id} onClick={() => setSelectedTimeSlot(slot.id)}
                        className={`p-3 rounded-xl border-2 text-center transition-all ${selectedTimeSlot === slot.id ? "border-primary bg-primary/5 shadow-sm" : "border-border bg-white hover:border-primary/30"}`}>
                        <p className={`text-sm font-semibold ${selectedTimeSlot === slot.id ? "text-primary" : "text-text-dark"}`}>{slot.label}</p>
                        <p className="text-xs text-text-light mt-0.5">{slot.time}</p>
                      </button>
                    ))}
                  </div>
                </div>
              )}
              {programType === "daynight" && (
                <div className="mt-5">
                  <div className="flex items-center gap-2 mb-3"><Sun size={16} className="text-primary" /><h4 className="text-sm font-semibold text-text-dark">시간대 선택</h4></div>
                  <div className="grid grid-cols-2 gap-3">
                    {DAYNIGHT_TIME_SLOTS.map((slot) => (
                      <button key={slot.id} onClick={() => setSelectedTimeSlot(slot.id)}
                        className={`p-4 rounded-xl border-2 text-center transition-all ${selectedTimeSlot === slot.id ? "border-primary bg-primary/5 shadow-sm" : "border-border bg-white hover:border-primary/30"}`}>
                        <span className="text-2xl block mb-1">{slot.emoji}</span>
                        <p className={`text-sm font-semibold ${selectedTimeSlot === slot.id ? "text-primary" : "text-text-dark"}`}>{slot.label}</p>
                        <p className="text-xs text-text-light mt-0.5">{slot.time}</p>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Options */}
            <div className="space-y-4">
              {/* Base Program */}
              <div className="bg-background rounded-2xl shadow-sm border border-border p-6">
                <div className="flex items-center gap-2 mb-4"><Users size={18} className="text-primary" /><h3 className="text-lg font-semibold text-text-dark">기본 프로그램</h3></div>
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <p className="font-medium text-text-dark">총 예약인원</p>
                    {extraGuests > 0
                      ? <p className="text-sm text-text-light">{BASE_PEOPLE}인 기본 + {extraGuests}인 추가 = <span className="font-semibold text-text-dark">{totalGuests}인</span></p>
                      : <p className="text-sm text-text-light">{BASE_PEOPLE}인 기본</p>
                    }
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-text-dark">{totalGuests}<span className="text-base font-medium">인</span></p>
                  </div>
                </div>
                <div className="p-3 bg-primary/5 border border-primary/20 rounded-xl flex items-center justify-between">
                  <span className="text-sm text-text-mid">1인당 예상 요금</span>
                  <span className="text-lg font-bold text-primary">{formatPrice(pricePerPerson)}</span>
                </div>
                {program.rangeMode && checkIn && checkOut && (
                  <div className="mt-2 pt-2 border-t border-border">
                    <p className="text-sm text-text-mid">{program.label} {formatPrice(program.basePrice)} × {nights}박 = <span className="font-semibold text-primary">{formatPrice(program.basePrice * nights)}</span></p>
                  </div>
                )}
              </div>

              {/* Extra Options */}
              <div className="bg-background rounded-2xl shadow-sm border border-border p-6">
                <h3 className="text-base font-semibold text-text-dark mb-4">추가 옵션</h3>
                <div className="space-y-4">
                  <Counter label="추가 인원" desc={`1인 ${formatPrice(EXTRA_GUEST_PRICE)}`} value={extraGuests}
                    onDec={() => setExtraGuests((g) => Math.max(0, g - 1))} onInc={() => setExtraGuests((g) => Math.min(30, g + 1))} />

                  <hr className="border-border" />

                  <Counter label="바베큐 세트" desc={`그릴당 ${formatPrice(BBQ_GRILL_PRICE)}`} value={bbqGrills}
                    onDec={() => setBbqGrills((g) => Math.max(0, g - 1))} onInc={() => setBbqGrills((g) => Math.min(10, g + 1))} />

                  <hr className="border-border" />

                  <Counter label="가스렌지" desc={`개당 ${formatPrice(GAS_RANGE_PRICE)} (최대 5개)`} value={gasRanges}
                    onDec={() => setGasRanges((g) => Math.max(0, g - 1))} onInc={() => setGasRanges((g) => Math.min(5, g + 1))} />

                  <hr className="border-border" />

                  {/* 저녁 식사 */}
                  <Counter label="저녁 식사" desc={`1인 ${formatPrice(DINNER_PRICE)} (고기+햇반+쌈장+채소)`} value={dinnerCount}
                    onDec={() => setDinnerCount((g) => Math.max(0, g - 1))} onInc={() => setDinnerCount((g) => Math.min(totalGuests, g + 1))} />

                  <hr className="border-border" />

                  {/* 목공 키트 */}
                  <Counter label="목공 키트 (트레이)" desc={`개당 ${formatPrice(WOODCRAFT_PRICE)}`} value={woodcraftCount}
                    onDec={() => setWoodcraftCount((g) => Math.max(0, g - 1))} onInc={() => setWoodcraftCount((g) => Math.min(30, g + 1))} />

                  <hr className="border-border" />

                  {/* 버스 렌트 */}
                  <div>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-text-dark text-sm flex items-center gap-1.5">
                          <Bus size={14} className="text-primary" /> 버스 렌트
                        </p>
                        <p className="text-xs text-text-light">별도 견적 (요청 후 안내)</p>
                      </div>
                      {busRequested ? (
                        <span className="text-xs bg-primary/10 text-primary px-3 py-1.5 rounded-full font-semibold">견적 요청됨</span>
                      ) : (
                        <button onClick={() => setShowBusForm(!showBusForm)}
                          className="text-xs bg-primary text-white px-4 py-2 rounded-full font-semibold hover:bg-primary-light transition-colors">
                          {showBusForm ? "닫기" : "견적 요청"}
                        </button>
                      )}
                    </div>
                    {showBusForm && !busRequested && (
                      <div className="mt-3 p-4 bg-sage/30 rounded-xl space-y-3">
                        <p className="text-xs font-semibold text-text-dark mb-2">픽업 정보</p>
                        <div className="grid grid-cols-2 gap-2">
                          <input placeholder="담당자 이름" value={busForm.managerName} onChange={(e) => setBusForm({ ...busForm, managerName: e.target.value })}
                            className="px-3 py-2 rounded-lg border border-border text-sm bg-white focus:outline-none focus:border-primary" />
                          <input placeholder="연락처" value={busForm.managerPhone} onChange={(e) => setBusForm({ ...busForm, managerPhone: e.target.value })}
                            className="px-3 py-2 rounded-lg border border-border text-sm bg-white focus:outline-none focus:border-primary" />
                        </div>
                        <div className="grid grid-cols-3 gap-2">
                          <input placeholder="픽업 장소" value={busForm.pickupPlace} onChange={(e) => setBusForm({ ...busForm, pickupPlace: e.target.value })}
                            className="px-3 py-2 rounded-lg border border-border text-sm bg-white focus:outline-none focus:border-primary" />
                          <input placeholder="인원" value={busForm.pickupPeople} onChange={(e) => setBusForm({ ...busForm, pickupPeople: e.target.value })}
                            className="px-3 py-2 rounded-lg border border-border text-sm bg-white focus:outline-none focus:border-primary" />
                          <input placeholder="시간" value={busForm.pickupTime} onChange={(e) => setBusForm({ ...busForm, pickupTime: e.target.value })}
                            className="px-3 py-2 rounded-lg border border-border text-sm bg-white focus:outline-none focus:border-primary" />
                        </div>

                        <p className="text-xs font-semibold text-text-dark mb-2 pt-2">하차 정보</p>
                        <div className="grid grid-cols-2 gap-2">
                          <input placeholder="담당자 이름" value={busForm.dropoffManagerName} onChange={(e) => setBusForm({ ...busForm, dropoffManagerName: e.target.value })}
                            className="px-3 py-2 rounded-lg border border-border text-sm bg-white focus:outline-none focus:border-primary" />
                          <input placeholder="연락처" value={busForm.dropoffManagerPhone} onChange={(e) => setBusForm({ ...busForm, dropoffManagerPhone: e.target.value })}
                            className="px-3 py-2 rounded-lg border border-border text-sm bg-white focus:outline-none focus:border-primary" />
                        </div>
                        <div className="grid grid-cols-3 gap-2">
                          <input placeholder="하차 장소" value={busForm.dropoffPlace} onChange={(e) => setBusForm({ ...busForm, dropoffPlace: e.target.value })}
                            className="px-3 py-2 rounded-lg border border-border text-sm bg-white focus:outline-none focus:border-primary" />
                          <input placeholder="인원" value={busForm.dropoffPeople} onChange={(e) => setBusForm({ ...busForm, dropoffPeople: e.target.value })}
                            className="px-3 py-2 rounded-lg border border-border text-sm bg-white focus:outline-none focus:border-primary" />
                          <input placeholder="시간" value={busForm.dropoffTime} onChange={(e) => setBusForm({ ...busForm, dropoffTime: e.target.value })}
                            className="px-3 py-2 rounded-lg border border-border text-sm bg-white focus:outline-none focus:border-primary" />
                        </div>

                        <button onClick={() => { setBusRequested(true); setShowBusForm(false); }}
                          className="w-full py-2.5 bg-primary text-white rounded-xl text-sm font-semibold hover:bg-primary-light transition-colors mt-2">
                          견적 요청하기
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Price Summary */}
          <div className="mt-8 bg-background rounded-2xl shadow-sm border border-border p-4 sm:p-6">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2"><ShoppingCart className="w-5 h-5 text-primary" /><h3 className="text-lg font-semibold text-text-dark">요금 요약</h3></div>
                <div className="text-sm text-text-mid space-y-0.5">
                  <p>{program.label} ({formatPrice(program.basePrice)}/{program.unit}{program.rangeMode && nights > 1 ? ` × ${nights}박` : ""}): {formatPrice(program.basePrice * nights)}</p>
                  {getTimeSlotLabel() && <p>시간대: {getTimeSlotLabel()}</p>}
                  {extraGuests > 0 && <p>추가 인원 ({extraGuests}명): {formatPrice(extraGuests * EXTRA_GUEST_PRICE)}</p>}
                  {bbqGrills > 0 && <p>바베큐 세트 ({bbqGrills}개): {formatPrice(bbqGrills * BBQ_GRILL_PRICE)}</p>}
                  {gasRanges > 0 && <p>가스렌지 ({gasRanges}개): {formatPrice(gasRanges * GAS_RANGE_PRICE)}</p>}
                  {dinnerCount > 0 && <p>저녁 식사 ({dinnerCount}명): {formatPrice(dinnerCount * DINNER_PRICE)}</p>}
                  {woodcraftCount > 0 && <p>목공 키트 ({woodcraftCount}개): {formatPrice(woodcraftCount * WOODCRAFT_PRICE)}</p>}
                  {busRequested && <p>버스 렌트: 별도 견적</p>}
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm text-text-light">총 결제 금액</p>
                <p className="text-3xl font-bold text-primary">{formatPrice(totalPrice)}</p>
                <p className="text-sm text-text-mid mt-1">1인당 약 <span className="font-semibold text-primary">{formatPrice(pricePerPerson)}</span></p>
                {busRequested && <p className="text-xs text-text-light mt-1">+ 버스 렌트 별도</p>}
              </div>
            </div>
            <button onClick={() => setShowConfirm(true)}
              className="mt-6 w-full py-4 bg-primary text-white rounded-2xl font-semibold text-lg hover:bg-primary-light transition-colors shadow-md hover:shadow-lg">
              예약하기
            </button>
          </div>
        </div>
      </section>

      {/* Confirm Popup */}
      {showConfirm && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 animate-fade-in">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setShowConfirm(false)} />
          <div className="relative bg-white rounded-3xl max-w-md w-full max-h-[90vh] overflow-y-auto shadow-2xl animate-scale-in p-5 sm:p-8">
            <button onClick={() => setShowConfirm(false)} className="absolute top-4 right-4 w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-colors"><X size={16} /></button>
            <div className="text-center mb-6">
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4"><ShoppingCart size={28} className="text-primary" /></div>
              <h3 className="text-xl font-bold text-text-dark">예약 확인</h3>
              <p className="text-sm text-text-light mt-1">아래 내용을 확인해주세요</p>
            </div>
            <div className="space-y-3 mb-6">
              <div className="flex justify-between text-sm"><span className="text-text-light">프로그램</span><span className="font-medium text-text-dark">{program.label}</span></div>
              {program.rangeMode && checkIn && checkOut && (
                <div className="flex justify-between text-sm gap-2"><span className="text-text-light flex-shrink-0">날짜</span>
                  <span className="font-medium text-text-dark text-right">{formatFullDate(checkIn)} ~<br className="sm:hidden" /> {formatFullDate(checkOut)} ({nights}박)</span></div>
              )}
              {!program.rangeMode && selectedDate && (
                <div className="flex justify-between text-sm"><span className="text-text-light">날짜</span><span className="font-medium text-text-dark">{formatFullDate(selectedDate)}</span></div>
              )}
              {getTimeSlotLabel() && <div className="flex justify-between text-sm"><span className="text-text-light">시간대</span><span className="font-medium text-text-dark">{getTimeSlotLabel()}</span></div>}
              <div className="flex justify-between text-sm"><span className="text-text-light">인원</span><span className="font-medium text-text-dark">{totalGuests}명</span></div>
              <hr className="border-border" />
              <div className="flex justify-between text-sm"><span className="text-text-light">{program.label}</span><span className="font-medium text-text-dark">{formatPrice(program.basePrice * nights)}</span></div>
              {extraGuests > 0 && <div className="flex justify-between text-sm"><span className="text-text-light">추가 인원</span><span className="font-medium text-text-dark">{formatPrice(extraGuests * EXTRA_GUEST_PRICE)}</span></div>}
              {bbqGrills > 0 && <div className="flex justify-between text-sm"><span className="text-text-light">바베큐 세트</span><span className="font-medium text-text-dark">{formatPrice(bbqGrills * BBQ_GRILL_PRICE)}</span></div>}
              {gasRanges > 0 && <div className="flex justify-between text-sm"><span className="text-text-light">가스렌지</span><span className="font-medium text-text-dark">{formatPrice(gasRanges * GAS_RANGE_PRICE)}</span></div>}
              {dinnerCount > 0 && <div className="flex justify-between text-sm"><span className="text-text-light">저녁 식사</span><span className="font-medium text-text-dark">{formatPrice(dinnerCount * DINNER_PRICE)}</span></div>}
              {woodcraftCount > 0 && <div className="flex justify-between text-sm"><span className="text-text-light">목공 키트</span><span className="font-medium text-text-dark">{formatPrice(woodcraftCount * WOODCRAFT_PRICE)}</span></div>}
              {busRequested && <div className="flex justify-between text-sm"><span className="text-text-light">버스 렌트</span><span className="font-medium text-amber-600">별도 견적</span></div>}
              <hr className="border-border" />
              <div className="flex justify-between"><span className="font-semibold text-text-dark">총 결제 금액</span><span className="font-bold text-primary text-lg">{formatPrice(totalPrice)}</span></div>
              <div className="flex justify-between text-sm"><span className="text-text-light">1인당</span><span className="font-medium text-primary">{formatPrice(pricePerPerson)}</span></div>
              {busRequested && <p className="text-xs text-text-light text-center">* 버스 렌트 비용은 별도 안내드립니다</p>}
            </div>
            <div className="flex gap-3">
              <button onClick={() => setShowConfirm(false)} className="flex-1 py-3 border-2 border-border rounded-xl font-semibold text-sm text-text-mid hover:bg-sage transition-colors">취소</button>
              <button onClick={() => { setShowConfirm(false); alert("예약이 완료되었습니다! 확인 메일을 보내드리겠습니다."); }}
                className="flex-1 py-3 bg-primary text-white rounded-xl font-semibold text-sm hover:bg-primary-light transition-colors">예약 확정</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
