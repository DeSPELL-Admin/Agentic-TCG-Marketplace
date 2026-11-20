# Payment Server

담당: 최승원

Spending Policy, 예산 예약, x402 검증·정산·복구를 구현할 위치입니다. 정산 후 Trading 체결 콜백을 사용하는 단방향 연결로 구성합니다.

현재는 예약 디렉터리이며 실행 로직과 테스트가 없습니다. 구현 시 `build`, `typecheck`, `test` 스크립트와 독립 테스트를 추가하고 `src/index.ts`에 공개 인터페이스를 export하세요.
