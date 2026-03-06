"use client";

import { useState, useEffect } from "react";
import { BarChart, Bar, ComposedChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from "recharts";
import { TrendingUp, Users, DollarSign, Calendar } from "lucide-react";
import { PROGRAM_LABELS, AnalyticsData } from "@/types/admin";

const COLORS = ["#2d5016", "#4a7c28", "#8B6914", "#c49a2a", "#e8ede4"];

function formatPrice(n: number) {
  if (n >= 10000) return (n / 10000).toFixed(0) + "만";
  return n.toLocaleString();
}

export default function AnalyticsPage() {
  const [data, setData] = useState<AnalyticsData & {
    years?: string[]; totalRevenue?: number; totalReservations?: number; totalGuests?: number;
    cumulativeGuests?: { month: string; guests: number; cumulative: number }[];
    yearlyStats?: { year: string; amount: number; count: number; guests: number }[];
  } | null>(null);
  const [viewMode, setViewMode] = useState<"chart" | "table">("chart");
  const [year, setYear] = useState(new Date().getFullYear().toString());
  const [month, setMonth] = useState("all");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    setLoading(true);
    setError("");
    fetch(`/api/admin/analytics?year=${year}&month=${month}`)
      .then((r) => {
        if (!r.ok) throw new Error("데이터 로드 실패");
        return r.json();
      })
      .then((d) => { setData(d); setLoading(false); })
      .catch((e) => { setError(e.message); setLoading(false); });
  }, [year, month]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  if (error) return <p className="text-red-500 text-base font-medium bg-red-50 px-4 py-3 rounded-xl">{error}</p>;
  if (!data) return <p className="text-gray-500 text-base">데이터를 불러올 수 없습니다.</p>;

  const periodLabel = month === "all" ? `${year}년` : `${year}년 ${parseInt(month)}월`;

  const pieData = data.programBreakdown.map((p) => ({
    name: PROGRAM_LABELS[p.type] || p.type,
    value: p.count,
    revenue: p.totalRevenue,
    avgGuests: p.avgGuests,
  }));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <h1 className="text-xl sm:text-2xl font-bold text-gray-900">매출/지표 분석</h1>
        <div className="flex items-center gap-1.5 sm:gap-2">
          <select
            value={year}
            onChange={(e) => setYear(e.target.value)}
            className="px-3 sm:px-4 py-2 rounded-xl border border-gray-200 bg-white text-sm font-semibold"
          >
            {(data.years || [year]).map((y) => (
              <option key={y} value={y}>{y}년</option>
            ))}
          </select>
          <select
            value={month}
            onChange={(e) => setMonth(e.target.value)}
            className="px-3 sm:px-4 py-2 rounded-xl border border-gray-200 bg-white text-sm font-semibold"
          >
            <option value="all">전체</option>
            {Array.from({ length: 12 }, (_, i) => {
              const m = String(i + 1).padStart(2, "0");
              return <option key={m} value={m}>{i + 1}월</option>;
            })}
          </select>
        </div>
      </div>

      {/* Summary KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-2.5 sm:gap-4">
        <div className="bg-white rounded-xl sm:rounded-2xl border border-gray-200 p-3 sm:p-5">
          <DollarSign size={18} className="text-green-600 mb-1.5 sm:mb-2" />
          <p className="text-lg sm:text-2xl font-bold text-gray-900">{formatPrice(data.totalRevenue || 0)}원</p>
          <p className="text-xs sm:text-sm text-gray-500">{periodLabel} 총 매출</p>
        </div>
        <div className="bg-white rounded-xl sm:rounded-2xl border border-gray-200 p-3 sm:p-5">
          <Calendar size={18} className="text-blue-600 mb-1.5 sm:mb-2" />
          <p className="text-lg sm:text-2xl font-bold text-gray-900">{data.totalReservations || 0}건</p>
          <p className="text-xs sm:text-sm text-gray-500">{periodLabel} 총 예약</p>
        </div>
        <div className="bg-white rounded-xl sm:rounded-2xl border border-gray-200 p-3 sm:p-5">
          <Users size={18} className="text-amber-600 mb-1.5 sm:mb-2" />
          <p className="text-lg sm:text-2xl font-bold text-gray-900">{(data.totalGuests || 0).toLocaleString()}명</p>
          <p className="text-xs sm:text-sm text-gray-500">{periodLabel} 총 방문자</p>
        </div>
        <div className="bg-white rounded-xl sm:rounded-2xl border border-gray-200 p-3 sm:p-5">
          <Users size={18} className="text-cyan-600 mb-1.5 sm:mb-2" />
          <p className="text-lg sm:text-2xl font-bold text-gray-900">{data.guestStats.avg}명</p>
          <p className="text-xs sm:text-sm text-gray-500">평균 인원</p>
        </div>
        <div className="bg-white rounded-xl sm:rounded-2xl border border-gray-200 p-3 sm:p-5">
          <TrendingUp size={18} className="text-primary mb-1.5 sm:mb-2" />
          <p className="text-lg sm:text-2xl font-bold text-gray-900">{data.guestStats.max}명</p>
          <p className="text-xs sm:text-sm text-gray-500">최대 인원</p>
        </div>
      </div>

      {/* Monthly Revenue - Chart/Table Toggle */}
      <div className="bg-white rounded-xl sm:rounded-2xl border border-gray-200 p-3 sm:p-5">
        <div className="flex items-center justify-between mb-3 sm:mb-4">
          <h3 className="text-sm sm:text-base font-bold text-gray-900">월별 매출 추이</h3>
          <div className="flex gap-1">
            <button onClick={() => setViewMode("chart")} className={`px-2.5 sm:px-3 py-1 rounded-lg text-xs font-semibold transition-all ${viewMode === "chart" ? "bg-primary text-white" : "bg-gray-100 text-gray-500 hover:bg-gray-200"}`}>차트</button>
            <button onClick={() => setViewMode("table")} className={`px-2.5 sm:px-3 py-1 rounded-lg text-xs font-semibold transition-all ${viewMode === "table" ? "bg-primary text-white" : "bg-gray-100 text-gray-500 hover:bg-gray-200"}`}>표</button>
          </div>
        </div>
        {viewMode === "chart" ? (
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={data.monthlyRevenue}>
              <XAxis dataKey="month" tick={{ fontSize: 11 }} tickFormatter={(v: string) => v.slice(5) + "월"} />
              <YAxis tick={{ fontSize: 11 }} tickFormatter={(v: number) => formatPrice(v)} />
              <Tooltip
                formatter={(v, name) => [(v as number).toLocaleString() + (name === "amount" ? "원" : "명"), name === "amount" ? "매출" : "방문자"]}
                labelFormatter={(l) => String(l).slice(5) + "월"}
              />
              <Bar dataKey="amount" fill="#2d5016" radius={[6, 6, 0, 0]} name="amount" />
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-2 px-2 text-gray-500 font-semibold">월</th>
                  <th className="text-right py-2 px-2 text-gray-500 font-semibold">예약 건수</th>
                  <th className="text-right py-2 px-2 text-gray-500 font-semibold">방문자 수</th>
                  <th className="text-right py-2 px-2 text-gray-500 font-semibold">매출</th>
                </tr>
              </thead>
              <tbody>
                {data.monthlyRevenue.map((m) => (
                  <tr key={m.month} className="border-b border-gray-100">
                    <td className="py-2 px-2 font-medium text-gray-900">{m.month.slice(5)}월</td>
                    <td className="py-2 px-2 text-right text-gray-700">{m.count}건</td>
                    <td className="py-2 px-2 text-right text-gray-700">{(m.guests || 0).toLocaleString()}명</td>
                    <td className="py-2 px-2 text-right font-semibold text-gray-900">{(m.amount || 0).toLocaleString()}원</td>
                  </tr>
                ))}
                <tr className="bg-gray-50 font-bold">
                  <td className="py-2 px-2 text-gray-900">합계</td>
                  <td className="py-2 px-2 text-right text-gray-900">{data.monthlyRevenue.reduce((s, m) => s + m.count, 0)}건</td>
                  <td className="py-2 px-2 text-right text-gray-900">{data.monthlyRevenue.reduce((s, m) => s + (m.guests || 0), 0).toLocaleString()}명</td>
                  <td className="py-2 px-2 text-right text-gray-900">{data.monthlyRevenue.reduce((s, m) => s + (m.amount || 0), 0).toLocaleString()}원</td>
                </tr>
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Cumulative Guests + Monthly Guests */}
      <div className="bg-white rounded-xl sm:rounded-2xl border border-gray-200 p-3 sm:p-5">
        <h3 className="text-sm sm:text-base font-bold text-gray-900 mb-3 sm:mb-4">월별 / 누적 방문자 수</h3>
        <ResponsiveContainer width="100%" height={280}>
          <ComposedChart data={data.cumulativeGuests || []}>
            <XAxis dataKey="month" tick={{ fontSize: 11 }} tickFormatter={(v: string) => v.slice(5) + "월"} />
            <YAxis yAxisId="left" tick={{ fontSize: 11 }} />
            <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 11 }} />
            <Tooltip
              formatter={(v, name) => [(v as number).toLocaleString() + "명", name === "guests" ? "월별 방문자" : "누적 방문자"]}
              labelFormatter={(l) => String(l).slice(5) + "월"}
            />
            <Legend formatter={(v) => v === "guests" ? "월별 방문자" : "누적 방문자"} />
            <Bar yAxisId="left" dataKey="guests" fill="#4a7c28" radius={[4, 4, 0, 0]} name="guests" />
            <Line yAxisId="right" type="monotone" dataKey="cumulative" stroke="#c49a2a" strokeWidth={2.5} dot={{ r: 3 }} name="cumulative" />
          </ComposedChart>
        </ResponsiveContainer>
      </div>

      {/* Yearly Comparison */}
      {data.yearlyStats && data.yearlyStats.length > 1 && (
        <div className="bg-white rounded-xl sm:rounded-2xl border border-gray-200 p-3 sm:p-5">
          <h3 className="text-sm sm:text-base font-bold text-gray-900 mb-3 sm:mb-4">연도별 비교</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-2 px-2 text-gray-500 font-semibold">연도</th>
                  <th className="text-right py-2 px-2 text-gray-500 font-semibold">예약 건수</th>
                  <th className="text-right py-2 px-2 text-gray-500 font-semibold">총 방문자</th>
                  <th className="text-right py-2 px-2 text-gray-500 font-semibold">총 매출</th>
                </tr>
              </thead>
              <tbody>
                {data.yearlyStats.map((ys) => (
                  <tr key={ys.year} className={`border-b border-gray-100 ${ys.year === year ? "bg-primary/5" : ""}`}>
                    <td className="py-2 px-2 font-medium text-gray-900">{ys.year}년</td>
                    <td className="py-2 px-2 text-right text-gray-700">{ys.count}건</td>
                    <td className="py-2 px-2 text-right text-gray-700">{ys.guests.toLocaleString()}명</td>
                    <td className="py-2 px-2 text-right font-semibold text-gray-900">{ys.amount.toLocaleString()}원</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Program Breakdown */}
        <div className="bg-white rounded-2xl border border-gray-200 p-5">
          <h3 className="text-base font-bold text-gray-900 mb-4">프로그램별 분석</h3>
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
                <span className="text-gray-600">{PROGRAM_LABELS[p.type]}</span>
                <span className="text-gray-900 font-semibold">{p.count}건 · 평균 {p.avgGuests}명 · {formatPrice(p.totalRevenue)}원</span>
              </div>
            ))}
          </div>
        </div>

        {/* Purpose Breakdown */}
        <div className="bg-white rounded-2xl border border-gray-200 p-5">
          <h3 className="text-base font-bold text-gray-900 mb-4">예약 목적별 분석</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={data.purposeBreakdown} layout="vertical">
              <XAxis type="number" tick={{ fontSize: 12 }} />
              <YAxis dataKey="purpose" type="category" tick={{ fontSize: 12 }} width={100} />
              <Tooltip formatter={(v) => [(v as number) + "건", "예약"]} />
              <Bar dataKey="count" fill="#4a7c28" radius={[0, 6, 6, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Guest Distribution */}
      <div className="bg-white rounded-2xl border border-gray-200 p-5">
        <h3 className="text-base font-bold text-gray-900 mb-4">인원 구간별 분포</h3>
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={data.guestStats.distribution}>
            <XAxis dataKey="range" tick={{ fontSize: 12 }} />
            <YAxis tick={{ fontSize: 12 }} />
            <Tooltip formatter={(v) => [(v as number) + "건", "예약"]} />
            <Bar dataKey="count" fill="#8B6914" radius={[6, 6, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
