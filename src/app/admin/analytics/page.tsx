"use client";

import { useState, useEffect } from "react";
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from "recharts";
import { TrendingUp, Users, DollarSign, Calendar, Search, ChevronDown, ChevronUp } from "lucide-react";
import { PROGRAM_LABELS, AnalyticsData } from "@/types/admin";

const COLORS = ["#2d5016", "#4a7c28", "#8B6914", "#c49a2a", "#e8ede4"];
const YEAR_COLORS = ["#2d5016", "#3b82f6", "#ef4444", "#f59e0b", "#8b5cf6", "#ec4899", "#06b6d4", "#84cc16"];

function formatPrice(n: number) {
  if (n >= 10000) return (n / 10000).toFixed(0) + "만";
  return n.toLocaleString();
}

export default function AnalyticsPage() {
  const [data, setData] = useState<AnalyticsData & {
    years?: string[]; totalRevenue?: number;
    totalReservations?: number;
    totalGuests?: number;
    allTimeTotalGuests?: number;
    cumulativeGuests?: { month: string; guests: number; cumulative: number }[];
    monthlyGuestsByYear?: Record<string, number | string>[];
    monthlyRevenueByYear?: Record<string, number | string>[];
    chartYears?: string[];
    yearlyStats?: { year: string; amount: number; count: number; guests: number }[];
  } | null>(null);
  const [viewMode, setViewMode] = useState<"chart" | "table">("chart");
  const [year, setYear] = useState(new Date().getFullYear().toString());
  const [month, setMonth] = useState("all");
  const [basis, setBasis] = useState<"stay" | "booking">("stay"); // stay=이용일 / booking=신청일
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // 기간별 매출
  const [periodFrom, setPeriodFrom] = useState("");
  const [periodTo, setPeriodTo] = useState("");
  const [periodLoading, setPeriodLoading] = useState(false);
  const [periodExpanded, setPeriodExpanded] = useState(false);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [periodStats, setPeriodStats] = useState<any>(null);

  useEffect(() => {
    setLoading(true);
    setError("");
    fetch(`/api/admin/analytics?year=${year}&month=${month}&basis=${basis}`)
      .then((r) => {
        if (!r.ok) throw new Error("데이터 로드 실패");
        return r.json();
      })
      .then((d) => { setData(d); setLoading(false); })
      .catch((e) => { setError(e.message); setLoading(false); });
  }, [year, month, basis]);

  const searchPeriod = () => {
    if (!periodFrom || !periodTo) return;
    setPeriodLoading(true);
    fetch(`/api/admin/analytics?year=${year}&month=${month}&basis=${basis}&from=${periodFrom}&to=${periodTo}`)
      .then((r) => r.json())
      .then((d) => { setPeriodStats(d.periodStats); setPeriodLoading(false); setPeriodExpanded(true); })
      .catch(() => setPeriodLoading(false));
  };

  const setPeriodPreset = (days: number, label?: string) => {
    const to = new Date();
    const from = new Date();
    if (label === "thisMonth") {
      from.setDate(1);
    } else if (label === "lastMonth") {
      from.setMonth(from.getMonth() - 1);
      from.setDate(1);
      to.setDate(0); // last day of prev month
    } else if (label === "thisYear") {
      from.setMonth(0, 1);
    } else {
      from.setDate(from.getDate() - days);
    }
    setPeriodFrom(from.toISOString().split("T")[0]);
    setPeriodTo(to.toISOString().split("T")[0]);
  };

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

      {/* 매출 기준 토글 */}
      <div className="bg-white rounded-2xl border border-gray-200 p-4">
        <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">매출 집계 기준</p>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setBasis("stay")}
            className={`px-4 py-2.5 rounded-xl text-sm font-bold transition-all ${
              basis === "stay"
                ? "bg-primary text-white shadow-md"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            🏡 이용일 기준
            <span className="block text-[10px] font-normal opacity-90 mt-0.5">체크인 날짜</span>
          </button>
          <button
            onClick={() => setBasis("booking")}
            className={`px-4 py-2.5 rounded-xl text-sm font-bold transition-all ${
              basis === "booking"
                ? "bg-emerald-600 text-white shadow-md"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            📝 신청일 기준
            <span className="block text-[10px] font-normal opacity-90 mt-0.5">예약 접수 날짜</span>
          </button>
        </div>
        <p className="text-[11px] text-gray-500 mt-2 leading-relaxed">
          {basis === "stay"
            ? "💡 손님이 실제로 펜션을 이용한 날짜 기준으로 매출을 집계합니다 (체크인 기준)."
            : "💡 손님이 예약을 신청·입금한 날짜 기준으로 매출을 집계합니다 (이번 달 들어온 돈)."}
        </p>
      </div>

      {/* 목차 */}
      <div className="flex flex-wrap gap-1.5 sm:gap-2">
        {[
          { id: "period-revenue", label: "기간별 매출" },
          { id: "kpi", label: "주요 지표" },
          { id: "monthly-revenue", label: "월별 매출" },
          { id: "monthly-guests", label: "연도별 방문자" },
          { id: "monthly-revenue-compare", label: "연도별 매출" },
          { id: "yearly-compare", label: "연도별 비교" },
          { id: "program", label: "프로그램별" },
          { id: "purpose", label: "목적별" },
          { id: "guest-dist", label: "인원 분포" },
        ].map((item) => (
          <button
            key={item.id}
            onClick={() => document.getElementById(item.id)?.scrollIntoView({ behavior: "smooth", block: "start" })}
            className="px-2.5 sm:px-3 py-1.5 rounded-lg text-xs sm:text-sm font-semibold bg-gray-100 text-gray-600 hover:bg-primary hover:text-white transition-colors"
          >
            {item.label}
          </button>
        ))}
      </div>

      {/* 기간별 매출 조회 */}
      <div id="period-revenue" className="bg-white rounded-xl sm:rounded-2xl border border-gray-200 p-3 sm:p-5">
        <h3 className="text-sm sm:text-base font-bold text-gray-900 mb-3">기간별 매출 조회</h3>

        {/* 프리셋 버튼 */}
        <div className="flex flex-wrap gap-1.5 mb-3">
          {[
            { label: "최근 7일", fn: () => setPeriodPreset(7) },
            { label: "최근 30일", fn: () => setPeriodPreset(30) },
            { label: "최근 90일", fn: () => setPeriodPreset(90) },
            { label: "이번 달", fn: () => setPeriodPreset(0, "thisMonth") },
            { label: "지난 달", fn: () => setPeriodPreset(0, "lastMonth") },
            { label: "올해", fn: () => setPeriodPreset(0, "thisYear") },
          ].map((p) => (
            <button key={p.label} onClick={p.fn}
              className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-gray-100 text-gray-600 hover:bg-primary hover:text-white transition-colors">
              {p.label}
            </button>
          ))}
        </div>

        {/* 날짜 선택 */}
        <div className="flex items-end gap-2 flex-wrap">
          <div>
            <label className="text-[10px] text-gray-500 block mb-0.5">시작일</label>
            <input type="date" value={periodFrom} onChange={(e) => setPeriodFrom(e.target.value)}
              className="px-3 py-2 rounded-lg border border-gray-200 text-sm bg-white" />
          </div>
          <span className="text-gray-400 pb-2">~</span>
          <div>
            <label className="text-[10px] text-gray-500 block mb-0.5">종료일</label>
            <input type="date" value={periodTo} onChange={(e) => setPeriodTo(e.target.value)}
              className="px-3 py-2 rounded-lg border border-gray-200 text-sm bg-white" />
          </div>
          <button onClick={searchPeriod} disabled={!periodFrom || !periodTo || periodLoading}
            className="flex items-center gap-1 px-4 py-2 rounded-xl bg-primary text-white text-sm font-semibold disabled:opacity-40 hover:bg-primary/90 transition-colors">
            {periodLoading ? <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full" /> : <Search size={14} />}
            조회
          </button>
        </div>

        {/* 기간별 결과 */}
        {periodStats && (
          <div className="mt-4 space-y-3">
            {/* 요약 카드 */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              <div className="bg-green-50 rounded-xl p-3">
                <p className="text-[10px] text-green-700 font-semibold">총 매출</p>
                <p className="text-lg font-bold text-green-900">{formatPrice(periodStats.totalRevenue)}원</p>
              </div>
              <div className="bg-blue-50 rounded-xl p-3">
                <p className="text-[10px] text-blue-700 font-semibold">예약 건수</p>
                <p className="text-lg font-bold text-blue-900">{periodStats.totalReservations}건</p>
              </div>
              <div className="bg-amber-50 rounded-xl p-3">
                <p className="text-[10px] text-amber-700 font-semibold">총 방문자</p>
                <p className="text-lg font-bold text-amber-900">{(periodStats.totalGuests || 0).toLocaleString()}명</p>
              </div>
              <div className="bg-purple-50 rounded-xl p-3">
                <p className="text-[10px] text-purple-700 font-semibold">건당 평균</p>
                <p className="text-lg font-bold text-purple-900">{formatPrice(periodStats.avgRevenue)}원</p>
              </div>
            </div>

            {/* 프로그램별 */}
            {periodStats.programBreakdown && periodStats.programBreakdown.length > 0 && (
              <div className="bg-gray-50 rounded-xl p-3">
                <p className="text-xs font-bold text-gray-700 mb-2">프로그램별</p>
                <div className="space-y-1">
                  {periodStats.programBreakdown.map((p: { type: string; count: number; guests: number; revenue: number }) => (
                    <div key={p.type} className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">{PROGRAM_LABELS[p.type] || p.type}</span>
                      <span className="font-semibold text-gray-900">{p.count}건 · {p.guests}명 · {formatPrice(p.revenue)}원</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 일별 차트 */}
            {periodStats.dailyBreakdown && periodStats.dailyBreakdown.length > 0 && (
              <div>
                <p className="text-xs font-bold text-gray-700 mb-2">일별 매출</p>
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={periodStats.dailyBreakdown}>
                    <XAxis dataKey="date" tick={{ fontSize: 10 }} tickFormatter={(v: string) => v.slice(5)} />
                    <YAxis tick={{ fontSize: 10 }} tickFormatter={(v: number) => formatPrice(v)} />
                    <Tooltip formatter={(v) => [(v as number).toLocaleString() + "원", "매출"]} labelFormatter={(l) => String(l)} />
                    <Bar dataKey="amount" fill="#2d5016" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}

            {/* 예약 상세 리스트 (접기/펼치기) */}
            {periodStats.reservations && periodStats.reservations.length > 0 && (
              <div>
                <button onClick={() => setPeriodExpanded(!periodExpanded)}
                  className="flex items-center gap-1 text-xs font-bold text-gray-600 hover:text-primary transition-colors">
                  예약 상세 ({periodStats.reservations.length}건)
                  {periodExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                </button>
                {periodExpanded && (
                  <div className="mt-2 overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-gray-200">
                          <th className="text-left py-1.5 px-2 text-gray-500 font-semibold text-xs">날짜</th>
                          <th className="text-left py-1.5 px-2 text-gray-500 font-semibold text-xs">예약자</th>
                          <th className="text-right py-1.5 px-2 text-gray-500 font-semibold text-xs">인원</th>
                          <th className="text-right py-1.5 px-2 text-gray-500 font-semibold text-xs">프로그램</th>
                          <th className="text-right py-1.5 px-2 text-gray-500 font-semibold text-xs">버스</th>
                          <th className="text-right py-1.5 px-2 text-gray-500 font-semibold text-xs">매출</th>
                        </tr>
                      </thead>
                      <tbody>
                        {periodStats.reservations.map((r: { id: number; date: string; name: string; guests: number; program: string; revenue: number; busCost: number }) => (
                          <tr key={r.id} className="border-b border-gray-100">
                            <td className="py-1.5 px-2 text-gray-700 text-xs">{r.date}</td>
                            <td className="py-1.5 px-2 font-medium text-gray-900 text-xs">{r.name}</td>
                            <td className="py-1.5 px-2 text-right text-gray-700 text-xs">{r.guests}명</td>
                            <td className="py-1.5 px-2 text-right text-gray-700 text-xs">{PROGRAM_LABELS[r.program] || r.program}</td>
                            <td className="py-1.5 px-2 text-right text-gray-500 text-xs">{r.busCost > 0 ? formatPrice(r.busCost) : "-"}</td>
                            <td className="py-1.5 px-2 text-right font-semibold text-gray-900 text-xs">{(r.revenue).toLocaleString()}원</td>
                          </tr>
                        ))}
                        <tr className="bg-gray-50 font-bold">
                          <td className="py-1.5 px-2 text-xs" colSpan={2}>합계</td>
                          <td className="py-1.5 px-2 text-right text-xs">{periodStats.totalGuests}명</td>
                          <td className="py-1.5 px-2 text-right text-xs">{periodStats.totalReservations}건</td>
                          <td className="py-1.5 px-2 text-right text-xs">{formatPrice(periodStats.reservations.reduce((s: number, r: { busCost: number }) => s + r.busCost, 0))}원</td>
                          <td className="py-1.5 px-2 text-right text-xs">{periodStats.totalRevenue.toLocaleString()}원</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Summary KPIs */}
      <div id="kpi" className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-4">
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
          <p className="text-xs sm:text-sm text-gray-500">{periodLabel} 누적 방문자</p>
        </div>
        <div className="bg-white rounded-xl sm:rounded-2xl border border-gray-200 p-3 sm:p-5">
          <TrendingUp size={18} className="text-primary mb-1.5 sm:mb-2" />
          <p className="text-lg sm:text-2xl font-bold text-gray-900">{(data.allTimeTotalGuests || 0).toLocaleString()}명</p>
          <p className="text-xs sm:text-sm text-gray-500">전체 누적 방문자</p>
          <p className="text-xs text-gray-400 mt-0.5">평균 {data.guestStats.avg}명/건</p>
        </div>
      </div>

      {/* Monthly Revenue - Chart/Table Toggle */}
      <div id="monthly-revenue" className="bg-white rounded-xl sm:rounded-2xl border border-gray-200 p-3 sm:p-5">
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
                formatter={(v) => [(v as number).toLocaleString() + "원", "매출"]}
                labelFormatter={(l) => String(l).slice(5) + "월"}
              />
              <Bar dataKey="amount" fill="#2d5016" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-2 px-2 text-gray-500 font-semibold">월</th>
                  <th className="text-right py-2 px-2 text-gray-500 font-semibold">예약</th>
                  <th className="text-right py-2 px-2 text-gray-500 font-semibold">방문자</th>
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

      {/* Monthly Guests by Year Comparison */}
      <div id="monthly-guests" className="bg-white rounded-xl sm:rounded-2xl border border-gray-200 p-3 sm:p-5">
        <h3 className="text-sm sm:text-base font-bold text-gray-900 mb-3 sm:mb-4">연도별 월별 방문자 수 비교</h3>
        {data.monthlyGuestsByYear && data.chartYears && data.chartYears.length > 0 ? (
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={data.monthlyGuestsByYear}>
              <XAxis dataKey="month" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip formatter={(v, name) => [(v as number).toLocaleString() + "명", `${name}년`]} />
              <Legend formatter={(v) => `${v}년`} />
              {data.chartYears.map((y, i) => (
                <Line
                  key={y}
                  type="monotone"
                  dataKey={y}
                  stroke={YEAR_COLORS[i % YEAR_COLORS.length]}
                  strokeWidth={y === year ? 3 : 1.5}
                  dot={{ r: y === year ? 4 : 2 }}
                  opacity={y === year ? 1 : 0.6}
                  name={y}
                />
              ))}
            </LineChart>
          </ResponsiveContainer>
        ) : (
          <div className="h-[300px] flex items-center justify-center text-gray-400 text-sm">데이터 없음</div>
        )}
      </div>

      {/* Monthly Revenue by Year Comparison */}
      <div id="monthly-revenue-compare" className="bg-white rounded-xl sm:rounded-2xl border border-gray-200 p-3 sm:p-5">
        <h3 className="text-sm sm:text-base font-bold text-gray-900 mb-1">연도별 월별 매출 비교</h3>
        <p className="text-[11px] text-gray-500 mb-3 sm:mb-4">{basis === "stay" ? "🏡 이용일 기준" : "📝 신청일 기준"}</p>
        {data.monthlyRevenueByYear && data.chartYears && data.chartYears.length > 0 ? (
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={data.monthlyRevenueByYear}>
              <XAxis dataKey="month" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} tickFormatter={(v) => formatPrice(v as number)} />
              <Tooltip formatter={(v, name) => [(v as number).toLocaleString() + "원", `${name}년`]} />
              <Legend formatter={(v) => `${v}년`} />
              {data.chartYears.map((y, i) => (
                <Line
                  key={y}
                  type="monotone"
                  dataKey={y}
                  stroke={YEAR_COLORS[i % YEAR_COLORS.length]}
                  strokeWidth={y === year ? 3 : 1.5}
                  dot={{ r: y === year ? 4 : 2 }}
                  opacity={y === year ? 1 : 0.6}
                  name={y}
                />
              ))}
            </LineChart>
          </ResponsiveContainer>
        ) : (
          <div className="h-[300px] flex items-center justify-center text-gray-400 text-sm">데이터 없음</div>
        )}
      </div>

      {/* Yearly Comparison */}
      {data.yearlyStats && data.yearlyStats.length > 0 && (
        <div id="yearly-compare" className="bg-white rounded-xl sm:rounded-2xl border border-gray-200 p-3 sm:p-5">
          <h3 className="text-sm sm:text-base font-bold text-gray-900 mb-3 sm:mb-4">연도별 비교</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-2 px-2 text-gray-500 font-semibold">연도</th>
                  <th className="text-right py-2 px-2 text-gray-500 font-semibold">예약</th>
                  <th className="text-right py-2 px-2 text-gray-500 font-semibold">방문자</th>
                  <th className="text-right py-2 px-2 text-gray-500 font-semibold">누적 방문자</th>
                  <th className="text-right py-2 px-2 text-gray-500 font-semibold">매출</th>
                </tr>
              </thead>
              <tbody>
                {(() => {
                  let cumTotal = 0;
                  const rows = data.yearlyStats!.map((ys) => {
                    cumTotal += ys.guests;
                    return (
                      <tr key={ys.year} className={`border-b border-gray-100 ${ys.year === year ? "bg-primary/5" : ""}`}>
                        <td className="py-2 px-2 font-medium text-gray-900">{ys.year}년</td>
                        <td className="py-2 px-2 text-right text-gray-700">{ys.count}건</td>
                        <td className="py-2 px-2 text-right text-gray-700">{ys.guests.toLocaleString()}명</td>
                        <td className="py-2 px-2 text-right font-semibold text-amber-700">{cumTotal.toLocaleString()}명</td>
                        <td className="py-2 px-2 text-right font-semibold text-gray-900">{ys.amount.toLocaleString()}원</td>
                      </tr>
                    );
                  });
                  const totalCount = data.yearlyStats!.reduce((s, y) => s + y.count, 0);
                  const totalGuests = data.yearlyStats!.reduce((s, y) => s + y.guests, 0);
                  const totalAmount = data.yearlyStats!.reduce((s, y) => s + y.amount, 0);
                  rows.push(
                    <tr key="total" className="bg-gray-50 font-bold">
                      <td className="py-2 px-2 text-gray-900">총합</td>
                      <td className="py-2 px-2 text-right text-gray-900">{totalCount}건</td>
                      <td className="py-2 px-2 text-right text-gray-900">{totalGuests.toLocaleString()}명</td>
                      <td className="py-2 px-2 text-right text-amber-700">{totalGuests.toLocaleString()}명</td>
                      <td className="py-2 px-2 text-right text-gray-900">{totalAmount.toLocaleString()}원</td>
                    </tr>
                  );
                  return rows;
                })()}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Program Breakdown */}
        <div id="program" className="bg-white rounded-xl sm:rounded-2xl border border-gray-200 p-3 sm:p-5">
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
        <div className="bg-white rounded-xl sm:rounded-2xl border border-gray-200 p-3 sm:p-5">
          <h3 className="text-sm sm:text-base font-bold text-gray-900 mb-3 sm:mb-4">예약 목적별 분석</h3>
          {(() => {
            const purposeTotal = data.purposeBreakdown.reduce((s, p) => s + p.count, 0);
            return (
              <div className="space-y-2.5">
                {data.purposeBreakdown.map((p) => {
                  const pct = purposeTotal > 0 ? Math.round((p.count / purposeTotal) * 100) : 0;
                  return (
                    <div key={p.purpose}>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm text-gray-700 font-medium">{p.purpose}</span>
                        <span className="text-sm font-semibold text-gray-900">{p.count}건 <span className="text-gray-400">({pct}%)</span></span>
                      </div>
                      <div className="w-full bg-gray-100 rounded-full h-2.5">
                        <div className="bg-primary h-2.5 rounded-full transition-all" style={{ width: `${pct}%` }} />
                      </div>
                    </div>
                  );
                })}
                {purposeTotal > 0 && (
                  <p className="text-xs text-gray-400 text-right pt-1">총 {purposeTotal}건</p>
                )}
              </div>
            );
          })()}
        </div>
      </div>

      {/* Guest Distribution */}
      <div id="guest-dist" className="bg-white rounded-xl sm:rounded-2xl border border-gray-200 p-3 sm:p-5">
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
