import { NextRequest, NextResponse } from "next/server";
import { SolapiMessageService } from "solapi";
import { supabaseAdmin } from "@/lib/supabase-admin";

/* 완주 로컬 체험 투어 — 출발 7일 전 인원 마감 판정
 *
 * 10명 미만으로 신청한 합류 대기자(status=waitlist)는 같은 날짜·같은 상품끼리 묶인다.
 * 출발 7일 전 시점에 그 묶음이 10명을 채웠는지 보고 확정 또는 취소로 정리한다.
 * 사람이 매일 세고 있을 수 없고, 여행객 입장에서도 임박해서 취소 통보를 받으면
 * 일정을 다시 짤 시간이 없기 때문에 7일이라는 여유를 둔다.
 *
 * Vercel Cron: 매일 00:00 UTC = KST 09:00
 * Trigger: GET /api/cron/hanok-departure-check (CRON_SECRET 인증)
 */

const messageService = new SolapiMessageService(
  (process.env.SOLAPI_API_KEY || "").trim(),
  (process.env.SOLAPI_API_SECRET || "").trim()
);
const SENDER = (process.env.SOLAPI_SENDER || "").trim();
const ADMIN_SOL = "01085319531";

const TABLE = "hanok_tour_bookings";
const GROUP_MIN = 10;
const CUTOFF_DAYS = 7;

const COURSE_KO: Record<string, string> = {
  A: "내 손으로 만드는 한국 밥상",
  B: "완주 로컬 하루",
  C: "손으로 빚는 한국의 다과",
  D: "전주 소리 집중 힐링",
};
const COURSE_EN: Record<string, string> = {
  A: "Make Your Own Korean Table",
  B: "Wanju Slow Day",
  C: "Make Korean Tea Sweets",
  D: "A Day of Korean Sound",
};

interface Booking {
  id: number;
  name: string;
  phone: string | null;
  language: string | null;
  course: string;
  party_size: number;
  preferred_date: string;
  status: string;
}

// KST 기준 오늘로부터 n일 뒤 날짜를 YYYY-MM-DD 로 만든다.
// 서버가 UTC 라 그냥 계산하면 한국 날짜와 하루 어긋난다.
function kstDatePlus(days: number) {
  const kstNow = new Date(Date.now() + 9 * 60 * 60 * 1000);
  kstNow.setUTCDate(kstNow.getUTCDate() + days);
  return kstNow.toISOString().slice(0, 10);
}

// 국내 휴대폰에만 문자를 보낸다. 해외 연락처는 솔이 이메일·메신저로 안내한다.
function koreanMobile(phone: string | null) {
  if (!phone) return null;
  const d = phone.replace(/[^0-9]/g, "");
  return d.length === 11 && d.startsWith("010") ? d : null;
}

export async function GET(req: NextRequest) {
  const auth = req.headers.get("authorization");
  if (auth !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const target = kstDatePlus(CUTOFF_DAYS);

  const { data, error } = await supabaseAdmin
    .from(TABLE)
    .select("id, name, phone, language, course, party_size, preferred_date, status")
    .eq("preferred_date", target)
    .in("status", ["waitlist", "pending"]);

  if (error) {
    console.error("[hanok-cron] 조회 실패:", error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const rows = (data || []) as Booking[];
  if (rows.length === 0) {
    return NextResponse.json({ ok: true, target, groups: 0, message: "해당 날짜 신청 없음" });
  }

  // 같은 날짜 안에서도 상품이 다르면 다른 차량·다른 협력처라 따로 센다.
  const byCourse = new Map<string, Booking[]>();
  for (const r of rows) {
    const list = byCourse.get(r.course) || [];
    list.push(r);
    byCourse.set(r.course, list);
  }

  const summary: { course: string; total: number; confirmed: boolean; count: number }[] = [];
  const tasks: Promise<unknown>[] = [];

  for (const [course, list] of byCourse) {
    const total = list.reduce((a, b) => a + (b.party_size || 0), 0);
    const filled = total >= GROUP_MIN;
    summary.push({ course, total, confirmed: filled, count: list.length });

    // 이미 확정(pending)인 건은 그대로 두고, 합류 대기만 상태를 옮긴다.
    const waiting = list.filter((r) => r.status === "waitlist");
    if (waiting.length === 0) continue;

    const ids = waiting.map((r) => r.id);
    await supabaseAdmin
      .from(TABLE)
      .update({ status: filled ? "pending" : "cancelled" })
      .in("id", ids);

    for (const r of waiting) {
      const to = koreanMobile(r.phone);
      if (!to) continue;
      const isKo = r.language !== "en";
      const nameKo = COURSE_KO[course] || course;
      const nameEn = COURSE_EN[course] || course;

      const msg = filled
        ? isKo
          ? `안녕하세요, ${r.name}님!
완주 로컬 체험 투어 출발이 확정되었습니다 🏯

■ 상품: ${nameKo}
■ 일시: ${target} 12:00 집결
■ 집결: 전주 한옥마을

인원이 모여 예정대로 출발합니다.
결제 안내를 곧 따로 보내드릴게요.

문의: 010-8531-9531 (임솔)`
          : `Hello ${r.name}!
Your Wanju local experience is confirmed 🏯

■ Course: ${nameEn}
■ Date: ${target}, meet at 12:00
■ Meeting point: Jeonju Hanok Village

The group has filled and the tour will run.
Payment details will follow shortly.

Contact: +82 10-8531-9531 (Sol)`
        : isKo
        ? `안녕하세요, ${r.name}님.

${target} 완주 로컬 체험 투어는
아쉽게도 최소 인원 ${GROUP_MIN}명이 모이지 않아
진행이 어렵게 되었습니다.

■ 상품: ${nameKo}
■ 일시: ${target}

결제하신 금액은 없으니 따로
처리하실 것은 없습니다.

다른 날짜로 다시 안내드릴 수 있으니
편하게 연락 주세요.

문의: 010-8531-9531 (임솔)
관심 가져주셔서 감사합니다.`
        : `Hello ${r.name},

Unfortunately the tour on ${target} will not run —
we did not reach the minimum of ${GROUP_MIN} travellers.

■ Course: ${nameEn}
■ Date: ${target}

No payment was taken, so there is nothing
for you to do.

We would be glad to suggest another date.
Just reply to this message.

Contact: +82 10-8531-9531 (Sol)
Thank you for your interest.`;

      tasks.push(
        messageService.sendOne({
          to, from: SENDER, text: msg, type: "LMS",
          subject: filled
            ? isKo ? "완주 체험투어 출발 확정" : "Wanju Local Tour - Confirmed"
            : isKo ? "완주 체험투어 진행 안내" : "Wanju Local Tour - Not Running",
        })
      );
    }
  }

  // 관리자 요약 — 확정된 건은 차량·협력처를 잡아야 하므로 반드시 알린다.
  const adminMsg = `[한옥투어 D-${CUTOFF_DAYS} 마감 판정]

■ 출발일: ${target}

${summary
  .map(
    (s) =>
      `${s.confirmed ? "✅" : "❌"} ${s.course}. ${COURSE_KO[s.course] || s.course}\n   ${s.total}명 (신청 ${s.count}건) → ${s.confirmed ? "출발 확정" : `취소 (${GROUP_MIN}명 미달)`}`
  )
  .join("\n")}

${summary.some((s) => s.confirmed) ? "▶ 확정 건은 차량·협력처 예약 확인 필요" : "▶ 확정된 출발 없음"}`;

  tasks.push(
    messageService.sendOne({
      to: ADMIN_SOL, from: SENDER, text: adminMsg, type: "LMS", subject: "한옥투어 마감 판정",
    })
  );

  await Promise.allSettled(tasks);

  console.log("[hanok-cron] 마감 판정:", target, JSON.stringify(summary));

  return NextResponse.json({ ok: true, target, cutoffDays: CUTOFF_DAYS, groupMin: GROUP_MIN, summary });
}
