---
name: reservation-query
description: 예약 데이터를 조회·생성·수정할 때 사용. 일별·월별 통계, 특정 고객 예약 이력, 날짜 차단 여부 확인 등 모든 예약 관련 작업에 적용.
---

# 예약 조회·생성 스킬

## 테이블 구조 (핵심 컬럼)

```sql
reservations (
  id uuid PRIMARY KEY,
  reservation_date date NOT NULL,     -- 체크인 날짜
  checkout_date date,                  -- 체크아웃 날짜
  stay_nights int,                     -- 숙박일수
  program_type text,                   -- overnight, hourly_3h, half_day
  time_slot text,                      -- 3시간/주야간용 (예: '14:00-17:00')
  purpose text,                        -- MT, 가족, 기업, 교회, 기념일, 동호회
  guest_count int NOT NULL,
  guest_name text,
  guest_phone text,
  total_price int,
  status text DEFAULT 'confirmed',     -- confirmed, cancelled, completed
  bbq_count int,                        -- 바베큐 인원
  dinner_count int,                     -- 저녁 인원
  woodcraft_count int,                  -- 목공 체험 인원
  pot_bbq_count int,                    -- 항아리 BBQ 인원
  bus_requested boolean,
  created_at timestamptz
)
```

## 표준 쿼리 패턴

### 특정 월 예약 조회 (서버사이드)
```typescript
// app/api/reservations/monthly/[year]/[month]/route.ts
import { createServerClient } from '@/lib/supabase/server'

export async function GET(
  request: Request,
  { params }: { params: { year: string; month: string } }
) {
  const supabase = createServerClient()

  const startDate = `${params.year}-${params.month.padStart(2, '0')}-01`
  const endDate = new Date(
    Number(params.year),
    Number(params.month),
    0
  ).toISOString().split('T')[0]

  const { data, error } = await supabase
    .from('reservations')
    .select('id, reservation_date, guest_count, program_type, purpose, status')
    .gte('reservation_date', startDate)
    .lte('reservation_date', endDate)
    .order('reservation_date', { ascending: true })

  if (error) {
    console.error('[reservations] monthly fetch failed:', error)
    return Response.json({ ok: false, error: error.message }, { status: 500 })
  }

  return Response.json({ ok: true, data })
}
```

### 특정 날짜 예약 가능 여부
```typescript
export async function isDateAvailable(date: string): Promise<boolean> {
  const supabase = createServerClient()

  // 1. 차단된 날짜인지 확인
  const { data: blocked } = await supabase
    .from('availability_calendar')
    .select('id')
    .eq('blocked_date', date)
    .maybeSingle()
  if (blocked) return false

  // 2. 이미 예약이 있는지 확인
  const { data: existing } = await supabase
    .from('reservations')
    .select('id')
    .eq('reservation_date', date)
    .in('status', ['confirmed', 'completed'])
    .maybeSingle()

  return !existing
}
```

### 고객 예약 이력 조회
```typescript
export async function getCustomerHistory(phone: string) {
  const supabase = createServerClient()

  // 전화번호 정규화 (010-xxxx-xxxx → 010xxxxxxxx)
  const normalized = phone.replace(/-/g, '')

  const { data, error } = await supabase
    .from('reservations')
    .select('id, reservation_date, guest_count, purpose, total_price')
    .eq('guest_phone', normalized)
    .order('reservation_date', { ascending: false })

  return { data, error }
}
```

## 예약 생성 시 검증 순서

1. **Zod 스키마로 입력 검증**
2. **비즈니스 규칙 검증** (`lib/validators/reservation.ts`의 `validateReservation` 호출)
3. **날짜 가용성 확인** (`isDateAvailable`)
4. **중복 예약 방지** (같은 전화번호로 같은 날짜)
5. **DB insert + RLS 통과 확인**
6. **고객 테이블 동기화** (신규면 insert, 재방문이면 `visit_count` 증가)
7. **SMS 발송** (예약 완료 안내)

## 절대 금지

- `select('*')` 로 전체 컬럼 가져와서 클라이언트에 노출
- 익명 anon 키로 예약 수정·삭제
- 과거 날짜 예약 허용
- 취소된 예약(`status='cancelled'`) 가용성 체크에 포함

## 자주 쓰는 통계 쿼리

### 월별 매출
```sql
SELECT
  DATE_TRUNC('month', reservation_date) AS month,
  COUNT(*) AS booking_count,
  SUM(total_price) AS revenue,
  SUM(guest_count) AS total_guests
FROM reservations
WHERE status = 'completed'
GROUP BY month
ORDER BY month DESC;
```

### 세그먼트별 점유율
```sql
SELECT purpose, COUNT(*), AVG(guest_count)
FROM reservations
WHERE reservation_date >= NOW() - INTERVAL '12 months'
GROUP BY purpose;
```
