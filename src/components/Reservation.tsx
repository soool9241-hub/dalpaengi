"use client";

import { useState, useMemo, useEffect, useCallback } from "react";
import { ChevronLeft, ChevronRight, Plus, Minus, ShoppingCart, Calendar, Users, X, Moon, Clock, Sun, Bus, Boxes } from "lucide-react";
import { useReservation } from "@/context/ReservationContext";
import { usePricing } from "@/context/SettingsContext";

const POT_BBQ_MIN = 10;

type ProgramType = "stay" | "half" | "daynight" | "jolib" | "healing";

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

const BASE_PEOPLE = 15;

interface Reservation {
  reservation_date: string;
  checkout_date: string | null;
  stay_nights: number;
  status: string;
}

// 날짜를 "YYYY-MM-DD" 형식으로 변환
function toDateStr(year: number, month: number, day: number): string {
  return `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

// Date 객체 → "YYYY-MM-DD" (로컬 시간 기준, toISOString은 UTC라 한국에서 하루 밀림)
function dateToStr(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

export default function Reservation() {
  const { selectedProgramId, selectedCheckInDate, setSelectedCheckInDate, isMTPackage } = useReservation();
  const { pricing, busRoutes } = usePricing();

  const PROGRAMS: Record<ProgramType, { label: string; icon: typeof Moon; basePrice: number; unit: string; rangeMode: boolean }> = useMemo(() => ({
    stay: { label: "숙박", icon: Moon, basePrice: pricing.stay, unit: "박", rangeMode: true },
    half: { label: "3시간 대여(평일만 가능)", icon: Clock, basePrice: pricing.half, unit: "회", rangeMode: false },
    daynight: { label: "주/야간 패키지(평일만 가능)", icon: Sun, basePrice: pricing.daynight, unit: "회", rangeMode: false },
    jolib: { label: "조립공간 CNC 체험", icon: Boxes, basePrice: 0, unit: "회", rangeMode: false },
    healing: { label: "힐링캠프 1박2일", icon: Moon, basePrice: 290000, unit: "인", rangeMode: false },
  }), [pricing]);

  const today = new Date();
  const [currentYear, setCurrentYear] = useState(today.getFullYear());
  const [currentMonth, setCurrentMonth] = useState(today.getMonth());

  const [programType, setProgramType] = useState<ProgramType>("stay");
  const [selectedTimeSlots, setSelectedTimeSlots] = useState<string[]>([]);

  const HALF_MAX_SLOTS = 3;

  const toggleTimeSlot = (slotId: string) => {
    setSelectedTimeSlots((prev) => {
      if (prev.includes(slotId)) return prev.filter((id) => id !== slotId);
      // 3시간 대여: 최대 3타임
      if (programType === "half" && prev.length >= HALF_MAX_SLOTS) return prev;
      return [...prev, slotId];
    });
  };

  // Supabase 예약 데이터
  const [bookedDates, setBookedDates] = useState<Set<string>>(new Set());
  const [loadingReservations, setLoadingReservations] = useState(false);

  // 예약 확정 상태
  const [guestName, setGuestName] = useState("");
  const [guestPhone, setGuestPhone] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Hero에서 프로그램 선택 시
  useEffect(() => {
    if (selectedProgramId) {
      setProgramType(selectedProgramId);
      setCheckIn(null);
      setCheckOut(null);
      setSelectedDate(null);
      setSelectedTimeSlots([]);
      // MT 패키지면 버스 선택함, 숙박이면 선택안함
      setShowBusForm(isMTPackage);
    }
  }, [selectedProgramId, isMTPackage]);

  // Hero에서 날짜 선택 시 → 달력에 체크인 + 체크아웃(1박) 자동 반영
  useEffect(() => {
    if (selectedCheckInDate) {
      const { year, month, day } = selectedCheckInDate;
      setCurrentYear(year);
      setCurrentMonth(month);
      if (programType === "stay") {
        setCheckIn({ year, month, day });
        // 1박 기준 체크아웃 자동 설정
        const nextDay = new Date(year, month, day + 1);
        setCheckOut({ year: nextDay.getFullYear(), month: nextDay.getMonth(), day: nextDay.getDate() });
      } else {
        setSelectedDate({ year, month, day });
      }
      setSelectedCheckInDate(null);
    }
  }, [selectedCheckInDate, programType, setSelectedCheckInDate]);

  const program = PROGRAMS[programType];

  const [checkIn, setCheckIn] = useState<{ year: number; month: number; day: number } | null>(null);
  const [checkOut, setCheckOut] = useState<{ year: number; month: number; day: number } | null>(null);
  const [selectedDate, setSelectedDate] = useState<{ year: number; month: number; day: number } | null>(null);

  const [extraGuests, setExtraGuests] = useState(15);
  const [bbqGrills, setBbqGrills] = useState(4); // 30명 / 8 = 4개
  const [gasRanges, setGasRanges] = useState(4); // 30명 / 8 = 4개
  const [dinnerCount, setDinnerCount] = useState(30); // 30명
  const [woodcraftCount, setWoodcraftCount] = useState(0);
  const [potBbqCount, setPotBbqCount] = useState(0); // 0=미선택, 10~N인분
  const [showConfirm, setShowConfirm] = useState(false);

  // Bus rental
  const [showBusForm, setShowBusForm] = useState(false);
  const [busForm, setBusForm] = useState({
    managerName: "",
    managerPhone: "",
    pickupPlace: "",
    customPickup: "",
    pickupPeople: "",
    pickupTime: "",
    dropoffManagerName: "",
    dropoffManagerPhone: "",
    dropoffPlace: "",
    customDropoff: "",
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

  // 서버 API에서 예약 데이터 조회 - 체크인~체크아웃 전날까지 차단 (에어비앤비 방식)
  // 체크인 오후 3시 ~ 체크아웃 오전 11시 → 체크아웃 날짜는 새 체크인 가능
  const fetchReservations = useCallback(async () => {
    setLoadingReservations(true);
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
      console.error("예약 데이터 조회 중 오류:", err);
    } finally {
      setLoadingReservations(false);
    }
  }, []);

  // 컴포넌트 마운트 시 + 월/프로그램 변경 시 예약 데이터 조회
  useEffect(() => {
    fetchReservations();
  }, [fetchReservations]);

  const isBooked = (day: number): boolean => {
    const dateStr = toDateStr(currentYear, currentMonth, day);
    return bookedDates.has(dateStr);
  };

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
    if (!program.rangeMode) {
      // 3시간 대여, 주/야간 패키지는 평일만 가능
      if (programType === "half" || programType === "daynight" || programType === "jolib") {
        const dayOfWeek = new Date(currentYear, currentMonth, day).getDay();
        if (dayOfWeek === 0 || dayOfWeek === 6) {
          alert("해당 프로그램은 평일만 예약 가능합니다.");
          return;
        }
      }
      setSelectedDate(clicked);
      return;
    }
    if (!checkIn || (checkIn && checkOut)) { setCheckIn(clicked); setCheckOut(null); }
    else {
      const d1 = new Date(checkIn.year, checkIn.month, checkIn.day);
      const d2 = new Date(clicked.year, clicked.month, clicked.day);
      if (d2 <= d1) { setCheckIn(clicked); setCheckOut(null); }
      else {
        // 체크인~체크아웃 전날까지 "숙박하는 밤"이 겹치는지 확인
        // 체크아웃 당일은 오전 퇴실이므로 겹치지 않음
        let hasConflict = false;
        for (let d = new Date(d1); d < d2; d.setDate(d.getDate() + 1)) {
          if (bookedDates.has(dateToStr(d))) {
            hasConflict = true;
            break;
          }
        }
        if (hasConflict) {
          alert("선택한 기간에 이미 예약이 있습니다. 체크아웃 날짜를 조정해주세요.");
          setCheckIn(clicked);
          setCheckOut(null);
        } else {
          setCheckOut(clicked);
        }
      }
    }
  };

  const handleProgramChange = (type: ProgramType) => {
    setProgramType(type);
    setCheckIn(null); setCheckOut(null); setSelectedDate(null); setSelectedTimeSlots([]);
    setShowBusForm(type !== "stay");
  };

  // 예약 확정 → Supabase INSERT (customers + reservations)
  const handleConfirmReservation = async () => {
    if (!guestName.trim() || !guestPhone.trim()) {
      alert("이름과 연락처를 입력해주세요.");
      return;
    }

    setIsSubmitting(true);
    try {
      // 날짜 결정
      let reservationDate: string;
      let stayNights = 1;
      if (program.rangeMode && checkIn && checkOut) {
        reservationDate = toDateStr(checkIn.year, checkIn.month, checkIn.day);
        stayNights = nights;
      } else if (selectedDate) {
        reservationDate = toDateStr(selectedDate.year, selectedDate.month, selectedDate.day);
      } else {
        alert("날짜를 선택해주세요.");
        setIsSubmitting(false);
        return;
      }

      const purposeMap: Record<string, string> = {
        stay: "숙박", half: "3시간 대여(평일)", daynight: "주/야간 패키지(평일)",
      };

      const notes = [
        extraGuests > 0 ? `추가인원 ${extraGuests}명` : "",
        dinnerCount > 0 ? `저녁식사 ${dinnerCount}명` : "",
        woodcraftCount > 0 ? `목공키트 ${woodcraftCount}개` : "",
        potBbqCount > 0 ? `항아리BBQ ${potBbqCount}인분` : "",
        busRequested ? "버스 렌트 요청" : "",
        selectedTimeSlots.length > 0 ? `시간대: ${getTimeSlotLabel()}` : "",
      ].filter(Boolean).join(", ") || null;

      // checkout_date 계산
      const ciDate = new Date(reservationDate);
      ciDate.setDate(ciDate.getDate() + stayNights);
      const checkoutDate = `${ciDate.getFullYear()}-${String(ciDate.getMonth() + 1).padStart(2, "0")}-${String(ciDate.getDate()).padStart(2, "0")}`;

      // API를 통해 예약 저장 (service_role key 사용)
      const apiRes = await fetch("/api/reservations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          guestName: guestName.trim(),
          guestPhone: guestPhone.trim(),
          reservationDate,
          checkoutDate,
          stayNights,
          totalGuests,
          extraGuests,
          programType,
          bbqGrills,
          gasRanges,
          dinnerCount,
          woodcraftCount,
          potBbqCount,
          busRequested: showBusForm,
          busForm: showBusForm ? busForm : null,
          selectedTimeSlot: selectedTimeSlots.join(",") || null,
          totalPrice,
          notes,
          purpose: purposeMap[programType] || programType,
        }),
      });

      const apiJson = await apiRes.json();
      if (!apiRes.ok || !apiJson.success) {
        console.error("예약 API 실패:", apiJson);
        alert("예약 저장에 실패했습니다. 다시 시도해주세요.\n" + (apiJson.error || ""));
        return;
      }

      // SMS 발송
      const dateLabel = program.rangeMode && checkIn
        ? `${checkIn.year}년 ${checkIn.month + 1}월 ${checkIn.day}일`
        : selectedDate ? `${selectedDate.year}년 ${selectedDate.month + 1}월 ${selectedDate.day}일` : "";

      const timeSlotLabel = getTimeSlotLabel();

      try {
        await fetch("/api/send-sms", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            guestName: guestName.trim(),
            guestPhone: guestPhone.trim().replace(/[^0-9]/g, ""),
            reservationDate: dateLabel,
            stayNights: stayNights,
            totalGuests: totalGuests,
            baseGuests: BASE_PEOPLE,
            extraGuests: extraGuests,
            programLabel: purposeMap[programType] || programType,
            programType,
            basePrice: program.basePrice,
            programPrice,
            slotCount: selectedTimeSlots.length,
            bbqGrills,
            gasRanges,
            dinnerCount,
            woodcraftCount,
            potBbqCount,
            busRequested: showBusForm,
            busPrice: busRoutes[busForm.pickupPlace] || 0,
            busManagerName: busForm.managerName,
            busManagerPhone: busForm.managerPhone,
            busPickupPlace: busForm.pickupPlace === "기타" ? busForm.customPickup : busForm.pickupPlace,
            busPickupPeople: busForm.pickupPeople,
            busPickupTime: busForm.pickupTime,
            busDropoffPlace: busForm.pickupPlace === "기타" ? busForm.customDropoff : busForm.pickupPlace,
            busDropoffPeople: busForm.dropoffPeople,
            busDropoffTime: busForm.dropoffTime,
            timeSlot: timeSlotLabel,
            totalPrice,
          }),
        });
      } catch (smsErr) {
        console.error("SMS 발송 실패:", smsErr);
      }

      setShowConfirm(false);
      alert("예약이 완료되었습니다! 확인 문자가 발송됩니다.");

      // 달력 갱신
      await fetchReservations();

      // 폼 초기화
      setCheckIn(null);
      setCheckOut(null);
      setSelectedDate(null);
      setSelectedTimeSlots([]);
      setExtraGuests(0);
      setBbqGrills(0);
      setGasRanges(0);
      setDinnerCount(0);
      setWoodcraftCount(0);
      setPotBbqCount(0);
      setGuestName("");
      setGuestPhone("");
    } catch (err) {
      console.error("예약 처리 중 오류:", err);
      alert("예약 처리 중 오류가 발생했습니다.");
    } finally {
      setIsSubmitting(false);
    }
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
  const isPastDate = (day: number) => new Date(currentYear, currentMonth, day) <= new Date(today.getFullYear(), today.getMonth(), today.getDate());
  const isWeekend = (day: number) => {
    const dow = new Date(currentYear, currentMonth, day).getDay();
    return dow === 0 || dow === 6;
  };
  const isWeekdayOnly = programType === "half" || programType === "daynight" || programType === "jolib";

  const busPrice = showBusForm && busForm.pickupPlace && busForm.pickupPlace !== "기타" ? (busRoutes[busForm.pickupPlace] || 0) : 0;

  // 프로그램 기본 요금 (타임슬롯 기반)
  const programPrice = useMemo(() => {
    if (programType === "half") {
      const count = Math.max(1, selectedTimeSlots.length);
      return pricing.half + (count - 1) * pricing.halfExtra;
    }
    if (programType === "daynight") {
      const count = Math.max(1, selectedTimeSlots.length);
      return pricing.daynight * count;
    }
    if (programType === "jolib") return 0;
    if (programType === "healing") return 290000 * Math.max(10, totalGuests);
    return program.basePrice * nights;
  }, [programType, selectedTimeSlots.length, pricing.half, pricing.halfExtra, pricing.daynight, program.basePrice, nights]);

  const totalPrice = useMemo(() => {
    let total = programPrice;
    total += extraGuests * pricing.extraGuest;
    total += bbqGrills * pricing.bbqGrill;
    total += gasRanges * pricing.gasRange;
    total += dinnerCount * pricing.dinner;
    total += woodcraftCount * pricing.woodcraft;
    total += potBbqCount * pricing.potBbq;
    total += busPrice;
    return total;
  }, [programPrice, extraGuests, bbqGrills, gasRanges, dinnerCount, woodcraftCount, potBbqCount, busPrice, pricing]);

  const pricePerPerson = useMemo(() => Math.round(totalPrice / totalGuests), [totalPrice, totalGuests]);

  const formatPrice = (price: number) => price.toLocaleString("ko-KR") + "원";

  const calendarDays: (number | null)[] = [];
  for (let i = 0; i < firstDayOfWeek; i++) calendarDays.push(null);
  for (let d = 1; d <= daysInMonth; d++) calendarDays.push(d);

  const formatFullDate = (d: { year: number; month: number; day: number }) => `${d.year}년 ${d.month + 1}월 ${d.day}일`;

  const getTimeSlotLabel = () => {
    if (selectedTimeSlots.length === 0) return null;
    if (programType === "half") {
      return selectedTimeSlots.map((id) => {
        const s = HALF_TIME_SLOTS.find((s) => s.id === id);
        return s ? `${s.label} (${s.time})` : null;
      }).filter(Boolean).join(", ");
    }
    if (programType === "daynight") {
      return selectedTimeSlots.map((id) => {
        const s = DAYNIGHT_TIME_SLOTS.find((s) => s.id === id);
        return s ? `${s.label} (${s.time})` : null;
      }).filter(Boolean).join(", ");
    }
    return null;
  };

  // Counter component for DRY
  const Counter = ({ label, desc, value, unitPrice, onDec, onInc, onChange }: { label: string; desc: string; value: number; unitPrice?: number; onDec: () => void; onInc: () => void; onChange?: (v: number) => void }) => (
    <div className="flex items-center justify-between">
      <div>
        <p className="font-medium text-text-dark text-sm">{label}</p>
        <p className="text-xs text-text-light inline">{desc}</p>
        {value > 0 && unitPrice && (
          <span className="text-xs text-primary font-semibold ml-2">{formatPrice(unitPrice)} x {value} = {formatPrice(value * unitPrice)}</span>
        )}
      </div>
      <div className="flex items-center gap-3">
        <button onClick={onDec} className="w-8 h-8 rounded-full border border-border flex items-center justify-center hover:bg-sage transition-colors">
          <Minus className="w-3.5 h-3.5 text-text-mid" />
        </button>
        <input
          type="number"
          min={0}
          value={value}
          onFocus={(e) => e.target.select()}
          onChange={(e) => {
            const v = Math.max(0, parseInt(e.target.value) || 0);
            if (onChange) onChange(v);
          }}
          className="w-12 text-center font-semibold text-text-dark text-sm border border-border rounded-lg py-1 focus:outline-none focus:border-primary"
        />
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
            {/* MT 패키지 */}
            <button onClick={() => { handleProgramChange("stay"); setShowBusForm(true); }}
              className={`flex-1 flex items-center gap-3 p-4 rounded-2xl border-2 transition-all relative ${programType === "stay" && showBusForm ? "border-primary bg-primary/5 shadow-md" : "border-border bg-white hover:border-primary/30"}`}>
              <div className="absolute -top-2 right-3 bg-primary text-white text-[10px] font-bold px-2 py-0.5 rounded-full">추천</div>
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${programType === "stay" && showBusForm ? "bg-primary text-white" : "bg-sage text-text-light"}`}>
                <span className="text-lg">🎓</span>
              </div>
              <div className="text-left">
                <p className={`font-semibold text-sm ${programType === "stay" && showBusForm ? "text-primary" : "text-text-dark"}`}>대학생 MT 패키지</p>
                <p className="text-xs text-text-light">{formatPrice(pricing.stay)}/박 (60명 수용)</p>
              </div>
            </button>
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
                {loadingReservations && <span className="text-xs text-text-light animate-pulse ml-auto">불러오는 중...</span>}
              </div>
              {program.rangeMode && <p className="text-xs text-text-light mb-4">첫 번째 클릭 = 체크인, 두 번째 클릭 = 체크아웃</p>}
              {isWeekdayOnly && <p className="text-xs text-amber-600 font-semibold mb-4">* 평일(월~금)만 예약 가능한 프로그램입니다</p>}
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
                {(() => {
                  // 체크아웃 선택 모드: 체크인 이후 첫 번째 예약 날짜를 찾아서 그 이후는 전부 차단
                  const isSelectingCheckout = program.rangeMode && checkIn && !checkOut;
                  let maxCheckoutDate: string | null = null;
                  if (isSelectingCheckout && checkIn) {
                    const ciDate = new Date(checkIn.year, checkIn.month, checkIn.day);
                    // 체크인 다음날부터 탐색해서 첫 번째 예약(마감) 날짜 찾기
                    for (let i = 1; i <= 365; i++) {
                      const d = new Date(ciDate);
                      d.setDate(d.getDate() + i);
                      const ds = dateToStr(d);
                      if (bookedDates.has(ds)) {
                        // 이 날짜가 체크아웃 가능한 최대 날짜 (퇴실 가능)
                        maxCheckoutDate = ds;
                        break;
                      }
                    }
                  }

                  return calendarDays.map((day, idx) => {
                    if (day === null) return <div key={`empty-${idx}`} />;
                    const past = isPastDate(day);
                    const booked = isBooked(day);
                    const dateStr = toDateStr(currentYear, currentMonth, day);

                    // 체크아웃 모드에서의 비활성화 판단
                    let disabledInCheckoutMode = false;
                    let isCheckoutAllowed = false;
                    if (isSelectingCheckout) {
                      const ciDate = new Date(checkIn!.year, checkIn!.month, checkIn!.day);
                      const thisDate = new Date(currentYear, currentMonth, day);
                      if (thisDate <= ciDate) {
                        // 체크인 당일 또는 이전 → 비활성화
                        disabledInCheckoutMode = true;
                      } else if (maxCheckoutDate && dateStr === maxCheckoutDate) {
                        // 첫 번째 예약 날짜 = 체크아웃 가능 (퇴실)
                        isCheckoutAllowed = true;
                      } else if (maxCheckoutDate && dateStr > maxCheckoutDate) {
                        // 첫 번째 예약 이후 → 완전 비활성화
                        disabledInCheckoutMode = true;
                      }
                    }

                    const weekendBlocked = isWeekdayOnly && isWeekend(day);
                    const disabled = !!(past
                      || weekendBlocked
                      || (booked && !isSelectingCheckout)
                      || (isSelectingCheckout && disabledInCheckoutMode));
                    const dayOfWeek = (firstDayOfWeek + day - 1) % 7;
                    const isCI = isCheckIn(day); const isCO = isCheckOut(day);
                    const inRange = isInRange(day); const isSingle = isSingleSelected(day);
                    const isSelected = isCI || isCO || isSingle;
                    return (
                      <button key={day} onClick={() => handleDateClick(day)} disabled={disabled}
                        className={`py-2.5 rounded-xl text-sm font-medium transition-all relative
                          ${past ? "text-text-light/30 cursor-not-allowed"
                          : weekendBlocked ? "text-text-light/30 cursor-not-allowed bg-gray-50"
                          : disabled && isSelectingCheckout ? "text-text-light/30 cursor-not-allowed"
                          : disabled ? "bg-red-100 text-red-400 cursor-not-allowed"
                          : isCheckoutAllowed ? "bg-orange-100 text-orange-500 hover:bg-orange-200"
                          : isSelected ? "bg-primary text-white shadow-md"
                          : inRange ? "bg-primary/15 text-primary"
                          : dayOfWeek === 0 ? "text-red-400 hover:bg-sage"
                          : dayOfWeek === 6 ? "text-blue-400 hover:bg-sage"
                          : "text-text-dark hover:bg-sage"}`}>
                        {day}
                        {isCI && <span className="absolute -bottom-0.5 left-1/2 -translate-x-1/2 text-[8px] text-white/80">IN</span>}
                        {isCO && <span className="absolute -bottom-0.5 left-1/2 -translate-x-1/2 text-[8px] text-white/80">OUT</span>}
                        {booked && !past && !isSelectingCheckout && <span className="absolute -bottom-0.5 left-1/2 -translate-x-1/2 text-[7px] text-red-400 font-bold">마감</span>}
                        {isCheckoutAllowed && <span className="absolute -bottom-0.5 left-1/2 -translate-x-1/2 text-[7px] text-orange-500 font-bold">퇴실</span>}
                      </button>
                    );
                  });
                })()}
              </div>

              {/* 범례 */}
              <div className="mt-3 flex items-center gap-4 text-xs text-text-light">
                <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-red-100 inline-block"></span> 예약마감</span>
                <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-primary inline-block"></span> 선택됨</span>
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
                  <div className="flex items-center gap-2 mb-1"><Clock size={16} className="text-primary" /><h4 className="text-sm font-semibold text-text-dark">시간대 선택 <span className="text-xs font-normal text-text-light">(최소 1개, 최대 {HALF_MAX_SLOTS}개)</span></h4></div>
                  <p className="text-xs text-primary mb-3">기본 1타임 {formatPrice(pricing.half)} / 추가 타임당 {formatPrice(pricing.halfExtra)}</p>
                  <div className="grid grid-cols-2 gap-2">
                    {HALF_TIME_SLOTS.map((slot) => {
                      const selected = selectedTimeSlots.includes(slot.id);
                      return (
                        <button key={slot.id} onClick={() => toggleTimeSlot(slot.id)}
                          className={`p-3 rounded-xl border-2 text-center transition-all ${selected ? "border-primary bg-primary/5 shadow-sm" : "border-border bg-white hover:border-primary/30"}`}>
                          <p className={`text-sm font-semibold ${selected ? "text-primary" : "text-text-dark"}`}>{slot.label}</p>
                          <p className="text-xs text-text-light mt-0.5">{slot.time}</p>
                          {selected && <p className="text-[10px] text-primary font-bold mt-1">선택됨</p>}
                        </button>
                      );
                    })}
                  </div>
                  {selectedTimeSlots.length > 1 && (
                    <div className="mt-2 p-2.5 bg-primary/5 border border-primary/20 rounded-xl text-center">
                      <p className="text-xs text-text-mid">{selectedTimeSlots.length}타임 선택: {formatPrice(pricing.half)} + {selectedTimeSlots.length - 1} × {formatPrice(pricing.halfExtra)} = <span className="font-bold text-primary">{formatPrice(programPrice)}</span></p>
                    </div>
                  )}
                </div>
              )}
              {programType === "healing" && selectedDate && (
                <div className="mt-5">
                  <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl">
                    <p className="text-sm font-semibold text-emerald-700 mb-1">힐링캠프 1박2일</p>
                    <p className="text-xs text-emerald-600">15:00 입실 ~ 익일 11:00 퇴실</p>
                    <p className="text-xs text-emerald-600 mt-1">1인 290,000원 · 최소 10명 ~ 최대 15명</p>
                    <p className="text-xs text-emerald-600 mt-1">석식 + 조식 + 프로그램 4종 포함</p>
                  </div>
                </div>
              )}
              {programType === "jolib" && selectedDate && (
                <div className="mt-5">
                  <div className="p-4 bg-teal-50 border border-teal-200 rounded-xl">
                    <p className="text-sm font-semibold text-teal-700 mb-1">조립공간 CNC 체험</p>
                    <p className="text-xs text-teal-600">1회 20분 · 회당 최대 6명 · 초기 이벤트 <span className="font-bold text-red-500">무료</span></p>
                    <p className="text-xs text-teal-600 mt-1">(정가: 현금 5,000원 / 카드 5,500원)</p>
                    <p className="text-xs text-teal-600 mt-1">체험 후 50,000원 상당 무료 체험 바우처 증정!</p>
                  </div>
                </div>
              )}
              {programType === "daynight" && (
                <div className="mt-5">
                  <div className="flex items-center gap-2 mb-1"><Sun size={16} className="text-primary" /><h4 className="text-sm font-semibold text-text-dark">시간대 선택 <span className="text-xs font-normal text-text-light">(복수 선택 가능)</span></h4></div>
                  <p className="text-xs text-primary mb-3">타임당 {formatPrice(pricing.daynight)}</p>
                  <div className="grid grid-cols-2 gap-3">
                    {DAYNIGHT_TIME_SLOTS.map((slot) => {
                      const selected = selectedTimeSlots.includes(slot.id);
                      return (
                        <button key={slot.id} onClick={() => toggleTimeSlot(slot.id)}
                          className={`p-4 rounded-xl border-2 text-center transition-all ${selected ? "border-primary bg-primary/5 shadow-sm" : "border-border bg-white hover:border-primary/30"}`}>
                          <span className="text-2xl block mb-1">{slot.emoji}</span>
                          <p className={`text-sm font-semibold ${selected ? "text-primary" : "text-text-dark"}`}>{slot.label}</p>
                          <p className="text-xs text-text-light mt-0.5">{slot.time}</p>
                          {selected && <p className="text-[10px] text-primary font-bold mt-1">선택됨</p>}
                        </button>
                      );
                    })}
                  </div>
                  {selectedTimeSlots.length > 1 && (
                    <div className="mt-2 p-2.5 bg-primary/5 border border-primary/20 rounded-xl text-center">
                      <p className="text-xs text-text-mid">{selectedTimeSlots.length}타임 선택: {formatPrice(pricing.daynight)} × {selectedTimeSlots.length} = <span className="font-bold text-primary">{formatPrice(programPrice)}</span></p>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Options */}
            <div className="space-y-4">
              {/* Base Program */}
              <div className="bg-background rounded-2xl shadow-sm border border-border p-6">
                <div className="flex items-center gap-2 mb-4"><Users size={18} className="text-primary" /><h3 className="text-lg font-semibold text-text-dark">{showBusForm && programType === "stay" ? "대학생 MT 패키지 (60명 수용가능)" : program.label}</h3></div>

                {programType === "healing" ? (
                  <div>
                    <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl mb-4">
                      <p className="text-sm font-semibold text-emerald-700 mb-2">힐링캠프 1박2일 안내</p>
                      <ul className="text-xs text-emerald-600 space-y-1">
                        <li>• 15:00 입실 ~ 익일 11:00 퇴실</li>
                        <li>• 프로그램 4종 (필라테스/명상/자기탐색/싱잉볼)</li>
                        <li>• 석식 (화심두부마을) + 건강한 조식 포함</li>
                        <li>• 아침 걷기 명상 (오소소 둘렛길)</li>
                        <li>• 1인 <span className="font-bold">290,000원</span></li>
                      </ul>
                    </div>
                    <label className="text-sm font-medium text-text-dark mb-2 block">참가 인원 (최소 10명 ~ 최대 15명)</label>
                    <div className="flex items-center gap-3">
                      <button onClick={() => setExtraGuests((v) => Math.max(10, (v < 10 ? 10 : v) - 1))}
                        className="w-8 h-8 rounded-full border border-border flex items-center justify-center hover:bg-sage transition-colors">
                        <Minus className="w-3.5 h-3.5 text-text-mid" />
                      </button>
                      <input type="number" min={10} max={15} value={Math.min(15, Math.max(10, extraGuests < 10 ? 10 : extraGuests))}
                        onFocus={(e) => e.target.select()}
                        onChange={(e) => setExtraGuests(Math.min(15, Math.max(10, parseInt(e.target.value) || 10)))}
                        className="w-16 text-center text-lg font-bold text-primary bg-white border-2 border-primary/30 rounded-xl py-1.5 focus:outline-none focus:border-primary" />
                      <button onClick={() => setExtraGuests((v) => Math.min(15, (v < 10 ? 10 : v) + 1))}
                        className="w-8 h-8 rounded-full border border-border flex items-center justify-center hover:bg-sage transition-colors">
                        <Plus className="w-3.5 h-3.5 text-text-mid" />
                      </button>
                      <span className="text-sm text-text-mid">명</span>
                    </div>
                    <div className="mt-4 p-3 bg-primary/5 border border-primary/20 rounded-xl text-center">
                      <p className="text-sm text-text-mid">{Math.max(10, extraGuests < 10 ? 10 : extraGuests)}명 × 290,000원</p>
                      <p className="text-2xl font-bold text-primary mt-1">{(290000 * Math.max(10, extraGuests < 10 ? 10 : extraGuests)).toLocaleString()}원</p>
                    </div>
                  </div>
                ) : programType === "jolib" ? (
                  <div>
                    <div className="p-4 bg-teal-50 border border-teal-200 rounded-xl mb-4">
                      <p className="text-sm font-semibold text-teal-700 mb-2">조립공간 CNC 체험 안내</p>
                      <ul className="text-xs text-teal-600 space-y-1">
                        <li>• 1회 20분 / 회당 최대 6명</li>
                        <li>• 정가: 현금 5,000원 / 카드 5,500원</li>
                        <li>• 체험 후 50,000원 상당 바우처 증정</li>
                        <li>• <span className="font-bold text-red-500">초기 이벤트 무료!</span></li>
                      </ul>
                    </div>
                    <label className="text-sm font-medium text-text-dark mb-2 block">체험 인원</label>
                    <div className="flex items-center gap-3">
                      <button onClick={() => setExtraGuests((v) => Math.max(1, (v || 1) - 1))}
                        className="w-8 h-8 rounded-full border border-border flex items-center justify-center hover:bg-sage transition-colors">
                        <Minus className="w-3.5 h-3.5 text-text-mid" />
                      </button>
                      <input type="number" min={1} max={6} value={Math.min(6, Math.max(1, extraGuests || 1))}
                        onFocus={(e) => e.target.select()}
                        onChange={(e) => setExtraGuests(Math.min(6, Math.max(1, parseInt(e.target.value) || 1)))}
                        className="w-16 text-center text-lg font-bold text-primary bg-white border-2 border-primary/30 rounded-xl py-1.5 focus:outline-none focus:border-primary" />
                      <button onClick={() => setExtraGuests((v) => Math.min(6, (v || 1) + 1))}
                        className="w-8 h-8 rounded-full border border-border flex items-center justify-center hover:bg-sage transition-colors">
                        <Plus className="w-3.5 h-3.5 text-text-mid" />
                      </button>
                      <span className="text-sm text-text-mid">명</span>
                    </div>
                    {(extraGuests || 0) < 1 && <p className="text-xs text-red-500 mt-2">* 인원을 입력해주세요</p>}
                    <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-xl text-center">
                      <p className="text-lg font-bold text-red-500">무료 <span className="text-xs font-normal text-text-light line-through ml-1">{((extraGuests || 1) * 5000).toLocaleString()}원</span></p>
                      <p className="text-xs text-text-light">초기 이벤트 진행 중</p>
                    </div>
                  </div>
                ) : (
                <>
                {/* 인원 입력 */}
                <div className="mb-4">
                  <label className="text-sm font-medium text-text-dark mb-2 block">예약 인원</label>
                  <div className="flex items-center gap-2 mb-2">
                    <div className="flex items-center gap-1.5 bg-sage/50 rounded-xl px-4 py-2.5">
                      <span className="text-sm text-text-mid">기본</span>
                      <span className="text-lg font-bold text-text-dark">{BASE_PEOPLE}</span>
                      <span className="text-sm text-text-mid">인</span>
                    </div>
                    <span className="text-lg text-text-light">+</span>
                    <div className="flex items-center gap-1.5">
                      <span className="text-sm text-text-mid">추가</span>
                      <input
                        type="number"
                        min={0}
                        value={extraGuests}
                        onFocus={(e) => e.target.select()}
                        onChange={(e) => {
                          const extra = Math.max(0, parseInt(e.target.value) || 0);
                          setExtraGuests(extra);
                          const val = BASE_PEOPLE + extra;
                          setBbqGrills(Math.min(6, Math.ceil(val / 8)));
                          setGasRanges(Math.min(5, Math.ceil(val / 8)));
                          setDinnerCount(val);
                        }}
                        className="w-14 text-center text-lg font-bold text-primary bg-white border-2 border-primary/30 rounded-xl py-1.5 focus:outline-none focus:border-primary"
                      />
                      <span className="text-sm text-text-mid">인</span>
                    </div>
                    <span className="text-lg text-text-light">=</span>
                    <div className="flex items-center gap-1 bg-primary/10 rounded-xl px-4 py-2.5">
                      <span className="text-lg font-bold text-primary">{totalGuests}</span>
                      <span className="text-sm text-primary">명</span>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      setBbqGrills(Math.min(6, Math.ceil(totalGuests / 8)));
                      setGasRanges(Math.min(5, Math.ceil(totalGuests / 8)));
                      setDinnerCount(totalGuests);
                    }}
                    className="px-4 py-2 bg-primary/10 text-primary text-xs font-semibold rounded-full hover:bg-primary/20 transition-colors"
                  >
                    옵션 자동추천
                  </button>
                </div>

                <div className="p-3 bg-primary/5 border border-primary/20 rounded-xl flex items-center justify-between">
                  <span className="text-sm text-text-mid">1인당 예상 요금</span>
                  <span className="text-lg font-bold text-primary">{formatPrice(pricePerPerson)}</span>
                </div>
                {program.rangeMode && checkIn && checkOut && (
                  <div className="mt-2 pt-2 border-t border-border">
                    <p className="text-sm text-text-mid">{program.label} {formatPrice(program.basePrice)} × {nights}박 = <span className="font-semibold text-primary">{formatPrice(programPrice)}</span></p>
                  </div>
                )}
                </>
                )}
              </div>

              {/* Extra Options */}
              {programType !== "jolib" && programType !== "healing" && (
              <div className="bg-background rounded-2xl shadow-sm border border-border p-6">
                <h3 className="text-base font-semibold text-text-dark mb-2">추가 옵션</h3>
                {extraGuests > 0 && (
                  <div className="mb-4 p-2.5 bg-primary/5 border border-primary/20 rounded-xl">
                    <p className="text-xs text-text-mid">추가 인원 {extraGuests}명 × {formatPrice(pricing.extraGuest)} = <span className="font-semibold text-primary">{formatPrice(extraGuests * pricing.extraGuest)}</span></p>
                  </div>
                )}
                <div className="space-y-4">
                  <Counter label="그릴 대여" desc={`숯+그릴+토치 / 그릴당 ${formatPrice(pricing.bbqGrill)} (최대 6개)`} value={bbqGrills} unitPrice={pricing.bbqGrill}
                    onDec={() => setBbqGrills((g) => Math.max(0, g - 1))} onInc={() => setBbqGrills((g) => Math.min(6, g + 1))} onChange={(v) => setBbqGrills(Math.min(6, v))} />

                  <hr className="border-border" />

                  <Counter label="가스렌지" desc={`버너+가스+불판 / 개당 ${formatPrice(pricing.gasRange)} (최대 5개)`} value={gasRanges} unitPrice={pricing.gasRange}
                    onDec={() => setGasRanges((g) => Math.max(0, g - 1))} onInc={() => setGasRanges((g) => Math.min(5, g + 1))} onChange={(v) => setGasRanges(Math.min(5, v))} />

                  <hr className="border-border" />

                  {/* 저녁 식사 */}
                  <Counter label="저녁 식사" desc={`1인 ${formatPrice(pricing.dinner)} (고기+햇반+쌈장+채소)`} value={dinnerCount} unitPrice={pricing.dinner}
                    onDec={() => setDinnerCount((g) => Math.max(0, g - 1))} onInc={() => setDinnerCount((g) => g + 1)} onChange={(v) => setDinnerCount(v)} />

                  <hr className="border-border" />

                  {/* 항아리 바베큐 */}
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-text-dark text-sm">항아리 바베큐 (통삼겹)</p>
                      <p className="text-xs text-text-light">1인 {formatPrice(pricing.potBbq)}</p>
                      <span className="inline-block mt-1 text-[11px] font-bold text-red-500 bg-red-50 border border-red-200 px-2 py-0.5 rounded-full">
                        * 최소 {POT_BBQ_MIN}인분부터 주문 가능
                      </span>
                      {potBbqCount > 0 && (
                        <p className="text-xs text-primary font-semibold mt-1">{potBbqCount}인분 = {formatPrice(potBbqCount * pricing.potBbq)}</p>
                      )}
                    </div>
                    <div className="flex items-center gap-3">
                      <button onClick={() => setPotBbqCount((c) => c <= POT_BBQ_MIN ? 0 : c - 1)}
                        className="w-8 h-8 rounded-full border border-border flex items-center justify-center hover:bg-sage transition-colors">
                        <Minus className="w-3.5 h-3.5 text-text-mid" />
                      </button>
                      <input
                        type="number"
                        min={0}
                        value={potBbqCount}
                        onFocus={(e) => e.target.select()}
                        onChange={(e) => {
                          const v = Math.max(0, parseInt(e.target.value) || 0);
                          setPotBbqCount(v > 0 && v < POT_BBQ_MIN ? POT_BBQ_MIN : v);
                        }}
                        className="w-12 text-center font-semibold text-text-dark text-sm border border-border rounded-lg py-1 focus:outline-none focus:border-primary"
                      />
                      <button onClick={() => setPotBbqCount((c) => c === 0 ? POT_BBQ_MIN : Math.min(50, c + 1))}
                        className="w-8 h-8 rounded-full border border-border flex items-center justify-center hover:bg-sage transition-colors">
                        <Plus className="w-3.5 h-3.5 text-text-mid" />
                      </button>
                    </div>
                  </div>

                  <hr className="border-border" />

                  {/* 버스 렌트 */}
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <p className="font-medium text-text-dark text-sm flex items-center gap-1.5">
                          <Bus size={14} className="text-primary" /> 버스 렌트
                        </p>
                        <p className="text-xs text-text-light">별도 견적 (요청 후 안내)</p>
                      </div>
                      <div className="flex bg-sage/50 rounded-full p-0.5">
                        <button onClick={() => { setShowBusForm(false); setBusRequested(false); }}
                          className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-all ${!showBusForm ? "bg-white text-text-dark shadow-sm" : "text-text-light"}`}>
                          선택안함
                        </button>
                        <button onClick={() => setShowBusForm(true)}
                          className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-all ${showBusForm ? "bg-primary text-white shadow-sm" : "text-text-light"}`}>
                          선택함
                        </button>
                      </div>
                    </div>
                    {showBusForm && (
                      <div className="mt-3 p-4 bg-sage/30 rounded-xl space-y-3">
                        <p className="text-xs font-semibold text-text-dark mb-2">책임자 정보</p>
                        <div className="grid grid-cols-2 gap-2">
                          <input placeholder="담당자 이름" value={busForm.managerName} onChange={(e) => setBusForm({ ...busForm, managerName: e.target.value })}
                            className="px-3 py-2 rounded-lg border border-border text-sm bg-white focus:outline-none focus:border-primary" />
                          <input placeholder="연락처" value={busForm.managerPhone} onChange={(e) => setBusForm({ ...busForm, managerPhone: e.target.value })}
                            className="px-3 py-2 rounded-lg border border-border text-sm bg-white focus:outline-none focus:border-primary" />
                        </div>

                        <p className="text-xs font-semibold text-text-dark mb-2 pt-2">승차 정보</p>
                        <div className="grid grid-cols-3 gap-2">
                          <select value={busForm.pickupPlace} onChange={(e) => setBusForm({ ...busForm, pickupPlace: e.target.value, dropoffPlace: e.target.value })}
                            className="px-3 py-2 rounded-lg border border-border text-sm bg-white focus:outline-none focus:border-primary">
                            <option value="">출발지 선택</option>
                            {Object.entries(busRoutes).map(([name, price]) => (
                              <option key={name} value={name}>{name} (왕복 {(price / 10000).toFixed(0)}만원)</option>
                            ))}
                            <option value="기타">기타 (직접입력)</option>
                          </select>
                          <input placeholder="인원" value={busForm.pickupPeople} onChange={(e) => setBusForm({ ...busForm, pickupPeople: e.target.value })}
                            className="px-3 py-2 rounded-lg border border-border text-sm bg-white focus:outline-none focus:border-primary" />
                          <select value={busForm.pickupTime} onChange={(e) => setBusForm({ ...busForm, pickupTime: e.target.value })}
                            className="px-3 py-2 rounded-lg border border-border text-sm bg-white focus:outline-none focus:border-primary">
                            <option value="">시간 선택</option>
                            {Array.from({ length: 25 }, (_, i) => {
                              const h = Math.floor(i / 2) + 6;
                              const m = i % 2 === 0 ? "00" : "30";
                              const t = `${String(h).padStart(2, "0")}:${m}`;
                              return <option key={t} value={t}>{t}</option>;
                            })}
                          </select>
                        </div>
                        {busForm.pickupPlace === "기타" && (
                          <input placeholder="승차지 직접 입력" value={busForm.customPickup}
                            onChange={(e) => setBusForm({ ...busForm, customPickup: e.target.value })}
                            className="mt-2 w-full px-3 py-2 rounded-lg border border-border text-sm bg-white focus:outline-none focus:border-primary" />
                        )}

                        {busForm.pickupPlace && busForm.pickupPlace !== "기타" && busRoutes[busForm.pickupPlace] && (
                          <div className="mt-2 p-2.5 bg-primary/5 border border-primary/20 rounded-xl">
                            <p className="text-xs text-text-mid">🚌 {busForm.pickupPlace} ↔ 펜션 왕복 견적: <span className="font-bold text-primary">{formatPrice(busRoutes[busForm.pickupPlace])}</span></p>
                          </div>
                        )}
                        {busForm.pickupPlace === "기타" && (
                          <div className="mt-2 p-2.5 bg-amber-50 border border-amber-200 rounded-xl">
                            <p className="text-xs text-amber-700">* 직접 입력 시 별도 견적을 안내드립니다</p>
                          </div>
                        )}

                        <p className="text-xs font-semibold text-text-dark mb-2 pt-2">하차 정보 <span className="font-normal text-text-light">(퇴실 11시 기준)</span></p>
                        {busForm.pickupPlace && busForm.pickupPlace !== "기타" && (
                          <p className="text-xs text-primary mb-2">하차지: {busForm.pickupPlace} (승차지와 동일)</p>
                        )}
                        {busForm.pickupPlace === "기타" && (
                          <input placeholder="하차지 직접 입력" value={busForm.customDropoff}
                            onChange={(e) => setBusForm({ ...busForm, customDropoff: e.target.value })}
                            className="mb-2 w-full px-3 py-2 rounded-lg border border-border text-sm bg-white focus:outline-none focus:border-primary" />
                        )}
                        <div className="grid grid-cols-2 gap-2">
                          <input placeholder="인원" value={busForm.dropoffPeople} onChange={(e) => setBusForm({ ...busForm, dropoffPeople: e.target.value })}
                            className="px-3 py-2 rounded-lg border border-border text-sm bg-white focus:outline-none focus:border-primary" />
                          <select value={busForm.dropoffTime} onChange={(e) => setBusForm({ ...busForm, dropoffTime: e.target.value })}
                            className="px-3 py-2 rounded-lg border border-border text-sm bg-white focus:outline-none focus:border-primary">
                            <option value="">하차 출발시간</option>
                            {Array.from({ length: 10 }, (_, i) => {
                              const h = Math.floor(i / 2) + 6;
                              const m = i % 2 === 0 ? "00" : "30";
                              const t = `${String(h).padStart(2, "0")}:${m}`;
                              return <option key={t} value={t}>{t}</option>;
                            })}
                            <option value="10:30">10:30</option>
                          </select>
                        </div>

                        <p className="text-xs text-primary font-medium mt-2 text-center">* 왕복 기준 견적이며, 예약 접수와 함께 요청됩니다</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
              )}
            </div>
          </div>

          {/* Price Summary */}
          <div className="mt-8 bg-background rounded-2xl shadow-sm border border-border p-4 sm:p-6">
            {programType === "healing" ? (
            <div className="text-center">
              <div className="flex items-center justify-center gap-2 mb-2"><ShoppingCart className="w-5 h-5 text-primary" /><h3 className="text-lg font-semibold text-text-dark">예약 요약</h3></div>
              <p className="text-sm text-text-mid mb-1">힐링캠프 1박2일 · {Math.max(10, extraGuests < 10 ? 10 : extraGuests)}명</p>
              <p className="text-3xl font-bold text-primary">{(290000 * Math.max(10, extraGuests < 10 ? 10 : extraGuests)).toLocaleString()}원</p>
              <p className="text-xs text-text-light mt-1">1인 290,000원 × {Math.max(10, extraGuests < 10 ? 10 : extraGuests)}명</p>
            </div>
            ) : programType === "jolib" ? (
            <div className="text-center">
              <div className="flex items-center justify-center gap-2 mb-2"><ShoppingCart className="w-5 h-5 text-primary" /><h3 className="text-lg font-semibold text-text-dark">예약 요약</h3></div>
              <p className="text-sm text-text-mid mb-1">조립공간 CNC 체험 · {Math.max(1, extraGuests || 1)}명 · 1회 20분</p>
              <p className="text-sm text-text-light line-through">{((Math.max(1, extraGuests || 1)) * 5000).toLocaleString()}원</p>
              <p className="text-3xl font-bold text-red-500">무료</p>
              <p className="text-xs text-text-light mt-1">초기 이벤트 진행 중</p>
            </div>
            ) : (
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2"><ShoppingCart className="w-5 h-5 text-primary" /><h3 className="text-lg font-semibold text-text-dark">요금 요약</h3></div>
                <div className="text-sm text-text-mid space-y-0.5">
                  <p>{program.label} {programType === "half" && selectedTimeSlots.length > 1 ? `(${selectedTimeSlots.length}타임)` : programType === "daynight" && selectedTimeSlots.length > 1 ? `(${selectedTimeSlots.length}타임)` : `(${formatPrice(program.basePrice)}/${program.unit}${program.rangeMode && nights > 1 ? ` × ${nights}박` : ""})`}: {formatPrice(programPrice)}</p>
                  {getTimeSlotLabel() && <p>시간대: {getTimeSlotLabel()}</p>}
                  {extraGuests > 0 && <p>추가 인원 ({extraGuests}명): {formatPrice(extraGuests * pricing.extraGuest)}</p>}
                  {bbqGrills > 0 && <p>그릴 대여 ({bbqGrills}개): {formatPrice(bbqGrills * pricing.bbqGrill)}</p>}
                  {gasRanges > 0 && <p>가스렌지 ({gasRanges}개): {formatPrice(gasRanges * pricing.gasRange)}</p>}
                  {dinnerCount > 0 && <p>저녁 식사 ({dinnerCount}명): {formatPrice(dinnerCount * pricing.dinner)}</p>}
                  {woodcraftCount > 0 && <p>목공 키트 ({woodcraftCount}개): {formatPrice(woodcraftCount * pricing.woodcraft)}</p>}
                  {potBbqCount > 0 && <p>항아리 바베큐 ({potBbqCount}인분): {formatPrice(potBbqCount * pricing.potBbq)}</p>}
                  {showBusForm && busPrice > 0 && <p>버스 렌트 ({busForm.pickupPlace} 왕복): {formatPrice(busPrice)}</p>}
                  {showBusForm && busPrice === 0 && <p>버스 렌트: 별도 견적</p>}
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm text-text-light">총 결제 금액</p>
                <p className="text-3xl font-bold text-primary">{formatPrice(totalPrice)}</p>
                <p className="text-sm text-text-mid mt-1">1인당 약 <span className="font-semibold text-primary">{formatPrice(pricePerPerson)}</span></p>
                {showBusForm && busPrice === 0 && <p className="text-xs text-text-light mt-1">+ 버스 렌트 별도 견적</p>}
              </div>
            </div>
            )}
            <button onClick={() => setShowConfirm(true)}
              className="mt-6 w-full py-4 bg-primary text-white rounded-2xl font-semibold text-lg hover:bg-primary-light transition-colors shadow-md hover:shadow-lg">
              {programType === "jolib" ? "체험 신청하기" : programType === "healing" ? "힐링캠프 예약하기" : "예약하기"}
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

            {/* 예약자 정보 입력 */}
            <div className="mb-5 space-y-3">
              <p className="text-sm font-semibold text-text-dark">예약자 정보</p>
              <input
                type="text"
                placeholder="이름 (단체명)"
                value={guestName}
                onChange={(e) => setGuestName(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-border text-sm bg-white focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/20"
              />
              <input
                type="tel"
                placeholder="연락처 (010-0000-0000)"
                value={guestPhone}
                onChange={(e) => {
                  const raw = e.target.value.replace(/[^0-9]/g, "").slice(0, 11);
                  const formatted = raw.length > 7 ? `${raw.slice(0,3)}-${raw.slice(3,7)}-${raw.slice(7)}` : raw.length > 3 ? `${raw.slice(0,3)}-${raw.slice(3)}` : raw;
                  setGuestPhone(formatted);
                }}
                className="w-full px-4 py-3 rounded-xl border border-border text-sm bg-white focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/20"
              />
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
              <div className="flex justify-between text-sm"><span className="text-text-light">{program.label}{(programType === "half" || programType === "daynight") && selectedTimeSlots.length > 1 ? ` (${selectedTimeSlots.length}타임)` : ""}</span><span className="font-medium text-text-dark">{formatPrice(programPrice)}</span></div>
              {extraGuests > 0 && <div className="flex justify-between text-sm"><span className="text-text-light">추가 인원</span><span className="font-medium text-text-dark">{formatPrice(extraGuests * pricing.extraGuest)}</span></div>}
              {bbqGrills > 0 && <div className="flex justify-between text-sm"><span className="text-text-light">그릴 대여</span><span className="font-medium text-text-dark">{formatPrice(bbqGrills * pricing.bbqGrill)}</span></div>}
              {gasRanges > 0 && <div className="flex justify-between text-sm"><span className="text-text-light">가스렌지</span><span className="font-medium text-text-dark">{formatPrice(gasRanges * pricing.gasRange)}</span></div>}
              {dinnerCount > 0 && <div className="flex justify-between text-sm"><span className="text-text-light">저녁 식사</span><span className="font-medium text-text-dark">{formatPrice(dinnerCount * pricing.dinner)}</span></div>}
              {woodcraftCount > 0 && <div className="flex justify-between text-sm"><span className="text-text-light">목공 키트</span><span className="font-medium text-text-dark">{formatPrice(woodcraftCount * pricing.woodcraft)}</span></div>}
              {potBbqCount > 0 && <div className="flex justify-between text-sm"><span className="text-text-light">항아리 바베큐 ({potBbqCount}인분)</span><span className="font-medium text-text-dark">{formatPrice(potBbqCount * pricing.potBbq)}</span></div>}
              {showBusForm && busPrice > 0 && <div className="flex justify-between text-sm"><span className="text-text-light">버스 렌트 ({busForm.pickupPlace} 왕복)</span><span className="font-medium text-text-dark">{formatPrice(busPrice)}</span></div>}
              {showBusForm && busPrice === 0 && <div className="flex justify-between text-sm"><span className="text-text-light">버스 렌트</span><span className="font-medium text-amber-600">별도 견적</span></div>}
              <hr className="border-border" />
              <div className="flex justify-between"><span className="font-semibold text-text-dark">총 결제 금액</span><span className="font-bold text-primary text-lg">{formatPrice(totalPrice)}</span></div>
              <div className="flex justify-between text-base"><span className="text-text-mid">1인당</span><span className="font-bold text-primary">{formatPrice(pricePerPerson)}</span></div>
              {showBusForm && busPrice === 0 && <p className="text-xs text-text-light text-center">* 버스 렌트 비용은 별도 안내드립니다</p>}
              <p className="text-text-mid mt-3 text-center leading-relaxed" style={{ fontSize: "20px" }}>예약 취소 및 환불: 예약일 2주 전 100% 환불 / 이후 환불 불가</p>
            </div>
            <div className="flex gap-3">
              <button onClick={() => setShowConfirm(false)} className="flex-1 py-3 border-2 border-border rounded-xl font-semibold text-sm text-text-mid hover:bg-sage transition-colors">취소</button>
              <button
                onClick={handleConfirmReservation}
                disabled={isSubmitting}
                className="flex-1 py-3 bg-primary text-white rounded-xl font-semibold text-sm hover:bg-primary-light transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
                {isSubmitting ? "처리 중..." : "예약 확정"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
