---
name: solapi-sms
description: Solapi로 SMS/LMS를 발송할 때 사용. 예약 확인·체크인 안내·청소 알림·마케팅 캠페인 등 모든 SMS 관련 작업에 적용.
---

# Solapi SMS 발송 스킬 (펜션 특화)

## 기본 원칙
- SMS 발송은 **반드시 서버사이드에서만** (`app/api/notify/**/*`)
- 모든 메시지에 `[달팽이아지트]` 접두사
- 발송 전 전화번호 형식 검증·Rate limit 통과 필수

## 환경변수
```env
SOLAPI_API_KEY=...
SOLAPI_API_SECRET=...
SOLAPI_SENDER_NUMBER=010XXXXXXXX   # 사전 등록된 발신번호 (필수)
OWNER_PHONE_NUMBER=010XXXXXXXX     # 솔 번호 (검수 알림용)
```

## 표준 구현

```typescript
// lib/sms/client.ts
import { SolapiMessageService } from 'solapi'

export const messageService = new SolapiMessageService(
  process.env.SOLAPI_API_KEY!,
  process.env.SOLAPI_API_SECRET!
)

export function normalizePhone(phone: string): string | null {
  const cleaned = phone.replace(/[^\d]/g, '')
  if (!/^01[016789]\d{7,8}$/.test(cleaned)) return null
  return cleaned
}

export function maskPhone(phone: string): string {
  const cleaned = phone.replace(/[^\d]/g, '')
  if (cleaned.length < 10) return phone
  return `${cleaned.slice(0, 3)}-****-${cleaned.slice(-4)}`
}
```

```typescript
// lib/sms/templates.ts
export const templates = {
  reservationConfirmed: (params: {
    guestName: string
    checkIn: string         // '2026년 4월 25일 (금)'
    guestCount: number
    programName: string
    totalPrice: number
  }) => `[달팽이아지트] ${params.guestName}님, 예약이 확정되었습니다.
📅 ${params.checkIn}
👥 ${params.guestCount}명 / ${params.programName}
💰 ${params.totalPrice.toLocaleString('ko-KR')}원
체크인 15:00 · 체크아웃 11:00
⚠️ 수건 개별 지참 · 반려동물 불가
문의: 010-8531-9531`,

  preCheckin1d: (params: {
    guestName: string
    keypadCode: string
  }) => `[달팽이아지트] ${params.guestName}님, 내일 입실 안내드립니다.
🔑 키패드 번호: ${params.keypadCode}
체크인 15:00부터 가능
주차: 건물 내 무료
⚠️ 퇴실 시 택시 승차 불가 (버스 렌트 문의)
문의: 010-8531-9531`,

  postCheckout: (params: { guestName: string; reviewUrl: string }) =>
    `[달팽이아지트] ${params.guestName}님, 편안한 시간 보내셨나요?
후기 남겨주시면 큰 힘이 됩니다 🐌
${params.reviewUrl}
다음에 또 뵙겠습니다!`,

  cleaningAssigned: (params: { cleanerName: string; date: string }) =>
    `[달팽이아지트] ${params.cleanerName}님, ${params.date} 청소 배정됐습니다.
체크아웃 11:00 → 체크인 15:00 사이
매뉴얼: https://dalpaengi-cleaning.vercel.app/manual
문의: 010-8531-9531`,

  cleaningCompleted: (params: { cleanerName: string; sessionId: string }) =>
    `[달팽이아지트] ${params.cleanerName}님이 청소를 완료했습니다.
검수 부탁드립니다:
https://dalpaengi-cleaning.vercel.app/review/${params.sessionId}`,

  cleaningRejected: (params: {
    cleanerName: string
    zoneName: string
    reason: string
  }) => `[달팽이아지트] 재청소 요청
구역: ${params.zoneName}
사유: ${params.reason}
${params.cleanerName}님, 확인 부탁드립니다.`,

  // 마케팅 (수신 동의자만)
  promoReady: (params: { guestName: string; discount: number; code: string }) =>
    `[달팽이아지트] ${params.guestName}님, ${params.discount}% 할인 쿠폰!
코드: ${params.code}
예약: https://dalpaengi-five.vercel.app
수신거부: 080-xxx-xxxx`,
} as const
```

## Rate Limiting

```typescript
// lib/sms/rate-limit.ts
const recentSends = new Map<string, number[]>()

export function checkRateLimit(phone: string): { allowed: boolean; retryAfter?: number } {
  const now = Date.now()
  const sends = recentSends.get(phone) ?? []
  const recent = sends.filter(t => now - t < 60_000)

  if (recent.length >= 3) {
    const oldest = Math.min(...recent)
    return { allowed: false, retryAfter: 60_000 - (now - oldest) }
  }

  recent.push(now)
  recentSends.set(phone, recent)
  return { allowed: true }
}
```

## API 라우트 패턴

```typescript
// app/api/notify/reservation-confirmed/route.ts
import { z } from 'zod'
import { messageService, normalizePhone, maskPhone } from '@/lib/sms/client'
import { templates } from '@/lib/sms/templates'
import { checkRateLimit } from '@/lib/sms/rate-limit'

const schema = z.object({
  reservationId: z.string().uuid(),
  guestName: z.string().min(1),
  guestPhone: z.string(),
  checkIn: z.string(),
  guestCount: z.number().int().positive(),
  programName: z.string(),
  totalPrice: z.number().int().nonnegative(),
})

export async function POST(request: Request) {
  const body = await request.json()
  const parsed = schema.safeParse(body)
  if (!parsed.success) {
    return Response.json({ error: 'invalid_input' }, { status: 400 })
  }

  const phone = normalizePhone(parsed.data.guestPhone)
  if (!phone) {
    return Response.json({ error: 'invalid_phone' }, { status: 400 })
  }

  const rl = checkRateLimit(phone)
  if (!rl.allowed) {
    return Response.json({ error: 'rate_limited', retryAfter: rl.retryAfter }, { status: 429 })
  }

  const text = templates.reservationConfirmed(parsed.data)

  try {
    const result = await messageService.sendOne({
      to: phone,
      from: process.env.SOLAPI_SENDER_NUMBER!,
      text,
    })
    console.log('[sms] sent to', maskPhone(phone), 'id:', result.messageId)
    return Response.json({ ok: true, messageId: result.messageId })
  } catch (error) {
    console.error('[sms] send failed:', error)
    return Response.json({ ok: false }, { status: 500 })
  }
}
```

## 메시지 로그 저장

발송 성공 시 `message_logs` 테이블에 기록:
```sql
INSERT INTO message_logs (
  reservation_id, phone, template_name, content, sent_at, solapi_message_id
) VALUES (...)
```

## 금지 사항

- 클라이언트 컴포넌트에서 Solapi 직접 호출
- 반복문에서 `await` 없이 병렬 발송 (Rate limit 초과)
- 하드코딩된 전화번호
- 개발 중 실제 고객 번호 발송
- 수신 거부자에게 마케팅 발송
- 야간(21:00~08:00) 광고성 SMS 발송 (정통법 위반)
