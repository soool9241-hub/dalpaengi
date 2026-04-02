-- ============================================
-- 바이브코딩 워크숍 신청 테이블
-- Supabase Dashboard > SQL Editor 에서 실행
-- ============================================

-- ─────────────────────────────────────────────
-- 1. vibecoding_applications 테이블 생성
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS vibecoding_applications (
  id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  created_at timestamptz DEFAULT now(),
  name text NOT NULL,
  phone text NOT NULL,
  age text,
  occupation text,
  idea text,
  course text DEFAULT 'A',
  experience text,
  how_found text,
  preferred_date text,
  status text DEFAULT 'pending',
  memo text,
  program text DEFAULT 'vibe-coding-basic'
);

-- ─────────────────────────────────────────────
-- 2. RLS 활성화
-- ─────────────────────────────────────────────
ALTER TABLE vibecoding_applications ENABLE ROW LEVEL SECURITY;

-- anon은 INSERT만 허용 (신청 폼 제출용)
CREATE POLICY "anon_insert_vibecoding" ON vibecoding_applications
  FOR INSERT
  TO anon
  WITH CHECK (true);

-- service_role은 모든 작업 허용 (서버 사이드용)
CREATE POLICY "service_role_full_access_vibecoding" ON vibecoding_applications
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);
