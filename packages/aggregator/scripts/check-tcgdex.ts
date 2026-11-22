import { createAggregatorService, createInMemoryCardIdentityStore, createTcgdexCardAdapter, TcgdexAdapterError } from '../src/index.js';

const service = createAggregatorService({ adapter: createTcgdexCardAdapter({ identityStore: createInMemoryCardIdentityStore() }) });
try {
  const cards = await service.searchCards({ query: 'Pikachu', limit: 1 });
  if (!cards[0]) throw new Error('No card found');
  const detail = await service.getCardVariant(cards[0].id);
  if (!detail || detail.id !== cards[0].id) throw new Error('Card identity mismatch');
  console.log(`TCGdex 검색·상세 확인: ${detail.name} / ${detail.setCode} / ${detail.cardNumber} (${detail.language})`);
  console.log('에디션·보존 상태는 UNSPECIFIED이며, 영구 ID 매핑과 DB 저장은 후속 작업입니다.');
} catch (error) {
  console.error(error instanceof TcgdexAdapterError ? `외부 카드 API 검증 실패: ${error.reason}` : '외부 카드 API 검색·상세 검증에 실패했습니다.');
  process.exitCode = 1;
}
