"use client";

import { useState, useEffect, useCallback } from "react";
import { CalendarCheck, Users, DollarSign, ArrowUpRight, ArrowDownRight, Pencil, Save, X, Phone, Bus } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { DashboardData, PROGRAM_LABELS, STATUS_LABELS, calculateRevenue } from "@/types/admin";
import type { ReservationRow } from "@/types/admin";

const COLORS = ["#2d5016", "#4a7c28", "#8B6914", "#c49a2a"];

const BUS_ROUTES: Record<string, number> = {
  "전북대": 600000, "전주대": 650000, "원광대": 700000, "우석대": 650000,
};
const TIME_OPTIONS_PICKUP = Array.from({ length: 25 }, (_, i) => {
  const h = Math.floor(i / 2) + 6;
  const m = i % 2 === 0 ? "00" : "30";
  return `${String(h).padStart(2, "0")}:${m}`;
});
const TIME_OPTIONS_DROPOFF = ["06:00","06:30","07:00","07:30","08:00","08:30","09:00","09:30","10:00","10:30"];

function formatPrice(n: number) {
  if (n >= 10000) return (n / 10000).toFixed(0) + "만원";
  return n.toLocaleString() + "원";
}

function formatPhone(phone: string): string {
  const digits = phone.replace(/[^0-9]/g, "");
  if (digits.length === 11) return `${digits.slice(0, 3)}-${digits.slice(3, 7)}-${digits.slice(7)}`;
  if (digits.length === 10) return `${digits.slice(0, 3)}-${digits.slice(3, 6)}-${digits.slice(6)}`;
  return phone;
}

function ChangeIndicator({ current, previous }: { current: number; previous: number }) {
  if (previous === 0) return null;
  const pct = Math.round(((current - previous) / previous) * 100);
  const up = pct >= 0;
  return (
    <span className={`flex items-center gap-0.5 text-xs sm:text-sm font-semibold ${up ? "text-green-600" : "text-red-500"}`}>
      {up ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
      {Math.abs(pct)}%
    </span>
  );
}

const RECENT_OPTIONS = [
  { value: 7, label: "7일" },
  { value: 14, label: "2주" },
  { value: 28, label: "4주" },
];

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function getBusCost(r: any): number {
  const bd = r.bus_detail;
  if (!r.bus_requested || !bd) return 0;
  const place = bd.pickup_place || "";
  if (!BUS_ROUTES[place]) return 0;
  // dropoff 정보 있으면 왕복, 없으면 편도
  const isRoundtrip = !!(bd.dropoff_time || bd.dropoff_people);
  return isRoundtrip ? BUS_ROUTES[place] : Math.round(BUS_ROUTES[place] * 0.6);
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function formatCheckinOptions(r: any): { label: string; value: string; color: string }[] {
  const opts: { label: string; value: string; color: string }[] = [];
  if (r.bbq_count > 0) opts.push({ label: "BBQ 그릴", value: `${r.bbq_count}개`, color: "bg-red-50 text-red-700" });
  if (r.dinner_count > 0) opts.push({ label: "저녁식사", value: `${r.dinner_count}인분`, color: "bg-orange-50 text-orange-700" });
  if (r.woodcraft_count > 0) opts.push({ label: "목공체험", value: `${r.woodcraft_count}명`, color: "bg-amber-50 text-amber-700" });
  if (r.pot_bbq_count > 0) opts.push({ label: "항아리BBQ", value: `${r.pot_bbq_count}개`, color: "bg-rose-50 text-rose-700" });
  if (r.burner_count > 0) opts.push({ label: "가스렌지", value: `${r.burner_count}개`, color: "bg-blue-50 text-blue-700" });
  if (r.bus_requested) {
    const bd = r.bus_detail;
    if (bd && bd.pickup_place) {
      const isRoundtrip = !!(bd.dropoff_time || bd.dropoff_people);
      const cost = getBusCost(r);
      opts.push({ label: `버스 ${isRoundtrip ? "왕복" : "편도"}`, value: `${bd.pickup_place}${cost > 0 ? ` ${formatPrice(cost)}` : ""}`, color: "bg-purple-50 text-purple-700" });
    } else {
      opts.push({ label: "버스", value: "요청", color: "bg-purple-50 text-purple-700" });
    }
  }
  return opts;
}

function getDday(dateStr: string): string {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const target = new Date(dateStr);
  target.setHours(0, 0, 0, 0);
  const diff = Math.round((target.getTime() - today.getTime()) / 86400000);
  if (diff === 0) return "D-DAY";
  if (diff > 0) return `D-${diff}`;
  return `D+${Math.abs(diff)}`;
}

function getDdayColor(dateStr: string): string {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const target = new Date(dateStr);
  target.setHours(0, 0, 0, 0);
  const diff = Math.round((target.getTime() - today.getTime()) / 86400000);
  if (diff === 0) return "bg-red-500 text-white";
  if (diff <= 2) return "bg-orange-500 text-white";
  if (diff <= 7) return "bg-amber-500 text-white";
  return "bg-primary/10 text-primary";
}

export default function AdminDashboard() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [recentDays, setRecentDays] = useState(7);
  const [recentReservations, setRecentReservations] = useState<ReservationRow[]>([]);
  const [recentLoading, setRecentLoading] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editForm, setEditForm] = useState<Partial<ReservationRow>>({});
  const [saving, setSaving] = useState(false);
  const [busMode, setBusMode] = useState<"none" | "oneway" | "roundtrip">("none");
  const [busForm, setBusForm] = useState({ pickupPlace: "", customPickup: "", pickupPeople: "", pickupTime: "", dropoffPlace: "", customDropoff: "", dropoffPeople: "", dropoffTime: "", managerName: "", managerPhone: "" });
  const [busLoading, setBusLoading] = useState(false);

  useEffect(() => {
    fetch("/api/admin/dashboard?recentDays=7")
      .then(async (r) => {
        if (r.status === 401) {
          window.location.href = "/admin-login";
          return null;
        }
        const json = await r.json();
        if (!r.ok) throw new Error(json.error || "데이터 로드 실패");
        return json;
      })
      .then((d) => {
        if (!d) return;
        setData(d);
        setRecentReservations(d.recentReservations || []);
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  const startEdit = async (r: ReservationRow) => {
    // 먼저 버스 데이터를 로드한 후에 편집 모드 진입
    setBusLoading(true);
    let loadedBusMode: "none" | "oneway" | "roundtrip" = r.bus_requested ? "roundtrip" : "none";
    let loadedBusForm = { pickupPlace: "", customPickup: "", pickupPeople: "", pickupTime: "", dropoffPlace: "", customDropoff: "", dropoffPeople: "", dropoffTime: "", managerName: "", managerPhone: "" };

    try {
      const res = await fetch(`/api/admin/reservations?bus_reservation_id=${r.id}`);
      const json = await res.json();
      console.log("[버스 로드] reservation_id:", r.id, "응답:", json);
      if (json.bus_request) {
        const b = json.bus_request;
        const knownRoutes = Object.keys(BUS_ROUTES);
        const isKnownPickup = knownRoutes.includes(b.pickup_place || "");
        const isKnownDropoff = knownRoutes.includes(b.dropoff_place || "");
        loadedBusForm = {
          pickupPlace: isKnownPickup ? b.pickup_place : (b.pickup_place ? "기타" : ""),
          customPickup: isKnownPickup ? "" : (b.pickup_place || ""),
          pickupPeople: b.pickup_people || "",
          pickupTime: b.pickup_time || "",
          dropoffPlace: isKnownDropoff ? b.dropoff_place : (b.dropoff_place ? "기타" : ""),
          customDropoff: isKnownDropoff ? "" : (b.dropoff_place || ""),
          dropoffPeople: b.dropoff_people || "",
          dropoffTime: b.dropoff_time || "",
          managerName: b.manager_name || "",
          managerPhone: b.manager_phone || "",
        };
        loadedBusMode = (b.dropoff_time || b.dropoff_people) ? "roundtrip" : "oneway";
        console.log("[버스 로드] 매핑 결과 - mode:", loadedBusMode, "form:", loadedBusForm);
      } else {
        console.log("[버스 로드] bus_request 없음");
      }
    } catch (e) {
      console.error("[버스 로드] fetch 실패:", e);
    }

    // 모든 state를 한번에 세팅
    setBusMode(loadedBusMode);
    setBusForm(loadedBusForm);
    setEditForm({
      guest_name: r.guest_name,
      guest_phone: r.guest_phone,
      guest_count: r.guest_count,
      extra_guests: r.extra_guests,
      stay_nights: r.stay_nights,
      bbq_count: r.bbq_count,
      dinner_count: r.dinner_count,
      woodcraft_count: r.woodcraft_count,
      pot_bbq_count: r.pot_bbq_count,
      burner_count: r.burner_count,
      bus_requested: r.bus_requested,
      notes: r.notes,
    });
    setEditingId(r.id);  // 이걸 마지막에 해야 UI가 한번에 렌더링
    setBusLoading(false);
  };

  const [saveResult, setSaveResult] = useState<{ type: "success" | "error"; msg: string } | null>(null);

  const saveEdit = async () => {
    if (!editingId || !data) return;
    setSaving(true);
    setSaveResult(null);
    const original = data.upcomingCheckins.find((r) => r.id === editingId);
    try {
      const res = await fetch("/api/admin/reservations", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: editingId,
          ...editForm,
          bus_form: busMode !== "none" ? busForm : undefined,
        }),
      });
      const patchResult = await res.json();
      if (!res.ok) {
        setSaveResult({ type: "error", msg: patchResult.error || "저장 실패" });
        setSaving(false);
        return;
      }
      if (patchResult.busErrors) {
        console.error("버스 저장 오류:", patchResult.busErrors);
      }

      // 변경 내역 계산
      const changes: string[] = [];
      if (original) {
        if (editForm.guest_name !== original.guest_name) changes.push(`예약자: ${original.guest_name} → ${editForm.guest_name}`);
        if (editForm.guest_phone !== original.guest_phone) changes.push(`연락처: ${original.guest_phone} → ${editForm.guest_phone}`);
        const origTotal = original.guest_count + (original.extra_guests || 0);
        const newTotal = (editForm.guest_count || 0) + (editForm.extra_guests || 0);
        if (origTotal !== newTotal) changes.push(`인원: ${origTotal}명 → ${newTotal}명`);
        if (editForm.bbq_count !== original.bbq_count) changes.push(`BBQ 그릴: ${original.bbq_count}개 → ${editForm.bbq_count}개`);
        if (editForm.dinner_count !== original.dinner_count) changes.push(`저녁식사: ${original.dinner_count}인분 → ${editForm.dinner_count}인분`);
        if (editForm.woodcraft_count !== original.woodcraft_count) changes.push(`목공체험: ${original.woodcraft_count}개 → ${editForm.woodcraft_count}개`);
        if (editForm.pot_bbq_count !== original.pot_bbq_count) changes.push(`항아리BBQ: ${original.pot_bbq_count}개 → ${editForm.pot_bbq_count}개`);
        if (editForm.burner_count !== original.burner_count) changes.push(`가스렌지: ${original.burner_count}개 → ${editForm.burner_count}개`);
        if (editForm.bus_requested !== original.bus_requested) changes.push(`버스: ${original.bus_requested ? "요청" : "미요청"} → ${editForm.bus_requested ? "요청" : "미요청"}`);
      }

      // 버스 변경 상세 내역
      if (busMode !== "none" && busForm.pickupPlace) {
        const busLabel = busMode === "roundtrip" ? "왕복" : "편도";
        const busCost = busForm.pickupPlace !== "기타" && BUS_ROUTES[busForm.pickupPlace]
          ? (busMode === "roundtrip" ? BUS_ROUTES[busForm.pickupPlace] : Math.round(BUS_ROUTES[busForm.pickupPlace] * 0.6))
          : 0;
        changes.push(`버스(${busLabel}): ${busForm.pickupPlace}${busCost > 0 ? ` ${busCost.toLocaleString()}원` : ""}`);
      }

      // 문자 발송 (변경 사항이 있을 때만)
      let smsSent = false;
      if (original && changes.length > 0) {
        const originalAmount = calculateRevenue(original);
        const updatedRow = { ...original, ...editForm } as ReservationRow;
        const newBaseAmount = calculateRevenue(updatedRow);
        // 버스 비용 포함
        const busCost = busMode !== "none" && busForm.pickupPlace && busForm.pickupPlace !== "기타" && BUS_ROUTES[busForm.pickupPlace]
          ? (busMode === "roundtrip" ? BUS_ROUTES[busForm.pickupPlace] : Math.round(BUS_ROUTES[busForm.pickupPlace] * 0.6))
          : 0;
        const newAmount = newBaseAmount + busCost;
        const diff = newAmount - originalAmount;
        if (diff !== 0) {
          changes.push(diff < 0
            ? `💰 환불 금액: ${Math.abs(diff).toLocaleString()}원`
            : `💰 추가 결제: ${diff.toLocaleString()}원`);
        }
        try {
          // 버스 상세 정보
          const busDetail = busMode !== "none" && busForm.pickupPlace ? {
            mode: busMode,
            pickupPlace: busForm.pickupPlace === "기타" ? busForm.customPickup : busForm.pickupPlace,
            pickupPeople: busForm.pickupPeople,
            pickupTime: busForm.pickupTime,
            dropoffPlace: busForm.dropoffPlace === "기타" ? busForm.customDropoff : (busForm.dropoffPlace || busForm.pickupPlace),
            dropoffPeople: busForm.dropoffPeople,
            dropoffTime: busForm.dropoffTime,
            managerName: busForm.managerName,
            managerPhone: busForm.managerPhone,
            cost: busCost,
          } : undefined;

          const smsRes = await fetch("/api/admin/reservations/notify", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              guestName: editForm.guest_name || original.guest_name,
              guestPhone: editForm.guest_phone || original.guest_phone,
              reservationDate: original.reservation_date,
              stayNights: original.stay_nights,
              guestCount: editForm.guest_count ?? original.guest_count,
              extraGuests: editForm.extra_guests ?? original.extra_guests,
              programType: original.program_type,
              bbqCount: editForm.bbq_count ?? original.bbq_count,
              burnerCount: editForm.burner_count ?? original.burner_count,
              dinnerCount: editForm.dinner_count ?? original.dinner_count,
              woodcraftCount: editForm.woodcraft_count ?? original.woodcraft_count,
              potBbqCount: editForm.pot_bbq_count ?? original.pot_bbq_count,
              busRequested: editForm.bus_requested ?? original.bus_requested,
              busDetail,
              timeSlot: original.time_slot,
              notes: editForm.notes ?? original.notes,
              changes,
              originalAmount,
              newAmount,
            }),
          });
          smsSent = smsRes.ok;
        } catch { /* SMS 실패해도 저장은 완료 */ }
      }

      // 로컬 상태 업데이트
      setData({
        ...data,
        upcomingCheckins: data.upcomingCheckins.map((r) =>
          r.id === editingId ? { ...r, ...editForm } as ReservationRow : r
        ),
      });
      setEditingId(null);
      setSaveResult({
        type: "success",
        msg: changes.length > 0
          ? `저장 완료! ${smsSent ? "변경 알림 발송됨" : "알림 발송 실패"} (${changes.length}건 변경)`
          : "저장 완료! (변경 사항 없음, 알림 미발송)",
      });
      setTimeout(() => setSaveResult(null), 4000);
    } catch {
      setSaveResult({ type: "error", msg: "네트워크 오류" });
    }
    setSaving(false);
  };

  const fetchRecent = useCallback(async (days: number) => {
    setRecentDays(days);
    setRecentLoading(true);
    try {
      const res = await fetch(`/api/admin/dashboard?recentDays=${days}`);
      const json = await res.json();
      setRecentReservations(json.recentReservations || []);
    } catch {}
    setRecentLoading(false);
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  if (error) return (
    <div className="bg-red-50 px-4 sm:px-5 py-4 rounded-xl flex items-center justify-between gap-3">
      <p className="text-red-500 text-sm sm:text-base font-medium">{error}</p>
      <button onClick={() => { setError(""); setLoading(true); window.location.reload(); }} className="text-xs sm:text-sm bg-red-100 text-red-600 px-3 sm:px-4 py-2 rounded-lg font-semibold hover:bg-red-200 transition-colors whitespace-nowrap">다시 시도</button>
    </div>
  );
  if (!data) return <p className="text-gray-500 text-base">데이터를 불러올 수 없습니다.</p>;

  const kpis = [
    { label: "오늘 체크인", value: `${data.todayCheckins.count}건`, sub: `${data.todayCheckins.totalGuests}명`, icon: CalendarCheck, color: "bg-primary/10 text-primary" },
    { label: "이번 주 예약", value: `${data.weekReservations}건`, icon: CalendarCheck, color: "bg-blue-50 text-blue-600" },
    { label: "이번 달 예약", value: `${data.monthReservations.count}건`, icon: Users, color: "bg-amber-50 text-amber-600", change: { current: data.monthReservations.count, previous: data.monthReservations.prevMonthCount } },
    { label: "이번 달 매출", value: formatPrice(data.monthRevenue.amount), icon: DollarSign, color: "bg-green-50 text-green-600", change: { current: data.monthRevenue.amount, previous: data.monthRevenue.prevMonthAmount } },
    { label: "누적 방문자", value: `${(data.totalCumulativeGuests || 0).toLocaleString()}명`, icon: Users, color: "bg-purple-50 text-purple-600" },
  ];

  const pieData = data.programDistribution.map((p) => ({
    name: PROGRAM_LABELS[p.type] || p.type,
    value: p.count,
  }));

  return (
    <div className="space-y-4 sm:space-y-6">
      <h1 className="text-xl sm:text-2xl font-bold text-gray-900">대시보드</h1>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-2.5 sm:gap-4">
        {kpis.map((kpi) => {
          const Icon = kpi.icon;
          return (
            <div key={kpi.label} className="bg-white rounded-xl sm:rounded-2xl border border-gray-200 p-3 sm:p-5">
              <div className="flex items-center justify-between mb-2 sm:mb-3">
                <div className={`w-8 h-8 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl flex items-center justify-center ${kpi.color}`}>
                  <Icon size={16} className="sm:hidden" />
                  <Icon size={20} className="hidden sm:block" />
                </div>
                {kpi.change && <ChangeIndicator current={kpi.change.current} previous={kpi.change.previous} />}
              </div>
              <p className="text-lg sm:text-2xl font-bold text-gray-900">{kpi.value}</p>
              <p className="text-xs sm:text-sm text-gray-500 mt-0.5 sm:mt-1">{kpi.label}</p>
              {kpi.sub && <p className="text-xs sm:text-sm text-gray-600 mt-0.5">총 {kpi.sub}</p>}
            </div>
          );
        })}
      </div>

      {/* 저장 결과 토스트 */}
      {saveResult && (
        <div className={`flex items-center justify-between rounded-xl px-4 py-3 text-sm font-semibold animate-fade-in ${saveResult.type === "success" ? "bg-green-50 text-green-800 border border-green-200" : "bg-red-50 text-red-800 border border-red-200"}`}>
          <span>{saveResult.type === "success" ? "✅" : "❌"} {saveResult.msg}</span>
          <button onClick={() => setSaveResult(null)} className="text-xs opacity-60 hover:opacity-100 ml-2">닫기</button>
        </div>
      )}

      {/* Upcoming Checkins - 최상단 풀 width */}
      <div className="bg-white rounded-xl sm:rounded-2xl border border-gray-200 p-3 sm:p-5">
          <div className="flex items-center justify-between mb-3 sm:mb-4">
            <div className="flex items-center gap-2">
              <h3 className="text-sm sm:text-base font-bold text-gray-900">다가오는 체크인</h3>
              {data.upcomingCheckins.length > 0 && (
                <span className="bg-red-500 text-white text-[10px] sm:text-xs font-black px-2 py-0.5 rounded-full">{data.upcomingCheckins.length}건</span>
              )}
            </div>
            <a href="/admin/reservations/calendar" className="text-xs sm:text-sm text-primary font-medium hover:underline">달력 →</a>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-2.5 max-h-[600px] overflow-y-auto">
            {data.upcomingCheckins.length === 0 ? (
              <p className="text-sm text-gray-400 py-8 text-center lg:col-span-2">예정된 체크인이 없습니다</p>
            ) : (
              data.upcomingCheckins.map((r: ReservationRow) => {
                const opts = formatCheckinOptions(r);
                const isEditing = editingId === r.id;
                const dday = getDday(r.reservation_date);
                const ddayColor = getDdayColor(r.reservation_date);

                if (isEditing) {
                  return (
                    <div key={r.id} className="border-2 border-primary rounded-xl p-3 sm:p-4 bg-primary/5 space-y-3 lg:col-span-2">
                      {/* 헤더: 예약 정보 + 버튼 */}
                      <div className="flex items-center justify-between flex-wrap gap-2">
                        <div>
                          <p className="text-sm font-bold text-primary">수정 모드 - {r.guest_name}</p>
                          <p className="text-[10px] text-gray-500">{r.reservation_date} ~ {r.checkout_date} · {r.stay_nights}박 · {PROGRAM_LABELS[r.program_type]}</p>
                        </div>
                        <div className="flex gap-1.5">
                          <button onClick={saveEdit} disabled={saving}
                            className="flex items-center gap-1 px-3 py-1.5 bg-primary text-white text-xs font-bold rounded-lg hover:bg-primary-light disabled:opacity-50">
                            {saving ? <div className="animate-spin w-3 h-3 border border-white border-t-transparent rounded-full" /> : <Save size={12} />}
                            저장 + 변경 알림
                          </button>
                          <button onClick={() => { setEditingId(null); setSaveResult(null); }}
                            className="flex items-center gap-1 px-3 py-1.5 bg-gray-100 text-gray-600 text-xs font-bold rounded-lg hover:bg-gray-200">
                            <X size={12} /> 취소
                          </button>
                        </div>
                      </div>

                      {/* 금액 미리보기 (버스 포함) */}
                      {(() => {
                        const origAmt = calculateRevenue(r);
                        const newAmt = calculateRevenue({ ...r, ...editForm } as ReservationRow);
                        // 버스 비용 계산
                        const busPrice = busMode !== "none" && busForm.pickupPlace && busForm.pickupPlace !== "기타" && BUS_ROUTES[busForm.pickupPlace]
                          ? (busMode === "roundtrip" ? BUS_ROUTES[busForm.pickupPlace] : Math.round(BUS_ROUTES[busForm.pickupPlace] * 0.6))
                          : 0;
                        const totalNew = newAmt + busPrice;
                        const diff = totalNew - origAmt;
                        return (
                          <div className={`rounded-lg px-3 py-2 text-xs font-bold ${diff === 0 ? "bg-gray-100 text-gray-600" : diff < 0 ? "bg-blue-50 text-blue-700 border border-blue-200" : "bg-red-50 text-red-700 border border-red-200"}`}>
                            <div className="flex items-center justify-between">
                              <span>변경 전: {formatPrice(origAmt)} → 변경 후: {formatPrice(totalNew)}</span>
                              <span className="text-sm">{diff === 0 ? "변동 없음" : diff < 0 ? `환불 ${formatPrice(Math.abs(diff))}` : `추가 ${formatPrice(diff)}`}</span>
                            </div>
                            {busPrice > 0 && (
                              <p className="text-[10px] font-normal mt-1 opacity-80">
                                (옵션 {formatPrice(newAmt)} + 버스 {busMode === "roundtrip" ? "왕복" : "편도"} {formatPrice(busPrice)})
                              </p>
                            )}
                          </div>
                        );
                      })()}

                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                        <div>
                          <label className="text-[10px] text-gray-500 font-bold">예약자명</label>
                          <input value={editForm.guest_name ?? ""} onChange={e => setEditForm({ ...editForm, guest_name: e.target.value })}
                            className="w-full border border-gray-200 rounded-lg px-2.5 py-1.5 text-sm focus:ring-2 focus:ring-primary/20 focus:outline-none" />
                        </div>
                        <div>
                          <label className="text-[10px] text-gray-500 font-bold">연락처</label>
                          <input value={editForm.guest_phone ?? ""} onChange={e => setEditForm({ ...editForm, guest_phone: e.target.value })}
                            className="w-full border border-gray-200 rounded-lg px-2.5 py-1.5 text-sm focus:ring-2 focus:ring-primary/20 focus:outline-none" />
                        </div>
                        <div>
                          <label className="text-[10px] text-gray-500 font-bold">총 인원</label>
                          <input type="number" min={1} value={(editForm.guest_count ?? 0) + (editForm.extra_guests ?? 0)}
                            onChange={e => {
                              const total = Math.max(1, parseInt(e.target.value) || 1);
                              const base = Math.min(total, 15);
                              const extra = Math.max(0, total - 15);
                              setEditForm({ ...editForm, guest_count: base, extra_guests: extra });
                            }}
                            className="w-full border border-gray-200 rounded-lg px-2.5 py-1.5 text-sm focus:ring-2 focus:ring-primary/20 focus:outline-none" />
                          <p className="text-[9px] text-gray-400 mt-0.5">기본{Math.min((editForm.guest_count ?? 0) + (editForm.extra_guests ?? 0), 15)} {((editForm.guest_count ?? 0) + (editForm.extra_guests ?? 0)) > 15 && `+ 추가${(editForm.guest_count ?? 0) + (editForm.extra_guests ?? 0) - 15}`}</p>
                        </div>
                        <div>
                          <label className="text-[10px] text-gray-500 font-bold">숙박일수</label>
                          <input type="number" min={1} value={editForm.stay_nights ?? 1}
                            onChange={e => setEditForm({ ...editForm, stay_nights: Math.max(1, parseInt(e.target.value) || 1) })}
                            className="w-full border border-gray-200 rounded-lg px-2.5 py-1.5 text-sm focus:ring-2 focus:ring-primary/20 focus:outline-none" />
                        </div>
                      </div>
                      <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
                        <div>
                          <label className="text-[10px] text-gray-500 font-bold">BBQ 그릴</label>
                          <input type="number" min={0} value={editForm.bbq_count ?? 0} onChange={e => setEditForm({ ...editForm, bbq_count: Math.max(0, parseInt(e.target.value) || 0) })}
                            className="w-full border border-gray-200 rounded-lg px-2.5 py-1.5 text-sm focus:ring-2 focus:ring-primary/20 focus:outline-none" />
                        </div>
                        <div>
                          <label className="text-[10px] text-gray-500 font-bold">저녁식사</label>
                          <input type="number" min={0} value={editForm.dinner_count ?? 0} onChange={e => setEditForm({ ...editForm, dinner_count: Math.max(0, parseInt(e.target.value) || 0) })}
                            className="w-full border border-gray-200 rounded-lg px-2.5 py-1.5 text-sm focus:ring-2 focus:ring-primary/20 focus:outline-none" />
                        </div>
                        <div>
                          <label className="text-[10px] text-gray-500 font-bold">목공체험</label>
                          <input type="number" min={0} value={editForm.woodcraft_count ?? 0} onChange={e => setEditForm({ ...editForm, woodcraft_count: Math.max(0, parseInt(e.target.value) || 0) })}
                            className="w-full border border-gray-200 rounded-lg px-2.5 py-1.5 text-sm focus:ring-2 focus:ring-primary/20 focus:outline-none" />
                        </div>
                        <div>
                          <label className="text-[10px] text-gray-500 font-bold">항아리BBQ</label>
                          <input type="number" min={0} value={editForm.pot_bbq_count ?? 0} onChange={e => setEditForm({ ...editForm, pot_bbq_count: Math.max(0, parseInt(e.target.value) || 0) })}
                            className="w-full border border-gray-200 rounded-lg px-2.5 py-1.5 text-sm focus:ring-2 focus:ring-primary/20 focus:outline-none" />
                        </div>
                        <div>
                          <label className="text-[10px] text-gray-500 font-bold">가스렌지</label>
                          <input type="number" min={0} value={editForm.burner_count ?? 0} onChange={e => setEditForm({ ...editForm, burner_count: Math.max(0, parseInt(e.target.value) || 0) })}
                            className="w-full border border-gray-200 rounded-lg px-2.5 py-1.5 text-sm focus:ring-2 focus:ring-primary/20 focus:outline-none" />
                        </div>
                      </div>

                      {/* 버스 렌트 */}
                      <div className="border border-gray-200 rounded-xl p-3 space-y-2.5">
                        <div className="flex items-center justify-between">
                          <label className="text-[10px] text-gray-500 font-bold flex items-center gap-1">
                            <Bus size={12} className="text-primary" /> 버스 렌트
                          </label>
                          <div className="flex bg-gray-100 rounded-full p-0.5">
                            {(["none", "oneway", "roundtrip"] as const).map((mode) => (
                              <button key={mode} type="button"
                                onClick={() => { setBusMode(mode); setEditForm({ ...editForm, bus_requested: mode !== "none" }); }}
                                className={`px-2.5 py-1 rounded-full text-[10px] sm:text-xs font-bold transition-all ${busMode === mode ? "bg-primary text-white shadow-sm" : "text-gray-400"}`}>
                                {mode === "none" ? "없음" : mode === "oneway" ? "편도" : "왕복"}
                              </button>
                            ))}
                          </div>
                        </div>

                        {busMode !== "none" && (
                          <div className="bg-gray-50 rounded-lg p-2.5 space-y-2">
                            <div className="grid grid-cols-2 gap-2">
                              <input placeholder="담당자 이름" value={busForm.managerName}
                                onChange={e => setBusForm({ ...busForm, managerName: e.target.value })}
                                className="px-2 py-1.5 rounded-lg border border-gray-200 text-xs bg-white" />
                              <input placeholder="담당자 연락처" value={busForm.managerPhone}
                                onChange={e => setBusForm({ ...busForm, managerPhone: e.target.value })}
                                className="px-2 py-1.5 rounded-lg border border-gray-200 text-xs bg-white" />
                            </div>

                            <p className="text-[10px] font-bold text-gray-600">승차 정보</p>
                            <div className="grid grid-cols-3 gap-1.5">
                              <select value={busForm.pickupPlace}
                                onChange={e => setBusForm({ ...busForm, pickupPlace: e.target.value, dropoffPlace: e.target.value })}
                                className="px-1.5 py-1.5 rounded-lg border border-gray-200 text-xs bg-white">
                                <option value="">출발지</option>
                                {Object.entries(BUS_ROUTES).map(([name, price]) => (
                                  <option key={name} value={name}>{name} ({(price/10000).toFixed(0)}만)</option>
                                ))}
                                <option value="기타">기타</option>
                              </select>
                              <input placeholder="인원" value={busForm.pickupPeople}
                                onChange={e => setBusForm({ ...busForm, pickupPeople: e.target.value })}
                                className="px-2 py-1.5 rounded-lg border border-gray-200 text-xs bg-white" />
                              <select value={busForm.pickupTime}
                                onChange={e => setBusForm({ ...busForm, pickupTime: e.target.value })}
                                className="px-1.5 py-1.5 rounded-lg border border-gray-200 text-xs bg-white">
                                <option value="">시간</option>
                                {TIME_OPTIONS_PICKUP.map(t => <option key={t} value={t}>{t}</option>)}
                              </select>
                            </div>
                            {busForm.pickupPlace === "기타" && (
                              <input placeholder="승차지 직접 입력" value={busForm.customPickup}
                                onChange={e => setBusForm({ ...busForm, customPickup: e.target.value })}
                                className="w-full px-2 py-1.5 rounded-lg border border-gray-200 text-xs bg-white" />
                            )}

                            {busMode === "roundtrip" && (
                              <>
                                <p className="text-[10px] font-bold text-gray-600">하차 정보 <span className="font-normal text-gray-400">(퇴실 11시 기준)</span></p>
                                {busForm.pickupPlace && busForm.pickupPlace !== "기타" && (
                                  <p className="text-[10px] text-primary">하차지: {busForm.pickupPlace} (승차지와 동일)</p>
                                )}
                                {busForm.pickupPlace === "기타" && (
                                  <input placeholder="하차지 직접 입력" value={busForm.customDropoff}
                                    onChange={e => setBusForm({ ...busForm, customDropoff: e.target.value })}
                                    className="w-full px-2 py-1.5 rounded-lg border border-gray-200 text-xs bg-white" />
                                )}
                                <div className="grid grid-cols-2 gap-1.5">
                                  <input placeholder="인원" value={busForm.dropoffPeople}
                                    onChange={e => setBusForm({ ...busForm, dropoffPeople: e.target.value })}
                                    className="px-2 py-1.5 rounded-lg border border-gray-200 text-xs bg-white" />
                                  <select value={busForm.dropoffTime}
                                    onChange={e => setBusForm({ ...busForm, dropoffTime: e.target.value })}
                                    className="px-1.5 py-1.5 rounded-lg border border-gray-200 text-xs bg-white">
                                    <option value="">하차 출발시간</option>
                                    {TIME_OPTIONS_DROPOFF.map(t => <option key={t} value={t}>{t}</option>)}
                                  </select>
                                </div>
                              </>
                            )}

                            {busForm.pickupPlace && busForm.pickupPlace !== "기타" && BUS_ROUTES[busForm.pickupPlace] && (
                              <div className="p-1.5 bg-primary/5 border border-primary/20 rounded-lg">
                                <p className="text-[10px] text-gray-600">{busMode === "roundtrip" ? "왕복" : "편도"} 견적: <span className="font-bold text-primary">{(busMode === "roundtrip" ? BUS_ROUTES[busForm.pickupPlace] : Math.round(BUS_ROUTES[busForm.pickupPlace] * 0.6)).toLocaleString()}원</span></p>
                              </div>
                            )}
                          </div>
                        )}
                      </div>

                      <div>
                        <label className="text-[10px] text-gray-500 font-bold">메모</label>
                        <textarea value={editForm.notes || ""} onChange={e => setEditForm({ ...editForm, notes: e.target.value })}
                          className="w-full border border-gray-200 rounded-lg px-2.5 py-1.5 text-sm h-16 resize-none" placeholder="관리자 메모..." />
                      </div>
                    </div>
                  );
                }

                return (
                  <div key={r.id}
                    onClick={() => !busLoading && startEdit(r)}
                    className={`border border-gray-200 rounded-xl p-3 sm:p-4 hover:border-primary/40 hover:shadow-sm transition-all cursor-pointer group ${busLoading ? "opacity-50 pointer-events-none" : ""}`}>
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className={`text-[10px] sm:text-xs font-black px-2 py-0.5 rounded-full ${ddayColor}`}>{dday}</span>
                        <p className="text-sm sm:text-base font-bold text-gray-900">{r.guest_name}</p>
                        <Pencil size={12} className="text-gray-300 group-hover:text-primary transition-colors" />
                      </div>
                      <p className="text-sm sm:text-base font-black text-primary whitespace-nowrap">{formatPrice(calculateRevenue(r) + getBusCost(r))}</p>
                    </div>
                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs sm:text-sm text-gray-600 mb-2">
                      <span className="flex items-center gap-1">
                        <CalendarCheck size={13} className="text-gray-400" />
                        {r.reservation_date} ~ {r.checkout_date || ""}
                      </span>
                      <span className="font-semibold">{r.stay_nights}박</span>
                      <span className="flex items-center gap-1">
                        <Users size={13} className="text-gray-400" />
                        {(() => { const total = r.guest_count + (r.extra_guests || 0); return total > 15 ? (<>기본15 <span className="text-amber-600">+추가{total - 15}</span> = <span className="font-black">{total}명</span></>) : (<span className="font-black">{total}명</span>); })()}
                      </span>
                      <span className="px-1.5 py-0.5 rounded bg-gray-100 text-gray-600 text-[10px] sm:text-xs font-bold">{PROGRAM_LABELS[r.program_type]}</span>
                    </div>
                    <div className="flex items-center gap-1 text-xs text-gray-500 mb-2">
                      <Phone size={11} className="text-gray-400" />
                      <a href={`tel:${r.guest_phone}`} className="hover:text-primary hover:underline">{formatPhone(r.guest_phone)}</a>
                    </div>
                    {opts.length > 0 && (
                      <div className="flex flex-wrap gap-1.5">
                        {opts.map((opt, i) => (
                          <span key={i} className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] sm:text-xs font-bold ${opt.color}`}>
                            {opt.label} <span className="font-black">{opt.value}</span>
                          </span>
                        ))}
                      </div>
                    )}
                    {r.notes && (
                      <p className="text-xs text-gray-400 mt-1.5 bg-gray-50 rounded-lg px-2 py-1 italic">📝 {r.notes}</p>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        {/* Weekly Revenue */}
        <div className="bg-white rounded-xl sm:rounded-2xl border border-gray-200 p-3 sm:p-5">
          <h3 className="text-sm sm:text-base font-bold text-gray-900 mb-3 sm:mb-4">최근 7일 매출</h3>
          <ResponsiveContainer width="100%" height={180} className="sm:!h-[220px]">
            <BarChart data={data.weeklyRevenue}>
              <XAxis dataKey="date" tick={{ fontSize: 11 }} tickFormatter={(v: string) => v.slice(5)} />
              <YAxis tick={{ fontSize: 11 }} tickFormatter={(v: number) => formatPrice(v)} width={50} />
              <Tooltip formatter={(v) => [(v as number).toLocaleString() + "원", "매출"]} labelFormatter={(l) => String(l)} />
              <Bar dataKey="amount" fill="#2d5016" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Program Distribution */}
        <div className="bg-white rounded-xl sm:rounded-2xl border border-gray-200 p-3 sm:p-5">
          <h3 className="text-sm sm:text-base font-bold text-gray-900 mb-3 sm:mb-4">이번 달 프로그램 비율</h3>
          {pieData.length > 0 ? (
            <ResponsiveContainer width="100%" height={180} className="sm:!h-[220px]">
              <PieChart>
                <Pie data={pieData} cx="50%" cy="50%" innerRadius={40} outerRadius={70} dataKey="value" label={({ name, percent }) => `${name || ""} ${((percent || 0) * 100).toFixed(0)}%`}>
                  {pieData.map((_, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[180px] sm:h-[220px] flex items-center justify-center text-gray-400 text-sm">이번 달 데이터 없음</div>
          )}
        </div>
      </div>

      {/* Recent Reservations */}
      <div className="bg-white rounded-xl sm:rounded-2xl border border-gray-200 p-3 sm:p-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3 sm:mb-4">
          <div className="flex items-center gap-2 sm:gap-3">
            <h3 className="text-sm sm:text-base font-bold text-gray-900">최근 예약</h3>
            <div className="flex gap-1">
              {RECENT_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => fetchRecent(opt.value)}
                  className={`px-2 sm:px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                    recentDays === opt.value
                      ? "bg-primary text-white"
                      : "bg-gray-100 text-gray-500 hover:bg-gray-200"
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
          <a href="/admin/reservations" className="text-xs sm:text-sm text-primary font-medium hover:underline">전체 보기 →</a>
        </div>
        {recentLoading ? (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin w-5 h-5 border-2 border-primary border-t-transparent rounded-full" />
          </div>
        ) : recentReservations.length === 0 ? (
          <p className="text-sm text-gray-400 py-8 text-center">해당 기간 접수된 예약이 없습니다</p>
        ) : (
          <div className="space-y-0 max-h-[400px] overflow-y-auto">
            {recentReservations.map((r: ReservationRow) => (
              <div key={r.id} className="flex items-center justify-between py-2.5 border-b border-gray-100 last:border-0">
                <div className="min-w-0 flex-1 mr-2">
                  <p className="text-sm font-semibold text-gray-900">{r.guest_name}</p>
                  <p className="text-xs sm:text-sm text-gray-500 truncate">{r.reservation_date} · {r.guest_count}명 · {PROGRAM_LABELS[r.program_type]}</p>
                </div>
                <span className={`text-xs px-2 sm:px-3 py-1 rounded-full font-semibold whitespace-nowrap flex-shrink-0 ${
                  r.status === "confirmed" ? "bg-green-100 text-green-800" :
                  r.status === "visited" ? "bg-blue-100 text-blue-800" :
                  r.status === "reviewed" ? "bg-purple-100 text-purple-800" :
                  r.status === "upcoming" ? "bg-cyan-100 text-cyan-800" :
                  "bg-red-100 text-red-700"
                }`}>
                  {STATUS_LABELS[r.status]}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
