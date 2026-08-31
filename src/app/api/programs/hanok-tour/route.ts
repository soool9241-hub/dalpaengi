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

/* ───── 코스 2종 ─────
   구간 시간의 합이 정확히 240분·360분이 되게 맞췄다(이동 시간 포함).
   6시간 코스만 공방 투어와 스냅 촬영이 들어가고, 소반 시간도 100분으로 길다.
   일정을 바꿀 땐 programs/hanok-tour/page.tsx 의 ITINERARY 도 같이 고친다. */
type CourseKey = "half" | "full";
const COURSES: Record<CourseKey, {
  labelKo: string; labelEn: string; hours: number; fee: number; minParty: number;
  planKo: string; planEn: string;
}> = {
  half: {
    labelKo: "4시간 코스", labelEn: "4-Hour Course", hours: 4, fee: 90_000, minParty: 1,
    planKo: "픽업·이동 30분\n두부마을 로컬 식사 50분\n한옥 카페 티타임 55분\n전통 소반 만들기 75분\n한옥마을 복귀 30분",
    planEn: "Pickup & drive 30m\nTofu village lunch 50m\nHanok cafe tea 55m\nSoban making 75m\nBack to Hanok Village 30m",
  },
  full: {
    labelKo: "6시간 원데이", labelEn: "6-Hour One Day", hours: 6, fee: 99_000, minParty: 2,
    planKo: "픽업·이동 30분\n두부마을 로컬 식사 60분\n한옥 카페 티타임 70분\n스토리팜 공방 투어 45분\n전통 소반 만들기 100분\n스냅 촬영·마무리 20분\n한옥마을 복귀 35분",
    planEn: "Pickup & drive 30m\nTofu village lunch 60m\nHanok cafe tea 70m\nStudio tour 45m\nSoban making 100m\nPhotos & wrap-up 20m\nBack to Hanok Village 35m",
  },
};

// 한옥마을 제휴 카페 QR 로 들어오면 10% 할인. 어느 카페에서 왔는지도 같이 남는다.
const REFERRAL_DISCOUNT = 0.1;
// 3인 이상 동반 예약 시 달팽이아지트 펜션 할인 쿠폰 10만원 제공
const COUPON_MIN_PARTY = 3;
const COUPON_VALUE = 100_000;

const MAX_PARTY = 10;

/* 제휴처 목록. QR 코드마다 ref 값을 다르게 발급해 유입 카페를 구분한다.
   새 제휴처가 생기면 여기에 한 줄 추가하고 그 값으로 QR 을 만들면 된다. */
const PARTNERS: Record<string, string> = {
  tirol: "티롤카페",
  hanboknam: "한복남",
  jaman: "자만벽화마을",
  direct: "직접 유입",
};

function calcFee(course: CourseKey, partySize: number, referral: string | null) {
  const base = COURSES[course].fee;
  const discounted = referral ? Math.round((base * (1 - REFERRAL_DISCOUNT)) / 10) * 10 : base;
  return {
    feePerPerson: discounted,
    totalFee: discounted * partySize,
    couponGranted: partySize >= COUPON_MIN_PARTY,
  };
}

// GET: 코스·요금 정보 (페이지가 서버 값과 어긋나지 않도록 여기서 내려준다)
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const ref = searchParams.get("ref");
  const validRef = ref && PARTNERS[ref] ? ref : null;

  return NextResponse.json({
    courses: Object.entries(COURSES).map(([key, c]) => ({
      key,
      labelKo: c.labelKo,
      labelEn: c.labelEn,
      hours: c.hours,
      planKo: c.planKo,
      planEn: c.planEn,
      fee: c.fee,
      minParty: c.minParty,
      discountedFee: validRef ? Math.round((c.fee * (1 - REFERRAL_DISCOUNT)) / 10) * 10 : c.fee,
    })),
    referral: validRef,
    referralName: validRef ? PARTNERS[validRef] : null,
    referralDiscount: REFERRAL_DISCOUNT,
    couponMinParty: COUPON_MIN_PARTY,
    couponValue: COUPON_VALUE,
    maxParty: MAX_PARTY,
  });
}

// POST: 예약 요청 접수
export async function POST(req: NextRequest) {
  const body = await req.json();
  const {
    name, phone, email, messenger, country, language,
    preferredDate, preferredTime, requests, privacyConsent,
  } = body;

  const course: CourseKey = (["half", "full"] as const).includes(body.course) ? body.course : "half";
  const courseInfo = COURSES[course];

  const partySize = Math.max(1, Math.min(MAX_PARTY, parseInt(String(body.partySize), 10) || 1));
  const referral = body.referral && PARTNERS[body.referral] ? String(body.referral) : null;
  const isKo = language === "ko";

  if (!name || !String(name).trim()) {
    return NextResponse.json(
      { error: isKo ? "이름을 입력해주세요." : "Please enter your name." },
      { status: 400 }
    );
  }

  // 외국인 대상이라 한국 전화번호가 없을 수 있다. 연락 수단이 하나도 없으면 받을 수 없다.
  const hasContact = [phone, email, messenger].some((v) => v && String(v).trim());
  if (!hasContact) {
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

  if (partySize < courseInfo.minParty) {
    return NextResponse.json(
      {
        error: isKo
          ? `${courseInfo.labelKo}는 최소 ${courseInfo.minParty}인부터 신청하실 수 있습니다.`
          : `The ${courseInfo.labelEn} requires at least ${courseInfo.minParty} people.`,
      },
      { status: 400 }
    );
  }

  if (privacyConsent !== true) {
    return NextResponse.json(
      {
        error: isKo
          ? "개인정보 수집 동의는 필수입니다."
          : "Consent to data collection is required.",
      },
      { status: 400 }
    );
  }

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

  const { feePerPerson, totalFee, couponGranted } = calcFee(course, partySize, referral);

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
    preferred_time: preferredTime || null,
    requests: requests || null,
    referral,
    fee_per_person: feePerPerson,
    total_fee: totalFee,
    coupon_granted: couponGranted,
    privacy_consent: privacyConsent,
    program: PROGRAM,
    status: "pending",
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
    referral || "direct"
  );

  try {
    const adminMsg = `[한옥투어 새 예약]

■ 코스: ${courseInfo.labelKo} (${courseInfo.hours}시간)
■ 인원: ${partySize}명
■ 희망일: ${preferredDate}${preferredTime ? ` ${preferredTime}` : ""}
■ 이름: ${name}
■ 국적: ${country || "-"}
■ 연락처: ${normalizedPhone || "-"}
■ 이메일: ${email || "-"}
■ 메신저: ${messenger || "-"}
■ 언어: ${isKo ? "한국어" : "English"}

━━ 💰 정산 ━━
1인 ${feePerPerson.toLocaleString("ko-KR")}원 × ${partySize}명
= ${totalFee.toLocaleString("ko-KR")}원
${referral ? `🎟️ ${PARTNERS[referral]} QR 유입 (10% 할인 적용)` : "· 직접 유입"}
${couponGranted ? `🎁 펜션 할인쿠폰 ${COUPON_VALUE.toLocaleString("ko-KR")}원 지급 대상` : ""}
${requests ? `\n■ 요청사항: ${requests}` : ""}
▶ 관리자에서 확정 처리`;

    const tasks = [
      messageService.sendOne({
        to: ADMIN_SOL, from: SENDER, text: adminMsg, type: "LMS", subject: "한옥투어 새 예약",
      }),
    ];

    // 국내 휴대폰이면 신청자에게도 안내 문자. 해외 번호는 발송하지 않고 이메일·메신저로 안내한다.
    if (koreanMobile) {
      const applicantMsg = isKo
        ? `안녕하세요, ${name}님!
한옥 체험 투어 예약이 접수되었습니다 🏯

■ 코스: ${courseInfo.labelKo}
■ 인원: ${partySize}명
■ 희망일: ${preferredDate}${preferredTime ? ` ${preferredTime}` : ""}
■ 금액: 1인 ${feePerPerson.toLocaleString("ko-KR")}원 (총 ${totalFee.toLocaleString("ko-KR")}원)
${referral ? `\n🎟️ ${PARTNERS[referral]} 제휴 10% 할인이 적용되었습니다.` : ""}
${couponGranted ? `\n🎁 3인 이상 동반이라 달팽이아지트 펜션\n   ${COUPON_VALUE.toLocaleString("ko-KR")}원 할인 쿠폰을 드립니다.` : ""}

━━ 🏯 코스 (${courseInfo.hours}시간) ━━
${courseInfo.planKo}

━━ 📌 다음 단계 ━━
가능 여부를 확인하고 24시간 안에
연락드립니다. 지금 입금하지 마세요.

문의: 010-8531-9531 (임솔)
감사합니다 :)`
        : `Hello ${name}!
Your Korean Culture Tour request is received 🏯

■ Course: ${courseInfo.labelEn} (${courseInfo.hours} hours)
■ Party: ${partySize} people
■ Date: ${preferredDate}${preferredTime ? ` ${preferredTime}` : ""}
■ Price: KRW ${feePerPerson.toLocaleString("en-US")} per person
   (Total KRW ${totalFee.toLocaleString("en-US")})
${referral ? `\nPartner discount (10%) applied.` : ""}

━━ SCHEDULE ━━
${courseInfo.planEn}

We will confirm availability within 24 hours.
Please do not transfer any payment yet.

Contact: +82 10-8531-9531 (Sol)
Thank you!`;

      tasks.push(
        messageService.sendOne({
          to: koreanMobile, from: SENDER, text: applicantMsg, type: "LMS",
          subject: isKo ? "한옥투어 예약 접수 안내" : "Korean Culture Tour - Request Received",
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
    partySize,
    feePerPerson,
    totalFee,
    couponGranted,
    referralApplied: !!referral,
    smsSent: !!koreanMobile,
  });
}
