-- 버스 승차/하차 세부 주소 컬럼 추가
-- bus_requests.pickup_detail은 차종 표기용으로 이미 사용 중. 별도로 상세 주소 컬럼을 둠.

ALTER TABLE bus_requests
  ADD COLUMN IF NOT EXISTS pickup_detail_address text,
  ADD COLUMN IF NOT EXISTS dropoff_detail_address text;

COMMENT ON COLUMN bus_requests.pickup_detail_address IS '승차지 세부 주소 (예: 전북대학교 의과대학 앞)';
COMMENT ON COLUMN bus_requests.dropoff_detail_address IS '하차지 세부 주소 (예: 전북대학교 의과대학 앞)';
