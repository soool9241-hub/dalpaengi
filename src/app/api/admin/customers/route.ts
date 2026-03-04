import { NextRequest, NextResponse } from "next/server";
import { verifyRequest } from "@/lib/admin-auth";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { calculateRevenue } from "@/types/admin";
import type { ReservationRow } from "@/types/admin";

export async function GET(req: NextRequest) {
  if (!(await verifyRequest(req))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const url = req.nextUrl.searchParams;
  const search = url.get("search");
  const sort = url.get("sort") || "last_visit";
  const order = url.get("order") || "desc";
  const page = parseInt(url.get("page") || "0");
  const pageSize = 20;
  const id = url.get("id");

  // Single customer with reservations
  if (id) {
    const { data: customer } = await supabaseAdmin.from("customers").select("*").eq("id", id).single();
    if (!customer) return NextResponse.json({ error: "Not found" }, { status: 404 });

    const { data: reservations } = await supabaseAdmin
      .from("reservations")
      .select("*")
      .or(`guest_phone.eq.${customer.phone},customer_id.eq.${customer.id}`)
      .order("reservation_date", { ascending: false });

    const revs = (reservations || []) as ReservationRow[];
    const totalRevenue = revs.reduce((sum, r) => sum + calculateRevenue(r), 0);
    const totalBbq = revs.reduce((sum, r) => sum + (r.bbq_count || 0), 0);
    const totalBurner = revs.reduce((sum, r) => sum + (r.burner_count || 0), 0);
    const totalDinner = revs.reduce((sum, r) => sum + (r.dinner_count || 0), 0);
    const totalWoodcraft = revs.reduce((sum, r) => sum + (r.woodcraft_count || 0), 0);
    const totalPotBbq = revs.reduce((sum, r) => sum + (r.pot_bbq_count || 0), 0);

    return NextResponse.json({
      customer,
      reservations: revs,
      stats: { totalRevenue, totalBbq, totalBurner, totalDinner, totalWoodcraft, totalPotBbq },
    });
  }

  // Customer list
  let query = supabaseAdmin.from("customers").select("*", { count: "exact" });

  if (search) query = query.or(`name.ilike.%${search}%,phone.ilike.%${search}%`);
  query = query.order(sort, { ascending: order === "asc" }).range(page * pageSize, (page + 1) * pageSize - 1);

  const { data, count, error } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const customers = data || [];

  // Fetch reservations for these customers to calculate revenue
  if (customers.length > 0) {
    const phones = customers.map((c) => c.phone);
    const ids = customers.map((c) => c.id);

    const orClauses = [
      ...ids.map((id: number) => `customer_id.eq.${id}`),
      ...phones.map((p: string) => `guest_phone.eq.${p}`),
    ];

    const { data: reservations } = await supabaseAdmin
      .from("reservations")
      .select("customer_id,guest_phone,program_type,stay_nights,extra_guests,bbq_count,burner_count,dinner_count,woodcraft_count,pot_bbq_count")
      .or(orClauses.join(","));

    const revMap: Record<number, { revenue: number; bbq: number; options: string[] }> = {};
    for (const r of (reservations || []) as ReservationRow[]) {
      const cust = customers.find(
        (c) => c.id === r.customer_id || c.phone === r.guest_phone
      );
      if (!cust) continue;
      if (!revMap[cust.id]) revMap[cust.id] = { revenue: 0, bbq: 0, options: [] };
      revMap[cust.id].revenue += calculateRevenue(r);
      revMap[cust.id].bbq += r.bbq_count || 0;
    }

    const enriched = customers.map((c) => ({
      ...c,
      total_revenue: revMap[c.id]?.revenue || 0,
      total_bbq: revMap[c.id]?.bbq || 0,
    }));

    return NextResponse.json({ data: enriched, total: count || 0, page, pageSize });
  }

  return NextResponse.json({ data: customers, total: count || 0, page, pageSize });
}
