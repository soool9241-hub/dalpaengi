import { NextRequest, NextResponse } from "next/server";
import { verifyRequest } from "@/lib/admin-auth";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { buildCsv, todayStamp, type CsvCell } from "@/lib/csv";
import { PROGRAM_LABELS, STATUS_LABELS, calculateRevenue } from "@/types/admin";
import type { ReservationRow } from "@/types/admin";

// 예약관리 CSV 내보내기 — 현재 필터(status/program/from/to/search)를 그대로 반영하되
// 페이지네이션 없이 전체 매칭 건을 내보낸다. (관리자 인증 쿠키 필요)
export async function GET(req: NextRequest) {
  if (!(await verifyRequest(req))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const url = req.nextUrl.searchParams;
  const status = url.get("status");
  const program = url.get("program");
  const from = url.get("from");
  const to = url.get("to");
  const search = url.get("search");
  const sort = url.get("sort") || "reservation_date";
  const order = url.get("order") || "desc";

  let query = supabaseAdmin.from("reservations").select("*");
  if (status && status !== "all") query = query.eq("status", status);
  if (program && program !== "all") query = query.eq("program_type", program);
  if (from) query = query.gte("reservation_date", from);
  if (to) query = query.lte("reservation_date", to);
  if (search) query = query.or(`guest_name.ilike.%${search}%,guest_phone.ilike.%${search}%`);
  query = query.order(sort, { ascending: order === "asc" });

  const { data, error } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const rows = (data || []) as ReservationRow[];

  const headers = [
    "ID", "상태", "예약자", "연락처", "프로그램", "입실일", "퇴실일", "박수", "시간대",
    "인원", "추가인원", "BBQ그릴", "가스버너", "저녁식사", "조식인원", "조식메뉴",
    "미니수영장", "목공", "항아리BBQ", "버스요청", "버스비", "총액", "목적", "유입경로", "메모", "접수일",
  ];

  const csvRows: CsvCell[][] = rows.map((r) => [
    r.id,
    STATUS_LABELS[r.status] || r.status,
    r.guest_name,
    r.guest_phone,
    PROGRAM_LABELS[r.program_type] || r.program_type,
    r.reservation_date,
    r.checkout_date || "",
    r.stay_nights,
    r.time_slot || "",
    r.guest_count,
    r.extra_guests || 0,
    r.bbq_count || 0,
    r.burner_count || 0,
    r.dinner_count || 0,
    r.breakfast_count || 0,
    r.breakfast_menu || "",
    r.pool_count || 0,
    r.woodcraft_count || 0,
    r.pot_bbq_count || 0,
    r.bus_requested ? "요청" : "",
    r.bus_fee || 0,
    r.total_amount ?? calculateRevenue(r),
    r.purpose || r.purpose_raw || "",
    r.referral_source || "",
    r.notes || "",
    r.submitted_at ? String(r.submitted_at).substring(0, 10) : "",
  ]);

  const csv = buildCsv(headers, csvRows);
  const filename = `예약목록_${status && status !== "all" ? status + "_" : ""}${todayStamp()}.csv`;

  return new NextResponse(csv, {
    status: 200,
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename*=UTF-8''${encodeURIComponent(filename)}`,
      "Cache-Control": "no-store",
    },
  });
}
