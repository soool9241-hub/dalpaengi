import { NextRequest, NextResponse } from "next/server";
import { verifyRequest } from "@/lib/admin-auth";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { buildCsv, todayStamp, type CsvCell } from "@/lib/csv";
import { calculateRevenue } from "@/types/admin";
import type { ReservationRow, CustomerRow } from "@/types/admin";

// 고객관리 CSV 내보내기 — 검색 필터 반영, 전체 고객 + 누적매출/BBQ 포함. (관리자 인증 쿠키 필요)
export async function GET(req: NextRequest) {
  if (!(await verifyRequest(req))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const url = req.nextUrl.searchParams;
  const search = url.get("search");
  const sort = url.get("sort") || "last_visit";
  const order = url.get("order") || "desc";

  let query = supabaseAdmin.from("customers").select("*");
  if (search) query = query.or(`name.ilike.%${search}%,phone.ilike.%${search}%`);
  query = query.order(sort, { ascending: order === "asc" });

  const { data, error } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const customers = (data || []) as CustomerRow[];

  // 누적 매출·BBQ 계산 (전체 예약 1회 조회 후 매핑)
  const revMap: Record<number, { revenue: number; bbq: number }> = {};
  if (customers.length > 0) {
    const { data: reservations } = await supabaseAdmin
      .from("reservations")
      .select("customer_id,guest_phone,program_type,stay_nights,guest_count,extra_guests,bbq_count,burner_count,dinner_count,breakfast_count,woodcraft_count,pot_bbq_count,pool_count,bus_fee");
    const byPhone: Record<string, CustomerRow> = {};
    const byId: Record<number, CustomerRow> = {};
    customers.forEach((c) => { byPhone[c.phone] = c; byId[c.id] = c; });
    for (const r of (reservations || []) as (ReservationRow & { customer_id: number | null })[]) {
      const cust = (r.customer_id != null && byId[r.customer_id]) || byPhone[r.guest_phone];
      if (!cust) continue;
      if (!revMap[cust.id]) revMap[cust.id] = { revenue: 0, bbq: 0 };
      revMap[cust.id].revenue += calculateRevenue(r);
      revMap[cust.id].bbq += r.bbq_count || 0;
    }
  }

  const headers = [
    "ID", "이름", "연락처", "방문횟수", "첫방문", "최근방문", "누적동반인원", "누적매출", "누적BBQ", "메모",
  ];
  const csvRows: CsvCell[][] = customers.map((c) => [
    c.id,
    c.name,
    c.phone,
    c.visit_count,
    c.first_visit || "",
    c.last_visit || "",
    c.total_guests_brought || 0,
    revMap[c.id]?.revenue || 0,
    revMap[c.id]?.bbq || 0,
    c.notes || "",
  ]);

  const csv = buildCsv(headers, csvRows);
  const filename = `고객목록_${todayStamp()}.csv`;

  return new NextResponse(csv, {
    status: 200,
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename*=UTF-8''${encodeURIComponent(filename)}`,
      "Cache-Control": "no-store",
    },
  });
}
