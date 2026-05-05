---
name: n8n-workflow
description: n8n 자동화 워크플로우를 설계·수정할 때 사용. SMS 캠페인, Google Sheets 동기화, Supabase 이벤트 트리거 등 모든 자동화 관련 작업에 적용.
---

# n8n 워크플로우 스킬 (펜션 특화)

## n8n 환경 제약
- **환경변수 지원 안 됨** → API 키는 Code 노드에 하드코딩 (n8n 내부에만 존재)
- 모놀리식 워크플로우 금지 → **목적별 분리 + Execute Workflow 연결**
- 솔의 n8n 서버: (인스턴스 URL은 별도 관리)

## 달팽이아지트 운영 중인 워크플로우

| ID | 이름 | 목적 |
|----|------|------|
| WF-1 | 예약 확정 SMS | Supabase insert → Solapi 발송 + 로그 |
| WF-2 | 체크인 1일 전 안내 | 매일 09:00 스케줄, 내일 예약자 필터 |
| WF-3 | 퇴실 후 후기 요청 | 체크아웃 당일 18:00 |
| WF-4 | Google Sheets 동기화 | 예약 데이터 → v10 고객리스트 시트 |
| WF-5 | 광고 성과 수집 | 네이버 SA API → ad_performance 테이블 |

## 표준 워크플로우 패턴

### 패턴 1: Supabase 이벤트 트리거 → SMS

```
[Webhook/Trigger] 예약 insert 감지
    ↓
[Function] 데이터 변환 (guest_name, checkIn 포맷팅)
    ↓
[HTTP Request] Solapi API 호출 (POST)
    ↓
[Supabase] message_logs 테이블에 발송 이력 저장
    ↓
[If] 발송 실패 시 → Slack 알림
```

### 패턴 2: 스케줄 기반 필터

```
[Schedule] 매일 09:00
    ↓
[Supabase] reservations 조회 WHERE reservation_date = today + 1
    ↓
[Function] 각 예약마다 키패드 번호 조회
    ↓
[Loop] 예약별로
    ↓
  [Execute Workflow] WF-1 호출 (SMS 발송 서브플로우)
```

### 패턴 3: Google Sheets ↔ Supabase 양방향

- v5 발송관리 시트 ID: `1gLoBug5SgbJBE2ccmmd2nSRbc_lFqKf7`
- v10 고객리스트 시트 ID: `1exogLs62kOrd4b2dQOwQ5NIL1fK3SPc0`

```
[Schedule] 매 1시간
    ↓
[Supabase] 마지막 동기화 이후 신규 예약 조회
    ↓
[Google Sheets] append row to v10
    ↓
[Supabase] 고객 수동 입력분을 역방향으로 동기화
```

## Code 노드 템플릿 (JavaScript)

```javascript
// 예시: 예약 데이터를 SMS 템플릿으로 변환
const items = $input.all()

const SOLAPI_SENDER = '01085319531'  // 하드코딩 (n8n 환경변수 미지원)

return items.map(item => {
  const r = item.json
  const checkInDate = new Date(r.reservation_date)
  const formatted = checkInDate.toLocaleDateString('ko-KR', {
    year: 'numeric', month: 'long', day: 'numeric', weekday: 'short'
  })

  return {
    json: {
      to: r.guest_phone.replace(/-/g, ''),
      from: SOLAPI_SENDER,
      text: `[달팽이아지트] ${r.guest_name}님, 예약이 확정되었습니다.\n📅 ${formatted}\n👥 ${r.guest_count}명\n체크인 15:00 · 체크아웃 11:00\n⚠️ 수건 개별 지참\n문의: 010-8531-9531`,
      reservationId: r.id,
    },
  }
})
```

## Webhook 수신 (Next.js → n8n)

```typescript
// app/api/webhooks/n8n/route.ts
export async function POST(request: Request) {
  const body = await request.json()

  // n8n에서 전송한 시크릿 검증
  const secret = request.headers.get('x-n8n-secret')
  if (secret !== process.env.N8N_WEBHOOK_SECRET) {
    return Response.json({ error: 'unauthorized' }, { status: 401 })
  }

  // 처리 로직
  // ...
}
```

## 금지 사항

- n8n Code 노드에 솔의 개인 정보·카카오톡 ID 하드코딩
- 무한 루프 가능성 있는 워크플로우 (예: Supabase insert → Webhook → Supabase insert)
- 같은 수신자에게 다중 워크플로우가 동시 발송
- 실패 시 재시도 없이 조용히 무시

## 디버깅 팁

- Execution 로그에서 각 노드 입출력 확인
- `console.log`는 Execution 로그에 표시됨
- 프로덕션 실행 전 **Manual Execution**으로 테스트
- 큰 데이터는 `Split In Batches`로 나눠서 처리
