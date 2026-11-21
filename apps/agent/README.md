# Agent Runtime

담당: 최재민

`createAgentRuntime({ aggregatorService, valuationService, model })`으로 OpenAI Agents SDK 런타임을 생성합니다. `runAgentTurn(message)`는 독립된 한 턴의 최종 응답을 반환합니다. 카드 검색과 적정가 도구는 주입받은 서비스와 공통 DTO를 사용합니다. `model`은 모델 이름이나 SDK의 `Model` 구현을 받습니다. 생략하면 SDK 기본 모델이 사용됩니다.

## 검증

저장소 루트에서 실행합니다. 자동 테스트는 가짜 모델과 기존 Mock 서비스를 사용합니다.

```sh
pnpm --filter @tcg/agent typecheck
pnpm --filter @tcg/agent test
pnpm --filter @tcg/agent build
```

실제 모델로 확인하려면 저장소 루트의 `.env` 또는 셸 환경에 `OPENAI_API_KEY`를 설정합니다. 필요하면 `OPENAI_MODEL`로 모델을 지정합니다. 카드·가격 데이터는 Mock 서비스에서 조회합니다.

```sh
pnpm --filter @tcg/agent demo "피카츄 적정가 알려줘"
```

후속 통합 범위에는 MCP Client, x402 Client, 세션 HTTP/SSE API가 포함됩니다.
