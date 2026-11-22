# 공통 DB

Prisma 7과 PostgreSQL driver adapter를 사용합니다. `createPrismaClient(databaseUrl)`은 Client를 생성하며 연결·종료는 호스트가 담당합니다. 최초 `pnpm install` 시 Client가 생성됩니다. Schema와 Migration은 `prisma/`에 있습니다. 타 담당 모델은 합의 후 추가합니다.

Prisma 정의는 `prisma/schema/` 디렉터리를 하나의 스키마로 읽습니다. `base.prisma`는 공통 datasource·generator, `catalog.prisma`는 정연한 담당 카드·가격 표본 모델만 정의합니다. 현재 다른 담당자용 모델 파일은 만들지 않습니다. 실제 PostgreSQL 스키마명, 테이블 및 Client 생성 위치는 기존과 동일하며 Migration은 계속 `prisma/migrations/`에서 공동 관리합니다.

루트에서 `pnpm db:generate`, `pnpm db:migrate`, `pnpm db:check`로 생성·마이그레이션·연결을 확인합니다. 기본 테스트는 DB 없이 실행되며 실제 통합 테스트는 `DATABASE_TEST_URL`을 설정합니다.

루트에서 `pnpm --filter @tcg/db test`와 `pnpm --filter @tcg/db typecheck`로 검증합니다.

`pnpm db:seed`는 공통 시연 fixtures의 카드 3개와 MOCK 가격 표본 6개를 고정 ID로 upsert합니다. `seedDemoCatalog(prisma)`도 공개합니다. `catalog.PriceObservation`에 가격, 데이터 구분, 출처 및 관측 시각을 보존합니다. 전체 DB 통합 검증은 루트 `pnpm test:db`로 실행합니다.

`catalog.ExternalCardIdentity`는 외부 카드 참조와 내부 UUID를 영구 매핑합니다. 제공자·외부 ID·언어·에디션·상태의 복합 유일성 제약을 둡니다. 해당 모델도 `catalog.prisma`에서 관리하며, 현재 제공자는 TCGDEX입니다. 매핑 저장소 팩토리는 `@tcg/aggregator`의 `createPrismaCardIdentityStore(prisma)`입니다. 카드 본문 저장은 후속 단계이며 이 테이블만 생성해도 `CardVariant` 행이 자동 생성되는 것은 아닙니다.
