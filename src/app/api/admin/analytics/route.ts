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
  const yearData = reservations.filter((r) => r.reservation_date?.startsWith(year));
  const filteredData = month === "all"
    ? yearData
    : yearData.filter((r) => r.reservation_date?.substring(5, 7) === month);

  // Monthly revenue + guests
  const monthlyMap: Record<string, { amount: number; count: number; guests: number }> = {};
  yearData.forEach((r) => {
    const month = r.reservation_date?.substring(0, 7);
    if (!month) return;
    if (!monthlyMap[month]) monthlyMap[month] = { amount: 0, count: 0, guests: 0 };
    monthlyMap[month].amount += calculateRevenue(r);
    monthlyMap[month].count += 1;
    monthlyMap[month].guests += r.guest_count || 0;
  });
  const monthlyRevenue = Object.entries(monthlyMap)
    .map(([month, v]) => ({ month, ...v }))
    .sort((a, b) => a.month.localeCompare(b.month));

  // Cumulative guests
  let cumGuests = 0;
  const cumulativeGuests = monthlyRevenue.map((m) => {
    cumGuests += m.guests;
    return { month: m.month, guests: m.guests, cumulative: cumGuests };
  });

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
    yearlyStats,
  });
}
