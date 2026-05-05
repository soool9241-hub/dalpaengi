# 코딩 컨벤션 (달팽이아지트 전 프로젝트 공통)

## TypeScript
- `strict: true` 유지
- `any` 금지 → `unknown` + 타입가드
- 함수 반환 타입 명시 (복잡한 추론만 생략)
- enum 대신 `as const` + union 타입

## 네이밍

| 종류 | 규칙 | 예시 |
|------|------|------|
| 컴포넌트 | PascalCase | `ReservationCard.tsx` |
| 훅 | camelCase + `use` | `useReservation` |
| 유틸 | camelCase | `formatKRW`, `maskPhone` |
| 상수 | UPPER_SNAKE_CASE | `MAX_GUEST_COUNT` |
| DB 테이블 | snake_case | `reservations`, `message_logs` |
| 파일명 | kebab-case or PascalCase | `reservation-utils.ts` |

## Import 순서

```typescript
// 1. 외부 라이브러리
import { useState } from 'react'
import { z } from 'zod'

// 2. 절대경로 내부 모듈
import { supabase } from '@/lib/supabase/client'
import { PROGRAMS } from '@/lib/constants/programs'

// 3. 상대경로
import { ReservationCard } from './ReservationCard'

// 4. 타입만 마지막
import type { Reservation } from '@/lib/types'
```

## 컴포넌트

- 함수형 고정, class 금지
- named export 우선 (page.tsx·layout.tsx는 default 허용)
- Props는 interface로 명시:
  ```typescript
  interface ReservationCardProps {
    reservation: Reservation
    onCancel: (id: string) => void
  }
  export function ReservationCard({ reservation, onCancel }: ReservationCardProps) { }
  ```

## 에러 처리

- Supabase 호출:
  ```typescript
  const { data, error } = await supabase.from('reservations').select()
  if (error) {
    console.error('[reservations] fetch failed:', error)
    return { ok: false, error: error.message }
  }
  ```
- try/catch는 **진짜 예외가능 지점**만. 전체 감싸기 금지

## 로그

- 민감정보 마스킹 (전화번호·이름 일부만)
- 접두사로 영역 구분: `[reservations]`, `[sms]`, `[cleaning]`
- 프로덕션에서 `console.log` 제거 (`console.error`만 유지)

## 한국어 처리

- 날짜 포맷: `2026년 4월 24일 (금)` 형식 사용
- 금액: `700,000원` 형식 (천 단위 콤마 + "원")
- 시간: 24시간제 사용 `15:00`, `11:00`

## 주석

- **왜**만 적는다. **무엇**은 코드로 설명
- TODO: `// TODO(sol, 2026-04-24): 리뷰 자동화 추가`
- 비즈니스 규칙은 주석으로 근거 남기기:
  ```typescript
  // 펜션 기본 인원 15인, 초과 시 10,000원/인
  const extraCharge = (guestCount - 15) * 10_000
  ```
