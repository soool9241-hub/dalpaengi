import { NextRequest, NextResponse } from "next/server";
import { verifyRequest } from "@/lib/admin-auth";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { calculateRevenue, ReservationRow } from "@/types/admin";

function getDateStr(d: Date): string {
  return d.toISOString().split("T")[0];
}

function getWeekRange(): [string, string] {
  const now = new Date();
  const day = now.getDay();
  const start = new Date(now);
  start.setDate(now.getDate() - day);
  const end = new Date(start);
  end.setDate(start.getDate() + 6);
  return [getDateStr(start), getDateStr(end)];
}

function getMonthRange(offset = 0): [string, string] {
  const now = new Date();
  const start = new Date(now.getFullYear(), now.getMonth() + offset, 1);
  const end = new Date(now.getFullYear(), now.getMonth() + offset + 1, 0);
  return [getDateStr(start), getDateStr(end)];
}

export async function GET(req: NextRequest) {
  try {
    if (!(await verifyRequest(req))) {
      return NextResponse.json({ error: "인증이 필요합니다. 다시 로그인해주세요." }, { status: 401 });
    }

    const recentDays = parseInt(req.nextUrl.searchParams.get("recentDays") || "7");
    const now = new Date();
    const today = getDateStr(now);
    const recentAgo = new Date(now);
    recentAgo.setDate(now.getDate() - recentDays);
    const recentFrom = recentAgo.toISOString();
    const [weekStart, weekEnd] = getWeekRange();
    const [monthStart, monthEnd] = getMonthRange(0);
    const [prevMonthStart, prevMonthEnd] = getMonthRange(-1);

    const results = await Promise.allSettled([
      supabaseAdmin.from("reservations").select("guest_count").eq("reservation_date", today).eq("status", "confirmed"),
      supabaseAdmin.from("reservations").select("id", { count: "exact" }).gte("reservation_date", weekStart).lte("reservation_date", weekEnd).eq("status", "confirmed"),
      supabaseAdmin.from("reservations").select("id", { count: "exact" }).gte("reservation_date", monthStart).lte("reservation_date", monthEnd).eq("status", "confirmed"),
      supabaseAdmin.from("reservations").select("id", { count: "exact" }).gte("reservation_date", prevMonthStart).lte("reservation_date", prevMonthEnd).eq("status", "confirmed"),
      supabaseAdmin.from("reservations").select("*").gte("created_at", recentFrom).order("created_at", { ascending: false }),
      supabaseAdmin.from("reservations").select("*").gte("reservation_date", today).eq("status", "confirmed").order("reservation_date", { ascending: true }).limit(5),
      supabaseAdmin.from("reservations").select("*").gte("reservation_date", monthStart).lte("reservation_date", monthEnd).eq("status", "confirmed"),
      supabaseAdmin.from("reservations").select("*").gte("reservation_date", prevMonthStart).lte("reservation_date", prevMonthEnd).eq("status", "confirmed"),
      supabaseAdmin.from("reservations").select("program_type").gte("reservation_date", monthStart).lte("reservation_date", monthEnd).eq("status", "confirmed"),
    ]);

    const safe = <T,>(i: number, fallback: T): T => {
      const r = results[i];
      if (r.status === "fulfilled") return r.value as T;
      return fallback;
    };

    const todayRes = safe(0, { data: [], count: 0 });
    const weekRes = safe(1, { data: [], count: 0 });
    const monthRes = safe(2, { data: [], count: 0 });
    const prevMonthRes = safe(3, { data: [], count: 0 });
    const recentRes = safe(4, { data: [] });
    const upcomingRes = safe(5, { data: [] });
    const monthAllRes = safe(6, { data: [] });
    const prevMonthAllRes = safe(7, { data: [] });
    const programRes = safe(8, { data: [] });

    const todayData = todayRes.data || [];
    const monthAllData = (monthAllRes.data || []) as ReservationRow[];
    const prevMonthAllData = (prevMonthAllRes.data || []) as ReservationRow[];

    const monthRevenue = monthAllData.reduce((sum, r) => sum + calculateRevenue(r), 0);
    const prevMonthRevenue = prevMonthAllData.reduce((sum, r) => sum + calculateRevenue(r), 0);

    // Weekly revenue (last 7 days)
    const weeklyRevenue: { date: string; amount: number }[] = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const ds = getDateStr(d);
      const dayRevenue = monthAllData
        .filter((r) => r.reservation_date === ds)
        .reduce((sum, r) => sum + calculateRevenue(r), 0);
      weeklyRevenue.push({ date: ds, amount: dayRevenue });
    }

    // Program distribution
    const programCounts: Record<string, number> = {};
    (programRes.data || []).forEach((r: { program_type: string }) => {
      programCounts[r.program_type] = (programCounts[r.program_type] || 0) + 1;
    });
    const programDistribution = Object.entries(programCounts).map(([type, count]) => ({ type, count }));

    return NextResponse.json({
      todayCheckins: {
        count: todayData.length,
        totalGuests: todayData.reduce((sum: number, r: { guest_count: number }) => sum + (r.guest_count || 0), 0),
      },
      weekReservations: weekRes.count || 0,
      monthReservations: { count: monthRes.count || 0, prevMonthCount: prevMonthRes.count || 0 },
      monthRevenue: { amount: monthRevenue, prevMonthAmount: prevMonthRevenue },
      recentReservations: recentRes.data || [],
      upcomingCheckins: upcomingRes.data || [],
      weeklyRevenue,
      programDistribution,
    });
  } catch (e) {
    console.error("Dashboard API error:", e);
    return NextResponse.json(
      { error: "서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요." },
      { status: 500 }
    );
  }
}
