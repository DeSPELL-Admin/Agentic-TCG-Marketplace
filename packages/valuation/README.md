# Valuation

`createValuationService({ aggregatorService, adapter, now? })`, `createMockPriceAdapter()`, `createValuationPlugin({ valuationService })`를 제공합니다.

BigInt 중앙값을 사용하며 신뢰 수준은 LOW로 유지합니다. 자료가 없으면 `INSUFFICIENT_DATA`와 null 가격을 반환합니다. Mock은 `dataSource`로 구분합니다. 실제 시세 수집과 평가 모델은 후속 작업입니다.

`createPrismaMockPriceAdapter(prisma)`는 DB의 MOCK 표본만 조회합니다. MARKET 표본과 혼합하지 않습니다. 모든 가격 표본은 `amount`, `source`, `observedAt`를 제공해야 합니다. 잘못된 가격·빈 출처·미래 관측 시각은 제공자 오류로 처리합니다. `evaluatedAt`은 계산 시점이며 시세의 최신성을 보장하지 않습니다. 상세 검증 규칙은 루트 `docs/contracts.md`를 확인하세요.

루트에서 `pnpm --filter @tcg/valuation test`와 `pnpm --filter @tcg/valuation typecheck`로 검증합니다.
