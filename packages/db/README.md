# 공통 DB

Prisma 7과 PostgreSQL driver adapter를 사용합니다. `createPrismaClient(databaseUrl)`은 Client를 생성하며 연결·종료는 호스트가 담당합니다. 최초 `pnpm install` 시 Client가 생성됩니다. Schema와 Migration은 `prisma/`에 있습니다. 타 담당 모델은 합의 후 추가합니다.

루트에서 `pnpm db:generate`, `pnpm db:migrate`, `pnpm db:check`로 생성·마이그레이션·연결을 확인합니다. 기본 테스트는 DB 없이 실행되며 실제 통합 테스트는 `DATABASE_TEST_URL`을 설정합니다.

루트에서 `pnpm --filter @tcg/db test`와 `pnpm --filter @tcg/db typecheck`로 검증합니다.
