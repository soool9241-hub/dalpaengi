export interface BreakfastItem {
  menu: string;
  count: number;
}

export interface ReservationRow {
  id: number;
  customer_id: number | null;
  submitted_at: string | null;
  reservation_date: string;
  checkout_date: string | null;
  stay_nights: number;
  guest_count: number;
  extra_guests: number;
  guest_name: string;
  guest_phone: string;
  program_type: "stay" | "half" | "daynight";
  purpose: string | null;
  purpose_raw: string | null;
  bbq_count: number;
  burner_count: number;
  pool_count: number | null;
  dinner_count: number;
  woodcraft_count: number;
  pot_bbq_count: number;
  bus_requested: boolean;
  bus_pickup_info: string | null;
  bus_dropoff_info: string | null;
  bus_fee: number | null;
  breakfast_count: number | null;
  breakfast_menu: string | null;
  woodcraft_10k: number | null;
  woodcraft_20k: number | null;
  woodcraft_30k: number | null;
  total_amount: number | null;
  time_slot: string | null;
  referral_source: string | null;
  source: string | null;
  status: "confirmed" | "upcoming" | "visited" | "reviewed" | "cancelled";
  notes: string | null;
  reservation_year: number | null;
  reservation_month: number | null;
  created_at: string;
  updated_at: string;
}

export interface CustomerRow {
  id: number;
  name: string;
  phone: string;
  visit_count: number;
  first_visit: string;
  last_visit: string;
  total_guests_brought: number;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface DashboardData {
  todayCheckins: { count: number; totalGuests: number };
  weekReservations: number;
  monthReservations: { count: number; prevMonthCount: number };
  monthRevenue: { amount: number; prevMonthAmount: number };
  recentReservations: ReservationRow[];
  upcomingCheckins: ReservationRow[];
  weeklyRevenue: { date: string; amount: number }[];
  programDistribution: { type: string; count: number }[];
  totalCumulativeGuests: number;
}

export interface AnalyticsData {
  monthlyRevenue: { month: string; amount: number; count: number; guests: number }[];
  programBreakdown: {
    type: string;
    count: number;
    avgGuests: number;
    totalRevenue: number;
  }[];
  purposeBreakdown: { purpose: string; count: number }[];
  guestStats: {
    avg: number;
    max: number;
    distribution: { range: string; count: number }[];
  };
}

export const PRICING = {
  stay: { base: 700000, label: "숙박" },
  half: { base: 300000, label: "3시간 대여" },
  daynight: { base: 400000, label: "주/야간 패키지" },
  extraGuest: 10000,
  bbqGrill: 30000,
  gasRange: 15000,
  dinner: 10000,
  woodcraft: 20000,
  potBbq: 30000,
  miniPool: 50000,
} as const;

export interface DynamicPricing {
  stay: number;
  half: number;
  daynight: number;
  extraGuest: number;
  bbqGrill: number;
  gasRange: number;
  dinner: number;
  woodcraft: number;
  potBbq: number;
  miniPool: number;
}

// 폼(Reservation.tsx)과 동일한 가격 공식.
// 추가인원은 (guest_count - 15)만 사용, extra_guests 컬럼은 사용 안 함.
// 버스 비용도 포함.
export function calculateRevenue(r: ReservationRow, dynamicPricing?: DynamicPricing): number {
  const p = dynamicPricing || {
    stay: PRICING.stay.base, half: PRICING.half.base, daynight: PRICING.daynight.base,
    extraGuest: PRICING.extraGuest, bbqGrill: PRICING.bbqGrill, gasRange: PRICING.gasRange,
    dinner: PRICING.dinner, woodcraft: PRICING.woodcraft, potBbq: PRICING.potBbq,
    miniPool: PRICING.miniPool,
  };
  const basePrice = p[r.program_type];
  let total = basePrice * (r.stay_nights || 1);
  total += Math.max(0, (r.guest_count || 0) - 15) * p.extraGuest;
  total += (r.bbq_count || 0) * p.bbqGrill;
  total += (r.burner_count || 0) * p.gasRange;
  total += (r.dinner_count || 0) * p.dinner;
  total += (r.breakfast_count || 0) * 10000;
  total += (r.woodcraft_count || 0) * p.woodcraft;
  total += (r.pot_bbq_count || 0) * p.potBbq;
  total += (r.pool_count || 0) * p.miniPool;
  total += (r.bus_fee || 0);
  return total;
}

// 조식 메뉴 목록. 육개장은 20인 이상 안내(관리자 화면에서는 하드 차단하지 않고 안내만).
export const BREAKFAST_MENU_OPTIONS: { name: string; minPeople: number }[] = [
  { name: "육개장", minPeople: 20 },
  { name: "김치찌개", minPeople: 0 },
  { name: "보리밥 비빔밥", minPeople: 0 },
  { name: "샌드위치", minPeople: 0 },
];

// 메뉴별 수량 배열의 총 인원
export function breakfastTotal(items: BreakfastItem[] | null | undefined): number {
  return (items ?? []).reduce((s, i) => s + (i.count || 0), 0);
}

// 메뉴별 수량을 breakfast_menu 문자열로 인코딩 (예: "김치찌개10·육개장10").
// DB 컬럼을 추가하지 않고 기존 breakfast_menu 에 그대로 저장한다.
export function encodeBreakfastMenu(items: BreakfastItem[] | null | undefined): string {
  return (items ?? []).filter((i) => (i.count || 0) > 0).map((i) => `${i.menu}${i.count}`).join("·");
}

// breakfast_menu 문자열을 메뉴별 수량 배열로 파싱.
// - 신규 인코딩: "김치찌개10·육개장10" → [{김치찌개,10},{육개장,10}]
// - 레거시 단일메뉴: "김치찌개"(+breakfast_count) → [{김치찌개, count}]
export function parseBreakfastItems(
  menu: string | null | undefined,
  count: number | null | undefined
): BreakfastItem[] {
  const m = (menu ?? "").trim();
  if (!m) return [];
  const segments = m.split(/[·,]/).map((s) => s.trim()).filter(Boolean);
  const items: BreakfastItem[] = [];
  for (const seg of segments) {
    const match = seg.match(/^(.+?)(\d+)$/);
    if (match) {
      items.push({ menu: match[1].trim(), count: parseInt(match[2], 10) });
    } else {
      // 숫자가 없는 레거시 단일 메뉴 → 총 인원을 수량으로 사용
      items.push({ menu: seg, count: count ?? 0 });
    }
  }
  return items.filter((i) => i.count > 0);
}

export const PROGRAM_LABELS: Record<string, string> = {
  stay: "숙박",
  half: "3시간 대여",
  daynight: "주/야간",
};

export const STATUS_LABELS: Record<string, string> = {
  confirmed: "예약확정",
  upcoming: "방문예정",
  visited: "방문완료",
  reviewed: "후기남김",
  cancelled: "예약취소",
};
