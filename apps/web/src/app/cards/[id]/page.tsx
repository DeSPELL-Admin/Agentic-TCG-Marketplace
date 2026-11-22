import Link from 'next/link';
import { notFound } from 'next/navigation';
import { idSchema } from '@tcg/contracts';
import { CoreApiError, getCardDisplayName, getCardVariant, getValuation, getMarketPrices } from '../../../lib/api';
import { ValuationDetails } from '../../../components/valuation-details';
import { MarketPrices } from '../../../components/market-prices';

export const dynamic = 'force-dynamic';
export default async function CardDetail({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!idSchema.safeParse(id).success) notFound();
  let card;
  try { card = await getCardVariant(id); }
  catch (error) {
    if (error instanceof CoreApiError && error.status === 404) notFound();
    throw error;
  }
  return <main>
    <header><Link href="/" className="brand">Agentic TCG</Link><span className="badge">카드 상세</span></header>
    <nav aria-label="카드 탐색"><Link href="/">카드 목록으로 돌아가기</Link></nav>
    <div className="detail-layout">
      <section aria-labelledby="card-heading">
        <div className="card-face detail-face" aria-hidden="true"><span>{card.game}</span><strong>{card.name.slice(0, 1)}</strong><span>{card.setCode} / {card.cardNumber}</span></div>
        <h1 id="card-heading">{getCardDisplayName(card)}</h1>
        {getCardDisplayName(card) !== card.name && <p>원문명: {card.name} / 한국어 종명 표기이며 한국어판 카드명과는 다를 수 있습니다.</p>}
        <dl className="card-attributes">
          <dt>게임</dt><dd>{card.game}</dd><dt>세트</dt><dd>{card.setCode}</dd>
          <dt>카드 번호</dt><dd>{card.cardNumber}</dd><dt>인쇄 언어</dt><dd>{card.language}</dd>
          <dt>에디션</dt><dd>{card.edition}</dd><dt>보존 상태</dt><dd>{card.condition}</dd>
          <dt>카드 ID</dt><dd>{card.id}</dd>
        </dl>
      </section>
      <CardValuation id={id} />
    </div>
    <CardMarketPrices id={id} />
  </main>;
}

async function CardMarketPrices({ id }: { id: string }) {
  try { return <MarketPrices prices={await getMarketPrices(id)} />; }
  catch { return <section><h2>외부 참고 시세</h2><p>참고 시세를 불러오지 못했습니다. 잠시 후 다시 시도하세요.</p></section>; }
}

async function CardValuation({ id }: { id: string }) {
  try { return <ValuationDetails valuation={await getValuation(id)} />; }
  catch { return <section><h2>적정가를 불러오지 못했습니다.</h2><p role="alert">카드 정보는 확인할 수 있습니다. 잠시 후 다시 시도하세요.</p><Link href={`/cards/${id}`}>적정가 다시 불러오기</Link></section>; }
}
