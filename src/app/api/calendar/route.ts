import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";

export async function GET() {
  const { data, error } = await supabaseAdmin
    .from("reservations")
    .select("reservation_date, checkout_date, status")
    .neq("status", "cancelled");

  if (error) {
    console.error("Calendar API error:", error);
    return NextResponse.json({ dates: [] });
  }

  return NextResponse.json({ dates: data || [] });
}
