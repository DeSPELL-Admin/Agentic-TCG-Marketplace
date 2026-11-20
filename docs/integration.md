# 모듈 통합 가이드

## 공개 API

```typescript
import { createAggregatorService, createAggregatorPlugin, createMockCardAdapter } from '@tcg/aggregator';
import { createValuationService, createValuationPlugin, createMockPriceAdapter } from '@tcg/valuation';

const aggregatorService = createAggregatorService({ adapter: createMockCardAdapter() });
const valuationService = createValuationService({ aggregatorService, adapter: createMockPriceAdapter() });

await app.register(createAggregatorPlugin({ aggregatorService }), { prefix: '/api' });
await app.register(createValuationPlugin({ valuationService }), { prefix: '/api' });
```

Service는 Fastify에 의존하지 않습니다. Plugin은 라우트 등록만 담당하며 `listen()`을 호출하지 않습니다. 독립 Fastify 호스트에서 사용하는 경우 공통 AppError·ZodError 처리를 호스트에 등록하세요.

## Core API 조립

`apps/api/src/app.ts`의 `buildApp()`에서 다음 순서로 초기화합니다.

1. Prisma Client 생성·연결 및 종료 hook 등록 (DB 활성화 시)
2. Aggregator·Valuation Service 생성
3. `createIntegrationPlugins(deps)` 호출
4. REST 및 전달받은 통합 Plugin 등록
5. `app.ready()` 후 반환; `server.ts`만 `listen()` 실행

후속 통합 코드는 `createIntegrationPlugins` 안에서 Trading → Payment → MCP 순서로 생성하고 해당 Plugin들을 반환합니다. 팩토리에서 초기화한 외부 리소스도 Plugin의 종료 hook으로 정리하세요. 테스트는 `buildApp()`과 `app.inject()`를 사용합니다.

Payment가 Trading Service 또는 정산 완료 콜백을 받는 단방향 연결을 권장합니다. Trading이 다시 Payment를 생성·호출하는 순환 의존성을 만들지 않습니다. 정산 증빙 확인, 멱등 체결, UNKNOWN 복구는 담당 모듈에서 구현하며 Core API에 복제하지 않습니다.

## 인증

카드·시세 조회는 공개입니다. 기본 `request.auth`는 null이며, 클라이언트의 사용자·Agent ID 헤더를 신뢰하지 않습니다. 검증된 인증 제공자를 `resolveAuth`로 주입하고, 보호된 라우트에서 `requireAuth(request)`를 호출하세요. 인증 provider와 Agent 소유권 인가는 아직 미구현입니다.

Web은 Server Component를 통해 Core API를 호출하므로 API 주소·비밀값을 브라우저에 노출할 필요가 없습니다. Agent HTTP/SSE 및 변경 요청용 BFF는 해당 모듈 구현 후 추가합니다.

## DB 소유권

| 스키마 | 책임 |
| --- | --- |
| auth | 사용자·Agent 인증 컨텍스트, 통합 담당 조율 |
| catalog | 정연한: 카드·시세 데이터 |
| market | 이채영: 인벤토리·고정가 매물 |
| agent | 최재민·최승원: 세션·정책 모델 조율 |
| trading | 이채영: 주문·예약·체결 |
| payment | 최승원: 결제·예산·정산 증빙 |

초기 Migration은 6개 논리 스키마와 catalog.CardVariant만 생성합니다. 타 담당 모델·예약 유일성 제약은 아직 확정하지 않았습니다. 공통 `packages/db/prisma/schema.prisma` 변경 후 `pnpm --filter @tcg/db db:dev --name <변경명>`으로 Migration을 추가하고 검토합니다. 기존 Migration을 덮어쓰지 않습니다.
