-- ============================================================
-- 가격 산출 단일화 마이그레이션
-- 작성일: 2026-05-05
-- 목적: 손님 폼(Reservation.tsx)이 보낸 totalPrice를 진리로 삼아
--       DB·SMS·어드민이 모두 같은 가격을 사용하도록.
-- ============================================================
--
-- 배경:
--   기존 trigger가 total_amount을 자동 계산하면서 (gc-15)와 extra_guests를
--   둘 다 추가인원으로 처리 → 신규 예약 10건 가격 부풀림 (2026-05 사고).
--
-- 변경 후:
--   API가 totalPrice를 total_amount에 직접 INSERT.
--   trigger는 NEW.total_amount이 NULL/0일 때만 fallback 계산하도록 변경
--   (또는 완전 제거).
--
-- ============================================================

-- 1) 기존 trigger 확인 (실행 전 어떤 trigger 있는지 보기)
SELECT trigger_name, event_manipulation, action_statement
  FROM information_schema.triggers
 WHERE event_object_table = 'reservations'
   AND action_statement ILIKE '%total_amount%';

-- 2) 기존 trigger 제거 (이름은 위 쿼리 결과로 확인 후 수정)
-- 예시:
DROP TRIGGER IF EXISTS reservations_calc_total ON reservations;
DROP TRIGGER IF EXISTS calc_total_amount_trigger ON reservations;
DROP TRIGGER IF EXISTS update_total_amount ON reservations;
DROP FUNCTION IF EXISTS calc_reservation_total CASCADE;
DROP FUNCTION IF EXISTS calculate_total_amount CASCADE;

-- 3) extra_guests 컬럼 사용 중지 안내 주석
COMMENT ON COLUMN reservations.extra_guests IS
  'DEPRECATED 2026-05: 사용 금지. guest_count 단독으로 총인원을 표현. '
  '신규 예약은 항상 0으로 저장. 옛 데이터 호환만.';

COMMENT ON COLUMN reservations.guest_count IS
  '총 예약 인원. 손님 폼이 입력한 값 그대로. 추가인원 분은 (guest_count - 15)로 계산.';

COMMENT ON COLUMN reservations.bus_fee IS
  '폼이 계산한 버스 가격 그대로 저장. 전북대 60만, 전주대 65만, 원광대 70만, 우석대 65만 (왕복). 기타는 0=별도견적.';

COMMENT ON COLUMN reservations.total_amount IS
  '폼(Reservation.tsx)이 보낸 totalPrice를 그대로 저장. 손님이 본 가격 = SMS = 어드민 = DB 일치.';

-- 4) 검증 쿼리 (실행 후 확인용)
-- 신규 예약 1건 INSERT 후 total_amount이 폼 값 그대로 들어갔는지 확인
-- SELECT id, guest_count, extra_guests, bus_fee, total_amount FROM reservations ORDER BY id DESC LIMIT 5;
