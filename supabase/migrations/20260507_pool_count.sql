-- 미니수영장 옵션 추가
-- 작성일: 2026-05-07
-- 7~9월 한정 추가옵션, 1대 50,000원 (최대 2대)

ALTER TABLE reservations
  ADD COLUMN IF NOT EXISTS pool_count INTEGER NOT NULL DEFAULT 0;

COMMENT ON COLUMN reservations.pool_count IS
  '미니수영장 대여 수량. 7~9월 한정 / 1대 50,000원. 폼에서 선택 시점에 검증.';

-- 검증
SELECT column_name, data_type, column_default
  FROM information_schema.columns
 WHERE table_name = 'reservations'
   AND column_name = 'pool_count';
