-- 항아리 바베큐 참가 코스 3종 추가
--   bbq   : 항아리 바베큐만           (1교시, 30,000원)
--   full  : 바베큐 + AI 스터디        (1+2교시, 60,000원)
--   study : AI 스터디만               (2교시, 30,000원)
-- 기존 신청자는 풀코스 기준으로 받았으므로 default 를 full 로 둔다.
ALTER TABLE public.bbq_applications
  ADD COLUMN IF NOT EXISTS course text NOT NULL DEFAULT 'full';

CREATE INDEX IF NOT EXISTS bbq_applications_course_idx
  ON public.bbq_applications (program, course);
