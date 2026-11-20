# Fastify Core API

`buildApp()`은 조립, 오류 처리, 인증 컨텍스트 및 자원 수명을 관리합니다. `server.ts`만 `listen()`을 호출합니다. 업무 로직은 packages의 Service에서 주입합니다.

카드 조회는 공개입니다. 인증은 `resolveAuth`로 주입하고 보호된 라우트는 `requireAuth`를 호출합니다. 루트 `.env`를 읽으며 기본 포트는 4000입니다. 통합 확장점은 루트 `docs/integration.md`를 확인하세요.

루트에서 `pnpm --filter @tcg/api test`와 `pnpm --filter @tcg/api typecheck`로 검증합니다.
