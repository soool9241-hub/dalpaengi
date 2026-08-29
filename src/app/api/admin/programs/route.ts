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
  "soundwalk-2026": { label: "달팽이 소리산책 리트릿 2026", maxCapacity: 20 },
  // 항아리 바베큐는 월 1회 정기 모임이라 회차마다 키가 하나씩 늘어난다.
  "bbq-2026-09-1": { label: "항아리 바베큐 모임 (9월 1회차)", maxCapacity: 30 },
  // 프라이빗 멤버십은 월 1기수 오픈이라 기수마다 키가 하나씩 늘어난다.
  "membership-2026-10": { label: "달팽이 프라이빗 멤버십 1기 (10월)", maxCapacity: 20 },
};

// 프로그램 식별자에 따라 테이블명 결정
function getTableName(program?: string | null): string {
  if (program && program.startsWith("vibe-coding")) return "vibecoding_applications";
  if (program && program.startsWith("soundwalk")) return "soundwalk_applications";
  if (program && program.startsWith("bbq")) return "bbq_applications";
  if (program && program.startsWith("membership")) return "membership_applications";
  return "retreat_applications";
}

// GET: 프로그램별 신청자 목록 조회
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const program = searchParams.get("program"); // 특정 프로그램 필터 (목록용)
  const search = searchParams.get("search") || "";

  // 통계는 항상 모든 신청 테이블에서 집계
  const tablesForStats = ["retreat_applications", "vibecoding_applications", "soundwalk_applications", "bbq_applications", "membership_applications"];
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

  // [소리산책] 대기자 → 정식 신청(pending) 전환 시: 자리 열림 안내 문자
  if (status === "pending" && appData?.status === "waitlist" && appData?.phone && tableName === "soundwalk_applications") {
    try {
      const phone = appData.phone.replace(/[^0-9]/g, "");
      const msg = `안녕하세요, ${appData.name}님! 🎵

대기해주셔서 감사합니다.
달팽이 소리산책 리트릿에 자리가 생겼습니다!

━━━━━━━━━━━━
✨ 정식 신청자로 전환되었습니다
━━━━━━━━━━━━

■ 프로그램: 달팽이 소리산책 리트릿
■ 일시: 2026.9.6(일) 12:00~18:00
■ 장소: 전북 완주군 소양면 해월신왕길 92
■ 참가비: 99,000원

입금계좌: 카카오뱅크 3333-06-4749542 임솔
※ 입금 확인 후 최종 확정됩니다.

자리가 생겼으니 빠른 입금 부탁드려요!

문의: 010-8531-9531 (임솔)
감사합니다 :)`;

      await messageService.sendOne({
        to: phone, from: SENDER, text: msg, type: "LMS", subject: "소리산책 자리 열림 안내"
      });
    } catch (smsErr) {
      console.error("소리산책 자리 열림 SMS 발송 실패:", smsErr);
    }
  }

  // [소리산책] 취소 처리 시 신청자/관리자 안내 문자
  if (status === "cancelled" && appData?.status !== "cancelled" && appData?.phone && tableName === "soundwalk_applications") {
    try {
      const phone = appData.phone.replace(/[^0-9]/g, "");

      const applicantMsg = `안녕하세요, ${appData.name}님.

달팽이 소리산책 리트릿 신청이
취소 처리되었습니다.

━━━━━━━━━━━━
❎ 신청 취소 완료
━━━━━━━━━━━━

• 입금하신 금액이 있다면
  영업일 기준 2~3일 내 환불됩니다.
• 다음 회차에도 관심 부탁드려요!

문의: 010-8531-9531 (임솔)
감사합니다 :)`;

      const { count: activeCount } = await supabaseAdmin
        .from("soundwalk_applications")
        .select("*", { count: "exact", head: true })
        .in("status", ["pending", "confirmed"]);

      const { count: wlCount } = await supabaseAdmin
        .from("soundwalk_applications")
        .select("*", { count: "exact", head: true })
        .eq("status", "waitlist");

      const adminMsg = `[소리산책 취소 처리]

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
        messageService.sendOne({ to: phone, from: SENDER, text: applicantMsg, type: "LMS", subject: "소리산책 신청 취소 안내" }),
        messageService.sendOne({ to: ADMIN_SOL, from: SENDER, text: adminMsg, type: "LMS", subject: "소리산책 취소 처리" }),
      ]);
    } catch (smsErr) {
      console.error("소리산책 취소 SMS 발송 실패:", smsErr);
    }
  }

  // [항아리BBQ] 대기자 → 정식 신청(pending) 전환 시: 자리 열림 안내 문자
  if (status === "pending" && appData?.status === "waitlist" && appData?.phone && tableName === "bbq_applications") {
    try {
      const phone = appData.phone.replace(/[^0-9]/g, "");
      const msg = `안녕하세요, ${appData.name}님! 🍖

대기해주셔서 감사합니다.
항아리 바베큐 모임에 자리가 생겼습니다!

━━━━━━━━━━━━
✨ 정식 신청자로 전환되었습니다
━━━━━━━━━━━━

■ 모임: 항아리 바베큐 + 자동수익 스터디
■ 일시: 2026.9.8(화) 19:00~23:00 (4시간)
■ 장소: 전북 완주군 소양면 해월신왕길 92
■ 회비: 신청하신 참가 유형 기준

입금계좌: 카카오뱅크 3333-06-4749542 임솔
※ 입금 확인 후 최종 확정됩니다.

30석 한정이라 자리가 금방 나갑니다.
빠른 입금 부탁드려요!

문의: 010-8531-9531 (임솔)`;

      await messageService.sendOne({
        to: phone, from: SENDER, text: msg, type: "LMS", subject: "항아리BBQ 자리 열림 안내"
      });
    } catch (smsErr) {
      console.error("항아리BBQ 자리 열림 SMS 발송 실패:", smsErr);
    }
  }

  // [항아리BBQ] 취소 처리 시 신청자/관리자 안내 문자
  if (status === "cancelled" && appData?.status !== "cancelled" && appData?.phone && tableName === "bbq_applications") {
    try {
      const phone = appData.phone.replace(/[^0-9]/g, "");

      const applicantMsg = `안녕하세요, ${appData.name}님.

항아리 바베큐 모임 신청이
취소 처리되었습니다.

━━━━━━━━━━━━
❎ 신청 취소 완료
━━━━━━━━━━━━

• 입금하신 금액이 있다면
  영업일 기준 2~3일 내 환불됩니다.
• 월 1회 정기 모임이니
  다음 회차에도 관심 부탁드려요!

문의: 010-8531-9531 (임솔)
감사합니다 :)`;

      // 취소된 회차의 잔여석만 세야 하므로 program 으로 한정한다.
      const roundProgram = appData.program as string;
      const { count: activeCount } = await supabaseAdmin
        .from("bbq_applications")
        .select("*", { count: "exact", head: true })
        .eq("program", roundProgram)
        .in("status", ["pending", "confirmed"]);

      const { count: wlCount } = await supabaseAdmin
        .from("bbq_applications")
        .select("*", { count: "exact", head: true })
        .eq("program", roundProgram)
        .eq("status", "waitlist");

      const adminMsg = `[항아리BBQ 취소 처리]

■ 이름: ${appData.name}
■ 연락처: ${appData.phone}
■ 이전상태: ${appData.status}
■ 회차: ${roundProgram}

━━━━━━━━━━━━
현재 ${activeCount || 0}/30석
대기자 ${wlCount || 0}명
━━━━━━━━━━━━

※ 대기자가 있다면 순번대로
관리자 페이지에서 "pending"으로
변경 시 자동 안내 문자가 발송됩니다.`;

      await Promise.allSettled([
        messageService.sendOne({ to: phone, from: SENDER, text: applicantMsg, type: "LMS", subject: "항아리BBQ 신청 취소 안내" }),
        messageService.sendOne({ to: ADMIN_SOL, from: SENDER, text: adminMsg, type: "LMS", subject: "항아리BBQ 취소 처리" }),
      ]);
    } catch (smsErr) {
      console.error("항아리BBQ 취소 SMS 발송 실패:", smsErr);
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
      } else if (tableName === "soundwalk_applications") {
        // 소리산책 리트릿 확정 문자 (입금 완료 + 준비물 재안내)
        const transport = appData.transport || "";
        let gatherInfo = "";
        if (transport === "전주고속터미널") {
          gatherInfo = `\n■ 집결: 전주고속터미널 11:00 (카니발 차량 픽업)`;
        } else if (transport === "전주역") {
          gatherInfo = `\n■ 집결: 전주역 11:20 (카니발 차량 픽업)`;
        } else if (transport === "자차") {
          gatherInfo = `\n■ 이동: 자차 11:50 펜션 도착 (무료 주차)`;
        }

        const msg = `안녕하세요, ${appData.name}님!
달팽이 소리산책 리트릿 참가가 최종 확정되었습니다 🎵

■ 프로그램: 달팽이 소리산책 리트릿
■ 일시: 2026.9.6(일) 12:00~18:00
■ 장소: 달팽이아지트펜션 (전북 완주군 소양면 해월신왕길 92)${gatherInfo}
■ 참가비: 99,000원 (입금 확인 완료 ✅)

━━ 🎧 당일 준비물 ━━
• 스마트폰 (Suno 앱 설치 + 무료가입 완료)
• 편한 운동화 — 숲길을 걷습니다
• 이어폰 (선택)
※ 녹음키트·태블릿·스피커는 준비되어 있습니다.

당일 숲에서 뵙겠습니다!

문의: 010-8531-9531 (임솔)
감사합니다 :)`;

        await messageService.sendOne({
          to: phone, from: SENDER, text: msg, type: "LMS", subject: "소리산책 리트릿 참가 확정"
        });
      } else if (tableName === "membership_applications") {
        // 멤버십은 "합격 통보 + 결제 안내" 다. 확정 시점에 아직 입금 전이라
        // 항바모처럼 "입금 확인 완료" 라고 쓰면 안 된다.
        const msg = `안녕하세요, ${appData.name}님!

달팽이 프라이빗 멤버십 1기
합류가 확정되었습니다 🐌

지원서 잘 읽었습니다.
내놓아주시겠다고 적어주신 부분이
저희가 찾던 그 마음이었어요.

━━ 📋 멤버십 안내 ━━
■ 기수: 1기 (2026년 10월 시작)
■ 정원: 20명
■ 회비: 월 300,000원 (최소 3개월)

━━ 💳 결제 안내 ━━
입금계좌: 카카오뱅크 3333-06-4749542 임솔
입금금액: 300,000원 (첫 달)
입금자명: ${appData.name}

━━ 🎫 이용하실 수 있는 것 ━━
• AI 레퍼런스 공유회 (주 1회 온라인)
• 빌더데이 (월 1회 오프라인 6시간)
• 달팽이 공유회 (부정기)
• 항아리 바베큐 모임 멤버가 15,000원
• 달팽이 라운지 자유석 (평일 09~18시)

━━ 🤝 첫 번째로 하실 일 ━━
입금 확인 후 멤버 채널로 초대드립니다.
들어오시면 인프라 맵에 채널을 등록해주세요.
그게 이 멤버십의 시작입니다.

문의: 010-8531-9531 (임솔)
함께하게 되어 반갑습니다 :)`;

        await messageService.sendOne({
          to: phone, from: SENDER, text: msg, type: "LMS", subject: "멤버십 1기 합류 확정 안내"
        });
      } else if (tableName === "bbq_applications") {
        // 항아리 바베큐 확정 문자 — 신청한 코스에 따라 시간·금액·준비물이 달라진다.
        // 코스 정의는 app/api/programs/bbq/route.ts 와 같은 값을 유지한다.
        // 요금은 자격에 따라 갈리고, 프로그램은 모두 동일한 4시간이다.
        const BBQ_FEES: Record<string, { label: string; fee: string }> = {
          guest: { label: "일반 참가", fee: "60,000원" },
          code: { label: "라이브 코드 할인", fee: "50,000원" },
          member: { label: "멤버십 회원", fee: "15,000원" },
        };
        const c = BBQ_FEES[appData.fee_type as string] || BBQ_FEES.guest;

        const transport = appData.transport || "";
        let gatherInfo = "";
        if (transport === "전주고속터미널") {
          gatherInfo = `\n■ 집결: 전주고속터미널 18:10 (카니발 차량 픽업)`;
        } else if (transport === "전주역") {
          gatherInfo = `\n■ 집결: 전주역 18:30 (카니발 차량 픽업)`;
        } else if (transport === "자차") {
          gatherInfo = `\n■ 이동: 자차 18:50 펜션 도착 (무료 주차)`;
        }

        const msg = `안녕하세요, ${appData.name}님!
항아리 바베큐 모임 참가가 최종 확정되었습니다 🍖

■ 참가 유형: ${c.label}
■ 일시: 2026.9.8(화) 19:00~23:00 (4시간)
■ 장소: 달팽이아지트펜션 (전북 완주군 소양면 해월신왕길 92)${gatherInfo}
■ 회비: ${c.fee} (입금 확인 완료 ✅)

━━ ⏰ 타임테이블 ━━
1부 19:00~21:00 항아리 바베큐 + 포트럭
2부 21:00~23:00 사례 공유 · 자동수익 스터디

━━ 🥘 포트럭 ━━
나눠 드실 음식이나 음료를 한 가지씩
가져와주세요. 부담 없는 걸로 충분합니다.

━━ 🎒 준비물 ━━
• 노트북 또는 태블릿 (2부용 · 선택)
• 고기는 저희가 다 준비해둡니다

당일 뵙겠습니다!

문의: 010-8531-9531 (임솔)
감사합니다 :)`;

        await messageService.sendOne({
          to: phone, from: SENDER, text: msg, type: "LMS", subject: "항아리BBQ 참가 확정"
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
