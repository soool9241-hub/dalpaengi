---
name: customer-analytics
description: 고객·예약 데이터를 분석할 때 사용. 세그먼트별 통계, 재방문률, 매출 분석, 빈 날짜 공략 타겟 추출 등에 적용.
---

# 고객 분석 스킬

## 정의된 고객 세그먼트

| 세그먼트 | purpose 값 | 리드타임 | 평균 인원 |
|---------|----------|---------|----------|
| MT 단체 | `MT` | ~31일 | 25~30명 |
| 가족 힐링 | `가족` | ~67일 | 8~15명 |
| 교회·종교 | `교회` | ~51일 | 20~40명 |
| 기업 워크숍 | `기업` | ~45일 | 15~25명 |
| 기념일 | `기념일` | ~30일 | 4~10명 |
| 동호회 | `동호회` | ~20일 | 10~20명 |

## 자주 쓰는 쿼리

### 1. 세그먼트별 예약 분포 (최근 12개월)

```sql
SELECT
  purpose,
  COUNT(*) AS bookings,
  SUM(guest_count) AS total_guests,
  AVG(guest_count)::numeric(10,1) AS avg_guests,
  SUM(total_price) AS total_revenue,
  AVG(total_price)::int AS avg_revenue
FROM reservations
WHERE status IN ('confirmed', 'completed')
  AND reservation_date >= NOW() - INTERVAL '12 months'
GROUP BY purpose
ORDER BY bookings DESC;
```

### 2. 재방문 고객 리스트

```sql
SELECT
  c.name,
  c.phone,
  c.visit_count,
  c.last_visit,
  SUM(r.total_price) AS lifetime_revenue
FROM customers c
LEFT JOIN reservations r ON r.guest_phone = c.phone
WHERE c.visit_count >= 2
  AND r.status = 'completed'
GROUP BY c.id, c.name, c.phone, c.visit_count, c.last_visit
ORDER BY c.visit_count DESC, lifetime_revenue DESC;
```

### 3. 빈 날짜 공략 타겟 추출 (DB 재연락)

빈 금요일이 있을 때, 과거 금요일 이용 경험이 있는 고객 찾기:

```sql
WITH target_dates AS (
  SELECT generate_series(
    '2026-05-01'::date,
    '2026-05-31'::date,
    '1 day'
  ) AS d
  WHERE EXTRACT(DOW FROM d) = 5  -- 금요일
),
unbooked AS (
  SELECT d FROM target_dates
  WHERE NOT EXISTS (
    SELECT 1 FROM reservations r
    WHERE r.reservation_date = target_dates.d
      AND r.status IN ('confirmed', 'completed')
  )
)
SELECT DISTINCT
  c.name,
  c.phone,
  c.visit_count,
  c.last_visit
FROM customers c
JOIN reservations r ON r.guest_phone = c.phone
WHERE EXTRACT(DOW FROM r.reservation_date) = 5
  AND r.status = 'completed'
  AND c.last_visit <= NOW() - INTERVAL '6 months'
ORDER BY c.visit_count DESC;
```

### 4. 월별 성장률

```sql
SELECT
  DATE_TRUNC('month', reservation_date) AS month,
  COUNT(*) AS bookings,
  SUM(total_price) AS revenue,
  LAG(SUM(total_price), 12) OVER (ORDER BY DATE_TRUNC('month', reservation_date)) AS last_year_revenue,
  ROUND(
    100.0 * (SUM(total_price) - LAG(SUM(total_price), 12) OVER (ORDER BY DATE_TRUNC('month', reservation_date)))
    / NULLIF(LAG(SUM(total_price), 12) OVER (ORDER BY DATE_TRUNC('month', reservation_date)), 0),
    1
  ) AS yoy_growth_pct
FROM reservations
WHERE status = 'completed'
GROUP BY DATE_TRUNC('month', reservation_date)
ORDER BY month DESC;
```

### 5. 옵션 주문 빈도 (항아리 BBQ 관심도)

```sql
SELECT
  COUNT(*) FILTER (WHERE pot_bbq_count > 0) AS pot_bbq_orders,
  COUNT(*) FILTER (WHERE bbq_count > 0) AS basic_bbq_orders,
  COUNT(*) FILTER (WHERE dinner_count > 0) AS dinner_orders,
  COUNT(*) FILTER (WHERE woodcraft_count > 0) AS woodcraft_orders,
  SUM(pot_bbq_count) AS total_pot_bbq_people,
  SUM(bbq_count) AS total_bbq_people
FROM reservations
WHERE reservation_date >= NOW() - INTERVAL '6 months';
```

## 대시보드 컴포넌트 패턴

```typescript
// app/(admin)/dashboard/segments/page.tsx (Server Component)
import { createServerClient } from '@/lib/supabase/server'

export default async function SegmentsDashboard() {
  const supabase = createServerClient()

  const { data, error } = await supabase
    .rpc('get_segment_stats', { months: 12 })  // SQL 함수로 캐싱

  if (error) {
    return <ErrorState message={error.message} />
  }

  return <SegmentChart data={data} />
}
```

## 시각화 추천

| 데이터 | 차트 종류 | 라이브러리 |
|--------|----------|----------|
| 월별 매출 추이 | Line Chart | Recharts |
| 세그먼트 분포 | Donut Chart | Recharts |
| 요일별 예약률 | Heatmap | d3.js or 커스텀 |
| 지역별 고객 분포 | 한국 지도 | react-simple-maps |

## 중요 지표 (KPI)

- **공실률**: `(전체 가능일 - 예약일) / 전체 가능일 * 100`
- **객단가**: `총 매출 / 예약 건수`
- **재방문률**: `visit_count >= 2 고객 수 / 전체 고객 수 * 100`
- **세그먼트 점유율**: 세그먼트별 예약 수 비율

## 금지

- 익명 anon 키로 고객 데이터 조회
- 분석 쿼리에서 `SELECT *` 사용 (필요한 컬럼만)
- 솔 외의 사용자에게 고객 전화번호·이름 노출
