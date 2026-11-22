# TCG Aggregator

`createAggregatorService({ adapter })`, `createMockCardAdapter()`, `createPrismaCardAdapter(prisma)`, `createTcgdexCardAdapter(options)`, `createAggregatorPlugin({ aggregatorService })`를 제공합니다. 모두 공통 `CardDataAdapter` 인터페이스로 교체합니다.

Plugin은 호스트에서 `/api` prefix로 등록합니다.

`createPrismaCardAdapter(prisma)`로 DB 조회를 주입할 수 있습니다. 이름 검색은 대소문자를 구분하지 않는 부분 일치이며 `%`, `_`, 역슬래시는 문자 그대로 검색합니다. 결과는 ID 순으로 정렬하고 limit를 적용합니다. 존재하지 않는 카드는 null이며 nullable imageUrl은 공통 DTO의 optional 필드로 정규화합니다. 공유 Prisma Client의 연결·종료는 호스트가 담당합니다.

루트에서 `pnpm --filter @tcg/aggregator test`와 `pnpm --filter @tcg/aggregator typecheck`로 검증합니다.

## TCGdex 외부 어댑터

첫 제공자는 [TCGdex REST API](https://tcgdex.dev/rest)이며 API 키 없이 영어 카탈로그를 조회합니다. 카드 검색은 [검색 API](https://tcgdex.dev/rest/cards)와 [필터·페이지 설정](https://tcgdex.dev/rest/filtering-sorting-pagination)을 사용합니다. 검색 brief에 세트 정보가 없으므로 필요한 상세만 보충해 공통 DTO로 변환합니다. 다른 언어, 시세 수집·환율 변환은 이번 구현 범위에 포함하지 않습니다.

```typescript
import {
  createAggregatorService,
  createInMemoryCardIdentityStore,
  createTcgdexCardAdapter,
} from '@tcg/aggregator';

// 독립 시연용. 운영 연결 시 영구 CardIdentityStore 구현을 주입한다.
const identityStore = createInMemoryCardIdentityStore();
const adapter = createTcgdexCardAdapter({ identityStore });
const service = createAggregatorService({ adapter });
const [card] = await service.searchCards({ query: 'Pikachu', limit: 1 });
const detail = card ? await service.getCardVariant(card.id) : null;
```

### 정규화와 ID

- 내부 `id`는 UUID이며 공급자의 `base1-58` 같은 ID를 직접 노출하지 않습니다.
- `CardIdentityStore.getOrCreateId(reference)`와 `findById(id)`를 필수 의존성으로 주입합니다. reference는 provider, externalId, language, edition, condition을 포함합니다.
- `createInMemoryCardIdentityStore()`는 동일 인스턴스에서만 UUID를 보존하는 시연용 저장소입니다. 어댑터를 다시 만들어도 같은 저장소를 주입하면 매핑이 유지됩니다. 프로세스 재시작에 견디는 DB 매핑과 카드 upsert는 후속 작업입니다. 매핑이 없는 내부 UUID는 외부 조회 없이 null을 반환합니다.
- `set.id`는 `setCode`, `localId`는 문자열 `cardNumber`, 언어는 `EN`으로 정규화합니다. 이미지가 있으면 [공식 이미지 규칙](https://tcgdex.dev/assets)에 따라 `/high.webp`를 붙이고, 없으면 URL을 생성하지 않습니다.
- 카탈로그는 개별 카드의 보존 상태를 알려주지 않으며 여러 인쇄 변형의 존재 여부만 제공합니다. `edition`과 `condition`은 `UNSPECIFIED`로 반환합니다. 일반판·홀로·초판이나 NM 상태로 임의 확정하지 않습니다. 이 결과는 검색용이며 거래 가능한 변형·상태를 확정하는 단계는 별도로 필요합니다.
- [Pocket 전용 `tcgp` 시리즈](https://tcgdex.dev/tcg-pocket)의 세트는 제외합니다. Pocket 카드나 검색 중 삭제된 카드가 섞이면 결과 수가 limit보다 적을 수 있으며 추가 페이지를 자동 순회하지 않습니다.
- 공급자의 `pricing` 등 추가 필드는 공통 DTO에 포함하지 않습니다. 실제 카드 정보를 가져오는 것과 실제 시장가격 평가는 별개입니다.

### 호출 제한과 실패 처리

- 요청당 기본 5초, 한 번의 검색/상세 작업에서 수행하는 외부 HTTP 조회는 기본 15초 제한입니다. ID 저장소의 응답 시간은 주입받은 구현이 관리합니다.
- 검색 limit는 1~100이며 첫 페이지를 ID 오름차순으로 요청합니다. 공급자가 더 많이 반환하더라도 후속 상세 조회는 limit 이하로 제한합니다.
- 상세 보충은 동시 최대 2건입니다. 상세 및 Pocket 세트 목록은 기본 60초 캐시를 사용하며 상세 캐시는 최대 200개입니다.
- `requestTimeoutMs`, `operationTimeoutMs`, `cacheTtlMs`, `fetch`, `now`를 주입할 수 있습니다. `cacheTtlMs: 0`은 캐시를 끕니다.
- 공급자 필터 구문인 `|`, `*`, `:`는 일반 검색어에서 거부하며, 나머지 검색어는 URLSearchParams로 인코딩합니다.
- 상세 404만 null입니다. 잘못된 응답·네트워크 오류·429·서버 오류를 빈 목록이나 Mock 성공으로 대체하지 않습니다. `TcgdexAdapterError`는 공통 `AppError`를 상속합니다.
- 내부 `reason`은 `TIMEOUT`, `RATE_LIMITED`, `NETWORK_ERROR`, `HTTP_ERROR`, `INVALID_RESPONSE`이며 HTTP 상태는 각각 504, 503, 502, 502, 502입니다. 공통 오류 코드는 기존 `INTERNAL_ERROR`를 사용합니다. 429의 Retry-After는 오류의 `retryAfterMs`로 보존합니다.
- 자동 재시도는 하지 않습니다. 호출자는 `retryable`과 `retryAfterMs`를 확인해 재호출을 결정합니다. 공급자 오류 본문이나 네트워크 진단 원문은 사용자 메시지에 노출하지 않습니다.

## 실제 API 확인

```powershell
pnpm --filter @tcg/aggregator check:external
```

키·DB 없이 검색 1건과 같은 UUID의 상세 조회를 확인합니다. 이 명령만 외부 네트워크에 의존하고, 기본 `test`는 주입한 fetch 응답으로 독립 실행합니다.

현재 Core API의 `CARD_DATA_SOURCE`는 기존 mock/database만 사용합니다. 영구 ID 매핑과 DB 저장을 구현하기 전에는 외부 어댑터를 기본 REST 경로에 연결하지 않습니다. FE, DB 스키마, 다른 담당자의 모듈·계약은 이번 변경 대상이 아닙니다.
