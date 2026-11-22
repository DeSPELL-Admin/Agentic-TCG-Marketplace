import { notFound } from 'next/navigation';
import { idSchema } from '@tcg/contracts';
import { CoreApiError, getCardVariant, getValuation, getMarketPrices } from '../../../server/api';
import { DetailView } from '../../../features/card-detail/detail-view';

export const dynamic = 'force-dynamic';
export default async function CardDetail({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ q?: string | string[] }> }) {
  const { id } = await params; const search = await searchParams;
  const query = typeof search.q === 'string' ? search.q.trim().slice(0, 200) : '';
  if (!idSchema.safeParse(id).success) notFound();
  let card;
  try { card = await getCardVariant(id); }
  catch (error) { if (error instanceof CoreApiError && error.status === 404) notFound(); throw error; }
  const [valuation, prices] = await Promise.allSettled([getValuation(id), getMarketPrices(id)]);
  return <DetailView card={card} query={query} valuation={valuation.status === 'fulfilled' ? valuation.value : null} prices={prices.status === 'fulfilled' ? prices.value : null} />;
}
