-- 달팽이 프라이빗 멤버십 지원서
--
-- 항바모(bbq_applications)와 달리 "신청"이 아니라 "지원 → 심사 → 입회" 흐름이다.
-- 인프라 맵 쉐어가 참여 원칙이라, 채널 규모보다 give/want/helped 세 답변이 핵심 판단 자료다.
-- 컬럼 모양은 다른 신청 테이블(name/phone/status/program/memo/created_at)과 맞춰서
-- 관리자 라우트가 동일하게 다룰 수 있게 한다.
CREATE TABLE IF NOT EXISTS public.membership_applications (
  id            bigserial PRIMARY KEY,
  name          text NOT NULL,
  phone         text NOT NULL,
  email         text,
  occupation    text,
  region        text,

  -- 인프라 맵: 운영 채널과 대략 규모. 정확한 수치가 아니라 자기 신고값이다.
  channels      text,
  reach         integer,

  -- 지원서 핵심 3문항. want 만 길고 give 가 비면 이 멤버십과 맞지 않는다는 판단 근거.
  give          text,
  want          text,
  helped        text,

  how_found     text,
  privacy_consent boolean NOT NULL DEFAULT false,

  -- 월 1기수 오픈이라 기수마다 값이 바뀐다 (membership-2026-10, -11 ...).
  program       text NOT NULL DEFAULT 'membership-2026-10',
  status        text NOT NULL DEFAULT 'pending',
  memo          text,
  created_at    timestamptz NOT NULL DEFAULT now()
);

-- 중복 지원 차단은 "같은 기수 안에서만". 이번 기수 탈락자가 다음 기수에 다시 지원할 수 있어야 한다.
CREATE UNIQUE INDEX IF NOT EXISTS membership_applications_phone_program_key
  ON public.membership_applications (phone, program);
CREATE INDEX IF NOT EXISTS membership_applications_status_idx
  ON public.membership_applications (status);
CREATE INDEX IF NOT EXISTS membership_applications_created_at_idx
  ON public.membership_applications (created_at DESC);

ALTER TABLE public.membership_applications ENABLE ROW LEVEL SECURITY;
