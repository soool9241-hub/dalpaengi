import { NextRequest, NextResponse } from "next/server";
import { verifyRequest } from "@/lib/admin-auth";
import { supabaseAdmin } from "@/lib/supabase-admin";

export async function GET(req: NextRequest) {
  if (!(await verifyRequest(req))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const url = req.nextUrl.searchParams;
  const search = url.get("search");
  const sort = url.get("sort") || "visit_count";
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

    return NextResponse.json({ customer, reservations: reservations || [] });
  }

  // Customer list
  let query = supabaseAdmin.from("customers").select("*", { count: "exact" });

  if (search) query = query.or(`name.ilike.%${search}%,phone.ilike.%${search}%`);
  query = query.order(sort, { ascending: order === "asc" }).range(page * pageSize, (page + 1) * pageSize - 1);

  const { data, count, error } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ data: data || [], total: count || 0, page, pageSize });
}
