import { tool } from '@openai/agents';
import {
  cardSearchResponseSchema,
  idSchema,
  valuationSchema,
  type AggregatorService,
  type ValuationService,
} from '@tcg/contracts';
import { z } from 'zod';

export interface CardToolDependencies {
  aggregatorService: Pick<AggregatorService, 'searchCards'>;
  valuationService: ValuationService;
}

export function createCardTools({ aggregatorService, valuationService }: CardToolDependencies) {
  return [
    tool({
      name: 'search_cards',
      description: '카드 이름으로 검색하고 카드 variant 후보를 반환합니다. 영문 카드 이름도 검색할 수 있습니다.',
      parameters: z.object({ query: z.string().trim().min(1).max(200) }),
      async execute({ query }) {
        const items = await aggregatorService.searchCards({ query, limit: 10 });
        return cardSearchResponseSchema.parse({ items, nextCursor: null });
      },
      errorFunction: () => '카드 검색에 실패했습니다. 검색어를 확인해 주세요.',
    }),
    tool({
      name: 'get_valuation',
      description: '검색에서 확인된 카드 variant ID의 적정가와 데이터 출처를 조회합니다.',
      parameters: z.object({ cardVariantId: idSchema }),
      async execute({ cardVariantId }) {
        return valuationSchema.parse(await valuationService.getValuation(cardVariantId));
      },
      errorFunction: () => '적정가 조회에 실패했습니다. 카드 variant를 확인해 주세요.',
    }),
  ];
}
