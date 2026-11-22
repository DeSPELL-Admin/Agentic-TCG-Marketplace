import { cardSearchResponseSchema, cardVariantSchema, valuationSchema, type CardVariant } from '@tcg/contracts';

export function getCardDisplayName(card: CardVariant): string {
  return card.localizedNames?.find(name => name.locale === 'ko')?.name ?? card.name;
}

export class CoreApiError extends Error {
  constructor(public readonly status: number) { super(`Core API 요청 실패 (${status})`); }
}

const coreApiUrl = process.env.CORE_API_URL ?? 'http://127.0.0.1:4000';
async function get(path: string): Promise<unknown> {
  const response = await fetch(new URL(path, coreApiUrl), { cache: 'no-store', signal: AbortSignal.timeout(5000) });
  if (!response.ok) throw new CoreApiError(response.status);
  return response.json();
}
export async function getCardVariant(id: string) {
  return cardVariantSchema.parse(await get(`/api/cards/${encodeURIComponent(id)}`));
}
export async function searchCards(query: string) {
  return cardSearchResponseSchema.parse(await get(`/api/cards?${new URLSearchParams({ q: query, limit: '20' })}`));
}
export async function getValuation(id: string) {
  return valuationSchema.parse(await get(`/api/cards/${encodeURIComponent(id)}/valuation`));
}
export function formatUsdc(amount: string): string {
  const value = BigInt(amount);
  const whole = (value / 1_000_000n).toLocaleString('en-US');
  const fraction = (value % 1_000_000n).toString().padStart(6, '0').replace(/0+$/, '');
  return `${whole}${fraction ? `.${fraction}` : ''} USDC`;
}
