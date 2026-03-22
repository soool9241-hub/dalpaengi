"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { X, Clock, Gift, ChevronRight, Calendar } from "lucide-react";
import { useReservation } from "@/context/ReservationContext";

const DEADLINE = new Date("2026-03-23T00:00:00+09:00");

const DAY_NAMES = ["일", "월", "화", "수", "목", "금", "토"];

const PURPOSES = [
  { id: "stay", label: "숙박 패키지", emoji: "🌙" },
  { id: "mt", label: "대학생 MT", emoji: "🎓" },
  { id: "family", label: "가족여행", emoji: "👨‍👩‍👧‍👦" },
  { id: "group", label: "동호회", emoji: "🤝" },
] as const;

function dateToStr(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function toDateStr(year: number, month: number, day: number): string {
  return `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

function getTimeLeft() {
  const now = new Date();
  const diff = DEADLINE.getTime() - now.getTime();
  if (diff <= 0) return null;
  const d = Math.floor(diff / 86400000);
  const h = Math.floor((diff % 86400000) / 3600000);
  const m = Math.floor((diff % 3600000) / 60000);
  const s = Math.floor((diff % 60000) / 1000);
  return { days: d, hours: h, minutes: m, seconds: s };
}

export default function EventPopup() {
  const { setSelectedProgramId, setSelectedCheckInDate, setIsMTPackage, setIsEventPromo } = useReservation();
  const [show, setShow] = useState(false);
  const [timeLeft, setTimeLeft] = useState(getTimeLeft());
  const [bookedDates, setBookedDates] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);

  const [purpose, setPurpose] = useState<string | null>(null);
  const [selectedDow, setSelectedDow] = useState<number | null>(null);
  const [selectedDate, setSelectedDate] = useState<{ year: number; month: number; day: number } | null>(null);

  const fetchReservations = useCallback(async () => {
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
    } catch { /* ignore */ } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!getTimeLeft()) return;
    fetchReservations();
    const timer = setTimeout(() => setShow(true), 500);
    return () => clearTimeout(timer);
  }, [fetchReservations]);

  useEffect(() => {
    if (!show) return;
    const interval = setInterval(() => {
      const tl = getTimeLeft();
      setTimeLeft(tl);
      if (!tl) clearInterval(interval);
    }, 1000);
    return () => clearInterval(interval);
  }, [show]);

  // 모바일에서 팝업 열릴 때 body 스크롤 방지
  useEffect(() => {
    if (show) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => { document.body.style.overflow = ""; };
  }, [show]);

  const availableDates = useMemo(() => {
    if (selectedDow === null) return [];
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const results: { year: number; month: number; day: number; label: string }[] = [];
    for (let m = 2; m <= 4; m++) {
      const daysInMonth = new Date(2026, m + 1, 0).getDate();
      for (let d = 1; d <= daysInMonth; d++) {
        const date = new Date(2026, m, d);
        if (date <= today) continue;
        if (date.getDay() !== selectedDow) continue;
        if (!bookedDates.has(toDateStr(2026, m, d))) {
          results.push({ year: 2026, month: m, day: d, label: `${m + 1}/${d}(${DAY_NAMES[selectedDow]})` });
        }
      }
    }
    return results;
  }, [selectedDow, bookedDates]);

  const todayAvailable = useMemo(() => !bookedDates.has(dateToStr(new Date())), [bookedDates]);

  const allSoldOut = useMemo(() => {
    if (loading) return false;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    for (let m = 2; m <= 4; m++) {
      const dim = new Date(2026, m + 1, 0).getDate();
      for (let d = 1; d <= dim; d++) {
        if (new Date(2026, m, d) <= today) continue;
        if (!bookedDates.has(toDateStr(2026, m, d))) return false;
      }
    }
    return true;
  }, [loading, bookedDates]);

  if (!show || !timeLeft || allSoldOut) return null;

  const handleBook = (date: { year: number; month: number; day: number }) => {
    setIsEventPromo(true);
    setIsMTPackage(purpose === "mt");
    setSelectedProgramId("stay");
    setSelectedCheckInDate(date);
    setShow(false);
    setTimeout(() => {
      document.getElementById("reservation")?.scrollIntoView({ behavior: "smooth" });
    }, 100);
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-end sm:items-center justify-center sm:p-4 animate-fade-in">
      {/* 백드롭 */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShow(false)} />

      {/* 팝업 컨테이너 - 모바일: 하단 시트, PC: 센터 모달 */}
      <div className="relative bg-background w-full sm:max-w-lg sm:rounded-3xl rounded-t-3xl max-h-[95vh] sm:max-h-[90vh] flex flex-col shadow-2xl animate-scale-in border border-border overflow-hidden">
        {/* 닫기 */}
        <button onClick={() => setShow(false)}
          className="absolute top-3 right-3 z-20 w-9 h-9 sm:w-8 sm:h-8 rounded-full bg-white flex items-center justify-center hover:bg-sage transition-colors shadow-sm border border-border active:scale-95">
          <X size={16} className="text-text-mid sm:w-[14px] sm:h-[14px]" />
        </button>

        {/* 스크롤 영역 */}
        <div className="overflow-y-auto overscroll-contain flex-1 [-webkit-overflow-scrolling:touch]">
          {/* 헤더 */}
          <div className="bg-primary px-5 sm:px-6 pt-10 sm:pt-8 pb-5 sm:pb-6 text-center text-white rounded-t-3xl relative">
            {/* 모바일 드래그 핸들 */}
            <div className="sm:hidden absolute top-3 left-1/2 -translate-x-1/2">
              <div className="w-10 h-1 rounded-full bg-white/30" />
            </div>
            <p className="text-[9px] sm:text-[10px] font-bold tracking-[0.25em] text-white/60 mb-2">GRAND OPEN EVENT</p>
            <h2 className="text-xl sm:text-2xl font-black leading-snug">지금 바로 예약시</h2>
            <p className="text-base sm:text-lg font-bold text-white/90 mt-1.5">28만원 할인 혜택 바로 특별 제공!!</p>
          </div>

          {/* 카운트다운 */}
          <div className="mx-3 sm:mx-4 -mt-4 sm:-mt-5 relative z-10 bg-white rounded-xl sm:rounded-2xl shadow-lg border border-border p-3 sm:p-4 text-center">
            <div className="flex items-center justify-center gap-1.5 mb-1.5 sm:mb-2">
              <Clock size={13} className="text-red-500" />
              <span className="text-[10px] sm:text-xs font-bold text-red-500 tracking-wider">EVENT 마감까지</span>
            </div>
            <div className="flex items-center justify-center gap-1.5 sm:gap-2">
              {[
                { v: timeLeft.days, l: "일" },
                { v: timeLeft.hours, l: "시" },
                { v: timeLeft.minutes, l: "분" },
                { v: timeLeft.seconds, l: "초" },
              ].map((t, i) => (
                <div key={i} className="flex items-baseline gap-0.5">
                  <span className="bg-primary/10 rounded-lg sm:rounded-xl px-2 sm:px-3 py-1.5 sm:py-2 text-2xl sm:text-3xl font-black text-primary tabular-nums min-w-[40px] sm:min-w-[52px] text-center inline-block">
                    {String(t.v).padStart(2, "0")}
                  </span>
                  <span className="text-[9px] sm:text-[10px] text-text-light font-bold">{t.l}</span>
                </div>
              ))}
            </div>
            <p className="text-[10px] sm:text-[11px] text-text-light mt-1.5 sm:mt-2">3월 22일(일) 자정 12시 마감</p>
          </div>

          {/* 무료 혜택 */}
          <div className="mx-3 sm:mx-4 mt-3 sm:mt-4 bg-gradient-to-br from-red-500 to-orange-500 rounded-xl sm:rounded-2xl p-[2px]">
            <div className="bg-white rounded-[10px] sm:rounded-[14px] p-3 sm:p-4 space-y-2.5 sm:space-y-3">
              <div className="text-center">
                <span className="inline-flex items-center gap-1.5 text-[11px] sm:text-xs font-black text-white bg-gradient-to-r from-red-500 to-orange-500 px-3 sm:px-4 py-1 sm:py-1.5 rounded-full shadow-md">
                  <Gift size={13} /> 예약 시 무료 제공
                </span>
              </div>

              <div className="flex items-center gap-2.5 sm:gap-3 bg-red-50 rounded-lg sm:rounded-xl p-2.5 sm:p-3 border border-red-100">
                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg sm:rounded-xl bg-gradient-to-br from-red-500 to-red-600 flex items-center justify-center flex-shrink-0 shadow-md text-lg sm:text-xl">🔥</div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs sm:text-sm font-black text-text-dark">바베큐 그릴 6개</p>
                  <p className="text-[10px] sm:text-[11px] text-text-light">숯 + 그릴 + 토치 풀세트</p>
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="text-[10px] sm:text-[11px] text-text-light line-through">180,000원</p>
                  <p className="text-base sm:text-lg font-black text-red-500">FREE</p>
                </div>
              </div>

              <div className="flex items-center gap-2.5 sm:gap-3 bg-orange-50 rounded-lg sm:rounded-xl p-2.5 sm:p-3 border border-orange-100">
                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg sm:rounded-xl bg-gradient-to-br from-orange-500 to-amber-500 flex items-center justify-center flex-shrink-0 shadow-md text-lg sm:text-xl">🥩</div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs sm:text-sm font-black text-text-dark">숯불용 고기 10인분</p>
                  <p className="text-[10px] sm:text-[11px] text-text-light">프리미엄 바베큐 고기 세트</p>
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="text-[10px] sm:text-[11px] text-text-light line-through">100,000원</p>
                  <p className="text-base sm:text-lg font-black text-orange-500">FREE</p>
                </div>
              </div>

              <div className="text-center pt-1.5 sm:pt-2 border-t border-border">
                <p className="text-[10px] sm:text-[11px] text-text-light">총 혜택 금액</p>
                <p className="text-2xl sm:text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-orange-500 leading-tight">280,000원</p>
                <p className="text-[11px] sm:text-xs font-bold text-red-500">무료 제공!</p>
              </div>
            </div>
          </div>

          {/* STEPS */}
          <div className="px-4 sm:px-5 pt-4 sm:pt-5 pb-4 sm:pb-5 space-y-4 sm:space-y-5">
            {/* STEP 1 */}
            <div>
              <p className="text-center text-[9px] sm:text-[10px] text-text-light tracking-widest font-bold mb-1.5 sm:mb-2">STEP 1</p>
              <div className="flex items-center justify-center gap-1.5 mb-2.5 sm:mb-3">
                <Calendar size={13} className="text-primary" />
                <p className="text-xs sm:text-sm font-bold text-text-dark">예약 목적 선택</p>
              </div>
              <div className="grid grid-cols-2 gap-1.5 sm:gap-2">
                {PURPOSES.map((p) => {
                  const active = purpose === p.id;
                  return (
                    <button key={p.id} onClick={() => { setPurpose(p.id); setSelectedDow(null); setSelectedDate(null); }}
                      className={`flex items-center gap-2 sm:gap-2.5 p-2.5 sm:p-3 rounded-lg sm:rounded-xl border-2 transition-all active:scale-[0.97] ${active ? "border-primary bg-primary/5 shadow-sm" : "border-border bg-white hover:border-primary/30"}`}>
                      <span className="text-base sm:text-lg">{p.emoji}</span>
                      <span className={`text-[11px] sm:text-xs font-bold ${active ? "text-primary" : "text-text-dark"}`}>{p.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* STEP 2 */}
            {purpose && (
              <div className="animate-fade-in">
                <p className="text-center text-[9px] sm:text-[10px] text-text-light tracking-widest font-bold mb-1.5 sm:mb-2">STEP 2</p>
                <div className="flex items-center justify-center gap-1.5 mb-2.5 sm:mb-3">
                  <Calendar size={13} className="text-primary" />
                  <p className="text-xs sm:text-sm font-bold text-text-dark">선호 요일</p>
                </div>
                <div className="flex justify-center gap-1 sm:gap-1.5 mb-2">
                  {DAY_NAMES.map((name, i) => {
                    const active = selectedDow === i;
                    return (
                      <button key={i} onClick={() => { setSelectedDow(i); setSelectedDate(null); }}
                        className={`w-9 h-9 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl text-xs sm:text-sm font-bold transition-all border active:scale-95 ${active ? "bg-primary text-white border-primary shadow-md" : `border-border bg-white hover:border-primary/30 ${i === 0 ? "text-red-400" : i === 6 ? "text-blue-400" : "text-text-dark"}`}`}>
                        {name}
                      </button>
                    );
                  })}
                </div>
                <div className="flex items-center justify-center gap-1.5">
                  <span className={`w-2 h-2 rounded-full ${todayAvailable ? "bg-green-500" : "bg-red-400"}`} />
                  <span className="text-[10px] sm:text-[11px] text-text-light">
                    오늘 {todayAvailable ? <span className="text-green-600 font-bold">예약 가능</span> : <span className="text-red-500 font-bold">마감</span>}
                  </span>
                </div>
              </div>
            )}

            {/* STEP 3 */}
            {selectedDow !== null && (
              <div className="animate-fade-in">
                <p className="text-center text-[9px] sm:text-[10px] text-text-light tracking-widest font-bold mb-1.5 sm:mb-2">STEP 3</p>
                <p className="text-center text-[11px] sm:text-xs text-text-light mb-2.5 sm:mb-3">
                  <span className="font-bold text-text-dark">{DAY_NAMES[selectedDow]}요일</span> 예약 가능일
                </p>
                {loading ? (
                  <p className="text-center text-[11px] sm:text-xs text-text-light animate-pulse py-4">불러오는 중...</p>
                ) : availableDates.length === 0 ? (
                  <div className="text-center py-3 sm:py-4 bg-sage/50 rounded-lg sm:rounded-xl">
                    <p className="text-xs sm:text-sm text-text-mid">해당 요일은 모두 마감되었습니다</p>
                    <p className="text-[10px] sm:text-xs text-text-light mt-1">다른 요일을 선택해보세요</p>
                  </div>
                ) : (
                  <div className="flex flex-wrap justify-center gap-1.5 sm:gap-2">
                    {availableDates.map((d) => {
                      const isSelected = selectedDate?.year === d.year && selectedDate?.month === d.month && selectedDate?.day === d.day;
                      return (
                        <button key={d.label}
                          onClick={() => setSelectedDate({ year: d.year, month: d.month, day: d.day })}
                          className={`px-3 py-1.5 sm:px-3.5 sm:py-2 rounded-full text-[11px] sm:text-xs font-bold transition-all border active:scale-95 ${isSelected ? "bg-primary text-white border-primary shadow-md" : "bg-white text-text-dark border-border hover:border-primary/40"}`}>
                          {d.label}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* CTA - 하단 고정 (스크롤과 분리) */}
        <div className="flex-shrink-0 px-4 sm:px-5 pb-4 sm:pb-5 pt-2 bg-background border-t border-border/50">
          <button
            disabled={!selectedDate}
            onClick={() => selectedDate && handleBook(selectedDate)}
            className={`w-full py-3.5 sm:py-4 rounded-xl sm:rounded-2xl font-bold text-xs sm:text-sm transition-all flex items-center justify-center gap-2 active:scale-[0.98] ${selectedDate ? "bg-primary text-white shadow-lg hover:bg-primary-light" : "bg-sage text-text-light cursor-not-allowed"}`}>
            {selectedDate ? (
              <>
                <Gift size={15} />
                지금 바로 혜택 받고 예약하기
                <ChevronRight size={15} />
              </>
            ) : purpose ? (selectedDow !== null ? "날짜를 선택해주세요" : "선호 요일을 선택해주세요") : "예약 목적을 선택해주세요"}
          </button>
          <p className="text-center text-[8px] sm:text-[9px] text-text-light/50 mt-1.5">* 이벤트 기간 내 예약 건에 한해 적용</p>
        </div>
      </div>
    </div>
  );
}
