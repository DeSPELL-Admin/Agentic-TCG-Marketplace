# 공통 설정

`parseApiEnv()`와 TypeScript strict 기본 설정을 제공합니다. `.env` 로드는 실행 호스트가 담당합니다. 현재 `DATA_MODE`는 mock만 허용합니다.

`CARD_DATA_SOURCE=mock|database`로 카드·가격 표본의 저장 위치를 선택합니다. database에는 `DATABASE_ENABLED=true`와 `DATABASE_URL`이 필요합니다. 실제 시장 데이터 모드를 의미하지 않습니다.

루트에서 `pnpm --filter @tcg/config test`와 `pnpm --filter @tcg/config typecheck`로 검증합니다.
