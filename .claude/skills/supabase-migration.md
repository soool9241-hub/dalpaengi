---
name: supabase-migration
description: Supabase 스키마 변경 시 사용. 테이블 추가·컬럼 변경·RLS 정책·인덱스 추가 등 모든 DB 변경 작업에 적용.
---

# Supabase 마이그레이션 스킬

## 펜션 Supabase 프로젝트
- 프로젝트 ID: `zujmishjfpmyjuipncby`
- URL: `https://zujmishjfpmyjuipncby.supabase.co`
- **운영 데이터 있음** — 예약·고객 데이터 보호 최우선

## 절대 금지
- ❌ Supabase 대시보드에서 직접 스키마 수정
- ❌ 운영 DB에 마이그레이션 파일 없이 SQL 실행
- ❌ `DROP TABLE` / `DROP COLUMN` 되돌릴 수 없는 실행 (백업 먼저)
- ❌ RLS 비활성화된 테이블 생성
- ❌ 기존 마이그레이션 파일 수정 (새 파일 추가로 해결)

## 표준 절차

### 1. 파일 생성
경로: `supabase/migrations/YYYYMMDDHHmmss_{description}.sql`

예시: `supabase/migrations/20260424120000_add_vip_flag_to_customers.sql`

### 2. SQL 템플릿

```sql
-- ============================================================
-- Migration: customers 테이블에 vip 플래그 추가
-- Author: sol
-- Date: 2026-04-24
-- ADR: ADR-007 (재방문 3회 이상 VIP 자동 태깅)
-- ============================================================

-- Up: 컬럼 추가
ALTER TABLE customers
  ADD COLUMN IF NOT EXISTS is_vip BOOLEAN NOT NULL DEFAULT FALSE;

-- 인덱스 추가 (VIP 조회 빈번)
CREATE INDEX IF NOT EXISTS idx_customers_vip
  ON customers(is_vip) WHERE is_vip = TRUE;

-- 기존 데이터 마이그레이션 (방문 3회 이상을 VIP로)
UPDATE customers SET is_vip = TRUE WHERE visit_count >= 3;

-- 주석
COMMENT ON COLUMN customers.is_vip IS
  'VIP 여부: 재방문 3회 이상 자동 TRUE, 솔이 수동 지정 가능';

-- RLS 정책 재확인 (필요 시)
-- DROP POLICY IF EXISTS "service_role can read all" ON customers;
-- CREATE POLICY "service_role can read all" ON customers
--   FOR SELECT USING (auth.role() = 'service_role');
```

### 3. RLS 패턴 (펜션 특화)

#### 3-1. 고객·예약 데이터 (민감)
```sql
-- 익명 접근 완전 차단
CREATE POLICY "deny anon" ON reservations
  FOR ALL TO anon USING (false);

-- service_role만 전체 접근
CREATE POLICY "service_role full access" ON reservations
  FOR ALL TO service_role USING (true) WITH CHECK (true);
```

#### 3-2. 공개 데이터 (빈 날짜 등)
```sql
-- 누구나 읽기 허용 (가용성 캘린더)
CREATE POLICY "public read" ON availability_calendar
  FOR SELECT TO anon USING (true);

-- 쓰기는 service_role만
CREATE POLICY "service_role write" ON availability_calendar
  FOR INSERT TO service_role WITH CHECK (true);
```

### 4. 로컬 검증

```bash
# 1. 마이그레이션 문법 확인 (dry-run)
npx supabase db lint

# 2. 로컬 DB에 적용
npx supabase db reset

# 3. 예상 스키마 확인
npx supabase db diff
```

### 5. 운영 적용 전 확인

- [ ] 백업 확인 (Supabase 자동 백업은 7일)
- [ ] 솔에게 확인 요청: "이 마이그레이션을 운영에 적용해도 될까요?"
- [ ] 다운타임 필요한지 판단 (큰 테이블 ALTER는 락 걸릴 수 있음)
- [ ] 롤백 스크립트 준비

### 6. 운영 적용

```bash
npx supabase db push
```

### 7. 적용 후 검증

```sql
-- 스키마 확인
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'customers';

-- RLS 정책 확인
SELECT * FROM pg_policies WHERE tablename = 'customers';

-- 인덱스 확인
SELECT indexname, indexdef
FROM pg_indexes
WHERE tablename = 'customers';
```

## 롤백

새 마이그레이션 파일로 되돌림:

```sql
-- supabase/migrations/20260424130000_rollback_vip_flag.sql
DROP INDEX IF EXISTS idx_customers_vip;
ALTER TABLE customers DROP COLUMN IF EXISTS is_vip;
```

## 자주 쓰는 스키마 변경 패턴

### 컬럼 추가 (nullable → 기본값 → NOT NULL)
```sql
-- Step 1: nullable로 추가
ALTER TABLE reservations ADD COLUMN notes TEXT;

-- Step 2: 기존 레코드에 기본값
UPDATE reservations SET notes = '' WHERE notes IS NULL;

-- Step 3: NOT NULL 제약
ALTER TABLE reservations ALTER COLUMN notes SET NOT NULL;
ALTER TABLE reservations ALTER COLUMN notes SET DEFAULT '';
```

### 뷰 생성 (통계용)
```sql
CREATE OR REPLACE VIEW v_monthly_revenue AS
SELECT
  DATE_TRUNC('month', reservation_date) AS month,
  COUNT(*) AS bookings,
  SUM(total_price) AS revenue,
  SUM(guest_count) AS guests
FROM reservations
WHERE status = 'completed'
GROUP BY DATE_TRUNC('month', reservation_date);
```

### 트리거 (자동 업데이트)
```sql
CREATE OR REPLACE FUNCTION update_visit_count()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE customers
  SET visit_count = visit_count + 1,
      last_visit = NEW.reservation_date,
      is_vip = (visit_count + 1 >= 3)
  WHERE phone = NEW.guest_phone;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_increment_visit
AFTER INSERT ON reservations
FOR EACH ROW
WHEN (NEW.status = 'confirmed')
EXECUTE FUNCTION update_visit_count();
```
