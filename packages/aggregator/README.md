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

// 독립 시연용. 영구 저장 시 createPrismaCardIdentityStore(prisma)를 사용한다.
const identityStore = createInMemoryCardIdentityStore();
const adapter = createTcgdexCardAdapter({ identityStore });
const service = createAggregatorService({ adapter });
const [card] = await service.searchCards({ query: 'Pikachu', limit: 1 });
const detail = card ? await service.getCardVariant(card.id) : null;
```

### 정규화와 ID

- 내부 `id`는 UUID이며 공급자의 `base1-58` 같은 ID를 직접 노출하지 않습니다.
- `CardIdentityStore.getOrCreateId(reference)`와 `findById(id)`를 필수 의존성으로 주입합니다. reference는 provider, externalId, language, edition, condition을 포함합니다.
- `createInMemoryCardIdentityStore()`는 동일 인스턴스에서만 UUID를 보존하는 시연용 저장소입니다. 어댑터를 다시 만들어도 같은 저장소를 주입하면 매핑이 유지됩니다. 영구 저장은 아래 Prisma 매핑 저장소를 사용합니다. 매핑이 없는 내부 UUID는 외부 조회 없이 null을 반환합니다.
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

## PostgreSQL 영구 UUID 매핑

`createPrismaCardIdentityStore(prisma)`를 외부 어댑터에 주입하면 프로세스·Client·어댑터가 바뀌어도 같은 참조의 UUID를 재사용합니다.

```typescript
import { createPrismaCardIdentityStore, createTcgdexCardAdapter } from '@tcg/aggregator';

// prisma의 생성·연결·종료는 실행 호스트가 담당한다.
const adapter = createTcgdexCardAdapter({
  identityStore: createPrismaCardIdentityStore(prisma),
});
```

- 저장 테이블은 `catalog.ExternalCardIdentity`입니다. provider는 현재 TCGDEX만 지원합니다.
- `provider + externalId + language + edition + condition` 복합 유일성 제약으로 중복을 방지합니다. 언어·에디션·상태는 앞뒤 공백 제거와 대문자 변환으로 정규화하고, 외부 ID의 대소문자는 그대로 보존합니다. 메모리 저장소도 동일한 정규화 규칙을 사용합니다.
- 생성은 DB의 중복 무시 삽입 후 해당 참조의 UUID를 조회합니다. 두 Client의 동시 요청에서도 DB 유일성 제약을 통해 하나의 UUID로 수렴합니다. 기존 UUID를 갱신하거나 덮어쓰지 않습니다.
- 언어·에디션·상태가 다른 참조에는 별도 UUID를 발급합니다. 여러 제공자의 동일 실물 카드를 자동 병합하는 기능은 포함하지 않습니다.
- `findById()`는 저장된 외부 참조를 복원합니다. 없는 UUID 또는 잘못된 UUID는 null이며 새 매핑을 생성하지 않습니다. DB 장애는 메모리 매핑이나 새 UUID로 대체하지 않습니다.
- 이 단계의 테이블은 내부 UUID를 **예약**합니다. 카드 이름·세트·이미지 본문을 `CardVariant`에 저장하거나 가짜 필수값으로 카드 행을 생성하지 않습니다. 카드 본문 upsert 시 이 UUID를 `CardVariant.id`로 사용하도록 후속 연결이 필요합니다. 현재 `ExternalCardIdentity.id`와 `CardVariant.id` 사이의 FK는 없습니다.
- 외부 카드가 조회되지 않더라도 기존 매핑을 삭제하거나 다른 카드에 UUID를 재할당하지 않습니다.

실제 API와 DB 매핑을 확인하려면 Migration을 적용하고 다음 명령을 실행합니다. 루트 `.env`의 `DATABASE_URL`을 사용하며, 매핑 데이터는 DB에 남습니다. 같은 외부 카드가 반환되면 명령을 다시 실행해도 같은 UUID가 출력됩니다.

```powershell
pnpm db:migrate
pnpm --filter @tcg/aggregator check:external:db
```

`pnpm test:db`는 외부 네트워크 없이 독립 Client 동시 요청·재연결·역매핑·중복 방지와 외부 어댑터 재생성 시 상세 조회를 검증합니다. 테스트가 생성한 고유 외부 ID의 행만 정리합니다.

현재 Core API의 `CARD_DATA_SOURCE`는 기존 mock/database만 사용합니다. 외부 카드 본문 저장과 REST 연결은 후속 작업이며 FE와 다른 담당자의 모듈·계약은 변경하지 않습니다.
