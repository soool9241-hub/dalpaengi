import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { SolapiMessageService } from "solapi";

const messageService = new SolapiMessageService(
  (process.env.SOLAPI_API_KEY || "").trim(),
  (process.env.SOLAPI_API_SECRET || "").trim()
);
const SENDER = (process.env.SOLAPI_SENDER || "").trim();

// 관리자 번호
const ADMIN_SOL = "01085319531";    // 홈페이지 관리자 임솔
const ADMIN_SEJIN = "01053140146";  // 리트릿 운영자 임세진

// 프로그램 목록 정의 (향후 프로그램 추가 시 여기에 추가)
const PROGRAMS: Record<string, { label: string; maxCapacity: number }> = {
  "spring-retreat-2026": { label: "완주하다 봄 리트릿 2026", maxCapacity: 20 },
  "vibe-coding-basic": { label: "바이브코딩 워크숍 기초반", maxCapacity: 20 },
};

// 프로그램 식별자에 따라 테이블명 결정
function getTableName(program?: string | null): string {
  if (program && program.startsWith("vibe-coding")) return "vibecoding_applications";
  return "retreat_applications";
}

// GET: 프로그램별 신청자 목록 조회
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const program = searchParams.get("program"); // 특정 프로그램 필터 (목록용)
  const search = searchParams.get("search") || "";

  // 통계는 항상 두 테이블 모두에서 집계
  const tablesForStats = ["retreat_applications", "vibecoding_applications"];
  const allRowsForStats: { program: string; status: string }[] = [];
  for (const t of tablesForStats) {
    const { data: rows } = await supabaseAdmin.from(t).select("program, status");
    if (rows) allRowsForStats.push(...rows);
  }

  // 목록은 선택된 program 또는 전체
  const listTable = program ? getTableName(program) : null;
  let data: Record<string, unknown>[] = [];

  if (listTable) {
    // 특정 프로그램만 조회
    let query = supabaseAdmin
      .from(listTable)
      .select("*")
      .eq("program", program!)
      .order("created_at", { ascending: false });
    if (search) {
      query = query.or(`name.ilike.%${search}%,phone.ilike.%${search}%`);
    }
    const { data: rows, error } = await query;
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    data = rows || [];
  } else {
    // 전체 조회: 두 테이블 병합
    for (const t of tablesForStats) {
      let query = supabaseAdmin.from(t).select("*").order("created_at", { ascending: false });
      if (search) {
        query = query.or(`name.ilike.%${search}%,phone.ilike.%${search}%`);
      }
      const { data: rows } = await query;
      if (rows) data.push(...rows);
    }
    // 최신순 정렬
    data.sort((a, b) => new Date(String(b.created_at)).getTime() - new Date(String(a.created_at)).getTime());
  }

  // 프로그램별 통계 (두 테이블 합산)
  // total = pending + confirmed만 포함 (취소/대기자는 정원 카운트에서 제외)
  const stats: Record<string, { total: number; pending: number; confirmed: number; waitlist: number; cancelled: number }> = {};
  for (const row of allRowsForStats) {
    if (!stats[row.program]) {
      stats[row.program] = { total: 0, pending: 0, confirmed: 0, waitlist: 0, cancelled: 0 };
    }
    if (row.status === "pending") { stats[row.program].pending++; stats[row.program].total++; }
    else if (row.status === "confirmed") { stats[row.program].confirmed++; stats[row.program].total++; }
    else if (row.status === "waitlist") stats[row.program].waitlist++;
    else if (row.status === "cancelled") stats[row.program].cancelled++;
  }

  return NextResponse.json({ data, stats, programs: PROGRAMS });
}

// POST: 수동 신청자 추가
export async function POST(req: NextRequest) {
  const body = await req.json();
  const { name, phone, program, status } = body;
  const tableName = getTableName(program);

  if (!name || !phone) {
    return NextResponse.json({ error: "이름과 연락처는 필수입니다." }, { status: 400 });
  }

  let insertData: Record<string, unknown>;

  if (tableName === "vibecoding_applications") {
    const { age, occupation, idea, course, experience, how_found, preferred_date } = body;
    insertData = {
      name,
      phone,
      age: age || null,
      occupation: occupation || null,
      idea: idea || null,
      course: course || "A",
      experience: experience || null,
      how_found: how_found || null,
      preferred_date: preferred_date || null,
      program: program || "vibe-coding-basic",
      status: status || "confirmed",
    };
  } else {
    const { age, gender, occupation, reason, region, transport, photoConsent } = body;
    insertData = {
      name,
      phone,
      age: age || null,
      gender: gender || null,
      occupation: occupation || null,
      reason: reason || null,
      region: region || null,
      transport: transport || null,
      ...(photoConsent !== undefined ? { photo_consent: photoConsent } : {}),
      program: program || "spring-retreat-2026",
      status: status || "confirmed",
    };
  }

  const { error } = await supabaseAdmin
    .from(tableName)
    .insert(insertData);

  if (error) {
    return NextResponse.json({ error: "추가 실패: " + error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}

// PATCH: 신청자 상태 변경
export async function PATCH(req: NextRequest) {
  const body = await req.json();
  const { id, status, memo, program } = body;
  const tableName = getTableName(program);

  if (!id) {
    return NextResponse.json({ error: "id가 필요합니다." }, { status: 400 });
  }

  // 상태 변경 전 신청자 정보 조회 (SMS용)
  const { data: appData } = await supabaseAdmin
    .from(tableName)
    .select("*")
    .eq("id", id)
    .single();

  const updateData: Record<string, string> = {};
  if (status) updateData.status = status;
  if (memo !== undefined) updateData.memo = memo;

  const { error } = await supabaseAdmin
    .from(tableName)
    .update(updateData)
    .eq("id", id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // 대기자 → 정식 신청(pending)으로 전환 시: 자리 열림 안내 문자
  if (status === "pending" && appData?.status === "waitlist" && appData?.phone && tableName === "retreat_applications") {
    try {
      const phone = appData.phone.replace(/[^0-9]/g, "");
      const msg = `안녕하세요, ${appData.name}님! 🌸

대기해주셔서 감사합니다.
완주하다 봄 리트릿에 자리가 생겼습니다!

━━━━━━━━━━━━
✨ 정식 신청자로 전환되었습니다
━━━━━━━━━━━━

■ 프로그램: 완주하다 봄 리트릿
■ 일시: 2026.4.18(토) ~ 19(일) 1박2일
■ 장소: 전북 완주군 해월신왕길 92
■ 참가비: 50,000원 (얼리버드)

입금계좌: 우리은행 1002-938-937713 임세진
※ 입금 확인 후 최종 확정됩니다.

자리가 생겼으니 빠른 입금 부탁드려요!
감사합니다 :)

문의: 010-5314-0146`;

      await messageService.sendOne({
        to: phone, from: SENDER, text: msg, type: "LMS", subject: "봄 리트릿 자리 열림 안내"
      });
    } catch (smsErr) {
      console.error("자리 열림 SMS 발송 실패:", smsErr);
    }
  }

  // 취소 처리 시 신청자/관리자에게 안내 문자
  if (status === "cancelled" && appData?.status !== "cancelled" && appData?.phone && tableName === "retreat_applications") {
    try {
      const phone = appData.phone.replace(/[^0-9]/g, "");

      // 1) 신청자 안내
      const applicantMsg = `안녕하세요, ${appData.name}님.

완주하다 봄 리트릿 신청이
취소 처리되었습니다.

━━━━━━━━━━━━
❎ 신청 취소 완료
━━━━━━━━━━━━

• 입금하신 금액이 있다면
  영업일 기준 2~3일 내 환불됩니다.
• 다음 회차에도 관심 부탁드려요!

문의: 010-5314-0146
감사합니다 :)`;

      // 2) 관리자 알림 (취소 + 현재 인원)
      const { count: activeCount } = await supabaseAdmin
        .from("retreat_applications")
        .select("*", { count: "exact", head: true })
        .in("status", ["pending", "confirmed"]);

      const { count: wlCount } = await supabaseAdmin
        .from("retreat_applications")
        .select("*", { count: "exact", head: true })
        .eq("status", "waitlist");

      const adminMsg = `[봄 리트릿 취소 처리]

■ 이름: ${appData.name}
■ 연락처: ${appData.phone}
■ 이전상태: ${appData.status}

━━━━━━━━━━━━
현재 ${activeCount || 0}/20명
대기자 ${wlCount || 0}명
━━━━━━━━━━━━

※ 대기자가 있다면 순번대로
관리자 페이지에서 "pending"으로
변경 시 자동 안내 문자가 발송됩니다.`;

      await Promise.allSettled([
        messageService.sendOne({ to: phone, from: SENDER, text: applicantMsg, type: "LMS", subject: "봄 리트릿 신청 취소 안내" }),
        messageService.sendOne({ to: ADMIN_SOL, from: SENDER, text: adminMsg, type: "LMS", subject: "봄 리트릿 취소 처리" }),
        messageService.sendOne({ to: ADMIN_SEJIN, from: SENDER, text: adminMsg, type: "LMS", subject: "봄 리트릿 취소 처리" }),
      ]);
    } catch (smsErr) {
      console.error("취소 SMS 발송 실패:", smsErr);
    }
  }

  // 확정 시 신청자에게 확정 문자 발송
  if (status === "confirmed" && appData?.phone) {
    try {
      const phone = appData.phone.replace(/[^0-9]/g, "");

      if (tableName === "vibecoding_applications") {
        // 바이브코딩 워크숍 확정 문자 (입금 완료)
        const msg = `안녕하세요, ${appData.name}님!
바이브코딩 워크숍 참가가 최종 확정되었습니다 🎉

■ 프로그램: 바이브코딩 워크숍 (6시간)
■ 장소: 달팽이아지트펜션 (전북 완주군 소양면 해월신왕길 92)
■ 참가비: 290,000원 (입금 확인 완료 ✅)

━━ 📋 안내사항 ━━
• 워크숍 전 1:1 원격 세팅 일정을 곧 안내드립니다.
• 노트북만 준비해오시면 됩니다 (프로그래밍 경험 無 OK).
• 워크숍 당일 점심/간식은 제공됩니다.

기대하셔도 좋아요! 당일 뵙겠습니다 🙌

문의: 010-8531-9531 (임솔)
감사합니다 :)`;

        await messageService.sendOne({
          to: phone, from: SENDER, text: msg, type: "LMS", subject: "바이브코딩 워크숍 참가 확정"
        });
      } else {
        // 리트릿 확정 문자
        const transport = appData.transport || "";
        let gatherInfo = "";
        if (transport === "전주고속터미널") {
          gatherInfo = `\n■ 집결: 전주고속터미널 13:30 (카니발 차량 픽업)`;
        } else if (transport === "전주역") {
          gatherInfo = `\n■ 집결: 전주역 14:00 (카니발 차량 픽업)`;
        } else if (transport === "자차") {
          gatherInfo = `\n■ 이동: 자차 14:30 집결 (전북 완주군 소양면 해월신왕길 92)`;
        }

        const msg = `안녕하세요, ${appData.name}님!
완주하다 봄 리트릿 참가가 확정되었습니다.

■ 프로그램: 완주하다 봄 리트릿
■ 일시: 2026.4.18(토) ~ 19(일) 1박2일
■ 장소: 달팽이아지트펜션 (전북 완주군 소양면 해월신왕길 92)${gatherInfo}

입금이 확인되어 참가가 최종 확정되었습니다.
당일 현장에서 뵙겠습니다!

문의: 010-5314-0146
감사합니다 :)`;

        await messageService.sendOne({
          to: phone, from: SENDER, text: msg, type: "LMS", subject: "봄 리트릿 참가 확정"
        });
      }
    } catch (smsErr) {
      console.error("확정 SMS 발송 실패:", smsErr);
    }
  }

  return NextResponse.json({ success: true });
}

// DELETE: 신청자 삭제
export async function DELETE(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  const program = searchParams.get("program");
  const tableName = getTableName(program);

  if (!id) {
    return NextResponse.json({ error: "id가 필요합니다." }, { status: 400 });
  }

  const { error } = await supabaseAdmin
    .from(tableName)
    .delete()
    .eq("id", Number(id));

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
