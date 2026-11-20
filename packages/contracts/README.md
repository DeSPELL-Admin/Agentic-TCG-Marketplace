# 공통 DTO / Schema

DTO는 Zod Schema에서 추론합니다. 공통 오류 코드, `AppError`, Aggregator·Valuation Service 계약을 공개합니다. UUID, UTC 날짜, USDC 정수 문자열을 사용합니다. 미정 계약은 루트 `docs/contracts.md`를 확인하세요.

루트에서 `pnpm --filter @tcg/contracts test`와 `pnpm --filter @tcg/contracts typecheck`로 검증합니다.
