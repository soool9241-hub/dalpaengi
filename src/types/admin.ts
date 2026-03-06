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
  dinner_count: number;
  woodcraft_count: number;
  pot_bbq_count: number;
  bus_requested: boolean;
  bus_pickup_info: string | null;
  bus_dropoff_info: string | null;
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
}

export interface AnalyticsData {
  monthlyRevenue: { month: string; amount: number; count: number }[];
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
}

export function calculateRevenue(r: ReservationRow, dynamicPricing?: DynamicPricing): number {
  const p = dynamicPricing || {
    stay: PRICING.stay.base, half: PRICING.half.base, daynight: PRICING.daynight.base,
    extraGuest: PRICING.extraGuest, bbqGrill: PRICING.bbqGrill, gasRange: PRICING.gasRange,
    dinner: PRICING.dinner, woodcraft: PRICING.woodcraft, potBbq: PRICING.potBbq,
  };
  const basePrice = p[r.program_type];
  let total = basePrice * (r.stay_nights || 1);
  total += (r.extra_guests || 0) * p.extraGuest;
  total += (r.bbq_count || 0) * p.bbqGrill;
  total += (r.burner_count || 0) * p.gasRange;
  total += (r.dinner_count || 0) * p.dinner;
  total += (r.woodcraft_count || 0) * p.woodcraft;
  total += (r.pot_bbq_count || 0) * p.potBbq;
  return total;
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
