"use client";

import { useState, useEffect, useCallback } from "react";
import { CalendarCheck, Users, TrendingUp, DollarSign, ArrowUpRight, ArrowDownRight } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { DashboardData, PROGRAM_LABELS, STATUS_LABELS, calculateRevenue } from "@/types/admin";
import type { ReservationRow } from "@/types/admin";

const COLORS = ["#2d5016", "#4a7c28", "#8B6914", "#c49a2a"];

function formatPrice(n: number) {
  if (n >= 10000) return (n / 10000).toFixed(0) + "만원";
  return n.toLocaleString() + "원";
}

function ChangeIndicator({ current, previous }: { current: number; previous: number }) {
  if (previous === 0) return null;
  const pct = Math.round(((current - previous) / previous) * 100);
  const up = pct >= 0;
  return (
    <span className={`flex items-center gap-0.5 text-sm font-semibold ${up ? "text-green-600" : "text-red-500"}`}>
      {up ? <ArrowUpRight size={16} /> : <ArrowDownRight size={16} />}
      {Math.abs(pct)}%
    </span>
  );
}

const RECENT_OPTIONS = [
  { value: 7, label: "7일" },
  { value: 14, label: "2주" },
  { value: 28, label: "4주" },
];

export default function AdminDashboard() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [recentDays, setRecentDays] = useState(7);
  const [recentReservations, setRecentReservations] = useState<ReservationRow[]>([]);
  const [recentLoading, setRecentLoading] = useState(false);

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
    <div className="bg-red-50 px-5 py-4 rounded-xl flex items-center justify-between">
      <p className="text-red-500 text-base font-medium">{error}</p>
      <button onClick={() => { setError(""); setLoading(true); window.location.reload(); }} className="text-sm bg-red-100 text-red-600 px-4 py-2 rounded-lg font-semibold hover:bg-red-200 transition-colors">다시 시도</button>
    </div>
  );
  if (!data) return <p className="text-gray-500 text-base">데이터를 불러올 수 없습니다.</p>;

  const kpis = [
    { label: "오늘 체크인", value: `${data.todayCheckins.count}건`, sub: `${data.todayCheckins.totalGuests}명`, icon: CalendarCheck, color: "bg-primary/10 text-primary" },
    { label: "이번 주 예약", value: `${data.weekReservations}건`, icon: CalendarCheck, color: "bg-blue-50 text-blue-600" },
    { label: "이번 달 예약", value: `${data.monthReservations.count}건`, icon: Users, color: "bg-amber-50 text-amber-600", change: { current: data.monthReservations.count, previous: data.monthReservations.prevMonthCount } },
    { label: "이번 달 매출", value: formatPrice(data.monthRevenue.amount), icon: DollarSign, color: "bg-green-50 text-green-600", change: { current: data.monthRevenue.amount, previous: data.monthRevenue.prevMonthAmount } },
  ];

  const pieData = data.programDistribution.map((p) => ({
    name: PROGRAM_LABELS[p.type] || p.type,
    value: p.count,
  }));

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">대시보드</h1>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {kpis.map((kpi) => {
          const Icon = kpi.icon;
          return (
            <div key={kpi.label} className="bg-white rounded-2xl border border-gray-200 p-5">
              <div className="flex items-center justify-between mb-3">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${kpi.color}`}>
                  <Icon size={20} />
                </div>
                {kpi.change && <ChangeIndicator current={kpi.change.current} previous={kpi.change.previous} />}
              </div>
              <p className="text-2xl font-bold text-gray-900">{kpi.value}</p>
              <p className="text-sm text-gray-500 mt-1">{kpi.label}</p>
              {kpi.sub && <p className="text-sm text-gray-600 mt-0.5">총 {kpi.sub}</p>}
            </div>
          );
        })}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Weekly Revenue */}
        <div className="bg-white rounded-2xl border border-gray-200 p-5">
          <h3 className="text-base font-bold text-gray-900 mb-4">최근 7일 매출</h3>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={data.weeklyRevenue}>
              <XAxis dataKey="date" tick={{ fontSize: 12 }} tickFormatter={(v: string) => v.slice(5)} />
              <YAxis tick={{ fontSize: 12 }} tickFormatter={(v: number) => formatPrice(v)} />
              <Tooltip formatter={(v) => [(v as number).toLocaleString() + "원", "매출"]} labelFormatter={(l) => String(l)} />
              <Bar dataKey="amount" fill="#2d5016" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Program Distribution */}
        <div className="bg-white rounded-2xl border border-gray-200 p-5">
          <h3 className="text-base font-bold text-gray-900 mb-4">이번 달 프로그램 비율</h3>
          {pieData.length > 0 ? (
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie data={pieData} cx="50%" cy="50%" innerRadius={50} outerRadius={80} dataKey="value" label={({ name, percent }) => `${name || ""} ${((percent || 0) * 100).toFixed(0)}%`}>
                  {pieData.map((_, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[220px] flex items-center justify-center text-gray-400 text-sm">이번 달 데이터 없음</div>
          )}
        </div>
      </div>

      {/* Tables */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Reservations */}
        <div className="bg-white rounded-2xl border border-gray-200 p-5">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <h3 className="text-base font-bold text-gray-900">최근 예약</h3>
              <div className="flex gap-1">
                {RECENT_OPTIONS.map((opt) => (
                  <button
                    key={opt.value}
                    onClick={() => fetchRecent(opt.value)}
                    className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
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
            <a href="/admin/reservations" className="text-sm text-primary font-medium hover:underline">전체 보기 →</a>
          </div>
          {recentLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin w-5 h-5 border-2 border-primary border-t-transparent rounded-full" />
            </div>
          ) : recentReservations.length === 0 ? (
            <p className="text-sm text-gray-400 py-8 text-center">해당 기간 접수된 예약이 없습니다</p>
          ) : (
            <div className="space-y-3 max-h-[400px] overflow-y-auto">
              {recentReservations.map((r: ReservationRow) => (
                <div key={r.id} className="flex items-center justify-between py-2.5 border-b border-gray-100 last:border-0">
                  <div>
                    <p className="text-sm font-semibold text-gray-900">{r.guest_name}</p>
                    <p className="text-sm text-gray-500">{r.reservation_date} · {r.guest_count}명 · {PROGRAM_LABELS[r.program_type]}</p>
                  </div>
                  <span className={`text-xs px-3 py-1 rounded-full font-semibold whitespace-nowrap ${
                    r.status === "confirmed" ? "bg-green-100 text-green-800" :
                    r.status === "visited" ? "bg-blue-100 text-blue-800" :
                    r.status === "reviewed" ? "bg-purple-100 text-purple-800" :
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

        {/* Upcoming Checkins */}
        <div className="bg-white rounded-2xl border border-gray-200 p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-bold text-gray-900">다가오는 체크인</h3>
            <a href="/admin/reservations/calendar" className="text-sm text-primary font-medium hover:underline">달력 보기 →</a>
          </div>
          <div className="space-y-3">
            {data.upcomingCheckins.length === 0 ? (
              <p className="text-sm text-gray-400 py-8 text-center">예정된 체크인이 없습니다</p>
            ) : (
              data.upcomingCheckins.map((r: ReservationRow) => (
                <div key={r.id} className="flex items-center justify-between py-2.5 border-b border-gray-100 last:border-0">
                  <div>
                    <p className="text-sm font-semibold text-gray-900">{r.guest_name}</p>
                    <p className="text-sm text-gray-500">{r.reservation_date} · {r.stay_nights}박 · {r.guest_count}명</p>
                  </div>
                  <p className="text-sm font-bold text-primary">{formatPrice(calculateRevenue(r))}</p>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
