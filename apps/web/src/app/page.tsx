import { formatUsdc, getCardDisplayName, getValuation, searchCards } from '../lib/api';
import Link from 'next/link';

export const dynamic = 'force-dynamic';
export default async function Home({ searchParams }: { searchParams: Promise<{ q?: string | string[] }> }) {
  const params = await searchParams;
  const query = typeof params.q === 'string' ? params.q : '';
  let results;
  try {
    const { items } = await searchCards(query);
    results = await Promise.all(items.map(async card => ({ card, valuation: await getValuation(card.id) })));
  } catch {
    return <main><header><strong>Agentic TCG</strong><span className="badge">개발 데모</span></header><h1>카드 데이터를 불러오지 못했습니다.</h1><p role="alert">Core API 연결을 확인한 뒤 다시 시도하세요.</p><a href="/">다시 불러오기</a></main>;
  }
  return <main>
    <header><strong>Agentic TCG</strong><span className="badge">카드 카탈로그</span></header>
    <section className="intro"><div><h1>다음 컬렉션을 찾아보세요.</h1><p>한국어 또는 원문 이름으로 카드를 검색하세요.</p></div><p className="notice">한국어 표기는 포켓몬 종명입니다.<br />가격은 시연용이며 실제 시세·거래를 제공하지 않습니다.</p></section>
    <form role="search"><label htmlFor="query">카드 이름</label><div className="search"><input id="query" name="q" defaultValue={query} maxLength={200} placeholder="피카츄, 리자몽, 이브이" /><button type="submit">검색</button></div></form>
    <section aria-labelledby="results"><h2 id="results">카드 목록 <span>{results.length}개</span></h2>
      {results.length === 0 ? <p>검색 결과가 없습니다. 다른 카드 이름으로 검색하세요.</p> : <div className="cards">{results.map(({ card, valuation }) => <article key={card.id}>
        <div className="card-face" aria-hidden="true"><span>{card.game}</span><strong>{card.name.slice(0, 1)}</strong><span>{card.setCode} / {card.cardNumber}</span></div>
        <h3><Link href={`/cards/${card.id}`}>{getCardDisplayName(card)}</Link></h3>
        {getCardDisplayName(card) !== card.name && <p>원문명: {card.name}</p>}
        <p>{card.language} · {card.edition} · {card.condition}</p>
        <dl><dt>Mock 적정가</dt><dd>{valuation.status === 'AVAILABLE' ? formatUsdc(valuation.estimatedPrice) : '가격 데이터 부족'}</dd><dt>표본 / 신뢰 수준</dt><dd>{valuation.sampleSize}개 / {valuation.confidence}</dd></dl>
      </article>)}</div>}
    </section>
    <footer>매물·보유 카드·Agent 실행·정책·거래 내역은 담당 모듈 연결 후 추가됩니다.</footer>
  </main>;
}
