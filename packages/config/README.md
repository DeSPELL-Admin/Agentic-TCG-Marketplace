# 공통 설정

`parseApiEnv()`와 TypeScript strict 기본 설정을 제공합니다. `.env` 로드는 실행 호스트가 담당합니다. 현재 `DATA_MODE`는 mock만 허용합니다.

루트에서 `pnpm --filter @tcg/config test`와 `pnpm --filter @tcg/config typecheck`로 검증합니다.
