import { expect, it } from 'vitest';
import { createAggregatorService, createMockCardAdapter } from '../src/index.js';

const service = createAggregatorService({ adapter: createMockCardAdapter() });
it('검색어와 limit를 적용한다', async () => {
  expect((await service.searchCards({ query: 'PIKA', limit: 1 })).map(card => card.name)).toEqual(['Pikachu']);
  expect(await service.searchCards({ query: 'unknown', limit: 10 })).toEqual([]);
});
it('존재하지 않는 카드는 null을 반환한다', async () => {
  expect(await service.getCardVariant('00000000-0000-4000-8000-000000000099')).toBeNull();
});
