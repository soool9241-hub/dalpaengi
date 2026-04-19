# AI랩 — 에이전트 로스터 INDEX

> 28명 전체 에이전트 프롬프트 인덱스. 각 링크는 해당 에이전트의 v1 프롬프트 파일입니다.
> 지침서: [../AI랩_완전자율_에이전시_지침서.md](../AI랩_완전자율_에이전시_지침서.md)

---

## Layer 0 — Meta (자기 육성) · 모두 L5

| # | 에이전트 | 역할 | 프롬프트 |
|---|---|---|---|
| M00 | Mentor Agent | Chief Orchestrator의 스승 | [v1](./M00-mentor/v1.md) |
| M01 | Roster Planner | 조직 편성·신규 에이전트 스폰 | [v1](./M01-roster-planner/v1.md) |
| M02 | Prompt Evolution Agent | 프롬프트 버전 관리·A/B 테스트 | [v1](./M02-prompt-evolution/v1.md) |
| M03 | Metrics/Audit Agent | KPI 추적·이상 탐지 | [v1](./M03-metrics-audit/v1.md) |
| M04 | Ethics/Safety Gate | 금기 수호자·킬스위치 | [v1](./M04-ethics-safety/v1.md) |

## Layer 1 — Governance

| # | 에이전트 | 역할 | 자율성 | 프롬프트 |
|---|---|---|---|---|
| C00 | Chief Orchestrator | 최고 지휘자 (AI) | L4 | [v1](./C00-chief-orchestrator/v1.md) |
| C01 | Client Liaison | 사람 발주자와 유일한 접점 | L3 | [v1](./C01-client-liaison/v1.md) |
| C02 | Gate Reviewer | G1~G6 게이트 심사관 | L3 | [v1](./C02-gate-reviewer/v1.md) |

## Layer 2 — Execution (20명)

### 기획 / 영업
| # | 에이전트 | 역할 | 자율성 | 프롬프트 |
|---|---|---|---|---|
| 01 | Discovery Agent | 요구사항 문서화 | L3 | [v1](./01-discovery/v1.md) |
| 02 | Proposal Agent | 제안서·견적 | L3 | [v1](./02-proposal/v1.md) |
| 03 | Research Agent | 경쟁사·레퍼런스 조사 | L3 | [v1](./03-research/v1.md) |
| 04 | Brand/Copy Agent | 톤·슬로건·카피 | L3 | [v1](./04-brand-copy/v1.md) |

### 설계
| # | 에이전트 | 역할 | 자율성 | 프롬프트 |
|---|---|---|---|---|
| 05 | Information Architect | 사이트맵·와이어프레임 | L3 | [v1](./05-information-architect/v1.md) |
| 06 | UI Designer Agent | 디자인 시스템·토큰 | L3 | [v1](./06-ui-designer/v1.md) |

### 빌드
| # | 에이전트 | 역할 | 자율성 | 프롬프트 |
|---|---|---|---|---|
| 07 | Frontend Builder | React/Vite 구현 | L3 | [v1](./07-frontend-builder/v1.md) |
| 08 | Backend/DB Agent | Supabase 스키마·RLS | L3 | [v1](./08-backend-db/v1.md) |
| 09 | Automation Agent | n8n·Claude API·Solapi | L3 | [v1](./09-automation/v1.md) |
| 10 | Integration Agent | 결제·지도·카톡 외부 연동 | L3 | [v1](./10-integration/v1.md) |
| 11 | Content Migration | 기존 사이트 이관 | L2 | [v1](./11-content-migration/v1.md) |

### 품질
| # | 에이전트 | 역할 | 자율성 | 프롬프트 |
|---|---|---|---|---|
| 12 | QA Agent | 50항목 체크리스트 | L2 | [v1](./12-qa/v1.md) |
| 13 | Performance Agent | Lighthouse·번들 최적화 | L2 | [v1](./13-performance/v1.md) |
| 14 | Security/Audit Agent | RLS·시크릿·OWASP | L2 | [v1](./14-security-audit/v1.md) |
| 15 | SEO Agent | 메타·OG·schema.org | L3 | [v1](./15-seo/v1.md) |

### 운영
| # | 에이전트 | 역할 | 자율성 | 프롬프트 |
|---|---|---|---|---|
| 16 | Deploy Agent | Vercel·도메인·환경변수 | L3 | [v1](./16-deploy/v1.md) |
| 17 | Analytics Agent | 대시보드·주간 리포트 | L3 | [v1](./17-analytics/v1.md) |
| 18 | Support/Maintenance | 런칭 후 AS | L3 | [v1](./18-support-maintenance/v1.md) |

### 지원
| # | 에이전트 | 역할 | 자율성 | 프롬프트 |
|---|---|---|---|---|
| 19 | Docs/Handover Agent | 인수인계서·매뉴얼 | L3 | [v1](./19-docs-handover/v1.md) |

### 예비 슬롯
| # | 상태 |
|---|---|
| 20~29 | 비어있음 — Roster Planner(M01)가 병목 감지 시 스폰 |

---

## 자율성 등급 요약

- **L5 (5명)**: M00~M04 — 조직 확장·프롬프트 수정·킬스위치
- **L4 (1명)**: C00 — 실행 레이어 전체 오케스트레이션
- **L3 (17명)**: 대부분의 실행 + Governance
- **L2 (5명)**: 품질 레이어 + Content Migration (승인 게이트 필요)
- **L1**: 기본값 (강등된 에이전트만 임시 배치)

---

## 프롬프트 버전 관리 규칙

1. 모든 프롬프트는 `v{n}.md`로 불변 저장
2. 현재 활성 버전은 `current.md` (심볼릭 또는 프론트매터 명시)
3. 수정은 **Prompt Evolution Agent (M02)만** 가능
4. A/B 테스트 통과 시 `v{n+1}.md` 생성 + `current.md` 전환
5. 롤백 시 `current.md`만 이전 버전으로 복원 (원본 불변)

---

## 다음 단계

- [ ] `/projects/_template/` 부트스트랩 구조 생성
- [ ] `state.md` 스키마 검증 스크립트
- [ ] 파일럿 프로젝트 1건 (달팽이 멤버십 사이트)
- [ ] Metrics Agent 초기 대시보드
- [ ] 첫 A/B 테스트 사이클 가동 (v1 → v2)
