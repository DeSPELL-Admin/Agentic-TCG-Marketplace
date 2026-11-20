import type { FastifyPluginAsync } from 'fastify';
import { AppError, cardParamsSchema, valuationSchema, type AggregatorService, type ValuationService } from '@tcg/contracts';

export type { ValuationService } from '@tcg/contracts';
export interface PriceObservation { amount: string }
export interface PriceDataAdapter {
  dataSource: 'MOCK' | 'MARKET';
  sourceSummary: string[];
  getObservations(cardVariantId: string): Promise<PriceObservation[]>;
}
export interface ValuationDependencies {
  aggregatorService: AggregatorService;
  adapter: PriceDataAdapter;
  now?: () => Date;
}
export function createValuationService({ aggregatorService, adapter, now = () => new Date() }: ValuationDependencies): ValuationService {
  return {
    async getValuation(cardVariantId) {
      if (!await aggregatorService.getCardVariant(cardVariantId)) throw new AppError('CARD_NOT_FOUND', '카드를 찾을 수 없습니다.', 404);
      const samples = await adapter.getObservations(cardVariantId);
      const base = { cardVariantId, currency: 'USDC' as const, sampleSize: samples.length, confidence: 'LOW' as const, evaluatedAt: now().toISOString(), dataSource: adapter.dataSource, sourceSummary: adapter.sourceSummary };
      if (samples.length === 0) return valuationSchema.parse({ ...base, status: 'INSUFFICIENT_DATA', estimatedPrice: null });
      // 초기 추정기는 정수 단위 중앙값만 사용한다. 통계적 신뢰 수준은 후속 평가 모델에서 확정.
      const amounts = samples.map(sample => BigInt(sample.amount)).sort((a, b) => a < b ? -1 : a > b ? 1 : 0);
      const middle = Math.floor(amounts.length / 2);
      const estimatedPrice = amounts.length % 2 ? amounts[middle]! : (amounts[middle - 1]! + amounts[middle]!) / 2n;
      return valuationSchema.parse({ ...base, status: 'AVAILABLE', estimatedPrice: estimatedPrice.toString() });
    },
  };
}
export function createMockPriceAdapter(): PriceDataAdapter {
  return {
    dataSource: 'MOCK',
    sourceSummary: ['시연용 합성 가격. 실제 시장가격이 아닙니다.'],
    async getObservations(id) {
      const prices: Record<string, string[]> = {
        '00000000-0000-4000-8000-000000000001': ['10000000', '12000000', '14000000'],
        '00000000-0000-4000-8000-000000000002': ['25000000', '30000000', '35000000'],
      };
      return (prices[id] ?? []).map(amount => ({ amount }));
    },
  };
}
export interface ValuationPluginDependencies { valuationService: ValuationService }
export function createValuationPlugin({ valuationService }: ValuationPluginDependencies): FastifyPluginAsync {
  return async app => {
    app.get('/cards/:id/valuation', async request => {
      const { id } = cardParamsSchema.parse(request.params);
      return valuationSchema.parse(await valuationService.getValuation(id));
    });
  };
}
