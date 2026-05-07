"use client";

import { useState, useMemo, useEffect, useCallback } from "react";
import { ChevronLeft, ChevronRight, Plus, Minus, ShoppingCart, Calendar, Users, X, Moon, Clock, Sun, Bus, Boxes } from "lucide-react";
import { useReservation } from "@/context/ReservationContext";
import { usePricing } from "@/context/SettingsContext";

const POT_BBQ_MIN = 10;
const BREAKFAST_MIN = 10;

type ProgramType = "stay" | "half" | "daynight" | "jolib" | "healing";

const HALF_TIME_SLOTS = [
  { id: "09-12", label: "오전", time: "09:00 ~ 12:00", startH: 9, endH: 12 },
  { id: "12-15", label: "낮", time: "12:00 ~ 15:00", startH: 12, endH: 15 },
  { id: "15-18", label: "오후", time: "15:00 ~ 18:00", startH: 15, endH: 18 },
  { id: "18-21", label: "저녁", time: "18:00 ~ 21:00", startH: 18, endH: 21 },
];

const DAYNIGHT_TIME_SLOTS = [
  { id: "day", label: "주간", time: "10:00 ~ 15:00", emoji: "☀️", startH: 10, endH: 15 },
  { id: "night", label: "야간", time: "17:00 ~ 22:00", emoji: "🌙", startH: 17, endH: 22 },
];

const JOLIB_TIME_SLOTS = [
  { id: "14-16", label: "1타임", time: "14:00 ~ 16:00", soldOut: true, startH: 14, endH: 16 },
  { id: "16-18", label: "2타임", time: "16:00 ~ 18:00", soldOut: true, startH: 16, endH: 18 },

];

// 퇴실 11시 + 청소 3시간 = 14시 이후 사용 가능
const CLEANUP_READY_HOUR = 14;
// 입실 15시, 청소 3시간 필요 = 12시 이전에 끝나야 함
const MUST_END_BY_HOUR = 12;

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
  const { selectedProgramId, selectedCheckInDate, setSelectedCheckInDate, isMTPackage, isEventPromo, setIsEventPromo, isJiffPromo, setIsJiffPromo } = useReservation();
  const { pricing, busRoutes } = usePricing();

  const PROGRAMS: Record<ProgramType, { label: string; icon: typeof Moon; basePrice: number; unit: string; rangeMode: boolean }> = useMemo(() => ({
    stay: { label: "숙박", icon: Moon, basePrice: pricing.stay, unit: "박", rangeMode: true },
    half: { label: "3시간 대여(평일만 가능)", icon: Clock, basePrice: pricing.half, unit: "회", rangeMode: false },
    daynight: { label: "주/야간 패키지(평일만 가능)", icon: Sun, basePrice: pricing.daynight, unit: "회", rangeMode: false },
    jolib: { label: "나만의 아지트 만들기(목공체험)", icon: Boxes, basePrice: 30000, unit: "인", rangeMode: false },
    healing: { label: "힐링캠프 1박2일", icon: Moon, basePrice: 290000, unit: "인", rangeMode: true },
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
  const [checkinDates, setCheckinDates] = useState<Set<string>>(new Set());
  const [checkoutDates, setCheckoutDates] = useState<Set<string>>(new Set());
  const [loadingReservations, setLoadingReservations] = useState(false);

  // 예약 확정 상태
  const [guestName, setGuestName] = useState("");
  const [guestPhone, setGuestPhone] = useState("");
  const [guestPurpose, setGuestPurpose] = useState("");
  const [guestPurposeCustom, setGuestPurposeCustom] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const PURPOSE_OPTIONS = [
    "가족모임",
    "친구/지인 모임",
    "회사 워크숍/MT",
    "동호회/소모임",
    "커플/데이트",
    "생일/기념일",
    "워케이션/작업",
    "기타",
  ];

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
      if (isMTPackage) {
        // MT 패키지: 30인 기준 추천 세팅
        setExtraGuests(15);
        setTotalGuestsInput("30");
        setBbqGrills(4);
        setGasRanges(4);
        setDinnerCount(30);
      } else {
        // 일반 숙박 패키지: 전부 0으로 초기화
        setExtraGuests(0);
        setTotalGuestsInput(String(BASE_PEOPLE));
        setBbqGrills(0);
        setGasRanges(0);
        setDinnerCount(0);
        setBreakfastCount(0);
        setBreakfastMenu("");
        setWoodcraftCount(0);
        setPotBbqCount(0);
      }
    }
  }, [selectedProgramId, isMTPackage]);

  // 이벤트 팝업에서 넘어온 경우: 그릴 6개 + 저녁식사 10명분 자동 세팅 (0원 적용)
  useEffect(() => {
    if (isEventPromo) {
      setBbqGrills(6);
      setDinnerCount(10);
    }
  }, [isEventPromo]);

  // Hero에서 날짜 선택 시 → 달력에 체크인 + 체크아웃(1박) 자동 반영
  useEffect(() => {
    if (selectedCheckInDate) {
      const { year, month, day } = selectedCheckInDate;
      setCurrentYear(year);
      setCurrentMonth(month);
      if (PROGRAMS[programType].rangeMode) {
        setCheckIn({ year, month, day });
        // 1박 기준 체크아웃 자동 설정
        const nextDay = new Date(year, month, day + 1);
        setCheckOut({ year: nextDay.getFullYear(), month: nextDay.getMonth(), day: nextDay.getDate() });
      } else {
        setSelectedDate({ year, month, day });
      }
      setSelectedCheckInDate(null);
    }
  }, [selectedCheckInDate, programType, setSelectedCheckInDate, PROGRAMS]);

  const program = PROGRAMS[programType];

  const [checkIn, setCheckIn] = useState<{ year: number; month: number; day: number } | null>(null);
  const [checkOut, setCheckOut] = useState<{ year: number; month: number; day: number } | null>(null);
  const [selectedDate, setSelectedDate] = useState<{ year: number; month: number; day: number } | null>(null);

  const [extraGuests, setExtraGuests] = useState(0);
  const [totalGuestsInput, setTotalGuestsInput] = useState(String(BASE_PEOPLE));
  const [bbqGrills, setBbqGrills] = useState(0);
  const [gasRanges, setGasRanges] = useState(0);
  const [poolCount, setPoolCount] = useState(0);
  const [dinnerCount, setDinnerCount] = useState(0);
  const [breakfastCount, setBreakfastCount] = useState(0);
  const [breakfastMenu, setBreakfastMenu] = useState<string>("");
  const [woodcraftCount, setWoodcraftCount] = useState(0);
  const [assemblyCount, setAssemblyCount] = useState(0);
  const [potBbqCount, setPotBbqCount] = useState(0); // 0=미선택, 10~N인분
  const [showConfirm, setShowConfirm] = useState(false);

  // JIFF 프로모: 그릴 3개 + 저녁식사 5인분 + 조식(인원수) 자동 세팅 (전체 0원)
  useEffect(() => {
    if (isJiffPromo) {
      setBbqGrills(3);
      setDinnerCount(5);
      setBreakfastCount(BASE_PEOPLE + extraGuests);
      setBreakfastMenu("샌드위치");
      setCurrentYear(2026);
      setCurrentMonth(3);
    }
  }, [isJiffPromo, extraGuests]);

  // JIFF 기간: 4.29 ~ 5.8
  const JIFF_START = "2026-04-29";
  const JIFF_END = "2026-05-08";
  const isJiffDateAllowed = (dateStr: string) => {
    if (!isJiffPromo) return true;
    return dateStr >= JIFF_START && dateStr <= JIFF_END;
  };

  // Bus rental
  const [showBusForm, setShowBusForm] = useState(false);
  // MT 모드: Hero에서 isMTPackage=true 또는 예약폼에서 MT 패키지 버튼 직접 클릭
  const isMTMode = isMTPackage || (programType === "stay" && showBusForm);
  const [busForm, setBusForm] = useState({
    managerName: "",
    managerPhone: "",
    pickupPlace: "",
    customPickup: "",
    pickupDetailAddress: "",
    pickupPeople: "",
    pickupTime: "",
    dropoffManagerName: "",
    dropoffManagerPhone: "",
    dropoffPlace: "",
    customDropoff: "",
    dropoffDetailAddress: "",
    dropoffPeople: "",
    dropoffTime: "",
  });
  const [busStopover, setBusStopover] = useState<{ place: string; time: string }[]>([]);
  const [busRequested, setBusRequested] = useState(false);

  // 버스 종류/대수
  const BUS_TYPES = [
    { id: "45", label: "일반 (45인승)", seats: 45 },
    { id: "31", label: "우등 (31인승)", seats: 31 },
    { id: "12", label: "스타렉스 (12인승)", seats: 12 },
  ];
  const [busSelections, setBusSelections] = useState<{ typeId: string; count: number }[]>([]);

  // 총인원 기반 버스 자동 추천 (45인승 기준, 초과 시 45+스타렉스 조합)
  const recommendBus = (people: number) => {
    if (people <= 0) return [];
    if (people <= 45) return [{ typeId: "45", count: 1 }];
    // 45인 초과: 45인승 N대 + 스타렉스로 나머지
    const big = Math.floor(people / 45);
    const remain = people - big * 45;
    const result: { typeId: string; count: number }[] = [{ typeId: "45", count: big }];
    if (remain > 0) {
      const vans = Math.ceil(remain / 12);
      result.push({ typeId: "12", count: vans });
    }
    return result;
  };

  const BASE_HEALING = 10;
  const MAX_HEALING = 15;
  const totalGuests = programType === "healing" ? Math.min(MAX_HEALING, BASE_HEALING + extraGuests) : BASE_PEOPLE + extraGuests;

  // 미니수영장 — 7/8/9월(JS month 6/7/8)에만 노출. 그 외엔 자동 0.
  const selectedMonth = checkIn?.month ?? selectedDate?.month ?? null;
  const isPoolSeason = selectedMonth !== null && [6, 7, 8].includes(selectedMonth);
  useEffect(() => {
    if (!isPoolSeason && poolCount > 0) setPoolCount(0);
  }, [isPoolSeason, poolCount]);

  // 조식 메뉴 — 육개장은 20인 이상 필수. 인원 미달 시 자동 해제.
  useEffect(() => {
    if (breakfastMenu === "육개장" && breakfastCount < 20) {
      setBreakfastMenu("");
    }
  }, [breakfastCount, breakfastMenu]);

  const busRecommendation = recommendBus(totalGuests);
  const busRecommendText = busRecommendation.map(b => {
    const t = BUS_TYPES.find(bt => bt.id === b.typeId);
    return t ? `${t.label} ${b.count}대` : "";
  }).join(" + ");

  // 버스 선택 시 인원 변경되면 자동 추천 적용
  useEffect(() => {
    if (showBusForm && totalGuests > 0) {
      const rec = recommendBus(totalGuests);
      setBusSelections([...rec]);
    }
  }, [totalGuests, showBusForm]);

  const totalBusSeats = busSelections.reduce((sum, b) => {
    const t = BUS_TYPES.find(bt => bt.id === b.typeId);
    return sum + (t ? t.seats * b.count : 0);
  }, 0);

  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  const firstDayOfWeek = new Date(currentYear, currentMonth, 1).getDay();

  const monthNames = [
    "1월", "2월", "3월", "4월", "5월", "6월",
    "7월", "8월", "9월", "10월", "11월", "12월",
  ];
  const dayNames = ["일", "월", "화", "수", "목", "금", "토"];

  // 서버 API에서 예약 데이터 조회 - 체크인~체크아웃 전날까지 차단 (에어비앤비 방식)
  // 체크인 오후 3시 ~ 체크아웃 오전 11시 → 체크아웃 날짜는 새 체크인 가능
  // + 체크인/체크아웃 날짜 추적 (시간제 프로그램 3시간 청소 버퍼 적용)
  const [calendarFetchFailed, setCalendarFetchFailed] = useState(false);
  const fetchReservations = useCallback(async () => {
    setLoadingReservations(true);
    try {
      const res = await fetch("/api/calendar", { cache: "no-store" });
      if (!res.ok) {
        throw new Error(`Calendar fetch failed: ${res.status}`);
      }
      const json = await res.json();
      if (json.error) {
        throw new Error(json.error);
      }
      const data = json.dates || [];

      const dates = new Set<string>();
      const ciDates = new Set<string>();
      const coDates = new Set<string>();
      data.forEach((r: { reservation_date: string; checkout_date: string | null }) => {
        if (!r.reservation_date) return;
        const start = new Date(r.reservation_date);
        const end = r.checkout_date ? new Date(r.checkout_date) : new Date(r.reservation_date);
        if (!r.checkout_date) end.setDate(end.getDate() + 1);

        ciDates.add(dateToStr(start));
        coDates.add(dateToStr(end));

        for (let d = new Date(start); d < end; d.setDate(d.getDate() + 1)) {
          dates.add(dateToStr(d));
        }
      });

      setBookedDates(dates);
      setCheckinDates(ciDates);
      setCheckoutDates(coDates);
      setCalendarFetchFailed(false);
    } catch (err) {
      console.error("예약 데이터 조회 중 오류:", err);
      // fetch 실패 시 플래그 세팅 → 예약 버튼 잠금 (중복 예약 위험 방지)
      setCalendarFetchFailed(true);
    } finally {
      setLoadingReservations(false);
    }
  }, []);

  // 컴포넌트 마운트 시 + 월/프로그램 변경 시 예약 데이터 조회
  useEffect(() => {
    fetchReservations();
  }, [fetchReservations]);

  // 탭이 다시 활성화될 때 + 30초마다 재조회 (stale 달력으로 인한 중복 예약 방지)
  useEffect(() => {
    const refetchIfVisible = () => {
      if (document.visibilityState === "visible") fetchReservations();
    };
    document.addEventListener("visibilitychange", refetchIfVisible);
    window.addEventListener("focus", refetchIfVisible);
    const intervalId = window.setInterval(refetchIfVisible, 30000);
    return () => {
      document.removeEventListener("visibilitychange", refetchIfVisible);
      window.removeEventListener("focus", refetchIfVisible);
      window.clearInterval(intervalId);
    };
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
    if (programType === "healing") {
      setCheckIn(clicked);
      const nextDay = new Date(currentYear, currentMonth, day + 1);
      setCheckOut({ year: nextDay.getFullYear(), month: nextDay.getMonth(), day: nextDay.getDate() });
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
    setShowBusForm(type !== "stay" && type !== "healing");
    setIsEventPromo(false); // 프로그램 변경 시 이벤트 해제
    if (type === "healing") {
      setExtraGuests(0); // 기본 10명 (BASE_HEALING)
    }
    // 일반 숙박(MT 아님)으로 전환 시 옵션 0으로 리셋
    if (type === "stay") {
      setExtraGuests(0);
      setTotalGuestsInput(String(BASE_PEOPLE));
      setBbqGrills(0);
      setGasRanges(0);
      setDinnerCount(0);
    }
  };

  // 예약 확정 → Supabase INSERT (customers + reservations)
  const handleConfirmReservation = async () => {
    if (!guestName.trim() || !guestPhone.trim()) {
      alert("이름과 연락처를 입력해주세요.");
      return;
    }

    // 예약 목적 필수
    const finalPurpose = guestPurpose === "기타" ? guestPurposeCustom.trim() : guestPurpose;
    if (!finalPurpose) {
      alert("예약 목적을 선택(또는 입력)해주세요.");
      return;
    }

    // 조식 선택 시 메뉴 필수
    if (breakfastCount > 0 && !breakfastMenu) {
      alert("조식 메뉴를 선택해주세요.");
      return;
    }

    // 버스 렌트 선택 시 필수항목 검증
    if (showBusForm) {
      const missing: string[] = [];
      if (!busForm.managerName.trim()) missing.push("담당자 이름");
      if (!busForm.managerPhone.trim()) missing.push("담당자 연락처");
      if (!busForm.pickupPlace) missing.push("출발지");
      if (busForm.pickupPlace === "기타" && !busForm.customPickup.trim()) missing.push("승차지 직접 입력");
      if (!busForm.pickupDetailAddress?.trim()) missing.push("출발지 세부 주소");
      if (!busForm.pickupPeople.trim()) missing.push("승차 인원");
      if (!busForm.pickupTime) missing.push("승차 시간");
      if (!busForm.customDropoff.trim()) missing.push("하차지");
      if (!busForm.dropoffPeople.trim()) missing.push("하차 인원");
      if (!busForm.dropoffTime) missing.push("하차 출발시간");
      if (missing.length > 0) {
        alert(`버스 렌트 정보를 모두 입력해주세요.\n\n미입력: ${missing.join(", ")}`);
        return;
      }
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
        breakfastCount > 0 ? `조식 ${breakfastCount}명${breakfastMenu ? ` (${breakfastMenu})` : ""}` : "",
        woodcraftCount > 0 ? `목공키트 ${woodcraftCount}개` : "",
        assemblyCount > 0 ? `조립체험 ${assemblyCount}인` : "",
        potBbqCount > 0 ? `항아리BBQ ${potBbqCount}인분` : "",
        busRequested ? `버스 렌트 (${busSelections.map(b => { const t = BUS_TYPES.find(bt => bt.id === b.typeId); return t ? `${t.label} ${b.count}대` : ""; }).join(" + ") || "미선택"})` : "",
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
          poolCount,
          dinnerCount,
          breakfastCount,
          breakfastMenu,
          woodcraftCount,
          potBbqCount,
          busRequested: showBusForm,
          busForm: showBusForm ? busForm : null,
          busStopover: showBusForm && busStopover.length > 0 ? busStopover.filter(s => s.place.trim()) : null,
          // 폼이 화면에 표시한 버스 가격 — busRoutes 테이블 lookup (전북대 60만, 전주대 65만, 원광대 70만, 우석대 65만, 기타 0=별도견적)
          busPrice: busPrice || 0,
          selectedTimeSlot: selectedTimeSlots.join(",") || null,
          totalPrice,
          notes,
          purpose: finalPurpose,
          purposeRaw: finalPurpose,
          programLabel: purposeMap[programType] || programType,
        }),
      });

      const apiJson = await apiRes.json();
      if (apiRes.status === 409 || apiJson.code === "DATE_CONFLICT") {
        // 서버 중복 체크에서 차단 - 달력 새로고침 + 날짜 초기화
        console.warn("서버 중복 체크 차단:", apiJson);
        alert((apiJson.error || "해당 기간이 이미 예약되었습니다.") + "\n\n달력을 새로고침합니다. 다른 날짜를 선택해주세요.");
        await fetchReservations();
        setCheckIn(null);
        setCheckOut(null);
        setSelectedDate(null);
        setShowConfirm(false);
        return;
      }
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
            poolCount,
            dinnerCount,
            breakfastCount,
            breakfastMenu,
            woodcraftCount,
            potBbqCount,
            busRequested: showBusForm,
            busVehicles: showBusForm ? busSelections.map(b => { const t = BUS_TYPES.find(bt => bt.id === b.typeId); return t ? `${t.label} ${b.count}대` : ""; }).join(" + ") : "",
            busPrice: busRoutes[busForm.pickupPlace] || 0,
            busManagerName: busForm.managerName,
            busManagerPhone: busForm.managerPhone,
            busPickupPlace: busForm.pickupPlace === "기타" ? busForm.customPickup : busForm.pickupPlace,
            busPickupDetailAddress: busForm.pickupDetailAddress,
            busPickupPeople: busForm.pickupPeople,
            busPickupTime: busForm.pickupTime,
            busDropoffPlace: busForm.customDropoff,
            busDropoffDetailAddress: busForm.dropoffDetailAddress,
            busDropoffPeople: busForm.dropoffPeople,
            busDropoffTime: busForm.dropoffTime,
            busStopover: showBusForm && busStopover.length > 0 ? busStopover.filter(s => s.place.trim()).map(s => `${s.place}(${s.time || "시간미정"})`).join(" → ") : "",
            timeSlot: timeSlotLabel,
            totalPrice,
            purpose: finalPurpose,
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
      setBreakfastCount(0);
      setBreakfastMenu("");
      setWoodcraftCount(0);
      setPotBbqCount(0);
      setGuestName("");
      setGuestPhone("");
      setGuestPurpose("");
      setGuestPurposeCustom("");
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
  const isTimeBased = programType === "half" || programType === "daynight" || programType === "jolib";

  // 시간제 프로그램: 숙박 체크인/체크아웃일에 슬롯 충돌 확인
  // 퇴실 11시 + 청소 3시간 = 14시 이후 사용 가능
  // 입실 15시, 청소 3시간 필요 = 12시 이전에 끝나야 함
  const isSlotBlockedByStay = (dateStr: string, startH: number, endH: number): boolean => {
    const isCI = checkinDates.has(dateStr);
    const isCO = checkoutDates.has(dateStr);
    // 체크아웃일: 14시 이전에 시작하는 슬롯 차단
    if (isCO && startH < CLEANUP_READY_HOUR) return true;
    // 체크인일: 12시 이후에 끝나는 슬롯 차단
    if (isCI && endH > MUST_END_BY_HOUR) return true;
    return false;
  };

  // 시간제 프로그램에서 특정 날짜에 이용 가능한 슬롯이 있는지 확인
  const hasAvailableSlots = (dateStr: string): boolean => {
    if (programType === "half") {
      return HALF_TIME_SLOTS.some(s => !isSlotBlockedByStay(dateStr, s.startH, s.endH));
    }
    if (programType === "daynight") {
      return DAYNIGHT_TIME_SLOTS.some(s => !isSlotBlockedByStay(dateStr, s.startH, s.endH));
    }
    if (programType === "jolib") {
      return JOLIB_TIME_SLOTS.some(s => !isSlotBlockedByStay(dateStr, s.startH, s.endH));
    }
    return true;
  };

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
    if (programType === "jolib") return 30000 * Math.max(1, extraGuests || 1);
    if (programType === "healing") return 290000 * totalGuests;
    return program.basePrice * nights;
  }, [programType, selectedTimeSlots.length, pricing.half, pricing.halfExtra, pricing.daynight, program.basePrice, nights]);

  // 이벤트 프로모: 그릴 6개 + 저녁식사 10인분 무료
  const EVENT_FREE_GRILLS = 6;
  const EVENT_FREE_DINNER = 10;
  const JIFF_FREE_GRILLS = 3;
  const JIFF_FREE_DINNER = 5;

  const jiffOriginalPrice = useMemo(() => {
    if (!isJiffPromo) return 0;
    let total = programPrice;
    total += extraGuests * pricing.extraGuest;
    total += bbqGrills * pricing.bbqGrill;
    total += dinnerCount * pricing.dinner;
    total += gasRanges * pricing.gasRange;
    total += breakfastCount * 10000;
    total += woodcraftCount * pricing.woodcraft;
    total += assemblyCount * 5000;
    total += potBbqCount * pricing.potBbq;
    total += poolCount * pricing.miniPool;
    total += busPrice;
    return total;
  }, [isJiffPromo, programPrice, extraGuests, bbqGrills, gasRanges, dinnerCount, breakfastCount, woodcraftCount, assemblyCount, potBbqCount, poolCount, busPrice, pricing]);

  const totalPrice = useMemo(() => {
    if (isJiffPromo) return 0;
    let total = programPrice;
    total += extraGuests * pricing.extraGuest;

    if (isEventPromo) {
      const chargedGrills = Math.max(0, bbqGrills - EVENT_FREE_GRILLS);
      const chargedDinner = Math.max(0, dinnerCount - EVENT_FREE_DINNER);
      total += chargedGrills * pricing.bbqGrill;
      total += chargedDinner * pricing.dinner;
    } else {
      total += bbqGrills * pricing.bbqGrill;
      total += dinnerCount * pricing.dinner;
    }

    total += gasRanges * pricing.gasRange;
    total += breakfastCount * 10000;
    total += woodcraftCount * pricing.woodcraft;
    total += assemblyCount * 5000;
    total += potBbqCount * pricing.potBbq;
    total += poolCount * pricing.miniPool;
    total += busPrice;
    return total;
  }, [programPrice, extraGuests, bbqGrills, gasRanges, dinnerCount, breakfastCount, woodcraftCount, assemblyCount, potBbqCount, poolCount, busPrice, pricing, isEventPromo, isJiffPromo]);

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
          type="text"
          inputMode="numeric"
          maxLength={2}
          value={value}
          onFocus={(e) => e.target.select()}
          onChange={(e) => {
            const raw = e.target.value.replace(/[^0-9]/g, "").slice(0, 2);
            const v = Math.max(0, parseInt(raw) || 0);
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

          {/* 이벤트 프로모 안내 */}
          {isEventPromo && (
            <div className="mb-6 p-4 bg-gradient-to-r from-red-50 to-orange-50 border-2 border-red-200 rounded-2xl">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-lg">🎉</span>
                  <div>
                    <p className="text-sm font-bold text-red-600">오픈 이벤트 혜택 적용 중!</p>
                    <p className="text-xs text-gray-500">그릴 6개 (180,000원) + 숯불용 고기 10인분 (100,000원) 무료</p>
                  </div>
                </div>
                <button onClick={() => setIsEventPromo(false)} className="text-xs text-gray-400 hover:text-gray-600 px-2 py-1 rounded">해제</button>
              </div>
            </div>
          )}

          {/* JIFF 프로모 안내 */}
          {isJiffPromo && (
            <div className="mb-6 p-4 bg-gradient-to-r from-yellow-50 to-amber-50 border-2 border-yellow-300 rounded-2xl">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-lg">🎬</span>
                  <div>
                    <p className="text-sm font-bold text-amber-700">JIFF STAY 특가 적용 중!</p>
                    <p className="text-xs text-gray-500">
                      그릴 3개 + 목살 5인분 + 조식 샌드위치 + 애플사이더 5병 무료
                      {jiffOriginalPrice > 0 && <span className="ml-1 font-bold text-amber-600">({formatPrice(jiffOriginalPrice)} → 0원)</span>}
                    </p>
                  </div>
                </div>
                <button onClick={() => setIsJiffPromo(false)} className="text-xs text-gray-400 hover:text-gray-600 px-2 py-1 rounded">해제</button>
              </div>
            </div>
          )}

          {/* Program Tabs */}
          <div className="flex flex-col sm:flex-row gap-3 mb-8">
            {/* MT 패키지 */}
            <button onClick={() => {
              handleProgramChange("stay");
              setShowBusForm(true);
              // MT 모드: 30인 기준 자동 추천
              setExtraGuests(15);
              setTotalGuestsInput("30");
              setBbqGrills(4);
              setGasRanges(4);
              setDinnerCount(30);
            }}
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

                    // 시간제 프로그램: 체크인일(오전 가능) / 체크아웃일(오후 가능) 부분 허용
                    const isStayCheckin = checkinDates.has(dateStr);
                    const isStayCheckout = checkoutDates.has(dateStr);
                    const timePartial = isTimeBased && (
                      (booked && isStayCheckin && hasAvailableSlots(dateStr)) ||
                      (!booked && isStayCheckout && hasAvailableSlots(dateStr))
                    );
                    // 시간제에서 체크인일+체크아웃일 동시 → 이용 가능 슬롯 없으면 차단
                    const timeFullyBlocked = isTimeBased && !booked && isStayCheckout && !hasAvailableSlots(dateStr);

                    const jiffBlocked = !isJiffDateAllowed(dateStr);
                    const disabled = !!(past
                      || weekendBlocked
                      || jiffBlocked
                      || (booked && !isSelectingCheckout && !timePartial)
                      || timeFullyBlocked
                      || (isSelectingCheckout && disabledInCheckoutMode));
                    const dayOfWeek = (firstDayOfWeek + day - 1) % 7;
                    const isCI = isCheckIn(day); const isCO = isCheckOut(day);
                    const inRange = isInRange(day); const isSingle = isSingleSelected(day);
                    const isSelected = isCI || isCO || isSingle;

                    // 시간제 프로그램에서 부분 이용 가능 표시
                    const showPartialLabel = isTimeBased && !past && !weekendBlocked && !disabled && (isStayCheckin || isStayCheckout);

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
                          : showPartialLabel ? "bg-amber-50 text-amber-700 hover:bg-amber-100 border border-amber-200"
                          : dayOfWeek === 0 ? "text-red-400 hover:bg-sage"
                          : dayOfWeek === 6 ? "text-blue-400 hover:bg-sage"
                          : "text-text-dark hover:bg-sage"}`}>
                        {day}
                        {isCI && <span className="absolute -bottom-0.5 left-1/2 -translate-x-1/2 text-[8px] text-white/80">IN</span>}
                        {isCO && <span className="absolute -bottom-0.5 left-1/2 -translate-x-1/2 text-[8px] text-white/80">OUT</span>}
                        {booked && !past && !isSelectingCheckout && !timePartial && <span className="absolute -bottom-0.5 left-1/2 -translate-x-1/2 text-[7px] text-red-400 font-bold">마감</span>}
                        {isCheckoutAllowed && <span className="absolute -bottom-0.5 left-1/2 -translate-x-1/2 text-[7px] text-orange-500 font-bold">퇴실</span>}
                        {showPartialLabel && !isSelected && <span className="absolute -bottom-0.5 left-1/2 -translate-x-1/2 text-[6px] text-amber-600 font-bold">{isStayCheckout ? "오후" : "오전"}</span>}
                      </button>
                    );
                  });
                })()}
              </div>

              {/* 범례 */}
              <div className="mt-3 flex flex-wrap items-center gap-3 text-xs text-text-light">
                <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-red-100 inline-block"></span> 예약마감</span>
                <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-primary inline-block"></span> 선택됨</span>
                {isTimeBased && <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-amber-50 border border-amber-200 inline-block"></span> 일부 시간만 가능</span>}
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
                      const blocked = selectedDate && isSlotBlockedByStay(toDateStr(selectedDate.year, selectedDate.month, selectedDate.day), slot.startH, slot.endH);
                      return (
                        <button key={slot.id} onClick={() => !blocked && toggleTimeSlot(slot.id)} disabled={!!blocked}
                          className={`p-3 rounded-xl border-2 text-center transition-all relative ${blocked ? "border-border bg-gray-50 opacity-50 cursor-not-allowed" : selected ? "border-primary bg-primary/5 shadow-sm" : "border-border bg-white hover:border-primary/30"}`}>
                          <p className={`text-sm font-semibold ${blocked ? "text-text-light" : selected ? "text-primary" : "text-text-dark"}`}>{slot.label}</p>
                          <p className="text-xs text-text-light mt-0.5">{slot.time}</p>
                          {blocked && <p className="text-[10px] text-red-400 font-bold mt-1">청소 시간</p>}
                          {selected && !blocked && <p className="text-[10px] text-primary font-bold mt-1">선택됨</p>}
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
              {programType === "jolib" && selectedDate && (
                <div className="mt-5">
                  <div className="flex items-center gap-2 mb-1"><Clock size={16} className="text-teal-600" /><h4 className="text-sm font-semibold text-text-dark">시간대 선택</h4></div>
                  <p className="text-xs text-teal-600 mb-3">1인 30,000원 · 2시간 체험</p>
                  <div className="grid grid-cols-2 gap-3">
                    {JOLIB_TIME_SLOTS.map((slot) => (
                      <div key={slot.id}
                        className="p-4 rounded-xl border-2 border-border bg-gray-50 text-center opacity-60 cursor-not-allowed relative">
                        <p className="text-sm font-semibold text-text-dark">{slot.label}</p>
                        <p className="text-xs text-text-light mt-0.5">{slot.time}</p>
                        <span className="absolute top-2 right-2 text-[10px] font-bold text-red-500 bg-red-50 border border-red-200 px-1.5 py-0.5 rounded-full">SOLD OUT</span>
                      </div>
                    ))}
                  </div>
                  <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-xl text-center">
                    <p className="text-sm font-semibold text-red-500">현재 모든 타임이 마감되었습니다</p>
                    <p className="text-xs text-text-light mt-1">다음 일정이 오픈되면 안내드리겠습니다</p>
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
                      const blocked = selectedDate && isSlotBlockedByStay(toDateStr(selectedDate.year, selectedDate.month, selectedDate.day), slot.startH, slot.endH);
                      return (
                        <button key={slot.id} onClick={() => !blocked && toggleTimeSlot(slot.id)} disabled={!!blocked}
                          className={`p-4 rounded-xl border-2 text-center transition-all ${blocked ? "border-border bg-gray-50 opacity-50 cursor-not-allowed" : selected ? "border-primary bg-primary/5 shadow-sm" : "border-border bg-white hover:border-primary/30"}`}>
                          <span className="text-2xl block mb-1">{slot.emoji}</span>
                          <p className={`text-sm font-semibold ${blocked ? "text-text-light" : selected ? "text-primary" : "text-text-dark"}`}>{slot.label}</p>
                          <p className="text-xs text-text-light mt-0.5">{slot.time}</p>
                          {blocked && <p className="text-[10px] text-red-400 font-bold mt-1">청소 시간</p>}
                          {selected && !blocked && <p className="text-[10px] text-primary font-bold mt-1">선택됨</p>}
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
                    <label className="text-sm font-medium text-text-dark mb-2 block">참가 인원</label>
                    <div className="flex items-center gap-2 mb-2">
                      <div className="flex items-center gap-1.5 bg-sage/50 rounded-xl px-4 py-2.5">
                        <span className="text-sm text-text-mid">기본</span>
                        <span className="text-lg font-bold text-text-dark">{BASE_HEALING}</span>
                        <span className="text-sm text-text-mid">인</span>
                      </div>
                      <span className="text-lg text-text-light">+</span>
                      <div className="flex items-center gap-1.5">
                        <span className="text-sm text-text-mid">추가</span>
                        <input type="number" min={0} max={MAX_HEALING - BASE_HEALING}
                          value={extraGuests}
                          onFocus={(e) => e.target.select()}
                          onChange={(e) => setExtraGuests(Math.min(MAX_HEALING - BASE_HEALING, Math.max(0, parseInt(e.target.value) || 0)))}
                          className="w-14 text-center text-lg font-bold text-primary bg-white border-2 border-primary/30 rounded-xl py-1.5 focus:outline-none focus:border-primary" />
                        <span className="text-sm text-text-mid">인</span>
                      </div>
                      <span className="text-lg text-text-light">=</span>
                      <div className="flex items-center gap-1 bg-primary/10 rounded-xl px-4 py-2.5">
                        <span className="text-lg font-bold text-primary">{totalGuests}</span>
                        <span className="text-sm text-primary">명</span>
                      </div>
                    </div>
                    <p className="text-xs text-text-light mb-3">최소 {BASE_HEALING}명 ~ 최대 {MAX_HEALING}명</p>
                    <div className="p-3 bg-primary/5 border border-primary/20 rounded-xl flex items-center justify-between">
                      <span className="text-sm text-text-mid">{totalGuests}명 × 290,000원</span>
                      <span className="text-lg font-bold text-primary">{(290000 * totalGuests).toLocaleString()}원</span>
                    </div>
                  </div>
                ) : programType === "jolib" ? (
                  <div>
                    <div className="p-4 bg-teal-50 border border-teal-200 rounded-xl mb-4">
                      <p className="text-sm font-semibold text-teal-700 mb-2">나만의 아지트 만들기(목공체험) 안내</p>
                      <ul className="text-xs text-teal-600 space-y-1">
                        <li>• 2시간 체험 / 회당 최대 6명</li>
                        <li>• <span className="font-bold">1인 30,000원</span></li>
                        <li>• 운영: 14:00~16:00 / 16:00~18:00 (2타임)</li>
                        <li>• 체험 후 50,000원 상당 바우처 증정</li>
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
                    <div className="mt-4 p-3 bg-primary/5 border border-primary/20 rounded-xl flex items-center justify-between">
                      <span className="text-sm text-text-mid">{Math.max(1, extraGuests || 1)}명 × 30,000원</span>
                      <span className="text-lg font-bold text-primary">{(30000 * Math.max(1, extraGuests || 1)).toLocaleString()}원</span>
                    </div>
                  </div>
                ) : (
                <>
                {/* 인원 입력 */}
                <div className="mb-4">
                  <label className="text-sm font-medium text-text-dark mb-2 block">예약 인원</label>
                  <div className="flex items-center gap-2 mb-2">
                    <div className="flex items-center gap-1.5">
                      <span className="text-sm text-text-mid">총</span>
                      <input
                        type="number"
                        min={BASE_PEOPLE}
                        value={totalGuestsInput}
                        onFocus={(e) => e.target.select()}
                        onChange={(e) => {
                          const raw = e.target.value;
                          setTotalGuestsInput(raw);
                          const parsed = parseInt(raw);
                          if (!isNaN(parsed)) {
                            const total = Math.max(BASE_PEOPLE, parsed);
                            const extra = total - BASE_PEOPLE;
                            setExtraGuests(extra);
                            if (isMTMode) { setBbqGrills(Math.min(6, Math.ceil(total / 8))); setGasRanges(Math.min(5, Math.ceil(total / 8))); setDinnerCount(total); }
                          }
                        }}
                        onBlur={() => {
                          const parsed = parseInt(totalGuestsInput);
                          const total = isNaN(parsed) || parsed < BASE_PEOPLE ? BASE_PEOPLE : parsed;
                          setTotalGuestsInput(String(total));
                          const extra = total - BASE_PEOPLE;
                          setExtraGuests(extra);
                          if (isMTMode) { setBbqGrills(Math.min(6, Math.ceil(total / 8))); setGasRanges(Math.min(5, Math.ceil(total / 8))); setDinnerCount(total); }
                        }}
                        className="w-16 text-center text-lg font-bold text-primary bg-white border-2 border-primary/30 rounded-xl py-1.5 focus:outline-none focus:border-primary"
                      />
                      <span className="text-sm text-text-mid">명</span>
                    </div>
                    <span className="text-lg text-text-light">=</span>
                    <div className="flex items-center gap-1.5 bg-sage/50 rounded-xl px-3 py-2.5">
                      <span className="text-xs text-text-mid">기본</span>
                      <span className="text-sm font-bold text-text-dark">{BASE_PEOPLE}</span>
                    </div>
                    <span className="text-lg text-text-light">+</span>
                    <div className="flex items-center gap-1.5 bg-sage/50 rounded-xl px-3 py-2.5">
                      <span className="text-xs text-text-mid">추가</span>
                      <span className="text-sm font-bold text-primary">{extraGuests}</span>
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
                <div className="space-y-4">
                  <Counter label="추가 인원" desc={`기본 ${BASE_PEOPLE}명 포함 / 추가 1인당 ${formatPrice(pricing.extraGuest)}`} value={extraGuests} unitPrice={pricing.extraGuest}
                    onDec={() => { const v = Math.max(0, extraGuests - 1); setExtraGuests(v); setTotalGuestsInput(String(BASE_PEOPLE + v)); if (isMTMode) { const t = BASE_PEOPLE + v; setBbqGrills(Math.min(6, Math.ceil(t / 8))); setGasRanges(Math.min(5, Math.ceil(t / 8))); setDinnerCount(t); } }}
                    onInc={() => { const v = extraGuests + 1; setExtraGuests(v); setTotalGuestsInput(String(BASE_PEOPLE + v)); if (isMTMode) { const t = BASE_PEOPLE + v; setBbqGrills(Math.min(6, Math.ceil(t / 8))); setGasRanges(Math.min(5, Math.ceil(t / 8))); setDinnerCount(t); } }}
                    onChange={(v) => { const extra = Math.max(0, v); setExtraGuests(extra); setTotalGuestsInput(String(BASE_PEOPLE + extra)); if (isMTMode) { const t = BASE_PEOPLE + extra; setBbqGrills(Math.min(6, Math.ceil(t / 8))); setGasRanges(Math.min(5, Math.ceil(t / 8))); setDinnerCount(t); } }} />

                  <hr className="border-border" />

                  {isEventPromo && bbqGrills > 0 && bbqGrills <= EVENT_FREE_GRILLS && (
                    <div className="mb-1 flex items-center gap-1.5">
                      <span className="text-[10px] font-bold text-red-500 bg-red-50 border border-red-200 px-2 py-0.5 rounded-full">EVENT 무료</span>
                      <span className="text-[10px] text-text-light">그릴 {Math.min(bbqGrills, EVENT_FREE_GRILLS)}개 ({formatPrice(Math.min(bbqGrills, EVENT_FREE_GRILLS) * pricing.bbqGrill)} 상당)</span>
                    </div>
                  )}
                  {isJiffPromo && bbqGrills > 0 && bbqGrills <= JIFF_FREE_GRILLS && (
                    <div className="mb-1 flex items-center gap-1.5">
                      <span className="text-[10px] font-bold text-amber-700 bg-yellow-50 border border-yellow-300 px-2 py-0.5 rounded-full">🎬 JIFF 무료</span>
                      <span className="text-[10px] text-text-light">그릴 {Math.min(bbqGrills, JIFF_FREE_GRILLS)}개 ({formatPrice(Math.min(bbqGrills, JIFF_FREE_GRILLS) * pricing.bbqGrill)} 상당)</span>
                    </div>
                  )}
                  <Counter label="그릴 대여" desc={`숯+그릴+토치 / 그릴당 ${formatPrice(pricing.bbqGrill)} (최대 6개)`} value={bbqGrills} unitPrice={(isEventPromo || isJiffPromo) ? 0 : pricing.bbqGrill}
                    onDec={() => setBbqGrills((g) => Math.max(0, g - 1))} onInc={() => setBbqGrills((g) => Math.min(6, g + 1))} onChange={(v) => setBbqGrills(Math.min(6, v))} />

                  <hr className="border-border" />

                  <Counter label="가스버너" desc={`버너+가스+불판 / 개당 ${formatPrice(pricing.gasRange)} (최대 5개)`} value={gasRanges} unitPrice={pricing.gasRange}
                    onDec={() => setGasRanges((g) => Math.max(0, g - 1))} onInc={() => setGasRanges((g) => Math.min(5, g + 1))} onChange={(v) => setGasRanges(Math.min(5, v))} />

                  <hr className="border-border" />

                  {/* 미니수영장 — 7~9월 한정 */}
                  {isPoolSeason && (
                    <>
                      <Counter
                        label="🏊 미니수영장 ☀️ 7~9월 추천 옵션"
                        desc={`${formatPrice(pricing.miniPool)} / 여름 시즌 한정`}
                        value={poolCount}
                        unitPrice={pricing.miniPool}
                        onDec={() => setPoolCount((g) => Math.max(0, g - 1))}
                        onInc={() => setPoolCount((g) => Math.min(1, g + 1))}
                        onChange={(v) => setPoolCount(Math.min(1, v))}
                      />
                      <hr className="border-border" />
                    </>
                  )}

                  {/* 저녁 식사 */}
                  {isEventPromo && dinnerCount > 0 && (
                    <div className="mb-1 flex items-center gap-1.5">
                      <span className="text-[10px] font-bold text-orange-500 bg-orange-50 border border-orange-200 px-2 py-0.5 rounded-full">EVENT 무료</span>
                      <span className="text-[10px] text-text-light">숯불용 고기 {Math.min(dinnerCount, EVENT_FREE_DINNER)}인분 ({formatPrice(Math.min(dinnerCount, EVENT_FREE_DINNER) * pricing.dinner)} 상당)</span>
                    </div>
                  )}
                  {isJiffPromo && dinnerCount > 0 && dinnerCount <= JIFF_FREE_DINNER && (
                    <div className="mb-1 flex items-center gap-1.5">
                      <span className="text-[10px] font-bold text-amber-700 bg-yellow-50 border border-yellow-300 px-2 py-0.5 rounded-full">🎬 JIFF 무료</span>
                      <span className="text-[10px] text-text-light">목살 {Math.min(dinnerCount, JIFF_FREE_DINNER)}인분 ({formatPrice(Math.min(dinnerCount, JIFF_FREE_DINNER) * pricing.dinner)} 상당)</span>
                    </div>
                  )}
                  <Counter label="저녁 식사" desc={`1인 ${formatPrice(pricing.dinner)} (고기+햇반+쌈장+채소)`} value={dinnerCount} unitPrice={(isEventPromo && dinnerCount <= EVENT_FREE_DINNER) || isJiffPromo ? 0 : pricing.dinner}
                    onDec={() => setDinnerCount((g) => Math.max(0, g - 1))} onInc={() => setDinnerCount((g) => g + 1)} onChange={(v) => setDinnerCount(v)} />

                  <hr className="border-border" />

                  {isJiffPromo && breakfastCount > 0 && (
                    <div className="mb-1 flex items-center gap-1.5">
                      <span className="text-[10px] font-bold text-amber-700 bg-yellow-50 border border-yellow-300 px-2 py-0.5 rounded-full">🎬 JIFF 무료</span>
                      <span className="text-[10px] text-text-light">조식 샌드위치 {breakfastCount}인분 ({formatPrice(breakfastCount * 10000)} 상당)</span>
                    </div>
                  )}
                  {/* 조식 식사 — 최소 10인분 */}
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-text-dark text-sm">조식 식사</p>
                      <p className="text-xs text-text-light">{isJiffPromo ? "샌드위치 · JIFF 무료 제공" : "1인 10,000원 (메뉴 선택)"}</p>
                      <span className="inline-block mt-1 text-[11px] font-bold text-red-500 bg-red-50 border border-red-200 px-2 py-0.5 rounded-full">
                        * 최소 {BREAKFAST_MIN}인분부터 주문 가능
                      </span>
                      {breakfastCount > 0 && (
                        <p className="text-xs text-primary font-semibold mt-1">{breakfastCount}인분 = {formatPrice(breakfastCount * (isJiffPromo ? 0 : 10000))}</p>
                      )}
                    </div>
                    <div className="flex items-center gap-3">
                      <button onClick={() => setBreakfastCount((c) => c <= BREAKFAST_MIN ? 0 : c - 1)}
                        className="w-8 h-8 rounded-full border border-border flex items-center justify-center hover:bg-sage transition-colors">
                        <Minus className="w-3.5 h-3.5 text-text-mid" />
                      </button>
                      <input
                        type="number"
                        min={0}
                        value={breakfastCount}
                        onFocus={(e) => e.target.select()}
                        onChange={(e) => {
                          const v = Math.max(0, parseInt(e.target.value) || 0);
                          setBreakfastCount(v > 0 && v < BREAKFAST_MIN ? BREAKFAST_MIN : v);
                        }}
                        className="w-12 text-center font-semibold text-text-dark text-sm border border-border rounded-lg py-1 focus:outline-none focus:border-primary"
                      />
                      <button onClick={() => setBreakfastCount((c) => c === 0 ? BREAKFAST_MIN : Math.min(50, c + 1))}
                        className="w-8 h-8 rounded-full border border-border flex items-center justify-center hover:bg-sage transition-colors">
                        <Plus className="w-3.5 h-3.5 text-text-mid" />
                      </button>
                    </div>
                  </div>

                  {breakfastCount > 0 && (
                    <div className="ml-1 -mt-2">
                      <p className="text-[11px] font-semibold text-text-mid mb-1.5">조식 메뉴 선택</p>
                      <div className="flex flex-wrap gap-2">
                        {[
                          { name: "육개장", minPeople: 20 },
                          { name: "김치찌개", minPeople: 0 },
                          { name: "보리밥 비빔밥", minPeople: 0 },
                        ].map(({ name, minPeople }) => {
                          const disabled = minPeople > 0 && breakfastCount < minPeople;
                          const selected = breakfastMenu === name;
                          return (
                            <button
                              key={name}
                              type="button"
                              disabled={disabled}
                              onClick={() => !disabled && setBreakfastMenu(name)}
                              className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition-all ${
                                disabled
                                  ? "bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed"
                                  : selected
                                  ? "bg-primary text-white border-primary"
                                  : "bg-white text-text-mid border-border hover:border-primary/40"
                              }`}
                            >
                              {name}{minPeople > 0 ? ` (${minPeople}인↑)` : ""}
                            </button>
                          );
                        })}
                      </div>
                      {!breakfastMenu && (
                        <p className="text-[10px] text-amber-600 mt-1">메뉴를 선택해주세요</p>
                      )}
                    </div>
                  )}

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

                  {/* 조립공간 셀프체험 */}
                  <div>
                    <div className="flex items-center gap-1.5 mb-0.5">
                      <span className="text-xs font-bold text-red-500 bg-red-50 border border-red-200 px-2 py-0.5 rounded-full">숙박 예약 할인</span>
                      <span className="text-[10px] text-text-light"><span className="line-through">30,000원</span> → <span className="font-bold text-primary">5,000원</span>/인</span>
                    </div>
                  </div>
                  <Counter label="🧩 조립공간 셀프체험" desc="아이들 추천! CNC 나무 끼워맞추기 · 도구 불필요 · 셀프 자유 체험" value={assemblyCount} unitPrice={5000}
                    onDec={() => setAssemblyCount((g) => Math.max(0, g - 1))} onInc={() => setAssemblyCount((g) => g + 1)} onChange={(v) => setAssemblyCount(v)} />

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
                        {/* 차량 종류/대수 선택 */}
                        <p className="text-xs font-semibold text-text-dark mb-2">차량 종류 / 대수</p>
                        {isMTPackage && totalGuests > 0 && (
                          <div className="p-2.5 bg-primary/5 border border-primary/20 rounded-xl mb-2">
                            <p className="text-xs text-text-mid">💡 총 <span className="font-bold text-primary">{totalGuests}명</span> 기준 자동 추천: <span className="font-bold text-primary">{busRecommendText}</span></p>
                          </div>
                        )}
                        <div className="space-y-2">
                          {BUS_TYPES.map((bt) => {
                            const sel = busSelections.find(s => s.typeId === bt.id);
                            const count = sel ? sel.count : 0;
                            const updateCount = (newCount: number) => {
                              if (newCount <= 0) {
                                setBusSelections(prev => prev.filter(s => s.typeId !== bt.id));
                              } else {
                                setBusSelections(prev => {
                                  const exists = prev.find(s => s.typeId === bt.id);
                                  if (exists) return prev.map(s => s.typeId === bt.id ? { ...s, count: newCount } : s);
                                  return [...prev, { typeId: bt.id, count: newCount }];
                                });
                              }
                            };
                            return (
                              <div key={bt.id} className="flex items-center justify-between bg-white rounded-lg px-3 py-2 border border-border">
                                <span className="text-sm text-text-dark">{bt.label}</span>
                                <div className="flex items-center gap-2">
                                  <button onClick={() => updateCount(count - 1)} disabled={count === 0}
                                    className="w-7 h-7 rounded-full bg-sage flex items-center justify-center text-text-mid disabled:opacity-30">
                                    <Minus size={14} />
                                  </button>
                                  <span className="text-sm font-bold text-text-dark w-6 text-center">{count}</span>
                                  <button onClick={() => updateCount(count + 1)}
                                    className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                                    <Plus size={14} />
                                  </button>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                        {busSelections.length > 0 && (
                          <div className="p-3 bg-primary/10 border border-primary/30 rounded-xl text-center">
                            <p className="text-sm font-bold text-primary">
                              🚌 {busSelections.map(b => { const t = BUS_TYPES.find(bt => bt.id === b.typeId); return t ? `${t.label} ${b.count}대` : ""; }).join(" + ")}
                            </p>
                            <p className="text-xs text-text-mid mt-1">
                              총 <span className="font-bold text-primary">{totalBusSeats}석</span> / 인원 {totalGuests}명
                              {totalBusSeats >= totalGuests
                                ? <span className="text-green-600 font-semibold ml-1">✓ 여유 {totalBusSeats - totalGuests}석</span>
                                : <span className="text-red-500 font-semibold ml-1">✗ 좌석 부족 {totalGuests - totalBusSeats}명</span>
                              }
                            </p>
                          </div>
                        )}

                        <hr className="border-border" />
                        <p className="text-xs font-semibold text-text-dark mb-2">책임자 정보</p>
                        <div className="grid grid-cols-2 gap-2">
                          <input placeholder="담당자 이름" value={busForm.managerName} onChange={(e) => setBusForm({ ...busForm, managerName: e.target.value })}
                            className="px-3 py-2 rounded-lg border border-border text-sm bg-white focus:outline-none focus:border-primary" />
                          <input placeholder="연락처" value={busForm.managerPhone} onChange={(e) => setBusForm({ ...busForm, managerPhone: e.target.value })}
                            className="px-3 py-2 rounded-lg border border-border text-sm bg-white focus:outline-none focus:border-primary" />
                        </div>

                        <p className="text-xs font-semibold text-text-dark mb-2 pt-2">승차 정보</p>
                        <div className="grid grid-cols-3 gap-2">
                          <select value={busForm.pickupPlace} onChange={(e) => { const v = e.target.value; setBusForm({ ...busForm, pickupPlace: v, dropoffPlace: v, customDropoff: v === "기타" ? "" : v }); }}
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
                        <input placeholder="출발지 세부 주소 (예: 서울역 2번 출구 앞)" value={busForm.pickupDetailAddress}
                          onChange={(e) => setBusForm({ ...busForm, pickupDetailAddress: e.target.value })}
                          className="w-full px-3 py-2 rounded-lg border border-border text-sm bg-white focus:outline-none focus:border-primary" />
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

                        {/* 경유지 추가 */}
                        <div className="pt-2">
                          <div className="flex items-center justify-between mb-2">
                            <p className="text-xs font-semibold text-text-dark">경유지 <span className="font-normal text-text-light">(선택)</span></p>
                            <button
                              type="button"
                              onClick={() => setBusStopover([...busStopover, { place: "", time: "" }])}
                              className="text-xs text-primary font-semibold hover:underline"
                            >+ 경유지 추가</button>
                          </div>
                          {busStopover.map((stop, idx) => (
                            <div key={idx} className="flex items-center gap-2 mb-2">
                              <input
                                placeholder={`경유지 ${idx + 1} (예: 전주역)`}
                                value={stop.place}
                                onChange={(e) => { const arr = [...busStopover]; arr[idx].place = e.target.value; setBusStopover(arr); }}
                                className="flex-1 px-3 py-2 rounded-lg border border-border text-sm bg-white focus:outline-none focus:border-primary"
                              />
                              <select
                                value={stop.time}
                                onChange={(e) => { const arr = [...busStopover]; arr[idx].time = e.target.value; setBusStopover(arr); }}
                                className="w-24 px-2 py-2 rounded-lg border border-border text-sm bg-white focus:outline-none focus:border-primary"
                              >
                                <option value="">시간</option>
                                {Array.from({ length: 24 }, (_, i) => { const h = Math.floor(i / 2) + 6; const m = i % 2 === 0 ? "00" : "30"; const t = `${String(h).padStart(2, "0")}:${m}`; return <option key={t} value={t}>{t}</option>; })}
                              </select>
                              <button
                                type="button"
                                onClick={() => setBusStopover(busStopover.filter((_, i) => i !== idx))}
                                className="w-8 h-8 rounded-full border border-red-200 flex items-center justify-center text-red-400 hover:bg-red-50 transition-colors text-xs font-bold"
                              >✕</button>
                            </div>
                          ))}
                        </div>

                        <p className="text-xs font-semibold text-text-dark mb-2 pt-2">하차 정보 <span className="font-normal text-text-light">(퇴실 11시 기준)</span></p>
                        <div className="grid grid-cols-3 gap-2">
                          <input placeholder="하차지" value={busForm.customDropoff}
                            onChange={(e) => setBusForm({ ...busForm, customDropoff: e.target.value })}
                            readOnly={busForm.pickupPlace !== "기타" && busForm.pickupPlace !== ""}
                            className={`px-3 py-2 rounded-lg border border-border text-sm focus:outline-none focus:border-primary ${busForm.pickupPlace !== "기타" && busForm.pickupPlace !== "" ? "bg-gray-100 text-gray-500" : "bg-white"}`} />
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
                        <input placeholder="하차지 세부 주소 (예: 서울역 2번 출구 앞)" value={busForm.dropoffDetailAddress}
                          onChange={(e) => setBusForm({ ...busForm, dropoffDetailAddress: e.target.value })}
                          className="w-full mt-2 px-3 py-2 rounded-lg border border-border text-sm bg-white focus:outline-none focus:border-primary" />

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
              <p className="text-sm text-text-mid mb-1">힐링캠프 1박2일 · {totalGuests}명</p>
              <p className="text-3xl font-bold text-primary">{programPrice.toLocaleString()}원</p>
              <p className="text-xs text-text-light mt-1">1인 290,000원 × {totalGuests}명</p>
            </div>
            ) : programType === "jolib" ? (
            <div className="text-center">
              <div className="flex items-center justify-center gap-2 mb-2"><ShoppingCart className="w-5 h-5 text-primary" /><h3 className="text-lg font-semibold text-text-dark">예약 요약</h3></div>
              <p className="text-sm text-text-mid mb-1">나만의 아지트 만들기(목공체험) · {Math.max(1, extraGuests || 1)}명 · 2시간</p>
              <p className="text-3xl font-bold text-primary">{programPrice.toLocaleString()}원</p>
              <p className="text-xs text-text-light mt-1">1인 30,000원 × {Math.max(1, extraGuests || 1)}명</p>
            </div>
            ) : (
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2"><ShoppingCart className="w-5 h-5 text-primary" /><h3 className="text-lg font-semibold text-text-dark">요금 요약</h3></div>
                <div className="text-sm text-text-mid space-y-0.5">
                  <p>{program.label} {programType === "half" && selectedTimeSlots.length > 1 ? `(${selectedTimeSlots.length}타임)` : programType === "daynight" && selectedTimeSlots.length > 1 ? `(${selectedTimeSlots.length}타임)` : `(${formatPrice(program.basePrice)}/${program.unit}${program.rangeMode && nights > 1 ? ` × ${nights}박` : ""})`}: {formatPrice(programPrice)}</p>
                  {getTimeSlotLabel() && <p>시간대: {getTimeSlotLabel()}</p>}
                  {extraGuests > 0 && <p>추가 인원 ({extraGuests}명): {formatPrice(extraGuests * pricing.extraGuest)}</p>}
                  {bbqGrills > 0 && <p>그릴 대여 ({bbqGrills}개): {isJiffPromo && bbqGrills <= JIFF_FREE_GRILLS ? <><span className="line-through text-text-light">{formatPrice(bbqGrills * pricing.bbqGrill)}</span> <span className="text-amber-600 font-bold">무료(JIFF)</span></> : isEventPromo && bbqGrills <= EVENT_FREE_GRILLS ? <><span className="line-through text-text-light">{formatPrice(bbqGrills * pricing.bbqGrill)}</span> <span className="text-red-500 font-bold">무료(EVENT)</span></> : formatPrice(Math.max(0, bbqGrills - (isEventPromo ? EVENT_FREE_GRILLS : 0)) * pricing.bbqGrill)}</p>}
                  {gasRanges > 0 && <p>가스버너 ({gasRanges}개): {formatPrice(gasRanges * pricing.gasRange)}</p>}
                  {poolCount > 0 && <p>🏊 미니수영장 ({poolCount}대): {formatPrice(poolCount * pricing.miniPool)}</p>}
                  {dinnerCount > 0 && <p>저녁 식사 ({dinnerCount}명): {isJiffPromo && dinnerCount <= JIFF_FREE_DINNER ? <><span className="line-through text-text-light">{formatPrice(dinnerCount * pricing.dinner)}</span> <span className="text-amber-600 font-bold">무료(JIFF)</span></> : isEventPromo && dinnerCount <= EVENT_FREE_DINNER ? <><span className="line-through text-text-light">{formatPrice(dinnerCount * pricing.dinner)}</span> <span className="text-red-500 font-bold">무료(EVENT)</span></> : formatPrice(Math.max(0, dinnerCount - (isEventPromo ? EVENT_FREE_DINNER : 0)) * pricing.dinner)}</p>}
                  {woodcraftCount > 0 && <p>목공 키트 ({woodcraftCount}개): {formatPrice(woodcraftCount * pricing.woodcraft)}</p>}
                  {assemblyCount > 0 && <p>조립공간 셀프체험 ({assemblyCount}인): <span className="line-through text-text-light mr-1">{formatPrice(assemblyCount * 30000)}</span><span className="text-primary font-semibold">{formatPrice(assemblyCount * 5000)}</span></p>}
                  {potBbqCount > 0 && <p>항아리 바베큐 ({potBbqCount}인분): {formatPrice(potBbqCount * pricing.potBbq)}</p>}
                  {showBusForm && busPrice > 0 && <p>버스 렌트 ({busForm.pickupPlace} 왕복): {formatPrice(busPrice)}</p>}
                  {showBusForm && busPrice === 0 && <p>버스 렌트: 별도 견적</p>}
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm text-text-light">총 결제 금액</p>
                {isJiffPromo && jiffOriginalPrice > 0 && (
                  <div className="mb-1">
                    <span className="text-sm line-through text-text-light mr-2">{formatPrice(jiffOriginalPrice)}</span>
                    <span className="text-xs font-bold text-amber-600 bg-yellow-50 border border-yellow-300 px-2 py-0.5 rounded-full">🎬 JIFF 전액 할인</span>
                  </div>
                )}
                <p className="text-3xl font-bold text-primary">{formatPrice(totalPrice)}</p>
                <p className="text-sm text-text-mid mt-1">1인당 약 <span className="font-semibold text-primary">{formatPrice(pricePerPerson)}</span></p>
                {showBusForm && busPrice === 0 && <p className="text-xs text-text-light mt-1">+ 버스 렌트 별도 견적</p>}
              </div>
            </div>
            )}
            <button onClick={async () => {
              // 달력 로드 실패 시 예약 차단
              if (calendarFetchFailed) {
                alert("예약 현황을 불러오지 못했습니다.\n페이지를 새로고침한 후 다시 시도해주세요.");
                await fetchReservations();
                return;
              }
              // 확인 모달 열기 전 달력 최신화 + 중복 재검증 (stale 데이터로 인한 중복 예약 방지)
              if (program.rangeMode && checkIn && checkOut) {
                setLoadingReservations(true);
                try {
                  const res = await fetch("/api/calendar");
                  const json = await res.json();
                  const latest: { reservation_date: string; checkout_date: string | null }[] = json.dates || [];
                  const ciStr = toDateStr(checkIn.year, checkIn.month, checkIn.day);
                  const coStr = toDateStr(checkOut.year, checkOut.month, checkOut.day);
                  const hasConflict = latest.some((r) => {
                    if (!r.reservation_date) return false;
                    const rCi = r.reservation_date;
                    const rCo = r.checkout_date || new Date(new Date(r.reservation_date).getTime() + 86400000).toISOString().split("T")[0];
                    return rCi < coStr && rCo > ciStr;
                  });
                  if (hasConflict) {
                    alert("선택하신 기간이 방금 다른 예약으로 마감되었습니다.\n달력을 새로고침하니 다른 날짜를 선택해주세요.");
                    await fetchReservations();
                    setCheckIn(null);
                    setCheckOut(null);
                    return;
                  }
                } catch (e) {
                  console.error("재검증 실패:", e);
                } finally {
                  setLoadingReservations(false);
                }
              }
              setShowConfirm(true);
            }}
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

              {/* 예약 목적 */}
              <div>
                <p className="text-xs text-text-light mb-2">예약 목적 <span className="text-primary">*</span></p>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
                  {PURPOSE_OPTIONS.map((opt) => (
                    <button
                      key={opt}
                      type="button"
                      onClick={() => {
                        setGuestPurpose(opt);
                        if (opt !== "기타") setGuestPurposeCustom("");
                      }}
                      className={`py-2 px-2 text-xs rounded-lg border transition-colors ${
                        guestPurpose === opt
                          ? "bg-primary text-white border-primary"
                          : "bg-white text-text-mid border-border hover:border-primary/50"
                      }`}
                    >
                      {opt}
                    </button>
                  ))}
                </div>
                {guestPurpose === "기타" && (
                  <input
                    type="text"
                    placeholder="목적을 직접 입력해주세요"
                    value={guestPurposeCustom}
                    onChange={(e) => setGuestPurposeCustom(e.target.value)}
                    className="w-full mt-2 px-4 py-3 rounded-xl border border-border text-sm bg-white focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/20"
                  />
                )}
              </div>
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
              {bbqGrills > 0 && <div className="flex justify-between text-sm"><span className="text-text-light">그릴 대여{isJiffPromo && bbqGrills <= JIFF_FREE_GRILLS ? " (JIFF)" : isEventPromo && bbqGrills <= EVENT_FREE_GRILLS ? " (EVENT)" : ""}</span><span className="font-medium text-text-dark">{isJiffPromo && bbqGrills <= JIFF_FREE_GRILLS ? <><span className="line-through text-text-light mr-1">{formatPrice(bbqGrills * pricing.bbqGrill)}</span><span className="text-amber-600">무료</span></> : isEventPromo && bbqGrills <= EVENT_FREE_GRILLS ? <><span className="line-through text-text-light mr-1">{formatPrice(bbqGrills * pricing.bbqGrill)}</span><span className="text-red-500">무료</span></> : formatPrice(bbqGrills * pricing.bbqGrill)}</span></div>}
              {gasRanges > 0 && <div className="flex justify-between text-sm"><span className="text-text-light">가스버너</span><span className="font-medium text-text-dark">{formatPrice(gasRanges * pricing.gasRange)}</span></div>}
              {poolCount > 0 && <div className="flex justify-between text-sm"><span className="text-text-light">🏊 미니수영장</span><span className="font-medium text-text-dark">{formatPrice(poolCount * pricing.miniPool)}</span></div>}
              {dinnerCount > 0 && <div className="flex justify-between text-sm"><span className="text-text-light">저녁 식사{isJiffPromo && dinnerCount <= JIFF_FREE_DINNER ? " (JIFF)" : isEventPromo && dinnerCount <= EVENT_FREE_DINNER ? " (EVENT)" : ""}</span><span className="font-medium text-text-dark">{isJiffPromo && dinnerCount <= JIFF_FREE_DINNER ? <><span className="line-through text-text-light mr-1">{formatPrice(dinnerCount * pricing.dinner)}</span><span className="text-amber-600">무료</span></> : isEventPromo && dinnerCount <= EVENT_FREE_DINNER ? <><span className="line-through text-text-light mr-1">{formatPrice(dinnerCount * pricing.dinner)}</span><span className="text-red-500">무료</span></> : formatPrice(dinnerCount * pricing.dinner)}</span></div>}
              {woodcraftCount > 0 && <div className="flex justify-between text-sm"><span className="text-text-light">목공 키트</span><span className="font-medium text-text-dark">{formatPrice(woodcraftCount * pricing.woodcraft)}</span></div>}
              {assemblyCount > 0 && <div className="flex justify-between text-sm"><span className="text-text-light">조립공간 셀프체험 ({assemblyCount}인)</span><span className="font-medium text-text-dark"><span className="line-through text-text-light mr-1">{formatPrice(assemblyCount * 30000)}</span>{formatPrice(assemblyCount * 5000)}</span></div>}
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
