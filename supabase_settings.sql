-- site_settings 테이블 생성
CREATE TABLE IF NOT EXISTS site_settings (
  key TEXT PRIMARY KEY,
  value JSONB NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- RLS 활성화
ALTER TABLE site_settings ENABLE ROW LEVEL SECURITY;

-- 누구나 읽기 가능
CREATE POLICY "Anyone can read settings"
  ON site_settings FOR SELECT
  USING (true);

-- service_role만 쓰기 가능
CREATE POLICY "Service role can update settings"
  ON site_settings FOR UPDATE
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Service role can insert settings"
  ON site_settings FOR INSERT
  WITH CHECK (true);

-- 초기 데이터: 가격 설정
INSERT INTO site_settings (key, value) VALUES
('pricing', '{
  "stay": 700000,
  "half": 300000,
  "daynight": 400000,
  "extraGuest": 10000,
  "bbqGrill": 30000,
  "gasRange": 15000,
  "dinner": 10000,
  "woodcraft": 20000,
  "potBbq": 30000
}'::jsonb),
('bus_routes', '{
  "전북대": 500000,
  "전주대": 450000,
  "원광대": 550000,
  "우석대": 500000
}'::jsonb)
ON CONFLICT (key) DO NOTHING;
