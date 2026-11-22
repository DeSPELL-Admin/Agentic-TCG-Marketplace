# Agentic TCG Marketplace

AI Agent × MCP × x402 기반 TCG 거래 PoC의 개발 시작용 모노레포입니다.
정연한 담당 범위의 실행 가능한 최소 구조를 제공하며, 거래·결제·Agent 구현은 각 담당자가 추가합니다.

## 빠른 시작

Node.js 24 LTS, pnpm 12.9.1이 필요합니다. 아래 명령은 저장소 루트에서 실행합니다.

```powershell
pnpm env:init
pnpm install
pnpm dev
```

- Web: `http://127.0.0.1:<PORT>`
- Core API: `http://127.0.0.1:<API_PORT>/health`
- 검색: `<CORE_API_URL>/api/cards?q=pika&limit=10`
- 적정가: `<CORE_API_URL>/api/cards/00000000-0000-4000-8000-000000000001/valuation`

`pnpm env:init`은 루트 `.env`에 암호학적 난수 기반 DB 비밀번호와 계정·DB 이름, 사용 가능한 서로 다른 임의 포트를 생성합니다. 생성 결과에는 접속 포트만 표시하며 비밀값은 표시하지 않습니다. 기존 `.env`는 덮어쓰지 않습니다. 이미 생성한 경우 이 단계는 생략하세요. 수동 구성은 `.env.example`을 참고합니다. Web은 `PORT`, API는 `API_PORT`, Compose의 DB 공개 포트는 `POSTGRES_PORT`를 사용하며 `CORE_API_URL`과 `DATABASE_URL`도 일치해야 합니다.

Mock 모드는 외부 API 키·PostgreSQL·체인 연결 없이 실행됩니다. `pnpm install`의 postinstall이 Prisma Client를 생성합니다. `.env`는 커밋하지 않습니다.

## 디렉터리

```text
apps/
  web/                 Next.js 16 / React 19, 서버 측 API 조회
  api/                 Fastify 5 통합 호스트
  agent/               [예약] 최재민 Agent Runtime
packages/
  aggregator/          카드 데이터 어댑터, Service, REST Plugin
  valuation/           가격 어댑터, 기본 중앙값 평가, REST Plugin
  contracts/           공통 DTO, Zod v4 Schema, 오류 코드
  db/                  Prisma 7 Client, Schema, Migration
  config/              환경변수 검증, 공통 TypeScript 설정
  trading/             [예약] 이채영
  mcp-server/          [예약] 김민지
  mcp-client/          [예약] 김민지
  payment-server/      [예약] 최승원
  payment-client/      [예약] 최승원
infra/                 PostgreSQL Docker Compose
research/              이재환 연구·실험
docs/                  통합 규칙 및 계약 결정 사항
```

예약 패키지는 `src/index.ts`와 README만 제공하며 업무 로직·실행·테스트가 아직 없습니다.

## PostgreSQL 연결

Docker Engine을 실행한 뒤 다음 명령을 사용합니다.

```powershell
pnpm infra:up
pnpm db:migrate
pnpm db:seed
pnpm db:check
```

API에서도 연결하려면 루트 `.env`의 `DATABASE_ENABLED=true`로 변경하고 서버를 재시작합니다. 활성화 시 연결 실패는 서버 부팅 실패로 처리합니다.

카드·가격 표본의 저장 위치는 `CARD_DATA_SOURCE=mock|database`로 선택합니다. `mock`은 메모리 어댑터이며 DB가 필요 없습니다. `database`는 DB 연결을 요구하며 PostgreSQL에서 검색·상세·가격 표본을 조회합니다. DB 장애 시 메모리 Mock으로 조용히 대체하지 않습니다. `/health`의 `cardDataSource`로 활성 어댑터를 확인할 수 있습니다.

`pnpm db:seed`는 고정 UUID의 시연 카드 3개와 `MOCK` 가격 표본 6개를 트랜잭션으로 upsert합니다. 반복 실행해도 중복되지 않으며 다른 ID의 데이터는 삭제하지 않습니다. `DATA_MODE=mock`은 두 저장 방식 모두 합성 가격을 사용한다는 의미입니다. DB에서 읽었다고 실제 시장가격이 되지 않습니다. 실제 외부 카드·시세 수집은 후속 범위입니다.

목록에서 카드 이름을 선택하면 `/cards/:id` 상세 화면으로 이동합니다. 카드 속성과 가격·표본 수·신뢰 수준·출처·평가 시각을 확인할 수 있습니다.

## 외부 카드 수집

```powershell
pnpm cards:collect --query Pikachu --limit 5
```

Migration 적용 후 실행합니다. TCGdex 영어 카탈로그에서 최대 5개를 조회하고, 영구 매핑된 내부 UUID로 DB에 저장한 뒤 조회까지 확인합니다. 기본 limit는 5, 허용 범위는 1~100이며 첫 페이지만 수집합니다. 재실행해도 중복 카드가 생성되지 않습니다. API가 `CARD_DATA_SOURCE=database`이면 기존 `/api/cards`, `/api/cards/:id`에서 저장된 외부 카드도 조회됩니다. 일반 조회는 외부 API를 호출하지 않습니다. 수집 카드의 상태·에디션은 UNSPECIFIED이며, 가격 표본은 별도로 수집해야 합니다. 상세 규칙은 [Aggregator 가이드](packages/aggregator/README.md)를 확인하세요.

```powershell
pnpm infra:down
```

종료해도 데이터 볼륨은 유지됩니다. Compose 계정은 로컬 개발 전용입니다.

## 검증 및 개별 실행

```powershell
pnpm typecheck
pnpm test
pnpm test:db
pnpm build
pnpm --filter @tcg/api dev
pnpm --filter @tcg/web dev
pnpm --filter @tcg/aggregator test
```

모든 구현 패키지는 독립 `test` 스크립트를 제공합니다. `pnpm test`는 외부 DB 없이 실행할 수 있으며 DB 통합 테스트는 건너뜁니다. `pnpm test:db`는 루트 `.env`를 읽고 실제 PostgreSQL 통합 테스트까지 실행합니다. 마이그레이션을 먼저 적용하세요. 테스트 전용 DB가 있다면 `DATABASE_TEST_URL`로 지정할 수 있고 미지정 시 `DATABASE_URL`을 사용합니다. 통합 테스트는 시연 seed를 upsert하고 직접 생성한 임시 카드·표본만 정리합니다. `pnpm db:check`로 실제 연결과 테이블 존재도 확인할 수 있습니다.

내부 패키지는 개발 편의를 위해 소스(`src/index.ts`)를 공개합니다. Next.js는 `transpilePackages`, API는 `tsx`로 이를 실행합니다. 라이브러리 build는 `dist`를 생성하며 npm 배포·독립 Docker 이미지 패키징은 후속 작업입니다. 루트 `dev`는 Web/API만 실행합니다.

기본 명령은 Windows의 실행 파일 제어 정책에도 사용할 수 있도록 pnpm 자체 실행기를 사용합니다. Turborepo 설정도 포함되어 있으며 Turbo 실행이 허용된 환경에서는 `pnpm turbo:dev`, `pnpm turbo:build`로 실행·캐시를 사용할 수 있습니다.

## 현재 범위

카드 검색·상세 화면·Mock 적정가, API 오류 처리, 인증 컨텍스트 주입 지점, PostgreSQL 조회 어댑터·시연 seed·실제 DB 통합 테스트를 구현했습니다. [TCGdex 외부 카드 수집·영구 UUID 매핑·DB 저장](packages/aggregator/README.md) 후 기존 REST 경로에서 조회할 수 있습니다. 전체 카탈로그 동기화, 실제 시세 수집, 거래 가능한 카드 변형·상태 확정, 상용 인증, 매물·주문·정책 API, MCP, Agent Runtime, x402 결제 및 전체 거래 E2E는 아직 구현하지 않았습니다. 기존 DB/Mock 모드는 유지합니다.

가격은 USDC 최소 단위 정수 문자열입니다. UUID 및 UTC ISO 8601을 사용합니다. Mock 가격은 `dataSource: "MOCK"`로 구분하고, 표본이 없으면 `status: "INSUFFICIENT_DATA"`, `estimatedPrice: null`을 반환합니다. 이 확장은 초안 계약의 미정 부분을 구체화한 **팀 검토 대상**입니다. [계약 결정 사항](docs/contracts.md), [통합 가이드](docs/integration.md)를 확인하세요.
