# Valuation

`createValuationService({ aggregatorService, adapter, now? })`, `createMockPriceAdapter()`, `createValuationPlugin({ valuationService })`를 제공합니다.

BigInt 중앙값을 사용하며 신뢰 수준은 LOW로 유지합니다. 자료가 없으면 `INSUFFICIENT_DATA`와 null 가격을 반환합니다. Mock은 `dataSource`로 구분합니다. 실제 시세 수집과 평가 모델은 후속 작업입니다.

루트에서 `pnpm --filter @tcg/valuation test`와 `pnpm --filter @tcg/valuation typecheck`로 검증합니다.
