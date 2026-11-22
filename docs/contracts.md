# 공통 계약 결정 사항

기준: 제공된 공통 API 계약서 v2.0 및 시스템 설계서 v2.1.

- ID: 계약서 본문의 UUID 원칙을 따릅니다. `card-001` 등의 예시는 실제 ID로 사용하지 않습니다.
- 가격: USDC 6 decimals, 음수·소수·지수 표기를 허용하지 않는 정수 문자열. 계산과 표시는 BigInt를 사용합니다.
- 날짜: UTC ISO 8601 문자열.
- 검색 응답: `{ items: CardVariant[], nextCursor: null }`. 현재 커서 페이지네이션은 미구현입니다. `limit`는 1~100입니다.
- REST 성공: 계약서의 직접 DTO 응답 형식을 따릅니다. MCP의 `{ ok, data }` 래퍼를 REST에 적용하지 않습니다.
- REST 오류: `{ error: { code, message, retryable }, requestId }`.

## 팀 검토가 필요한 Valuation 확장

초안의 '가격 부재를 표현하는 별도 상태' 요구를 다음처럼 구체화했습니다.

```typescript
type Valuation = {
  cardVariantId: string;
  currency: 'USDC';
  sampleSize: number;
  confidence: 'LOW' | 'MEDIUM' | 'HIGH';
  evaluatedAt: string;
  sourceSummary?: string[];
  dataSource: 'MOCK' | 'MARKET';
} & (
  | { status: 'AVAILABLE'; estimatedPrice: string; sourceSummary: string[] }
  | { status: 'INSUFFICIENT_DATA'; estimatedPrice: null; sampleSize: 0; confidence: 'LOW' }
);
```

가격 부재 시 confidence는 LOW만 허용합니다. 초기 평가는 중앙값이며 짝수 표본은 정수 평균의 소수 최소 단위를 버립니다. 현재 신뢰 수준은 항상 LOW이며 표본 수만으로 HIGH를 만들어 내지 않습니다. 합성 가격은 실제 거래 판단에 사용하면 안 됩니다.

### 구현 계약의 세부 검증 규칙

- `AVAILABLE`은 `sampleSize >= 1`과 비어 있지 않은 `sourceSummary`를 요구합니다.
- `INSUFFICIENT_DATA`는 `sampleSize: 0`, `estimatedPrice: null`, `confidence: LOW`를 요구합니다.
- 제공자 가격 표본은 `amount`(양의 USDC 최소 단위 정수 문자열), `source`(빈 문자열 불가), `observedAt`(UTC ISO 8601)을 제공합니다. 미래 관측 시각이나 잘못된 표본은 서버의 제공자 오류(HTTP 500)로 처리하며 입력 오류로 돌리거나 임의 가격으로 대체하지 않습니다.
- `evaluatedAt`은 표본 조회를 시작한 계산 시점이며, 표본의 최신성을 보장하지 않습니다. 가격 관측 시각은 DB에 별도로 보존합니다. 최신성·신뢰 수준 산정 모델은 후속 범위입니다.
- DB 어댑터도 `MOCK` 표본만 최대 100개(관측 시각 내림차순, 동일 시각은 ID 순) 읽습니다. `MARKET` 표본을 합성 평가에 섞지 않습니다.
- 메모리 Mock과 DB seed는 `@tcg/contracts/fixtures`의 동일 카드 UUID와 가격 표본을 사용합니다. fixtures는 시연용이며 실제 카드·시세 자료가 아닙니다.

위 규칙은 이번 구현에서 코드·테스트로 고정한 계약안입니다. 팀 합의가 완료되었다는 의미는 아니며 MCP·Trading·Payment 담당자와 공유·검토해야 합니다.

Aggregator의 `CardDataAdapter`, Valuation의 `PriceDataAdapter`는 실제 제공자 구현을 위한 교체 경계입니다. 실제 외부 API 어댑터 및 시세 정규화는 미구현입니다.

Inventory·Listing·BuyOrder·MatchQuote·Trade·SpendingPolicy는 초안의 DTO/Zod Schema만 제공합니다. 아직 Trading·Payment Service 입력, 인증 방식, SDK 종속 x402 타입을 임의로 고정하지 않았습니다. 관련 담당자와 합의한 뒤 계약과 테스트를 먼저 변경하세요. 이번 작업에서 다른 담당자에게 메시지를 발송하지 않았으므로 이 문서와 변경 내용을 팀에 공유해야 합니다.
