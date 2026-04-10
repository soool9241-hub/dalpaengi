export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const purpose = searchParams.get("purpose");
  const status = searchParams.get("status");
  const q = searchParams.get("q");
  const SB_URL = process.env.SUPABASE_URL;
  const SB_KEY = process.env.SUPABASE_SERVICE_KEY;
  let url = `${SB_URL}/rest/v1/reservations?select=guest_name,guest_phone,purpose,reservation_date,guest_count,status&order=reservation_date.desc&limit=500`;
  if (purpose && purpose !== "전체") url += `&purpose=eq.${encodeURIComponent(purpose)}`;
  if (status && status !== "전체") url += `&status=eq.${status}`;
  try {
    const res = await fetch(url, { headers: { apikey: SB_KEY, Authorization: `Bearer ${SB_KEY}` }, cache: "no-store" });
    if (!res.ok) return Response.json({ error: `Supabase ${res.status}` }, { status: 500 });
    const data = await res.json();
    const seen = new Set();
    let unique = [];
    for (const c of data) { if (c.guest_phone && !seen.has(c.guest_phone)) { seen.add(c.guest_phone); unique.push(c); } }
    if (q) { const ql = q.toLowerCase(); unique = unique.filter(c => c.guest_name.toLowerCase().includes(ql) || c.guest_phone.includes(ql)); }
    return Response.json({ customers: unique, total: unique.length });
  } catch (e) { return Response.json({ error: e.message }, { status: 500 }); }
}
