import crypto from "crypto";
function generateAuth() {
  const apiKey = process.env.SOLAPI_API_KEY, apiSecret = process.env.SOLAPI_API_SECRET;
  const date = new Date().toISOString(), salt = crypto.randomUUID().replace(/-/g, "").substring(0, 32);
  const signature = crypto.createHmac("sha256", apiSecret).update(date + salt).digest("hex");
  return `HMAC-SHA256 apiKey=${apiKey}, date=${date}, salt=${salt}, signature=${signature}`;
}
export async function POST(request) {
  try {
    const { phones, message } = await request.json();
    if (!phones?.length || !message) return Response.json({ error: "phones, message 필수" }, { status: 400 });
    if (!process.env.SOLAPI_API_KEY) return Response.json({ error: "Solapi 키 미설정" }, { status: 500 });
    const from = process.env.SOLAPI_SENDER || "01085319531";
    const auth = generateAuth();
    const messages = phones.map(to => ({ to, from, text: message }));
    const res = await fetch("https://api.solapi.com/messages/v4/send-many", { method: "POST", headers: { Authorization: auth, "Content-Type": "application/json" }, body: JSON.stringify({ messages }) });
    const data = await res.json();
    if (!res.ok) return Response.json({ error: data.errorMessage || `Solapi ${res.status}` }, { status: 500 });
    return Response.json({ success: true, count: phones.length, result: data });
  } catch (e) { return Response.json({ error: e.message }, { status: 500 }); }
}
