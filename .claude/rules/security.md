# 보안 가드레일 (펜션 운영 특화)

펜션은 **실제 고객의 개인정보(이름·전화번호·방문이력)**를 다룬다.
유출되면 신뢰도 타격 + 개인정보보호법 위반 가능. 아래 규칙을 절대 위반하지 않는다.

---

## 🚨 Critical — 즉시 중단

### 1. 비밀키 노출 금지
- `.env`, `.env.local`, `.env.production` 파일 커밋 금지
- 아래 키들은 **서버 라우트(app/api/) 또는 Server Action에서만** 사용:
  - `SUPABASE_SERVICE_ROLE_KEY`
  - `SOLAPI_API_SECRET`
  - `NAVER_API_SECRET` (광고 API)
- `NEXT_PUBLIC_` 붙지 않은 환경변수는 브라우저에서 사용 불가

### 2. 고객 데이터 클라이언트 노출 금지
- 전화번호·이름·방문이력·결제내역은 **Server Component에서만 조회**
- `"use client"` 컴포넌트에서 `reservations.select('*')` 직접 호출 금지
- 클라이언트에는 **필요한 필드만 가공해서 내려보냄**

**나쁜 예:**
```typescript
'use client'
const { data } = await supabase.from('reservations').select('*')  // ❌ 전체 노출
```

**좋은 예:**
```typescript
// app/api/reservations/upcoming/route.ts (서버)
const { data } = await supabase.from('reservations')
  .select('id, check_in, guest_count')  // ✅ 필요한 필드만
  .gte('check_in', today)
```

### 3. Supabase RLS 필수
- 모든 테이블 **반드시 RLS 활성화**:
  ```sql
  ALTER TABLE reservations ENABLE ROW LEVEL SECURITY;
  ```
- 익명 anon 키로 고객·예약 데이터 읽기·쓰기 허용 정책 금지
- 대표(솔) 전용 CRM은 Supabase Auth의 `auth.uid()`로 제한

### 4. 전화번호 마스킹
- 로그·에러 메시지에 전화번호 평문 출력 금지:
  ```typescript
  const masked = phone.replace(/(\d{3})\d{4}(\d{4})/, '$1-****-$2')
  console.log('[sms] 발송 대상:', masked)  // 010-****-1234
  ```
- 어드민 화면에서도 기본은 마스킹, 클릭 시에만 전체 표시

### 5. 파일 업로드 검증
- 청소 인증 사진 등 업로드:
  - MIME 화이트리스트: `image/jpeg`, `image/png`, `image/webp`
  - 크기 10MB 이하
  - 파일명 UUID로 재생성 (사용자 입력명 사용 금지)
- Supabase Storage **private 버킷**에 저장, signed URL만 배포

### 6. SMS 남용 방지
- 같은 번호 1분 **3회 초과 발송 차단**
- 발송 전 전화번호 형식 검증: `/^01[016789]\d{7,8}$/`
- 테스트 중 실제 고객 번호 발송 금지 (개발용 더미 번호 사용)

### 7. 하드코딩 금지
- API 키·비밀번호·솔 개인 번호(010-8531-9531) 코드에 직접 쓰지 않음
- 환경변수 또는 설정 파일 참조

---

## ⚠️ Major — 머지 전 수정

- 고객 데이터를 쿼리하는 API 라우트에 인증 확인 없음
- Zod 스키마 없이 request body 파싱
- Supabase 호출 결과의 `error` 무시
- 에러 메시지에 내부 구조 노출 (`stack trace`를 클라이언트에 반환)

---

## 경계 파일 (수정 전 솔 확인)

아래 파일 수정 시 반드시 사람에게 확인 요청:

- `middleware.ts` (인증 경계)
- `lib/supabase/server.ts` (service role 사용부)
- `app/api/reservations/**/*` (예약 DB 조작)
- `app/api/notify/**/*` (SMS 발송)
- `supabase/migrations/*.sql` (스키마 변경)
- `.env.example` (환경변수 목록)
- `docs/adr.yaml` (아키텍처 결정)

---

## 커밋 전 체크리스트

- [ ] `.env*` 파일 커밋에 없는가?
- [ ] `console.log`로 전화번호·이름 출력하고 있지 않은가?
- [ ] 새 테이블에 RLS 정책 추가했는가?
- [ ] API 라우트에 Zod 검증 있는가?
- [ ] 클라이언트 컴포넌트에서 고객 전체 데이터 fetch 하지 않는가?
- [ ] 사진 업로드 시 MIME·크기 검증 있는가?
