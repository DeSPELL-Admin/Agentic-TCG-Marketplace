# Next.js Web

카드 검색 및 Mock 가격을 표시하는 최소 Server Component 화면입니다. 서버에서 `CORE_API_URL`의 Fastify를 호출하고 공통 Zod Schema로 응답을 검증합니다. 카드 이미지는 이니셜로 표시하며 외부 이미지·폰트 요청이 없습니다.

블루·화이트 팔레트, 로컬 기본 폰트, 카드 비율의 미리보기를 사용합니다. 모바일 한 열 배치, 입력 라벨, 키보드 포커스, 빈 결과·연결 오류·로딩 상태를 제공합니다.

매물·Agent·정책·거래 UI와 HTTP/SSE BFF는 후속 범위입니다. 포트는 3000이며 Core API를 함께 실행해야 합니다.

루트에서 `pnpm --filter @tcg/web test`와 `pnpm --filter @tcg/web typecheck`로 검증합니다.
