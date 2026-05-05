-- 자동 리마인더 SMS 발송 추적 컬럼
-- 작성일: 2026-05-05
-- 목적: D-1 / 6시간 전 리마인더 SMS 중복 발송 방지

ALTER TABLE reservations
  ADD COLUMN IF NOT EXISTS reminder_d1_sent_at TIMESTAMPTZ NULL;

ALTER TABLE reservations
  ADD COLUMN IF NOT EXISTS reminder_6h_sent_at TIMESTAMPTZ NULL;

COMMENT ON COLUMN reservations.reminder_d1_sent_at IS
  '입실 1일 전 리마인더 SMS 발송 시각. NULL이면 미발송.';

COMMENT ON COLUMN reservations.reminder_6h_sent_at IS
  '입실 6시간 전 길안내 SMS 발송 시각. NULL이면 미발송.';

-- 검증
SELECT column_name, data_type, is_nullable
  FROM information_schema.columns
 WHERE table_name = 'reservations'
   AND column_name IN ('reminder_d1_sent_at', 'reminder_6h_sent_at');
