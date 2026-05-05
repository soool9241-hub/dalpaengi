# 비즈니스 로직 규칙 (펜션 운영 특화)

이 문서는 **달팽이아지트의 비즈니스 규칙을 코드로 강제**하기 위한 가드레일이다.
할인·요금·옵션 계산은 여기 정의된 상수·함수만 사용한다.

---

## 1. 요금 계산 기준 (`lib/pricing.ts`에 고정)

### 1-1. 기본 프로그램
```typescript
export const PROGRAMS = {
  OVERNIGHT: {
    id: 'overnight',
    name: '숙박 패키지',
    basePrice: 700_000,
    baseGuestCount: 15,
    durationHours: 24,
  },
  HOURLY_3H: {
    id: 'hourly_3h',
    name: '3시간 단위 대여',
    basePrice: 300_000,
    baseGuestCount: 15,
    durationHours: 3,
  },
  HALF_DAY: {
    id: 'half_day',
    name: '주/야간 패키지',
    basePrice: 400_000,
    baseGuestCount: 15,
    durationHours: 5,
  },
} as const

export const EXTRA_GUEST_PRICE = 10_000  // 인당 추가 요금
export const MAX_CAPACITY = 40           // 최대 수용 인원
```

### 1-2. 요금 계산 함수
반드시 아래 함수만 사용:
```typescript
export function calculateTotalPrice(params: {
  programId: keyof typeof PROGRAMS
  guestCount: number
  options?: ReservationOption[]
}): number {
  const program = PROGRAMS[params.programId]
  const extraGuests = Math.max(0, params.guestCount - program.baseGuestCount)
  const basePrice = program.basePrice + extraGuests * EXTRA_GUEST_PRICE
  const optionsTotal = (params.options ?? []).reduce((sum, opt) => sum + opt.price, 0)
  return basePrice + optionsTotal
}
```

**금지:** 컴포넌트나 API에서 `700_000`, `10_000` 같은 숫자 직접 쓰기. 반드시 PROGRAMS 참조.

---

## 2. 옵션 상품

### 2-1. 저녁 옵션
```typescript
export const DINNER_OPTIONS = {
  BASIC: { name: '저녁 기본(목살)', pricePerPerson: 10_000, minPeople: 1 },
  PREMIUM_PORK: { name: '항아리 통삼겹', pricePerPerson: 30_000, minPeople: 10 },
  PREMIUM_RIBS: { name: '항아리 등갈비', pricePerPerson: 30_000, minPeople: 10 },
} as const
```

**검증 규칙:**
- 프리미엄 옵션은 **최소 10인 이상**만 주문 가능
- 주문 인원이 `minPeople` 미만이면 UI에서 선택 불가 처리

### 2-2. 조식
- 1인 10,000원
- **15인 이상** 주문 시 배달비 무료
- 사전 주문 필수

### 2-3. 체험 프로그램
```typescript
export const EXPERIENCES = {
  SINGING_BOWL: { name: '싱잉볼 체험', pricePerPerson: 30_000 },
  FOOT_BATH: { name: '사해소금 족욕', pricePerPerson: 15_000 },
  TREE_MAKING: { name: '트리 만들기', pricePerPerson: 20_000, seasonal: '11-12' },
  SOUND_COLLECTING: { name: '주변 소리 채집', pricePerPerson: 30_000 },
  MOVEMENT: { name: '움직임 워크샵', pricePerPerson: 20_000 },
} as const

export const EXPERIENCE_ADVANCE_DAYS = 14  // 최소 14일 전 예약
```

### 2-4. 목공 체험
```typescript
export const WOODCRAFT = {
  PLATE: { name: '나무접시', price: 10_000 },
  TRAY: { name: '트레이', price: 20_000 },
  CUTTING_BOARD: { name: '도마', price: 30_000 },
  TREE: { name: '트리', price: 30_000, seasonal: '11-12' },
} as const
```

---

## 3. 예약 검증 규칙

### 3-1. 필수 검증
```typescript
export function validateReservation(res: ReservationInput): Result {
  // 기본 인원 이상
  if (res.guestCount < 1) return { ok: false, error: '최소 1명 이상' }

  // 최대 수용 인원 (40명)
  if (res.guestCount > MAX_CAPACITY) {
    return { ok: false, error: `최대 ${MAX_CAPACITY}명까지 가능` }
  }

  // 체크인 날짜 유효성
  if (new Date(res.checkIn) < new Date()) {
    return { ok: false, error: '과거 날짜 예약 불가' }
  }

  // 프리미엄 저녁은 10인 이상
  if (res.dinnerOption === 'PREMIUM_PORK' || res.dinnerOption === 'PREMIUM_RIBS') {
    if (res.guestCount < 10) {
      return { ok: false, error: '프리미엄 저녁은 최소 10인 이상' }
    }
  }

  // 체험 프로그램은 14일 전
  if (res.experiences?.length) {
    const daysUntil = differenceInDays(new Date(res.checkIn), new Date())
    if (daysUntil < EXPERIENCE_ADVANCE_DAYS) {
      return { ok: false, error: `체험 프로그램은 최소 ${EXPERIENCE_ADVANCE_DAYS}일 전 예약` }
    }
  }

  return { ok: true }
}
```

### 3-2. 중복 예약 방지
- 같은 날짜에 숙박 예약 1건 이상 존재 시 차단
- `availability_calendar`에 차단된 날짜인지 확인
- 에어비앤비 예약과 충돌 확인 (수동 입력 기반)

---

## 4. 운영 제약 (UI에 반영)

- ⚠️ **수건 미제공** — 예약 확정 SMS에 명시
- ⚠️ **반려동물 불가** — 예약 폼에 동의 체크박스
- 체크인 **15:00**, 체크아웃 **11:00** (변경 금지)
- 셀프 체크인 — 키패드 번호 사전 발송
- 퇴실 시 **택시 승차 불가** — 버스 렌트 안내 필수

---

## 5. SMS 발송 규칙

### 5-1. 자동 발송 시나리오
```typescript
export const SMS_TRIGGERS = {
  RESERVATION_CONFIRMED: '예약 완료 직후',
  PRE_CHECKIN_7D: '체크인 7일 전 안내',
  PRE_CHECKIN_1D: '체크인 1일 전 키패드 번호',
  POST_CHECKOUT: '퇴실 후 후기 요청',
  CLEANING_REQUESTED: '청소 담당자에게 배정 알림',
  CLEANING_COMPLETED: '솔에게 검수 요청',
} as const
```

### 5-2. SMS 콘텐츠 규칙
- 발신자: 항상 `[달팽이아지트]` 접두사
- 길이: 가능하면 90자 이내 (SMS), 초과 시 LMS
- 주요 정보 순서: 날짜 → 주요 내용 → 링크 → 문의처
- 개인정보 포함 시 수신자만 알 수 있는 정보만

---

## 6. 고객 관리 규칙

### 6-1. 재방문 고객 식별
- 전화번호(phone) 기준 unique
- `visit_count` 자동 증가
- 3회 이상 재방문 = VIP 태그 자동 부여

### 6-2. 개인정보 보존 기간
- 예약 완료 후 **3년 보관** (세무 목적)
- 3년 경과 시 전화번호·이름 자동 마스킹 처리
- 삭제 요청 시 즉시 익명화 (`guest_name = '삭제된 고객'`)

---

## 7. 고정 URL·링크

- 버스 견적 의뢰: https://forms.gle/Ri4huHrXpr3rg9FH6
- 에어비앤비: https://www.airbnb.co.kr/rooms/28715892
- 카카오톡: sool9241
- 솔 번호: 환경변수 `OWNER_PHONE_NUMBER` (코드 하드코딩 금지)

---

## 8. 위반 시 리뷰 에이전트 대응

- `700000`, `10000` 같은 매직 넘버 발견 → Major 지적
- 예약 생성 API에 `validateReservation` 호출 없음 → Critical 지적
- SMS 발송에 `[달팽이아지트]` 접두사 빠짐 → Minor 지적
- 체크인 시간을 `14:00` 같은 다른 값으로 하드코딩 → Critical 지적
