# TCG Aggregator

`createAggregatorService({ adapter })`, `createMockCardAdapter()`, `createAggregatorPlugin({ aggregatorService })`를 제공합니다. 실제 제공자도 `CardDataAdapter`를 구현하여 교체합니다. 외부 API 어댑터는 아직 미구현입니다.

Plugin은 호스트에서 `/api` prefix로 등록합니다.

`createPrismaCardAdapter(prisma)`로 DB 조회를 주입할 수 있습니다. 이름 검색은 대소문자를 구분하지 않는 부분 일치이며 `%`, `_`, 역슬래시는 문자 그대로 검색합니다. 결과는 ID 순으로 정렬하고 limit를 적용합니다. 존재하지 않는 카드는 null이며 nullable imageUrl은 공통 DTO의 optional 필드로 정규화합니다. 공유 Prisma Client의 연결·종료는 호스트가 담당합니다.

루트에서 `pnpm --filter @tcg/aggregator test`와 `pnpm --filter @tcg/aggregator typecheck`로 검증합니다.
