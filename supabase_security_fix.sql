-- ============================================
-- 달팽이아지트 Supabase 보안 수정 SQL
-- Supabase Dashboard > SQL Editor 에서 실행
-- ============================================

-- ─────────────────────────────────────────────
-- 1. reservations 테이블 RLS 활성화
-- ─────────────────────────────────────────────
ALTER TABLE reservations ENABLE ROW LEVEL SECURITY;

-- anon은 SELECT만 허용 (달력에 예약된 날짜 표시용)
-- 개인정보는 제외하고 날짜/상태만 조회 가능
CREATE POLICY "anon_read_reservation_dates" ON reservations
  FOR SELECT
  TO anon
  USING (true);

-- anon은 INSERT만 허용 (예약 폼 제출용)
CREATE POLICY "anon_insert_reservation" ON reservations
  FOR INSERT
  TO anon
  WITH CHECK (true);

-- anon의 UPDATE, DELETE는 차단 (정책 없으면 자동 차단)

-- service_role은 모든 작업 허용 (서버 사이드용)
CREATE POLICY "service_role_full_access_reservations" ON reservations
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- ─────────────────────────────────────────────
-- 2. customers 테이블 RLS 활성화
-- ─────────────────────────────────────────────
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;

-- anon은 customers 테이블 접근 완전 차단
-- (프론트엔드에서 customers 테이블 직접 접근 불필요)

-- service_role만 모든 작업 허용
CREATE POLICY "service_role_full_access_customers" ON customers
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- ─────────────────────────────────────────────
-- 3. reservations SELECT 시 개인정보 보호
--    (보안 뷰 생성 - 프론트엔드용)
-- ─────────────────────────────────────────────
CREATE OR REPLACE VIEW public.reservation_calendar AS
SELECT
  id,
  reservation_date,
  checkout_date,
  stay_nights,
  status,
  program_type,
  time_slot
FROM reservations
WHERE status IN ('confirmed', 'pending');

-- 뷰에 anon 접근 허용
GRANT SELECT ON public.reservation_calendar TO anon;

-- ─────────────────────────────────────────────
-- 4. (선택) reservations SELECT 정책을 뷰 전용으로 변경
--    개인정보 직접 조회 차단이 필요하면 아래 실행
-- ─────────────────────────────────────────────
-- 기존 정책 삭제 후 더 엄격한 정책 적용
-- DROP POLICY "anon_read_reservation_dates" ON reservations;
-- CREATE POLICY "anon_read_reservation_dates_strict" ON reservations
--   FOR SELECT
--   TO anon
--   USING (false);
-- → 이 경우 프론트엔드에서 reservation_calendar 뷰만 사용하도록 코드 수정 필요
