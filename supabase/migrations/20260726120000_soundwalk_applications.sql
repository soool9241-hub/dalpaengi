-- 달팽이 소리산책 리트릿 신청 테이블
-- 베타 1회차: 2026-09-06(일) 12:00~18:00 · 20명 한정
-- 컬럼 구조를 retreat_applications 와 동일하게 맞춤 →
-- 관리자 API(app/api/admin/programs)의 리트릿 분기를 그대로 재사용하기 위함.

CREATE TABLE IF NOT EXISTS public.soundwalk_applications (
  id            bigserial PRIMARY KEY,
  name          text        NOT NULL,
  phone         text        NOT NULL,
  age           text,
  gender        text,
  occupation    text,
  reason        text,
  region        text,
  transport     text,
  photo_consent boolean     NOT NULL DEFAULT false,
  program       text        NOT NULL DEFAULT 'soundwalk-2026',
  -- pending(입금대기) · confirmed(확정) · waitlist(대기자) · cancelled(취소)
  status        text        NOT NULL DEFAULT 'pending',
  memo          text,
  created_at    timestamptz NOT NULL DEFAULT now()
);

-- 같은 번호 중복 신청 차단 (API에서도 체크하지만 DB 레벨에서 한 번 더)
CREATE UNIQUE INDEX IF NOT EXISTS soundwalk_applications_phone_key
  ON public.soundwalk_applications (phone);

-- 정원/대기자 카운트 쿼리가 status 로 필터링하므로 인덱스 추가
CREATE INDEX IF NOT EXISTS soundwalk_applications_status_idx
  ON public.soundwalk_applications (status);

CREATE INDEX IF NOT EXISTS soundwalk_applications_created_at_idx
  ON public.soundwalk_applications (created_at DESC);

-- RLS: 고객 개인정보(이름·연락처) 테이블이므로 anon 접근 전면 차단.
-- 정책을 만들지 않으면 anon/authenticated 는 아무것도 못 읽고,
-- service_role 은 RLS 를 우회하므로 서버 라우트에서만 조회·기록된다.
ALTER TABLE public.soundwalk_applications ENABLE ROW LEVEL SECURITY;

COMMENT ON TABLE public.soundwalk_applications IS
  '달팽이 소리산책 리트릿 신청자. service_role 전용(RLS 정책 없음).';
