# Trading

담당: 이채영

인벤토리, 고정가 매물, 매수 주문, 예약, 체결 Service 및 Fastify Plugin을 구현할 위치입니다. 공통 계약과 DB의 공개 인터페이스를 사용하며 Plugin에서 `listen()`을 호출하지 않습니다.

현재는 예약 디렉터리이며 실행 로직과 테스트가 없습니다. 구현 시 `build`, `typecheck`, `test` 스크립트와 독립 테스트를 추가하고 `src/index.ts`에 공개 인터페이스를 export하세요.
