# MCP Server

담당: 김민지

MCP Streamable HTTP Server와 Tool을 구현할 위치입니다. Trading·Payment·Aggregator·Valuation Service를 주입받고 독립 `listen()`을 호출하지 않습니다.

현재는 예약 디렉터리이며 실행 로직과 테스트가 없습니다. 구현 시 `build`, `typecheck`, `test` 스크립트와 독립 테스트를 추가하고 `src/index.ts`에 공개 인터페이스를 export하세요.
