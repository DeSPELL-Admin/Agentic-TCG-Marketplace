import { redirect } from 'next/navigation';
import { searchCards } from '../server/api';
import { LandingView } from '../features/landing/landing-view';

export const dynamic = 'force-dynamic';
export default async function Home({ searchParams }: { searchParams: Promise<{ q?: string | string[] }> }) {
  const params = await searchParams;
  // 기존 검색 URL을 열어도 새 검색 페이지로 이어진다.
  if (typeof params.q === 'string') redirect(`/cards?${new URLSearchParams({ q: params.q.trim().slice(0, 200) })}`);
  const results = await Promise.allSettled(['리자몽', '피카츄', '이브이'].map(searchCards));
  const cards = results.flatMap(result => {
    if (result.status !== 'fulfilled') return [];
    const card = result.value.items.find(item => item.imageUrl) ?? result.value.items[0];
    return card ? [card] : [];
  });
  return <LandingView cards={cards} />;
}
