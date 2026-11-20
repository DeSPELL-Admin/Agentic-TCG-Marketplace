import { expect, it } from 'vitest';
import type { AggregatorService, CardVariant } from '@tcg/contracts';
import { createMockPriceAdapter, createValuationService } from '../src/index.js';

const card: CardVariant = { id: '00000000-0000-4000-8000-000000000001', game: 'POKEMON', name: 'Pikachu', setCode: 'SV', cardNumber: '025', language: 'EN', edition: 'NORMAL', condition: 'NM' };
const aggregatorService: AggregatorService = { async getCardVariant() { return card; }, async searchCards() { return [card]; } };
it('Mock 가격을 실제 가격과 구분하고 평가 시각을 기록한다', async () => {
  const service = createValuationService({ aggregatorService, adapter: createMockPriceAdapter(), now: () => new Date('2026-11-20T00:00:00Z') });
  expect(await service.getValuation(card.id)).toMatchObject({ status: 'AVAILABLE', estimatedPrice: '12000000', dataSource: 'MOCK', sampleSize: 3, confidence: 'LOW', evaluatedAt: '2026-11-20T00:00:00.000Z' });
});
it('시세 자료가 없으면 가격을 만들어 내지 않는다', async () => {
  const service = createValuationService({ aggregatorService, adapter: { dataSource: 'MARKET', sourceSummary: [], async getObservations() { return []; } } });
  expect(await service.getValuation(card.id)).toMatchObject({ status: 'INSUFFICIENT_DATA', estimatedPrice: null, dataSource: 'MARKET' });
});
it('큰 정수 가격의 중앙값을 정밀도 손실 없이 계산한다', async () => {
  const service = createValuationService({ aggregatorService, adapter: { dataSource: 'MARKET', sourceSummary: [], async getObservations() { return [{ amount: '90071992547409930' }, { amount: '90071992547409932' }]; } } });
  expect((await service.getValuation(card.id)).estimatedPrice).toBe('90071992547409931');
});
