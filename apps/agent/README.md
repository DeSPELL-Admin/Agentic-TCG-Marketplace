# Agent Runtime

담당: 최재민

`createAgentRuntime({ aggregatorService, valuationService, model, decisionApi })`로 런타임을 생성합니다. `runAgentTurn(message)`는 Decision API로 의도를 분류한 뒤 독립된 한 턴의 최종 응답을 반환합니다. 기본 분류기는 OpenAI Responses API 구조화 출력을 사용하며, 같은 `DecisionApi` 인터페이스의 구현을 주입할 수 있습니다. 분류 모델과 메인 모델은 기본적으로 `gpt-5.6-luna`를 사용합니다.

| 분류 결과 | 처리 |
| --- | --- |
| `search_cards` | 메인 모델이 원문과 검색 도구를 받습니다. |
| `get_valuation` | 메인 모델이 원문과 검색·적정가 도구를 받습니다. 적정가 도구는 해당 턴의 검색 결과에 있는 variant ID만 조회합니다. |
| `needs_clarification` | 코드가 카드 정보를 요청합니다. |
| `unsupported` | 코드가 지원 범위를 안내합니다. |

메인 모델의 도구 루프는 SDK Runner에서 최대 6회로 제한합니다. 카드 검색과 적정가 도구는 주입받은 서비스와 공통 DTO를 사용합니다.

## 검증

저장소 루트에서 실행합니다. 자동 테스트는 가짜 모델과 기존 Mock 서비스를 사용합니다.

```sh
pnpm --filter @tcg/agent typecheck
pnpm --filter @tcg/agent test
pnpm --filter @tcg/agent build
```

실제 모델로 확인하려면 저장소 루트의 `.env` 또는 셸 환경에 `OPENAI_API_KEY`를 설정합니다. 데모에서는 `OPENAI_DECISION_MODEL`로 분류 모델을, `OPENAI_MODEL`로 메인 모델을 지정할 수 있습니다. 카드·가격 데이터는 Mock 서비스에서 조회합니다.

```sh
pnpm --filter @tcg/agent demo "피카츄 적정가 알려줘"
pnpm --filter @tcg/agent eval:intents
```

`eval:intents`는 [테스트셋](test/fixtures/intents.ts)의 한국어·영어 요청으로 실제 분류 모델을 호출해 경로와 언어를 비교합니다. 불일치하거나 API 호출에 실패하면 종료 코드 1을 반환합니다.

## MCP 연결

카드 조회용 Streamable HTTP 서버를 사용할 때는 루트 `.env`에 `AGENT_MCP_URL`을 설정합니다. 서버가 Bearer 인증을 요구하면 `AGENT_MCP_TOKEN`도 설정합니다.

```dotenv
AGENT_MCP_URL=http://127.0.0.1:4000/mcp
```

이 주소는 서버가 `/mcp`를 제공할 때의 예시입니다. 데모 명령은 동일하며, `AGENT_MCP_URL`을 비워두면 기존 로컬 Mock 서비스를 사용합니다.

```sh
pnpm --filter @tcg/agent demo "피카츄 적정가 알려줘"
```

서버는 `search_cards({ query, limit })`와 `get_valuation({ cardVariantId })`를 제공해야 합니다. 성공 응답은 `{ ok: true, data }`를 `structuredContent` 또는 단일 JSON 텍스트 블록으로 전달합니다. 검색의 `data`는 `{ items, nextCursor: null }`이며, 적정가는 공통 `Valuation` DTO입니다.

호스트 코드에서는 `await connectMcpCardServices({ url, headers })`의 반환값을 기존 `createAgentRuntime()`에 전달하고, 사용이 끝나면 `close()`를 호출합니다. 에이전트의 의도별 도구 제한과 현재 턴의 카드 ID 검증은 MCP를 사용할 때도 적용됩니다.

후속 통합 범위에는 x402 Client와 세션 HTTP/SSE API가 포함됩니다.
