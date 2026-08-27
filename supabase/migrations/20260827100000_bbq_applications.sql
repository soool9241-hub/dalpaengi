-- 항아리 바베큐 모임 신청 테이블
-- 컬럼 구성은 soundwalk_applications / retreat_applications 와 동일하게 맞춘다.
-- 관리자 페이지(app/api/admin/programs)가 세 테이블을 같은 코드로 다루기 때문.
CREATE TABLE IF NOT EXISTS public.bbq_applications (
  id           bigserial PRIMARY KEY,
  name         text NOT NULL,
  phone        text NOT NULL,
  age          text,
  gender       text,
  occupation   text,
  reason       text,
  region       text,
  transport    text,
  photo_consent boolean NOT NULL DEFAULT false,
  -- 월 1회 정기 모임이라 회차마다 program 값이 바뀐다 (bbq-2026-09, bbq-2026-10 ...).
  -- 정원 6명 카운트는 program 단위로 하므로, 회차가 바뀌면 자연히 0부터 다시 센다.
  program      text NOT NULL DEFAULT 'bbq-2026-09',
  status       text NOT NULL DEFAULT 'pending',
  memo         text,
  created_at   timestamptz NOT NULL DEFAULT now()
);

-- 중복 신청 차단은 "같은 회차 안에서" 만 적용한다.
-- phone 단독 UNIQUE 로 걸면 다음 달 재참가가 막힌다.
CREATE UNIQUE INDEX IF NOT EXISTS bbq_applications_phone_program_key
  ON public.bbq_applications (phone, program);
CREATE INDEX IF NOT EXISTS bbq_applications_status_idx
  ON public.bbq_applications (status);
CREATE INDEX IF NOT EXISTS bbq_applications_created_at_idx
  ON public.bbq_applications (created_at DESC);

-- anon 키로는 고객 데이터에 접근할 수 없어야 한다. 정책을 따로 만들지 않으므로
-- service_role(서버 전용) 외에는 읽기·쓰기가 모두 차단된다.
ALTER TABLE public.bbq_applications ENABLE ROW LEVEL SECURITY;
