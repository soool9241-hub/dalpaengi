-- 버스 차종 정보 컬럼 추가
-- 작성일: 2026-05-08
-- 목적: 손님이 선택한 버스 차종(일반/우등/중형/스타렉스)을 DB에 저장
--      형식 예: "일반 (45인승) 1대 + 스타렉스 (12인승) 1대"
--      또는 "중형 (25인승) · 50km이내 40만원 1대"

ALTER TABLE reservations
  ADD COLUMN IF NOT EXISTS bus_vehicles TEXT NULL;

COMMENT ON COLUMN reservations.bus_vehicles IS
  '손님이 선택한 버스 차종/대수 텍스트. 예: "일반(45인승) 1대 + 스타렉스(12인승) 1대"';

-- 검증
SELECT column_name, data_type, is_nullable
  FROM information_schema.columns
 WHERE table_name = 'reservations'
   AND column_name = 'bus_vehicles';
