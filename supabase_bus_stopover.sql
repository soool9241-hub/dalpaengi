-- 버스 경유지 + 조식 컬럼 추가
-- Supabase SQL Editor에서 실행

-- 1. bus_requests에 경유지 컬럼 추가
ALTER TABLE bus_requests
ADD COLUMN IF NOT EXISTS stopover_text TEXT;

COMMENT ON COLUMN bus_requests.stopover_text IS '경유지 정보 (예: "전주역(14:00) → 서울역(17:00)")';

-- 2. reservations에 조식 컬럼 추가
ALTER TABLE reservations
ADD COLUMN IF NOT EXISTS breakfast_count INTEGER DEFAULT 0;

ALTER TABLE reservations
ADD COLUMN IF NOT EXISTS breakfast_menu TEXT;

COMMENT ON COLUMN reservations.breakfast_count IS '조식 인원 (1인 10,000원)';
COMMENT ON COLUMN reservations.breakfast_menu IS '조식 메뉴 (육개장 / 김치찌개 / 보리밥 비빔밥)';
