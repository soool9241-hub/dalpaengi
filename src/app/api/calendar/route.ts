import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";

// 달력 데이터는 실시간 DB 조회 필요 - 절대 캐시 금지
export const dynamic = "force-dynamic";
export const revalidate = 0;
export const fetchCache = "force-no-store";

export async function GET() {
  // Supabase 기본 1000 row limit 회피 - 명시적으로 넉넉히 설정
  const { data, error } = await supabaseAdmin
    .from("reservations")
    .select("reservation_date, checkout_date, status")
    .neq("status", "cancelled")
    .limit(10000);

  if (error) {
    console.error("Calendar API error:", error);
    // 달력 fetch 실패 시 빈 배열 반환하면 모든 날짜가 예약 가능처럼 보여 중복 위험
    // → 500으로 명시적 실패 반환, 프론트에서 예약 버튼 비활성화 유도
    return NextResponse.json(
      { dates: [], error: error.message },
      {
        status: 500,
        headers: { "Cache-Control": "no-store, no-cache, must-revalidate" },
      }
    );
  }

  return NextResponse.json(
    { dates: data || [] },
    { headers: { "Cache-Control": "no-store, no-cache, must-revalidate" } }
  );
}
