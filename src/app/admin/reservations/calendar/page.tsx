"use client";

import { useState, useEffect, useCallback } from "react";
import { ChevronLeft, ChevronRight, Phone, X } from "lucide-react";
import { ReservationRow, PROGRAM_LABELS, STATUS_LABELS, calculateRevenue } from "@/types/admin";

const STATUS_COLORS: Record<string, string> = {
  confirmed: "bg-green-100 text-green-800",
  visited: "bg-blue-100 text-blue-800",
  reviewed: "bg-purple-100 text-purple-800",
  upcoming: "bg-cyan-100 text-cyan-800",
  cancelled: "bg-red-100 text-red-700",
};

function formatPrice(n: number) {
  if (n >= 10000) return (n / 10000).toFixed(0) + "만원";
  return n.toLocaleString() + "원";
}

function formatOptions(r: ReservationRow): string {
  const opts: string[] = [];
  if (r.bbq_count > 0) opts.push(`BBQ${r.bbq_count}`);
  if (r.burner_count > 0) opts.push(`렌지${r.burner_count}`);
  if (r.dinner_count > 0) opts.push(`석식${r.dinner_count}`);
  if (r.woodcraft_count > 0) opts.push(`목공${r.woodcraft_count}`);
  if (r.pot_bbq_count > 0) opts.push(`항아리${r.pot_bbq_count}`);
  if (r.bus_requested) opts.push("버스");
  return opts.join(" · ");
}

export default function CalendarPage() {
  const today = new Date();
  const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;
  const [year, setYear] = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth());
  const [reservations, setReservations] = useState<ReservationRow[]>([]);
  const [selected, setSelected] = useState<string | null>(null);
  const [detailRes, setDetailRes] = useState<ReservationRow | null>(null);
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

  const prevMonth = () => { if (month === 0) { setMonth(11); setYear(year - 1); } else setMonth(month - 1); setSelected(null); };
  const nextMonth = () => { if (month === 11) { setMonth(0); setYear(year + 1); } else setMonth(month + 1); setSelected(null); };

  const firstDayOfMonth = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const days = Array.from({ length: firstDayOfMonth + daysInMonth }, (_, i) =>
    i < firstDayOfMonth ? null : i - firstDayOfMonth + 1
  );

  const getDateStr = (day: number) => `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;

  const getReservationsForDay = (day: number) => {
    const ds = getDateStr(day);
    return reservations.filter((r) => {
      if (r.status === "cancelled") return false;
      const start = r.reservation_date;
      const end = r.checkout_date || start;
      return ds >= start && ds < end;
    });
  };

  const selectedReservations = selected
    ? reservations.filter((r) => {
        if (r.status === "cancelled") return false;
        const end = r.checkout_date || r.reservation_date;
        return selected >= r.reservation_date && selected < end;
      })
    : [];

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl sm:text-2xl font-bold text-gray-900">달력 뷰</h1>
        <a href="/admin/reservations" className="text-xs sm:text-sm text-primary font-medium hover:underline">← 목록</a>
      </div>

      <div className="bg-white rounded-2xl border border-gray-200 p-3 sm:p-5">
        {/* Month Nav */}
        <div className="flex items-center justify-between mb-4 sm:mb-6">
          <button onClick={prevMonth} className="p-2 rounded-lg hover:bg-gray-100 transition-colors"><ChevronLeft size={20} /></button>
          <h2 className="text-lg sm:text-xl font-bold text-gray-900">{year}년 {month + 1}월</h2>
          <button onClick={nextMonth} className="p-2 rounded-lg hover:bg-gray-100 transition-colors"><ChevronRight size={20} /></button>
        </div>

        {/* Day headers */}
        <div className="grid grid-cols-7 gap-1 mb-1 sm:mb-2">
          {["일", "월", "화", "수", "목", "금", "토"].map((d, i) => (
            <div key={d} className={`text-center text-xs sm:text-sm font-semibold py-1 sm:py-2 ${i === 0 ? "text-red-500" : i === 6 ? "text-blue-500" : "text-gray-500"}`}>{d}</div>
          ))}
        </div>

        {/* Calendar grid */}
        {loading ? (
          <div className="h-64 flex items-center justify-center text-gray-400 text-sm">
            <div className="animate-spin w-6 h-6 border-2 border-primary border-t-transparent rounded-full mr-2" />
            불러오는 중...
          </div>
        ) : (
          <div className="grid grid-cols-7 gap-0.5 sm:gap-1">
            {days.map((day, i) => {
              if (day === null) return <div key={i} />;
              const ds = getDateStr(day);
              const dayRes = getReservationsForDay(day);
              const isToday = ds === todayStr;
              const isSelected = ds === selected;
              const hasReservation = dayRes.length > 0;
              const dayOfWeek = (firstDayOfMonth + day - 1) % 7;

              return (
                <button
                  key={i}
                  onClick={() => setSelected(isSelected ? null : ds)}
                  className={`rounded-lg sm:rounded-xl flex flex-col items-center justify-start pt-1 sm:pt-2 pb-1 min-h-[52px] sm:min-h-[80px] text-sm transition-all relative overflow-hidden ${
                    isSelected ? "bg-primary/10 ring-2 ring-primary" :
                    isToday ? "bg-primary/5" :
                    "hover:bg-gray-50"
                  }`}
                >
                  <span className={`text-xs sm:text-sm font-medium ${
                    isToday ? "text-primary font-bold" :
                    dayOfWeek === 0 ? "text-red-500" :
                    dayOfWeek === 6 ? "text-blue-500" :
                    "text-gray-700"
                  }`}>{day}</span>

                  {hasReservation && (
                    <div className="w-full mt-0.5 sm:mt-1 px-0.5">
                      {/* 마감 표시 */}
                      <div className="bg-red-500 text-white text-[9px] sm:text-[10px] font-bold rounded px-1 py-0.5 text-center leading-tight">
                        마감
                      </div>
                      {/* PC: 예약자 이름들 표시 */}
                      <div className="hidden sm:block mt-0.5 space-y-0.5">
                        {dayRes.slice(0, 2).map((r) => (
                          <div key={r.id} className="text-[10px] text-gray-600 truncate leading-tight">
                            {r.guest_name} {r.guest_count + (r.extra_guests || 0)}명
                          </div>
                        ))}
                        {dayRes.length > 2 && (
                          <div className="text-[10px] text-gray-400">+{dayRes.length - 2}건</div>
                        )}
                      </div>
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Selected day - Reservation Cards */}
      {selected && (
        <div className="bg-white rounded-2xl border border-gray-200 p-3 sm:p-5">
          <h3 className="text-sm sm:text-base font-bold text-gray-900 mb-3">
            {selected} {selectedReservations.length > 0 ? <span className="text-red-500 ml-1">마감</span> : ""} ({selectedReservations.length}건)
          </h3>
          {selectedReservations.length === 0 ? (
            <p className="text-sm text-gray-400 py-4 text-center">해당 날짜에 예약이 없습니다</p>
          ) : (
            <div className="space-y-3">
              {selectedReservations.map((r) => {
                const optStr = formatOptions(r);
                return (
                  <div
                    key={r.id}
                    onClick={() => setDetailRes(r)}
                    className="bg-gray-50 rounded-xl p-3 sm:p-4 cursor-pointer hover:bg-gray-100 active:bg-gray-100 transition-colors"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-gray-900 text-sm sm:text-base">{r.guest_name}</span>
                        <span className="text-xs text-gray-500">{r.guest_phone}</span>
                      </div>
                      <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${STATUS_COLORS[r.status]}`}>
                        {STATUS_LABELS[r.status]}
                      </span>
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-x-4 gap-y-1 text-sm">
                      <div>
                        <span className="text-gray-500">프로그램: </span>
                        <span className="font-medium text-gray-800">{PROGRAM_LABELS[r.program_type]}</span>
                      </div>
                      <div>
                        <span className="text-gray-500">인원: </span>
                        <span className="font-medium text-gray-800">{r.guest_count + (r.extra_guests || 0)}명{r.extra_guests > 0 ? ` (기본${r.guest_count}+추가${r.extra_guests})` : ""}</span>
                      </div>
                      <div>
                        <span className="text-gray-500">기간: </span>
                        <span className="font-medium text-gray-800">{r.stay_nights}박</span>
                      </div>
                      <div>
                        <span className="text-gray-500">매출: </span>
                        <span className="font-bold text-primary">{formatPrice(calculateRevenue(r))}</span>
                      </div>
                    </div>
                    {optStr && (
                      <div className="mt-1.5 text-xs text-gray-500">
                        {optStr}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Detail Popup Modal */}
      {detailRes && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
          <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={() => setDetailRes(null)} />
          <div className="relative bg-white rounded-t-2xl sm:rounded-2xl shadow-xl w-full sm:max-w-lg max-h-[90vh] overflow-y-auto p-5 sm:p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-gray-900">예약자 상세정보</h2>
              <button onClick={() => setDetailRes(null)} className="p-1 rounded-lg hover:bg-gray-100 transition-colors"><X size={20} className="text-gray-400" /></button>
            </div>

            {/* 예약자 헤더 */}
            <div className="flex items-center gap-3 mb-5 pb-4 border-b border-gray-200">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-lg flex-shrink-0">
                {detailRes.guest_name.charAt(0)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="font-bold text-gray-900 text-lg">{detailRes.guest_name}</h3>
                  <span className={`text-xs px-2.5 py-0.5 rounded-full font-semibold ${STATUS_COLORS[detailRes.status]}`}>
                    {STATUS_LABELS[detailRes.status]}
                  </span>
                </div>
                <p className="text-sm text-gray-500 flex items-center gap-1 mt-0.5">
                  <Phone size={13} /> {detailRes.guest_phone}
                </p>
              </div>
            </div>

            {/* 예약 정보 */}
            <div className="space-y-2.5">
              <InfoRow label="체크인" value={`${detailRes.reservation_date} (${detailRes.stay_nights}박)`} />
              <InfoRow label="체크아웃" value={detailRes.checkout_date || "-"} />
              <InfoRow label="프로그램" value={PROGRAM_LABELS[detailRes.program_type]} />
              <InfoRow label="인원" value={`${detailRes.guest_count + (detailRes.extra_guests || 0)}명${detailRes.extra_guests > 0 ? ` (기본${detailRes.guest_count}+추가${detailRes.extra_guests})` : ""}`} />
              {detailRes.time_slot && <InfoRow label="시간대" value={detailRes.time_slot} />}
              <InfoRow label="목적" value={detailRes.purpose || detailRes.purpose_raw || "-"} />
            </div>

            {/* 옵션 상세 */}
            <div className="mt-4 pt-4 border-t border-gray-200">
              <h4 className="text-sm font-bold text-gray-900 mb-3">옵션 상세</h4>
              <div className="grid grid-cols-2 gap-2">
                <OptionBox label="BBQ 그릴" value={detailRes.bbq_count} unit="개" active={detailRes.bbq_count > 0} />
                <OptionBox label="가스버너" value={detailRes.burner_count} unit="개" active={detailRes.burner_count > 0} />
                <OptionBox label="저녁식사" value={detailRes.dinner_count} unit="명" active={detailRes.dinner_count > 0} />
                <OptionBox label="목공키트" value={detailRes.woodcraft_count} unit="개" active={detailRes.woodcraft_count > 0} />
                <OptionBox label="항아리BBQ" value={detailRes.pot_bbq_count} unit="인분" active={detailRes.pot_bbq_count > 0} />
                <OptionBox label="버스 렌트" value={detailRes.bus_requested ? 1 : 0} unit="" active={detailRes.bus_requested} text={detailRes.bus_requested ? "요청" : "없음"} />
              </div>
            </div>

            {/* 매출 / 메모 */}
            <div className="mt-4 pt-4 border-t border-gray-200 space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold text-gray-700">예상 매출</span>
                <span className="text-lg font-bold text-primary">{formatPrice(calculateRevenue(detailRes))}</span>
              </div>
              {detailRes.notes && <InfoRow label="메모" value={detailRes.notes} />}
              <InfoRow label="채널" value={detailRes.source || detailRes.referral_source || "-"} />
            </div>

            {/* 하단 버튼 */}
            <div className="mt-5 pt-4 border-t border-gray-200 flex gap-2">
              <a href={`/admin/reservations`} className="flex-1 py-2.5 rounded-xl bg-primary/10 text-primary font-semibold text-sm text-center hover:bg-primary/20 transition-colors">
                예약 관리로 이동
              </a>
              <button onClick={() => setDetailRes(null)} className="flex-1 py-2.5 rounded-xl border border-gray-200 text-gray-600 font-semibold text-sm hover:bg-gray-50 transition-colors">
                닫기
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start justify-between py-1.5">
      <span className="text-gray-500 text-sm min-w-[70px]">{label}</span>
      <span className="text-gray-900 text-sm font-medium text-right">{value}</span>
    </div>
  );
}

function OptionBox({ label, value, unit, active, text }: { label: string; value: number; unit: string; active: boolean; text?: string }) {
  return (
    <div className={`rounded-lg p-2.5 text-center ${active ? "bg-primary/5 border border-primary/20" : "bg-gray-50 border border-gray-100"}`}>
      <p className={`text-xs ${active ? "text-primary font-semibold" : "text-gray-400"}`}>{label}</p>
      <p className={`text-base font-bold mt-0.5 ${active ? "text-gray-900" : "text-gray-300"}`}>
        {text || `${value}${unit}`}
      </p>
    </div>
  );
}
