import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { SolapiMessageService } from "solapi";

const messageService = new SolapiMessageService(
  (process.env.SOLAPI_API_KEY || "").trim(),
  (process.env.SOLAPI_API_SECRET || "").trim()
);

const SENDER = (process.env.SOLAPI_SENDER || "").trim();
const ADMIN_SOL = "01085319531";

const TABLE = "hanok_tour_bookings";
const PROGRAM = "hanok-tour";

/* ───── 공통 조건 ─────
   네 상품 모두 6시간(12:00~18:00), 1인 99,000원, 10~15명 단체.
   달라지는 건 오후 체험뿐이다. */
const FEE = 99_000;
/* 1명부터 신청을 받는다. 다만 차량(팀 정액)과 가이드(팀 정액) 때문에
   소수 인원 단독 출발은 원가가 성립하지 않는다. 그래서 GROUP_MIN 미만은
   "다른 여행자와 함께 출발" 하는 합류 신청으로 처리하고,
   GROUP_MIN 이 모이면 그 날짜로 출발을 확정한다. */
const MIN_PARTY = 1;
const GROUP_MIN = 10;
const MAX_PARTY = 15;
/* 출발 7일 전에 인원을 확정한다. 판정은 api/cron/hanok-departure-check 가 매일 돌면서
   그날로부터 7일 뒤 출발 건을 확정 또는 취소로 정리한다. 값을 바꾸면 크론도 같이 고칠 것. */
const CUTOFF_DAYS = 7;
const MEETING = "전주 한옥마을";

/* ───── 상품 4종 ─────
   가격·일정을 바꿀 땐 programs/hanok-tour/page.tsx 의 COURSES 도 같이 고친다.
   D 는 제목 미확정 상태라 작업 제목을 쓰고 있다. */
type CourseKey = "A" | "B" | "C" | "D";
const COURSES: Record<CourseKey, {
  nameKo: string; nameEn: string; endTime: string; planKo: string; planEn: string;
}> = {
  A: {
    nameKo: "내 손으로 만드는 한국 밥상",
    nameEn: "Make Your Own Korean Table",
    endTime: "17:35",
    planKo: "12:00 한옥마을 집결\n12:30 두부마을 로컬 한상 (60분)\n13:35 한옥카페 전통차 (60분)\n14:45 스토리팜 CNC 공방 투어 (30분)\n15:20 전통소반 만들기 (90분)\n16:50 각인·포장·기념촬영\n17:35 한옥마을 복귀",
    planEn: "12:00 Meet at Hanok Village\n12:30 Local tofu set lunch (60m)\n13:35 Hanok cafe, Korean tea (60m)\n14:45 StoryFarm CNC workshop tour (30m)\n15:20 Make your own soban (90m)\n16:50 Engraving, wrapping, photos\n17:35 Back to Hanok Village",
  },
  B: {
    nameKo: "완주 로컬 하루",
    nameEn: "Wanju Slow Day",
    endTime: "17:05",
    planKo: "12:00 한옥마을 집결\n12:30 두부마을 로컬 한상 (60분)\n13:35 한옥카페 전통차 (60분)\n14:35 소양 고택 투어 (30분)\n15:05 K-콘텐츠 촬영지 투어 (30분)\n15:35 호수뷰 산책 (60분)\n17:05 한옥마을 복귀",
    planEn: "12:00 Meet at Hanok Village\n12:30 Local tofu set lunch (60m)\n13:35 Hanok cafe, Korean tea (60m)\n14:35 Historic hanok house tour (30m)\n15:05 K-content filming location (30m)\n15:35 Lakeside walk (60m)\n17:05 Back to Hanok Village",
  },
  C: {
    nameKo: "손으로 빚는 한국의 다과",
    nameEn: "Make Korean Tea Sweets",
    endTime: "17:35",
    planKo: "12:00 한옥마을 집결\n12:30 두부마을 로컬 한상 (60분)\n13:35 한옥카페 전통차 (60분)\n15:05 다과·다식 만들기 (90분)\n16:35 직접 만든 다식으로 티타임 (30분)\n17:35 한옥마을 복귀",
    planEn: "12:00 Meet at Hanok Village\n12:30 Local tofu set lunch (60m)\n13:35 Hanok cafe, Korean tea (60m)\n15:05 Dasik & tea sweets class (90m)\n16:35 Tea time with what you made (30m)\n17:35 Back to Hanok Village",
  },
  D: {
    nameKo: "전주 소리 집중 힐링",
    nameEn: "A Day of Korean Sound",
    endTime: "18:00",
    planKo: "12:00 한옥마을 집결\n12:30 두부마을 로컬 한상 (60분)\n14:00 소리나무 카페 · 헤아리움 음향 감상실\n     · 진공관앰프 공방 (90분)\n16:00 소리채집 프로그램 (90분)\n18:00 한옥마을 복귀",
    planEn: "12:00 Meet at Hanok Village\n12:30 Local tofu set lunch (60m)\n14:00 Sorinamu cafe, Hearium listening hall\n     & vacuum-tube amp workshop (90m)\n16:00 Field recording program (90m)\n18:00 Back to Hanok Village",
  },
};

/* 한옥마을 제휴 카페 QR 유입 추적. 새 제휴처는 여기에 한 줄 추가하고 그 값으로 QR 을 만든다. */
const PARTNERS: Record<string, string> = {
  tirol: "카페 티롤",
  hanboknam: "한복남",
  jaman: "자만벽화마을",
  direct: "직접 유입",
};

/* 제휴 할인율. 정리본 마진표가 99,000원 기준으로 잡혀 있어 기본값을 0 으로 둔다.
   10명 팀에 10% 를 걸면 A·C 상품 마진이 절반 아래로 떨어진다.
   할인을 켤 때는 이 값만 0.1 로 바꾸면 페이지 표기까지 같이 따라간다. */
const REFERRAL_DISCOUNT = 0;

function calcFee(partySize: number, referral: string | null) {
  const discounted =
    referral && REFERRAL_DISCOUNT > 0
      ? Math.round((FEE * (1 - REFERRAL_DISCOUNT)) / 10) * 10
      : FEE;
  return { feePerPerson: discounted, totalFee: discounted * partySize };
}

// GET: 상품·요금 정보 (페이지가 서버 값과 어긋나지 않도록 여기서 내려준다)
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const ref = searchParams.get("ref");
  const validRef = ref && PARTNERS[ref] ? ref : null;
  const { feePerPerson } = calcFee(1, validRef);

  return NextResponse.json({
    fee: FEE,
    feePerPerson,
    minParty: MIN_PARTY,
    groupMin: GROUP_MIN,
    maxParty: MAX_PARTY,
    meeting: MEETING,
    courses: Object.entries(COURSES).map(([key, c]) => ({ key, ...c })),
    referral: validRef,
    referralName: validRef ? PARTNERS[validRef] : null,
    referralDiscount: REFERRAL_DISCOUNT,
  });
}

// POST: 예약 요청 접수
export async function POST(req: NextRequest) {
  const body = await req.json();
  const {
    name, phone, email, messenger, country, language,
    preferredDate, requests, privacyConsent,
  } = body;

  const course: CourseKey = (["A", "B", "C", "D"] as const).includes(body.course) ? body.course : "A";
  const courseInfo = COURSES[course];
  const isKo = language === "ko";

  const rawParty = parseInt(String(body.partySize), 10);
  const partySize = Number.isFinite(rawParty) ? rawParty : 0;

  if (!name || !String(name).trim()) {
    return NextResponse.json(
      { error: isKo ? "이름을 입력해주세요." : "Please enter your name." },
      { status: 400 }
    );
  }

  // 외국인 대상이라 한국 전화번호가 없을 수 있다. 연락 수단이 하나도 없으면 받을 수 없다.
  if (![phone, email, messenger].some((v) => v && String(v).trim())) {
    return NextResponse.json(
      {
        error: isKo
          ? "이메일, 메신저 ID, 전화번호 중 하나는 입력해주세요."
          : "Please provide at least one of: email, messenger ID, or phone number.",
      },
      { status: 400 }
    );
  }

  if (!preferredDate) {
    return NextResponse.json(
      { error: isKo ? "희망 날짜를 선택해주세요." : "Please choose a preferred date." },
      { status: 400 }
    );
  }

  if (partySize < MIN_PARTY || partySize > MAX_PARTY) {
    return NextResponse.json(
      {
        error: isKo
          ? `인원은 ${MIN_PARTY}~${MAX_PARTY}명까지 신청하실 수 있습니다.`
          : `Group size must be between ${MIN_PARTY} and ${MAX_PARTY}.`,
      },
      { status: 400 }
    );
  }

  // GROUP_MIN 미만이면 단독 출발이 아니라 합류 신청이다.
  const joining = partySize < GROUP_MIN;

  if (privacyConsent !== true) {
    return NextResponse.json(
      { error: isKo ? "개인정보 수집 동의는 필수입니다." : "Consent to data collection is required." },
      { status: 400 }
    );
  }

  const referral = body.referral && PARTNERS[body.referral] ? String(body.referral) : null;

  // 전화번호가 있으면 정규화. 국내 번호만 문자 발송 대상이 된다.
  let normalizedPhone: string | null = null;
  let koreanMobile: string | null = null;
  if (phone && String(phone).trim()) {
    const raw = String(phone).trim();
    const digits = raw.replace(/[^0-9]/g, "");
    if (digits.length === 11 && digits.startsWith("010")) {
      normalizedPhone = `${digits.slice(0, 3)}-${digits.slice(3, 7)}-${digits.slice(7)}`;
      koreanMobile = digits;
    } else {
      normalizedPhone = raw;
    }
  }

  const { feePerPerson, totalFee } = calcFee(partySize, referral);

  const { error } = await supabaseAdmin.from(TABLE).insert({
    name,
    phone: normalizedPhone,
    email: email || null,
    messenger: messenger || null,
    country: country || null,
    language: isKo ? "ko" : "en",
    course,
    party_size: partySize,
    preferred_date: preferredDate,
    preferred_time: "12:00",
    requests: requests || null,
    referral,
    fee_per_person: feePerPerson,
    total_fee: totalFee,
    coupon_granted: false,
    privacy_consent: privacyConsent,
    program: PROGRAM,
    // 합류 신청은 출발 인원이 찰 때까지 대기 상태로 둔다.
    // 관리자에서 10명이 모이면 pending 으로 올려 출발을 확정한다.
    status: joining ? "waitlist" : "pending",
  });

  if (error) {
    return NextResponse.json({ error: "Booking failed: " + error.message }, { status: 500 });
  }

  console.log(
    "[hanok-tour] 예약 접수:",
    normalizedPhone
      ? normalizedPhone.replace(/(\d{3})-\d{4}-(\d{4})/, "$1-****-$2")
      : email
      ? String(email).replace(/^(.{2}).*(@.*)$/, "$1***$2")
      : "(메신저)",
    course,
    partySize + "인",
    joining ? "(합류대기)" : "(단독출발)",
    referral || "direct"
  );

  try {
    const adminMsg = `[한옥투어 ${joining ? "합류 신청" : "새 예약"}]

■ 상품: ${course}. ${courseInfo.nameKo}
■ 인원: ${partySize}명${joining ? ` ⚠️ 합류 대기 (${GROUP_MIN}명 미만)` : " ✅ 단독 출발 가능"}
■ 희망일: ${preferredDate} 12:00 집결
■ 종료: ${courseInfo.endTime} (${MEETING} 해산)

■ 이름: ${name}
■ 국적: ${country || "-"}
■ 연락처: ${normalizedPhone || "-"}
■ 이메일: ${email || "-"}
■ 메신저: ${messenger || "-"}
■ 언어: ${isKo ? "한국어" : "English"}

━━ 💰 정산 ━━
1인 ${feePerPerson.toLocaleString("ko-KR")}원 × ${partySize}명
= ${totalFee.toLocaleString("ko-KR")}원
${referral ? `🎟️ ${PARTNERS[referral]} QR 유입` : "· 직접 유입"}
${requests ? `\n■ 요청사항: ${requests}` : ""}
${joining
  ? `▶ 출발 ${CUTOFF_DAYS}일 전 자동 판정 (매일 09:00)\n   ${GROUP_MIN}명 이상이면 확정, 미달이면 취소 안내`
  : "▶ 차량·협력처 확인 후 관리자에서 확정 처리"}`;

    const tasks = [
      messageService.sendOne({
        to: ADMIN_SOL, from: SENDER, text: adminMsg, type: "LMS", subject: "한옥투어 새 예약",
      }),
    ];

    // 국내 휴대폰이면 신청자에게도 안내. 해외 번호는 발송하지 않고 이메일·메신저로 안내한다.
    if (koreanMobile) {
      const applicantMsg = isKo
        ? `안녕하세요, ${name}님!
완주 로컬 체험 투어 ${joining ? "합류 신청이" : "예약이"} 접수되었습니다 🏯

■ 상품: ${courseInfo.nameKo}
■ 인원: ${partySize}명
■ 일시: ${preferredDate} 12:00~${courseInfo.endTime}
■ 집결/해산: ${MEETING}
■ 금액: 1인 ${feePerPerson.toLocaleString("ko-KR")}원
        (총 ${totalFee.toLocaleString("ko-KR")}원)

━━ 🗓 일정 ━━
${courseInfo.planKo}

━━ 📌 다음 단계 ━━
${joining
  ? `이 투어는 ${GROUP_MIN}명이 모이면 출발합니다.\n같은 날짜에 신청하신 다른 여행자분들과\n함께 출발하며, 인원이 차는 대로\n가장 먼저 안내드립니다.\n\n※ 출발 ${CUTOFF_DAYS}일 전에 인원을 확정합니다.\n   미달 시 취소 안내를 드리며,\n   결제 전이라 따로 처리하실 것은 없습니다.`
  : "차량과 협력처 일정을 확인하고\n24시간 안에 연락드립니다."}
지금 입금하지 마세요.

문의: 010-8531-9531 (임솔)
감사합니다 :)`
        : `Hello ${name}!
Your Wanju local experience request is received 🏯

■ Course: ${courseInfo.nameEn}
■ Group: ${partySize} people
■ Date: ${preferredDate} 12:00–${courseInfo.endTime}
■ Meet & finish: Jeonju Hanok Village
■ Price: KRW ${feePerPerson.toLocaleString("en-US")} per person
        (Total KRW ${totalFee.toLocaleString("en-US")})

━━ SCHEDULE ━━
${courseInfo.planEn}

${joining
  ? `This tour departs with ${GROUP_MIN} travellers.\nWe will match you with others booking the same\ndate and let you know as soon as it fills.\n\nWe confirm ${CUTOFF_DAYS} days before departure.\nIf it has not filled by then we cancel and\nlet you know — nothing is charged.`
  : "We will confirm vehicle and partner availability\nwithin 24 hours."}
Please do not send payment yet.

Contact: +82 10-8531-9531 (Sol)
Thank you!`;

      tasks.push(
        messageService.sendOne({
          to: koreanMobile, from: SENDER, text: applicantMsg, type: "LMS",
          subject: isKo ? "완주 체험투어 예약 접수" : "Wanju Local Tour - Request Received",
        })
      );
    }

    await Promise.allSettled(tasks);
  } catch (e) {
    console.error("[hanok-tour] SMS 발송 실패:", e);
  }

  return NextResponse.json({
    success: true,
    course,
    courseName: isKo ? courseInfo.nameKo : courseInfo.nameEn,
    partySize,
    joining,
    groupMin: GROUP_MIN,
    feePerPerson,
    totalFee,
    referralApplied: !!referral,
    smsSent: !!koreanMobile,
  });
}
