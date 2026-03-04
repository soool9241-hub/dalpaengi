"use client";

import { useState, useEffect } from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from "recharts";
import { TrendingUp, Users, DollarSign, Calendar } from "lucide-react";
import { PROGRAM_LABELS, AnalyticsData } from "@/types/admin";

const COLORS = ["#2d5016", "#4a7c28", "#8B6914", "#c49a2a", "#e8ede4"];

function formatPrice(n: number) {
  if (n >= 10000) return (n / 10000).toFixed(0) + "만";
  return n.toLocaleString();
}

export default function AnalyticsPage() {
  const [data, setData] = useState<AnalyticsData & { years?: string[]; totalRevenue?: number; totalReservations?: number } | null>(null);
  const [year, setYear] = useState(new Date().getFullYear().toString());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    fetch(`/api/admin/analytics?year=${year}`)
      .then((r) => r.json())
      .then((d) => { setData(d); setLoading(false); });
  }, [year]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!data) return <p className="text-text-light">데이터를 불러올 수 없습니다.</p>;

  const pieData = data.programBreakdown.map((p) => ({
    name: PROGRAM_LABELS[p.type] || p.type,
    value: p.count,
    revenue: p.totalRevenue,
    avgGuests: p.avgGuests,
  }));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-text-dark">매출/지표 분석</h1>
        <select
          value={year}
          onChange={(e) => setYear(e.target.value)}
          className="px-4 py-2 rounded-xl border border-border bg-white text-sm font-medium"
        >
          {(data.years || [year]).map((y) => (
            <option key={y} value={y}>{y}년</option>
          ))}
        </select>
      </div>

      {/* Summary KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl border border-border p-5">
          <DollarSign size={20} className="text-green-600 mb-2" />
          <p className="text-2xl font-bold text-text-dark">{formatPrice(data.totalRevenue || 0)}원</p>
          <p className="text-xs text-text-light">{year}년 총 매출</p>
        </div>
        <div className="bg-white rounded-2xl border border-border p-5">
          <Calendar size={20} className="text-blue-600 mb-2" />
          <p className="text-2xl font-bold text-text-dark">{data.totalReservations || 0}건</p>
          <p className="text-xs text-text-light">{year}년 총 예약</p>
        </div>
        <div className="bg-white rounded-2xl border border-border p-5">
          <Users size={20} className="text-amber-600 mb-2" />
          <p className="text-2xl font-bold text-text-dark">{data.guestStats.avg}명</p>
          <p className="text-xs text-text-light">평균 인원</p>
        </div>
        <div className="bg-white rounded-2xl border border-border p-5">
          <TrendingUp size={20} className="text-primary mb-2" />
          <p className="text-2xl font-bold text-text-dark">{data.guestStats.max}명</p>
          <p className="text-xs text-text-light">최대 인원</p>
        </div>
      </div>

      {/* Monthly Revenue Chart */}
      <div className="bg-white rounded-2xl border border-border p-5">
        <h3 className="text-sm font-semibold text-text-dark mb-4">월별 매출 추이</h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={data.monthlyRevenue}>
            <XAxis dataKey="month" tick={{ fontSize: 11 }} tickFormatter={(v: string) => v.slice(5) + "월"} />
            <YAxis tick={{ fontSize: 11 }} tickFormatter={(v: number) => formatPrice(v)} />
            <Tooltip
              formatter={(v) => [(v as number).toLocaleString() + "원", "매출"]}
              labelFormatter={(l) => String(l).slice(5) + "월"}
            />
            <Bar dataKey="amount" fill="#2d5016" radius={[6, 6, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Program Breakdown */}
        <div className="bg-white rounded-2xl border border-border p-5">
          <h3 className="text-sm font-semibold text-text-dark mb-4">프로그램별 분석</h3>
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie
                data={pieData}
                cx="50%"
                cy="50%"
                innerRadius={45}
                outerRadius={75}
                dataKey="value"
                label={({ name, percent }) => `${name || ""} ${((percent || 0) * 100).toFixed(0)}%`}
              >
                {pieData.map((_, i) => (
                  <Cell key={i} fill={COLORS[i % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
          <div className="mt-4 space-y-2">
            {data.programBreakdown.map((p) => (
              <div key={p.type} className="flex items-center justify-between text-sm">
                <span className="text-text-mid">{PROGRAM_LABELS[p.type]}</span>
                <span className="text-text-dark font-medium">{p.count}건 · 평균 {p.avgGuests}명 · {formatPrice(p.totalRevenue)}원</span>
              </div>
            ))}
          </div>
        </div>

        {/* Purpose Breakdown */}
        <div className="bg-white rounded-2xl border border-border p-5">
          <h3 className="text-sm font-semibold text-text-dark mb-4">예약 목적별 분석</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={data.purposeBreakdown} layout="vertical">
              <XAxis type="number" tick={{ fontSize: 11 }} />
              <YAxis dataKey="purpose" type="category" tick={{ fontSize: 11 }} width={100} />
              <Tooltip formatter={(v) => [(v as number) + "건", "예약"]} />
              <Bar dataKey="count" fill="#4a7c28" radius={[0, 6, 6, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Guest Distribution */}
      <div className="bg-white rounded-2xl border border-border p-5">
        <h3 className="text-sm font-semibold text-text-dark mb-4">인원 구간별 분포</h3>
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={data.guestStats.distribution}>
            <XAxis dataKey="range" tick={{ fontSize: 11 }} />
            <YAxis tick={{ fontSize: 11 }} />
            <Tooltip formatter={(v) => [(v as number) + "건", "예약"]} />
            <Bar dataKey="count" fill="#8B6914" radius={[6, 6, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
