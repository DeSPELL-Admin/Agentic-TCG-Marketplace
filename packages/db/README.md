# 공통 DB

Prisma 7과 PostgreSQL driver adapter를 사용합니다. `createPrismaClient(databaseUrl)`은 Client를 생성하며 연결·종료는 호스트가 담당합니다. 최초 `pnpm install` 시 Client가 생성됩니다. Schema와 Migration은 `prisma/`에 있습니다. 타 담당 모델은 합의 후 추가합니다.

루트에서 `pnpm db:generate`, `pnpm db:migrate`, `pnpm db:check`로 생성·마이그레이션·연결을 확인합니다. 기본 테스트는 DB 없이 실행되며 실제 통합 테스트는 `DATABASE_TEST_URL`을 설정합니다.

루트에서 `pnpm --filter @tcg/db test`와 `pnpm --filter @tcg/db typecheck`로 검증합니다.

`pnpm db:seed`는 공통 시연 fixtures의 카드 3개와 MOCK 가격 표본 6개를 고정 ID로 upsert합니다. `seedDemoCatalog(prisma)`도 공개합니다. `catalog.PriceObservation`에 가격, 데이터 구분, 출처 및 관측 시각을 보존합니다. 전체 DB 통합 검증은 루트 `pnpm test:db`로 실행합니다.
