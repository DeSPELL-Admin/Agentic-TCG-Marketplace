# TCG Aggregator

`createAggregatorService({ adapter })`, `createMockCardAdapter()`, `createAggregatorPlugin({ aggregatorService })`를 제공합니다. 실제 제공자도 `CardDataAdapter`를 구현하여 교체합니다. 외부 API 어댑터는 아직 미구현입니다.

Plugin은 호스트에서 `/api` prefix로 등록합니다.

루트에서 `pnpm --filter @tcg/aggregator test`와 `pnpm --filter @tcg/aggregator typecheck`로 검증합니다.
