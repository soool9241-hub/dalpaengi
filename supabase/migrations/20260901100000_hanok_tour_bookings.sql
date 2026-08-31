-- 외국인 대상 한국 문화 체험 투어 예약
--
-- 다른 신청 테이블과 다른 점:
--  1) 외국인이 대상이라 한국 전화번호가 없을 수 있다. phone 은 nullable,
--     대신 email 또는 messenger(카톡·왓츠앱·위챗 ID) 중 하나는 반드시 받는다.
--  2) 고정 회차가 아니라 희망 날짜를 받는 예약 요청이다 (장기 체류 여행객은
--     현지에서 즉흥적으로 일정을 잡기 때문).
--  3) referral 은 한옥마을 제휴 카페 QR 코드 식별자다. 어느 카페에서
--     유입됐는지 추적해야 제휴처에 성과를 보여줄 수 있다.
CREATE TABLE IF NOT EXISTS public.hanok_tour_bookings (
  id            bigserial PRIMARY KEY,
  name          text NOT NULL,
  phone         text,
  email         text,
  messenger     text,
  country       text,
  language      text NOT NULL DEFAULT 'en',

  course        text NOT NULL DEFAULT 'half',   -- half(4시간) | full(6시간)
  party_size    integer NOT NULL DEFAULT 1,
  preferred_date date,
  preferred_time text,
  requests      text,

  -- 제휴 카페 QR 유입 추적. NULL 이면 직접 유입.
  referral      text,
  -- 최종 안내 금액(1인). 제휴 할인·코스가 반영된 값을 그대로 저장해 정산 대조에 쓴다.
  fee_per_person integer,
  total_fee      integer,
  -- 3인 이상 동반 시 제공하는 펜션 할인 쿠폰 지급 여부
  coupon_granted boolean NOT NULL DEFAULT false,

  privacy_consent boolean NOT NULL DEFAULT false,
  program       text NOT NULL DEFAULT 'hanok-tour',
  status        text NOT NULL DEFAULT 'pending',
  memo          text,
  created_at    timestamptz NOT NULL DEFAULT now()
);

-- 같은 사람이 다른 날짜로 여러 번 예약할 수 있어야 하므로 연락처 UNIQUE 는 걸지 않는다.
CREATE INDEX IF NOT EXISTS hanok_tour_bookings_status_idx
  ON public.hanok_tour_bookings (status);
CREATE INDEX IF NOT EXISTS hanok_tour_bookings_date_idx
  ON public.hanok_tour_bookings (preferred_date);
CREATE INDEX IF NOT EXISTS hanok_tour_bookings_referral_idx
  ON public.hanok_tour_bookings (referral);
CREATE INDEX IF NOT EXISTS hanok_tour_bookings_created_at_idx
  ON public.hanok_tour_bookings (created_at DESC);

ALTER TABLE public.hanok_tour_bookings ENABLE ROW LEVEL SECURITY;
