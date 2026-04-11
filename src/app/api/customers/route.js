export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const purpose = searchParams.get("purpose"); // 쉼표 구분 다중 가능
  const status = searchParams.get("status");
  const q = searchParams.get("q");

  const SB_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
  const SB_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY;

  if (!SB_URL || !SB_KEY) {
    return Response.json({ error: "Supabase 환경변수 미설정 (NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)" }, { status: 500 });
  }

  let url = `${SB_URL}/rest/v1/reservations?select=guest_name,guest_phone,purpose,reservation_date,guest_count,status&order=reservation_date.desc&limit=500`;
  if (purpose && purpose !== "전체") {
    const list = purpose.split(",").map(p => p.trim()).filter(Boolean);
    if (list.length === 1) {
      url += `&purpose=eq.${encodeURIComponent(list[0])}`;
    } else if (list.length > 1) {
      url += `&purpose=in.(${list.map(p => `"${encodeURIComponent(p)}"`).join(",")})`;
    }
  }
  if (status && status !== "전체") url += `&status=eq.${status}`;

  try {
    const res = await fetch(url, {
      headers: { apikey: SB_KEY, Authorization: `Bearer ${SB_KEY}` },
      cache: "no-store",
    });
    if (!res.ok) {
      const errText = await res.text();
      return Response.json({ error: `Supabase ${res.status}: ${errText}` }, { status: 500 });
    }
    const data = await res.json();
    const seen = new Set();
    let unique = [];
    for (const c of data) {
      if (c.guest_phone && !seen.has(c.guest_phone)) {
        seen.add(c.guest_phone);
        unique.push(c);
      }
    }
    if (q) {
      const ql = q.toLowerCase();
      unique = unique.filter(c => (c.guest_name || "").toLowerCase().includes(ql) || (c.guest_phone || "").includes(ql));
    }
    return Response.json({ customers: unique, total: unique.length });
  } catch (e) {
    return Response.json({ error: e.message }, { status: 500 });
  }
}
