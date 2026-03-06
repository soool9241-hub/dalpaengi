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

  const { data: allData } = await supabaseAdmin
    .from("reservations")
    .select("*")
    .neq("status", "cancelled")
    .order("reservation_date", { ascending: true });

  const reservations = (allData || []) as ReservationRow[];
  const today = new Date().toISOString().split("T")[0];
  const yearData = reservations.filter((r) => r.reservation_date?.startsWith(year));
  const filteredData = month === "all"
    ? yearData
    : yearData.filter((r) => r.reservation_date?.substring(5, 7) === month);

  // Monthly revenue + guests (all reservations = confirmed)
  const monthlyMap: Record<string, { amount: number; count: number; guests: number }> = {};
  yearData.forEach((r) => {
    const m = r.reservation_date?.substring(0, 7);
    if (!m) return;
    if (!monthlyMap[m]) monthlyMap[m] = { amount: 0, count: 0, guests: 0 };
    monthlyMap[m].amount += calculateRevenue(r);
    monthlyMap[m].count += 1;
    monthlyMap[m].guests += r.guest_count || 0;
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

  // All years monthly guests for comparison chart
  const allYearsMonthly: Record<string, Record<string, number>> = {};
  reservations.forEach((r) => {
    const y = r.reservation_date?.substring(0, 4);
    const mm = r.reservation_date?.substring(5, 7);
    if (!y || !mm) return;
    if (!allYearsMonthly[y]) allYearsMonthly[y] = {};
    allYearsMonthly[y][mm] = (allYearsMonthly[y][mm] || 0) + (r.guest_count || 0);
  });
  // Build comparison data: rows = 01~12, cols = each year
  const monthlyGuestsByYear: Record<string, number | string>[] = [];
  for (let i = 1; i <= 12; i++) {
    const mm = String(i).padStart(2, "0");
    const row: Record<string, number | string> = { month: `${i}월` };
    for (const y of Object.keys(allYearsMonthly).sort()) {
      row[y] = allYearsMonthly[y][mm] || 0;
    }
    monthlyGuestsByYear.push(row);
  }
  const availableYearsForChart = Object.keys(allYearsMonthly).sort();

  // Yearly totals (all years)
  const yearlyMap: Record<string, { amount: number; count: number; guests: number }> = {};
  reservations.forEach((r) => {
    const y = r.reservation_date?.substring(0, 4);
    if (!y) return;
    if (!yearlyMap[y]) yearlyMap[y] = { amount: 0, count: 0, guests: 0 };
    yearlyMap[y].amount += calculateRevenue(r);
    yearlyMap[y].count += 1;
    yearlyMap[y].guests += r.guest_count || 0;
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
    programMap[t].guests += r.guest_count || 0;
    programMap[t].revenue += calculateRevenue(r);
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
  const guestCounts = filteredData.map((r) => r.guest_count || 0).filter(Boolean);
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
  const years = [...new Set(reservations.map((r) => r.reservation_date?.substring(0, 4)).filter(Boolean))].sort();

  return NextResponse.json({
    monthlyRevenue,
    programBreakdown,
    purposeBreakdown,
    guestStats: { avg, max, distribution },
    years,
    totalRevenue: filteredData.reduce((sum, r) => sum + calculateRevenue(r), 0),
    totalReservations: filteredData.length,
    totalGuests: filteredData.reduce((sum, r) => sum + (r.guest_count || 0), 0),
    cumulativeGuests,
    monthlyGuestsByYear,
    chartYears: availableYearsForChart,
    yearlyStats,
    allTimeTotalGuests: reservations.reduce((sum, r) => sum + (r.guest_count || 0), 0),
  });
}
