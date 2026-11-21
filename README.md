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
pnpm db:check
```

API에서도 연결하려면 루트 `.env`의 `DATABASE_ENABLED=true`로 변경하고 서버를 재시작합니다. 활성화 시 연결 실패는 서버 부팅 실패로 처리합니다. `DATA_MODE=mock`은 계속 Mock 카드·가격을 반환합니다. DB 연결 여부와 데이터 제공 모드는 별개입니다. DB에는 기본 catalog 모델만 생성되며 Mock 데이터는 저장하지 않습니다.

```powershell
pnpm infra:down
```

종료해도 데이터 볼륨은 유지됩니다. Compose 계정은 로컬 개발 전용입니다.

## 검증 및 개별 실행

```powershell
pnpm typecheck
pnpm test
pnpm build
pnpm --filter @tcg/api dev
pnpm --filter @tcg/web dev
pnpm --filter @tcg/aggregator test
```

모든 구현 패키지는 독립 `test` 스크립트를 제공합니다. DB 기본 테스트는 외부 연결 없이 실행되며, 실제 DB 통합 테스트는 마이그레이션 후 `DATABASE_TEST_URL`을 설정하면 실행됩니다. `pnpm db:check`로 실제 연결과 테이블 존재도 확인할 수 있습니다.

내부 패키지는 개발 편의를 위해 소스(`src/index.ts`)를 공개합니다. Next.js는 `transpilePackages`, API는 `tsx`로 이를 실행합니다. 라이브러리 build는 `dist`를 생성하며 npm 배포·독립 Docker 이미지 패키징은 후속 작업입니다. 루트 `dev`는 Web/API만 실행합니다.

기본 명령은 Windows의 실행 파일 제어 정책에도 사용할 수 있도록 pnpm 자체 실행기를 사용합니다. Turborepo 설정도 포함되어 있으며 Turbo 실행이 허용된 환경에서는 `pnpm turbo:dev`, `pnpm turbo:build`로 실행·캐시를 사용할 수 있습니다.

## 현재 범위

카드 검색·상세·Mock 적정가, API 오류 처리, 인증 컨텍스트 주입 지점, PostgreSQL 연결 기반을 구현했습니다. 실제 TCG 데이터 제공자, 상용 인증, 매물·주문·정책 API, MCP, Agent Runtime, x402 결제 및 전체 E2E는 아직 구현하지 않았습니다. 실제 데이터 어댑터는 공개 인터페이스를 구현해 주입하며, 미구현 live 모드로 조용히 대체하지 않습니다.

가격은 USDC 최소 단위 정수 문자열입니다. UUID 및 UTC ISO 8601을 사용합니다. Mock 가격은 `dataSource: "MOCK"`로 구분하고, 표본이 없으면 `status: "INSUFFICIENT_DATA"`, `estimatedPrice: null`을 반환합니다. 이 확장은 초안 계약의 미정 부분을 구체화한 **팀 검토 대상**입니다. [계약 결정 사항](docs/contracts.md), [통합 가이드](docs/integration.md)를 확인하세요.
