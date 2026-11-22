import type { FastifyPluginAsync } from 'fastify';
import type { PrismaClient } from '@tcg/db';
import { demoCards } from '@tcg/contracts/fixtures';
import { AppError, cardParamsSchema, cardSearchQuerySchema, cardSearchResponseSchema, cardVariantSchema, type AggregatorService, type CardVariant } from '@tcg/contracts';

export type { AggregatorService } from '@tcg/contracts';
export interface CardDataAdapter {
  searchCards(input: { query: string; limit: number }): Promise<CardVariant[]>;
  getCardVariant(id: string): Promise<CardVariant | null>;
}
export interface AggregatorDependencies { adapter: CardDataAdapter }
export function createAggregatorService({ adapter }: AggregatorDependencies): AggregatorService {
  return {
    async searchCards(input) { return (await adapter.searchCards(input)).map(card => cardVariantSchema.parse(card)); },
    async getCardVariant(id) { const card = await adapter.getCardVariant(id); return card === null ? null : cardVariantSchema.parse(card); },
  };
}
export const mockCards = demoCards;
export function createMockCardAdapter(cards: readonly CardVariant[] = mockCards): CardDataAdapter {
  return {
    async searchCards({ query, limit }) { return cards.filter(card => card.name.toLowerCase().includes(query.toLowerCase())).slice(0, limit).map(card => ({ ...card })); },
    async getCardVariant(id) { const card = cards.find(card => card.id === id); return card ? { ...card } : null; },
  };
}
export function createPrismaCardAdapter(prisma: PrismaClient): CardDataAdapter {
  const toCard = (row: Awaited<ReturnType<typeof prisma.cardVariant.findUnique>>): CardVariant | null => {
    if (!row) return null;
    return cardVariantSchema.parse({ ...row, imageUrl: row.imageUrl ?? undefined });
  };
  return {
    async searchCards({ query, limit }) {
      const rows = await prisma.cardVariant.findMany({
        where: { name: { contains: query.replace(/[\\%_]/g, character => `\\${character}`), mode: 'insensitive' } },
        orderBy: { id: 'asc' }, take: limit,
      });
      return rows.map(row => toCard(row)!);
    },
    async getCardVariant(id) { return toCard(await prisma.cardVariant.findUnique({ where: { id } })); },
  };
}
export interface AggregatorPluginDependencies { aggregatorService: AggregatorService }
// 호스트에서 prefix: '/api'로 등록한다. Service는 HTTP에 종속되지 않는다.
export function createAggregatorPlugin({ aggregatorService }: AggregatorPluginDependencies): FastifyPluginAsync {
  return async app => {
    app.get('/cards', async request => {
      const { q, limit } = cardSearchQuerySchema.parse(request.query);
      return cardSearchResponseSchema.parse({ items: await aggregatorService.searchCards({ query: q, limit }), nextCursor: null });
    });
    app.get('/cards/:id', async request => {
      const { id } = cardParamsSchema.parse(request.params);
      const card = await aggregatorService.getCardVariant(id);
      if (!card) throw new AppError('CARD_NOT_FOUND', '카드를 찾을 수 없습니다.', 404);
      return cardVariantSchema.parse(card);
    });
  };
}
