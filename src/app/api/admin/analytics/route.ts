import { NextRequest, NextResponse } from "next/server";
import { verifyRequest } from "@/lib/admin-auth";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { calculateRevenue, ReservationRow } from "@/types/admin";

export async function GET(req: NextRequest) {
  if (!(await verifyRequest(req))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const url = req.nextUrl.searchParams;
  const year = url.get("year") || new Date().getFullYear().toString();
  const month = url.get("month") || "all"; // "all" or "01"~"12"
  const fromDate = url.get("from") || "";
  const toDate = url.get("to") || "";
  const basis = url.get("basis") || "stay"; // "stay" = 이용일(체크인), "booking" = 신청일(접수일)

  const { data: allData } = await supabaseAdmin
    .from("reservations")
    .select("*")
    .neq("status", "cancelled")
    .order("reservation_date", { ascending: true });

  const reservations = (allData || []) as ReservationRow[];

  // 기준 날짜 추출 헬퍼: stay = reservation_date / booking = submitted_at(YYYY-MM-DD)
  const getBasisDate = (r: ReservationRow): string => {
    if (basis === "booking") {
      const submitted = (r as ReservationRow & { submitted_at?: string; created_at?: string }).submitted_at
        || (r as ReservationRow & { submitted_at?: string; created_at?: string }).created_at;
      return submitted ? String(submitted).substring(0, 10) : "";
    }
    return r.reservation_date || "";
  };

  // Bus cost lookup
  const busResIds = reservations.filter(r => r.bus_requested).map(r => r.id);
  const busMap: Record<number, number> = {};
  if (busResIds.length > 0) {
    const { data: busRows } = await supabaseAdmin.from("bus_requests").select("reservation_id, pickup_place").in("reservation_id", busResIds);
    const BUS_ROUTES: Record<string, number> = { "전북대": 600000, "전주대": 650000, "원광대": 700000, "우석대": 650000 };
    (busRows || []).forEach((b: { reservation_id: number; pickup_place: string }) => {
      busMap[b.reservation_id] = BUS_ROUTES[b.pickup_place] || 0;
    });
  }
  const getTotal = (r: ReservationRow) => calculateRevenue(r) + (busMap[r.id] || 0);

  const yearData = reservations.filter((r) => getBasisDate(r).startsWith(year));
  const filteredData = month === "all"
    ? yearData
    : yearData.filter((r) => getBasisDate(r).substring(5, 7) === month);

  // Period-based filtering (from/to)
  const periodData = (fromDate && toDate)
    ? reservations.filter((r) => {
        const d = getBasisDate(r);
        return d >= fromDate && d <= toDate;
      })
    : null;

  let periodStats = null;
  if (periodData) {
    const periodTotal = periodData.reduce((sum, r) => sum + getTotal(r), 0);
    const periodGuests = periodData.reduce((sum, r) => sum + (r.guest_count || 0) + (r.extra_guests || 0), 0);

    // Daily breakdown
    const dailyMap: Record<string, { amount: number; count: number; guests: number }> = {};
    periodData.forEach((r) => {
      const d = getBasisDate(r);
      if (!d) return;
      if (!dailyMap[d]) dailyMap[d] = { amount: 0, count: 0, guests: 0 };
      dailyMap[d].amount += getTotal(r);
      dailyMap[d].count += 1;
      dailyMap[d].guests += (r.guest_count || 0) + (r.extra_guests || 0);
    });
    const dailyBreakdown = Object.entries(dailyMap)
      .map(([date, v]) => ({ date, ...v }))
      .sort((a, b) => a.date.localeCompare(b.date));

    // Program breakdown for period
    const pMap: Record<string, { count: number; guests: number; revenue: number }> = {};
    periodData.forEach((r) => {
      const t = r.program_type;
      if (!pMap[t]) pMap[t] = { count: 0, guests: 0, revenue: 0 };
      pMap[t].count += 1;
      pMap[t].guests += (r.guest_count || 0) + (r.extra_guests || 0);
      pMap[t].revenue += getTotal(r);
    });
    const periodPrograms = Object.entries(pMap).map(([type, v]) => ({
      type, count: v.count, guests: v.guests, revenue: v.revenue,
    }));

    // Reservation list for period
    const periodList = periodData.map((r) => ({
      id: r.id,
      date: getBasisDate(r),
      reservationDate: r.reservation_date,
      name: r.guest_name,
      phone: r.guest_phone,
      program: r.program_type,
      guests: (r.guest_count || 0) + (r.extra_guests || 0),
      revenue: getTotal(r),
      busCost: busMap[r.id] || 0,
    }));

    periodStats = {
      from: fromDate,
      to: toDate,
      totalRevenue: periodTotal,
      totalReservations: periodData.length,
      totalGuests: periodGuests,
      avgRevenue: periodData.length > 0 ? Math.round(periodTotal / periodData.length) : 0,
      dailyBreakdown,
      programBreakdown: periodPrograms,
      reservations: periodList,
    };
  }

  // Monthly revenue + guests (all reservations = confirmed)
  const monthlyMap: Record<string, { amount: number; count: number; guests: number }> = {};
  yearData.forEach((r) => {
    const m = getBasisDate(r).substring(0, 7);
    if (!m) return;
    if (!monthlyMap[m]) monthlyMap[m] = { amount: 0, count: 0, guests: 0 };
    monthlyMap[m].amount += getTotal(r);
    monthlyMap[m].count += 1;
    monthlyMap[m].guests += (r.guest_count || 0) + (r.extra_guests || 0);
  });
  const monthlyRevenue = Object.entries(monthlyMap)
    .map(([m, v]) => ({ month: m, ...v }))
    .sort((a, b) => a.month.localeCompare(b.month));

  // Cumulative guests (current year)
  let cumGuests = 0;
  const cumulativeGuests = monthlyRevenue.map((m) => {
    cumGuests += m.guests;
    return { month: m.month, guests: m.guests, cumulative: cumGuests };
  });

  // All years monthly guests + revenue for comparison chart
  const allYearsMonthly: Record<string, Record<string, number>> = {};
  const allYearsMonthlyRevenue: Record<string, Record<string, number>> = {};
  reservations.forEach((r) => {
    const d = getBasisDate(r);
    const y = d.substring(0, 4);
    const mm = d.substring(5, 7);
    if (!y || !mm) return;
    if (!allYearsMonthly[y]) allYearsMonthly[y] = {};
    if (!allYearsMonthlyRevenue[y]) allYearsMonthlyRevenue[y] = {};
    allYearsMonthly[y][mm] = (allYearsMonthly[y][mm] || 0) + (r.guest_count || 0) + (r.extra_guests || 0);
    allYearsMonthlyRevenue[y][mm] = (allYearsMonthlyRevenue[y][mm] || 0) + getTotal(r);
  });
  // Build comparison data: rows = 01~12, cols = each year
  const monthlyGuestsByYear: Record<string, number | string>[] = [];
  const monthlyRevenueByYear: Record<string, number | string>[] = [];
  for (let i = 1; i <= 12; i++) {
    const mm = String(i).padStart(2, "0");
    const guestRow: Record<string, number | string> = { month: `${i}월` };
    const revRow: Record<string, number | string> = { month: `${i}월` };
    for (const y of Object.keys(allYearsMonthly).sort()) {
      guestRow[y] = allYearsMonthly[y][mm] || 0;
      revRow[y] = allYearsMonthlyRevenue[y][mm] || 0;
    }
    monthlyGuestsByYear.push(guestRow);
    monthlyRevenueByYear.push(revRow);
  }
  const availableYearsForChart = Object.keys(allYearsMonthly).sort();

  // Yearly totals (all years)
  const yearlyMap: Record<string, { amount: number; count: number; guests: number }> = {};
  reservations.forEach((r) => {
    const y = getBasisDate(r).substring(0, 4);
    if (!y) return;
    if (!yearlyMap[y]) yearlyMap[y] = { amount: 0, count: 0, guests: 0 };
    yearlyMap[y].amount += getTotal(r);
    yearlyMap[y].count += 1;
    yearlyMap[y].guests += (r.guest_count || 0) + (r.extra_guests || 0);
  });
  const yearlyStats = Object.entries(yearlyMap)
    .map(([y, v]) => ({ year: y, ...v }))
    .sort((a, b) => a.year.localeCompare(b.year));

  // Program breakdown (filtered by month if selected)
  const programMap: Record<string, { count: number; guests: number; revenue: number }> = {};
  filteredData.forEach((r) => {
    const t = r.program_type;
    if (!programMap[t]) programMap[t] = { count: 0, guests: 0, revenue: 0 };
    programMap[t].count += 1;
    programMap[t].guests += (r.guest_count || 0) + (r.extra_guests || 0);
    programMap[t].revenue += getTotal(r);
  });
  const programBreakdown = Object.entries(programMap).map(([type, v]) => ({
    type,
    count: v.count,
    avgGuests: v.count > 0 ? Math.round(v.guests / v.count) : 0,
    totalRevenue: v.revenue,
  }));

  // Purpose breakdown (filtered by month if selected)
  const purposeMap: Record<string, number> = {};
  filteredData.forEach((r) => {
    const p = r.purpose || r.purpose_raw || "기타";
    purposeMap[p] = (purposeMap[p] || 0) + 1;
  });
  const purposeBreakdown = Object.entries(purposeMap)
    .map(([purpose, count]) => ({ purpose, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 10);

  // Guest stats (filtered by month if selected)
  const guestCounts = filteredData.map((r) => (r.guest_count || 0) + (r.extra_guests || 0)).filter(Boolean);
  const avg = guestCounts.length > 0 ? Math.round(guestCounts.reduce((a, b) => a + b, 0) / guestCounts.length) : 0;
  const max = guestCounts.length > 0 ? Math.max(...guestCounts) : 0;
  const distribution = [
    { range: "1~10명", count: guestCounts.filter((g) => g <= 10).length },
    { range: "11~20명", count: guestCounts.filter((g) => g > 10 && g <= 20).length },
    { range: "21~30명", count: guestCounts.filter((g) => g > 20 && g <= 30).length },
    { range: "31~50명", count: guestCounts.filter((g) => g > 30 && g <= 50).length },
    { range: "51명+", count: guestCounts.filter((g) => g > 50).length },
  ];

  // Available years
  const years = [...new Set(reservations.map((r) => getBasisDate(r).substring(0, 4)).filter(Boolean))].sort();

  return NextResponse.json({
    basis,
    monthlyRevenue,
    programBreakdown,
    purposeBreakdown,
    guestStats: { avg, max, distribution },
    years,
    totalRevenue: filteredData.reduce((sum, r) => sum + getTotal(r), 0),
    totalReservations: filteredData.length,
    totalGuests: filteredData.reduce((sum, r) => sum + (r.guest_count || 0) + (r.extra_guests || 0), 0),
    cumulativeGuests,
    monthlyGuestsByYear,
    monthlyRevenueByYear,
    chartYears: availableYearsForChart,
    yearlyStats,
    allTimeTotalGuests: reservations.reduce((sum, r) => sum + (r.guest_count || 0) + (r.extra_guests || 0), 0),
    periodStats,
  });
}
