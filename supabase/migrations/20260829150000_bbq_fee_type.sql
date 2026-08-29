-- 항아리 바베큐 요금 3단
--   guest  : 일반 참가            60,000원
--   code   : 라이브 코드 할인     50,000원
--   member : 멤버십 회원          15,000원
--
-- "무엇을 듣느냐"가 아니라 "누구냐"로 갈린다. 프로그램은 모두 동일한 4시간이라
-- 코스가 아니라 요금 유형이다. 정산 대조를 위해 실제 금액도 같이 저장한다.
-- (직전에 만들었던 course 컬럼 마이그레이션은 적용 전에 폐기됨)
ALTER TABLE public.bbq_applications
  ADD COLUMN IF NOT EXISTS fee_type text NOT NULL DEFAULT 'guest';

ALTER TABLE public.bbq_applications
  ADD COLUMN IF NOT EXISTS fee_amount integer NOT NULL DEFAULT 60000;

CREATE INDEX IF NOT EXISTS bbq_applications_fee_type_idx
  ON public.bbq_applications (program, fee_type);
