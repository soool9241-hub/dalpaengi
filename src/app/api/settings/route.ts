import { NextRequest, NextResponse } from "next/server";
import { verifyRequest } from "@/lib/admin-auth";
import { supabase } from "@/lib/supabase";
import { getSupabaseAdmin } from "@/lib/supabase-admin";

export async function GET() {
  const { data, error } = await supabase
    .from("site_settings")
    .select("key, value");

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const settings: Record<string, unknown> = {};
  data?.forEach((row: { key: string; value: unknown }) => {
    settings[row.key] = row.value;
  });

  return NextResponse.json(settings);
}

export async function PUT(req: NextRequest) {
  if (!(await verifyRequest(req))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const admin = getSupabaseAdmin();

  const updates = Object.entries(body).map(([key, value]) =>
    admin
      .from("site_settings")
      .upsert({ key, value, updated_at: new Date().toISOString() }, { onConflict: "key" })
  );

  const results = await Promise.all(updates);
  const errors = results.filter((r) => r.error);

  if (errors.length > 0) {
    return NextResponse.json(
      { error: errors.map((e) => e.error?.message).join(", ") },
      { status: 500 }
    );
  }

  return NextResponse.json({ success: true });
}
