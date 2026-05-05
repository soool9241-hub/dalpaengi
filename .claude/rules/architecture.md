# 아키텍처 규칙

## 레이어 의존성 (단방향)

```
app/          → 페이지·라우트 (최상위)
  ↓
components/   → 재사용 UI
  ↓
lib/          → 도메인·DB·외부 연동 (최하위)
```

**금지:**
- `lib/`가 `components/`·`app/` import
- `components/`가 `app/` import
- 역방향 의존성 = 설계 오류

## Server vs Client 경계

### Server Component (기본)
- 데이터 fetch, service_role 사용
- "use client" 없이 작성
- props로 Client Component에 전달

### Client Component ("use client")
- useState·useEffect·이벤트 핸들러 **필수**인 곳만
- **service_role 키 절대 금지**
- anon 키로만 제한적 쿼리 (RLS 통과하는 것만)

### API Route / Server Action
- 외부 서비스 호출 (Solapi, 네이버 API)
- 민감 로직 (고객 데이터 조회·수정)
- Zod 검증 필수

## Supabase 클라이언트 분리

```typescript
// lib/supabase/client.ts → 브라우저 (anon)
import { createBrowserClient } from '@supabase/ssr'

// lib/supabase/server.ts → 서버 (service_role 또는 쿠키 세션)
import { createServerClient } from '@supabase/ssr'
```

**client.ts와 server.ts는 서로 import 금지.**

## 도메인 상수 위치

| 상수 | 파일 |
|------|------|
| 프로그램·요금 | `lib/constants/programs.ts` |
| 옵션(저녁·조식·체험) | `lib/constants/options.ts` |
| 체크인/아웃 시간 | `lib/constants/schedule.ts` |
| SMS 템플릿 | `lib/sms/templates.ts` |

**어떤 파일에서도 매직 넘버·매직 스트링 금지**. 반드시 위 상수 import.

## 하위 프로젝트 구조

모노레포로 관리할 경우:

```
dalpaengi/
├── apps/
│   ├── web/          # 메인 웹사이트 (dalpaengi-five.vercel.app)
│   ├── cleaning/     # 청소관리앱
│   └── crm/          # 솔 전용 CRM
├── packages/
│   ├── shared/       # 공통 타입·상수 (lib/constants 등)
│   ├── supabase/     # 공통 클라이언트·쿼리
│   └── ui/           # 공통 컴포넌트
├── supabase/
│   └── migrations/   # DB 마이그레이션 통합
└── .claude/          # 하네스 (프로젝트 루트)
```

별도 저장소로 관리할 경우 각 저장소에 `CLAUDE.md`만 심볼릭 링크로 공유.

## 새 기능 추가 절차

1. `lib/`에 도메인 타입·함수 추가 (순수 로직)
2. 필요하면 `app/api/`에 라우트 추가
3. `components/`에 UI 추가
4. `app/` 페이지에서 조립

**페이지 먼저 만들고 나중에 로직 쪼개기는 금지** — 의존성이 꼬인다.

## Supabase 마이그레이션

- `supabase/migrations/` 디렉토리에 SQL 파일만
- 파일명: `YYYYMMDDHHmmss_description.sql`
- 대시보드에서 직접 스키마 변경 금지
- 운영 DB 적용 전 백업 확인

## 환경 분리

- `.env.local` — 로컬 개발
- Vercel Preview — `NEXT_PUBLIC_ENV=preview`
- Vercel Production — `NEXT_PUBLIC_ENV=production`

테스트 데이터와 실운영 데이터가 섞이지 않도록 주의.
