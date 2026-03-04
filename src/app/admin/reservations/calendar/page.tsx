"use client";

import { useState, useEffect, useCallback } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { ReservationRow, PROGRAM_LABELS, STATUS_LABELS } from "@/types/admin";

export default function CalendarPage() {
  const today = new Date();
  const [year, setYear] = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth());
  const [reservations, setReservations] = useState<ReservationRow[]>([]);
  const [selected, setSelected] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchMonth = useCallback(async () => {
    setLoading(true);
    const from = `${year}-${String(month + 1).padStart(2, "0")}-01`;
    const lastDay = new Date(year, month + 1, 0).getDate();
    const to = `${year}-${String(month + 1).padStart(2, "0")}-${lastDay}`;
    try {
      const res = await fetch(`/api/admin/reservations?from=${from}&to=${to}&status=all&page=0`);
      const json = await res.json();
      setReservations(json.data || []);
    } catch {
      setReservations([]);
    }
    setLoading(false);
  }, [year, month]);

  useEffect(() => { fetchMonth(); }, [fetchMonth]);

  const prevMonth = () => { if (month === 0) { setMonth(11); setYear(year - 1); } else setMonth(month - 1); };
  const nextMonth = () => { if (month === 11) { setMonth(0); setYear(year + 1); } else setMonth(month + 1); };

  const firstDayOfMonth = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const days = Array.from({ length: firstDayOfMonth + daysInMonth }, (_, i) =>
    i < firstDayOfMonth ? null : i - firstDayOfMonth + 1
  );

  const getDateStr = (day: number) => `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;

  const getReservationsForDay = (day: number) => {
    const ds = getDateStr(day);
    return reservations.filter((r) => {
      const start = r.reservation_date;
      const end = r.checkout_date || start;
      return ds >= start && ds < end;
    });
  };

  const selectedReservations = selected
    ? reservations.filter((r) => {
        const end = r.checkout_date || r.reservation_date;
        return selected >= r.reservation_date && selected < end;
      })
    : [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">달력 뷰</h1>
        <a href="/admin/reservations" className="text-sm text-primary font-medium hover:underline">← 목록으로</a>
      </div>

      <div className="bg-white rounded-2xl border border-gray-200 p-5">
        {/* Month Nav */}
        <div className="flex items-center justify-between mb-6">
          <button onClick={prevMonth} className="p-2 rounded-lg hover:bg-gray-100 transition-colors"><ChevronLeft size={20} /></button>
          <h2 className="text-xl font-bold text-gray-900">{year}년 {month + 1}월</h2>
          <button onClick={nextMonth} className="p-2 rounded-lg hover:bg-gray-100 transition-colors"><ChevronRight size={20} /></button>
        </div>

        {/* Day headers */}
        <div className="grid grid-cols-7 gap-1 mb-2">
          {["일", "월", "화", "수", "목", "금", "토"].map((d, i) => (
            <div key={d} className={`text-center text-sm font-semibold py-2 ${i === 0 ? "text-red-500" : i === 6 ? "text-blue-500" : "text-gray-500"}`}>{d}</div>
          ))}
        </div>

        {/* Calendar grid */}
        {loading ? (
          <div className="h-64 flex items-center justify-center text-gray-400 text-sm">
            <div className="animate-spin w-6 h-6 border-2 border-primary border-t-transparent rounded-full mr-2" />
            불러오는 중...
          </div>
        ) : (
          <div className="grid grid-cols-7 gap-1">
            {days.map((day, i) => {
              if (day === null) return <div key={i} />;
              const ds = getDateStr(day);
              const dayRes = getReservationsForDay(day);
              const isToday = ds === today.toISOString().split("T")[0];
              const isSelected = ds === selected;
              const hasConfirmed = dayRes.some((r) => r.status === "confirmed");
              const hasPending = dayRes.some((r) => r.status === "pending");

              return (
                <button
                  key={i}
                  onClick={() => setSelected(isSelected ? null : ds)}
                  className={`aspect-square rounded-xl flex flex-col items-center justify-center gap-0.5 text-sm transition-all relative ${
                    isSelected ? "bg-primary text-white" :
                    isToday ? "bg-primary/10 text-primary font-bold" :
                    "hover:bg-gray-100"
                  }`}
                >
                  <span className="font-medium">{day}</span>
                  {dayRes.length > 0 && (
                    <div className="flex gap-0.5">
                      {hasConfirmed && <span className={`w-1.5 h-1.5 rounded-full ${isSelected ? "bg-white" : "bg-green-500"}`} />}
                      {hasPending && <span className={`w-1.5 h-1.5 rounded-full ${isSelected ? "bg-white/60" : "bg-amber-500"}`} />}
                    </div>
                  )}
                  {dayRes.length > 0 && (
                    <span className={`text-xs font-medium ${isSelected ? "text-white/80" : "text-gray-500"}`}>{dayRes.length}건</span>
                  )}
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Selected day detail */}
      {selected && (
        <div className="bg-white rounded-2xl border border-gray-200 p-5">
          <h3 className="text-base font-bold text-gray-900 mb-3">{selected} 예약 ({selectedReservations.length}건)</h3>
          {selectedReservations.length === 0 ? (
            <p className="text-sm text-gray-400">해당 날짜에 예약이 없습니다</p>
          ) : (
            <div className="space-y-3">
              {selectedReservations.map((r) => (
                <div key={r.id} className="flex items-center justify-between py-3 border-b border-gray-100 last:border-0">
                  <div>
                    <p className="text-sm font-semibold text-gray-900">{r.guest_name} · {r.guest_phone}</p>
                    <p className="text-sm text-gray-500">{PROGRAM_LABELS[r.program_type]} · {r.stay_nights}박 · {r.guest_count}명</p>
                  </div>
                  <span className={`text-sm px-3 py-1 rounded-full font-semibold ${
                    r.status === "confirmed" ? "bg-green-100 text-green-800" :
                    r.status === "pending" ? "bg-amber-100 text-amber-800" :
                    "bg-red-100 text-red-700"
                  }`}>
                    {STATUS_LABELS[r.status]}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
