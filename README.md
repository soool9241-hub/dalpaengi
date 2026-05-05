# 🐌 달팽이아지트 펜션 메인 웹사이트

> 전북 완주 60평 독채 펜션 — 예약·결제·SMS·어드민 통합 운영 사이트.
> 운영 URL: **https://dalpaengi-five.vercel.app**

---

## 기술 스택

| 영역 | 기술 |
|------|------|
| 프레임워크 | Next.js 16 (App Router) |
| 언어 | TypeScript (strict) |
| 스타일 | Tailwind CSS v4 |
| DB | Supabase (PostgreSQL, RLS) |
| SMS | Solapi |
| 차트 | Recharts |
| 분석 | Vercel Analytics + Speed Insights |
| 배포 | Vercel (master 브랜치 자동 배포) |

---

## 시작하기

### 1. 환경변수

```bash
cp .env.example .env.local
# .env.local 채우기 (Supabase URL/키, Solapi 등)
```

### 2. 개발 서버

```bash
npm install
npm run dev
# → http://localhost:3000
```

### 3. 빌드 / 배포

```bash
npm run build
npm start
```

master 브랜치에 push하면 Vercel이 자동 배포.

---

## 디렉토리 구조

```
src/
├── app/
│   ├── page.tsx              # 메인 랜딩
│   ├── programs/             # 프로그램 상세
│   ├── admin/                # 어드민 대시보드
│   │   ├── page.tsx          # 메인
│   │   ├── reservations/     # 예약 관리 (목록·캘린더)
│   │   ├── customers/        # 고객 관리
│   │   ├── settings/         # 가격 설정
│   │   ├── analytics/        # 통계
│   │   └── bus/              # 버스 견적
│   ├── admin-login/
│   ├── sms/                  # 마케팅 SMS 템플릿
│   └── api/
│       ├── reservations/     # 예약 생성/조회
│       ├── calendar/         # 방막기 캘린더
│       ├── send-sms/         # 예약 확인 SMS
│       └── admin/            # 어드민 전용
├── components/
│   ├── Hero.tsx
│   ├── Programs.tsx
│   ├── Spaces.tsx            # 공간 소개
│   ├── Reservation.tsx       # 예약 폼
│   ├── Reviews.tsx
│   ├── FAQ.tsx
│   ├── Gallery.tsx
│   ├── Location.tsx
│   ├── Contact.tsx
│   └── admin/
└── ...
```

---

## 주요 기능

### 예약
- 손님용 예약 폼 (`Reservation.tsx`) — 프로그램·날짜·인원·옵션 선택
- 추가옵션: BBQ 그릴 / **가스버너** / 저녁식사 / 목공키트 / 항아리BBQ / 버스 렌트
- 예약 목적 입력 (MT단체·가족힐링·교회·기념일·기업워크숍·동호회·기타)
- 자동 SMS 발송 (Solapi `[달팽이아지트]` 접두사)
- 중복 예약 방지: 서버 검증 + 캐시 무효화 + 클라이언트 폴링

### 어드민
- 비밀번호 + HMAC 쿠키 세션
- 예약 목록·캘린더 뷰
- 고객 관리 (재방문 통계)
- 가격·옵션 설정
- 통계 대시보드

### SMS
- 자동 시나리오: 예약 완료, 변경 알림, 체크인 D-1, 후기 요청
- 모든 발송에 `[달팽이아지트]` 접두사
- 발송 로그 `message_logs` 테이블에 저장

---

## 하네스 / 작업 규칙

이 저장소는 **mafia-codereview 하네스**를 따른다. 작업 전 필독:

| 파일 | 내용 |
|------|------|
| [`CLAUDE.md`](./CLAUDE.md) | 프로젝트 정체성·요금 구조·작업 원칙 |
| [`.claude/rules/security.md`](./.claude/rules/security.md) | 비밀키·고객 PII 보호 (Critical) |
| [`.claude/rules/business-logic.md`](./.claude/rules/business-logic.md) | 요금·옵션 검증 규칙 |
| [`.claude/rules/architecture.md`](./.claude/rules/architecture.md) | 레이어 의존·Server/Client 경계 |
| [`.claude/rules/coding-convention.md`](./.claude/rules/coding-convention.md) | TS·네이밍·로그 |
| [`docs/code-convention.yaml`](./docs/code-convention.yaml) | 자동 리뷰 규칙 |
| [`docs/adr.yaml`](./docs/adr.yaml) | 아키텍처 결정 기록 |

### 코드 리뷰 자동화

```bash
claude
/plugin marketplace add vibemafiaclub/mafia-codereview-harness   # 한 번만
/plugin install mafia-codereview                                  # 한 번만

/mafia-codereview:auto    # 6단계 파이프라인 자동 실행
```

---

## 보안 (요약)

- `SUPABASE_SERVICE_ROLE_KEY`·`SOLAPI_API_SECRET` — **서버 라우트 전용**
- `.env*` 절대 커밋 금지
- 모든 테이블 RLS 활성화
- 로그·에러에 전화번호 평문 출력 금지 (마스킹 필수)
- 디버깅 스크립트(`scripts/`)는 PII 포함 가능 → `.gitignore` 적용

상세는 [`security.md`](./.claude/rules/security.md) 참조.

---

## 운영자

- **임솔 (sool9241)** — 펜션지기·스토리팜 대표
- 전화: 환경변수 `OWNER_PHONE_NUMBER` (코드 하드코딩 금지)
- 카카오톡: `sool9241`

🐌 **달팽이처럼 천천히, 하지만 정성을 담아.**
