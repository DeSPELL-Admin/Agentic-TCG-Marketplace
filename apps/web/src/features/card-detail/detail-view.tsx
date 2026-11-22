'use client';

import Link from 'next/link';
import styled from '@emotion/styled';
import type { CardVariant, Valuation, MarketPricesResponse } from '@tcg/contracts';
import { CardImage } from '../../components/card-image';
import { ValuationDetails } from '../../components/valuation-details';
import { MarketPrices } from '../../components/market-prices';
import { RequestState } from '../../components/request-state';
import { Badge } from '../../components/ui';
import { getCardDisplayName, formatSet, formatAttribute } from '../../lib/formatters';

export function DetailView({ card, valuation, prices, query }: { card: CardVariant; valuation: Valuation | null; prices: MarketPricesResponse | null; query: string }) {
  const backHref = query ? `/?${new URLSearchParams({ q: query })}` : '/';
  return <>
    <BackNav aria-label="카드 탐색"><Link href={backHref}>{query ? `“${query}” 검색으로 돌아가기` : '카드 목록으로 돌아가기'}</Link></BackNav>
    <DetailLayout><CardImage card={card} detail /><Info><Heading><div><h1>{getCardDisplayName(card)}</h1>{getCardDisplayName(card) !== card.name && <p>{card.name}</p>}</div><Badge>인쇄 언어 {card.language}</Badge></Heading>
      <Facts><dt>게임</dt><dd>포켓몬 카드</dd><dt>세트·번호</dt><dd>{formatSet(card.setCode)} / {card.cardNumber}</dd><dt>에디션</dt><dd>{formatAttribute(card.edition)}</dd><dt>보존 상태</dt><dd>{formatAttribute(card.condition)}</dd></Facts>
      {valuation ? <ValuationDetails valuation={valuation} /> : <RequestState compact title="평가 정보를 불러오지 못했습니다." message="카드 정보는 확인할 수 있습니다. 잠시 후 다시 시도하세요." />}
      <NameNote>한국어 표기는 포켓몬 종명이며 한국어판 카드의 정식 제목과는 다를 수 있습니다. 카드의 인쇄 언어는 별도로 확인하세요.</NameNote>
      <Identifier><summary>카드 식별 정보</summary><code>{card.id}</code></Identifier>
    </Info></DetailLayout>
    {prices ? <MarketPrices prices={prices} /> : <PriceError><RequestState compact title="참고 시세를 불러오지 못했습니다." message="가격 자료의 유무를 확인하지 못했습니다. 잠시 후 다시 시도하세요." /></PriceError>}
  </>;
}

const BackNav = styled.nav({ marginBottom: 28, '& a': { display: 'inline-block', paddingBlock: 8, minHeight: 44, fontSize: 14, overflowWrap: 'anywhere' } });
const DetailLayout = styled.div({ display: 'grid', gridTemplateColumns: 'minmax(240px,.85fr) minmax(0,1.15fr)', gap: 48, alignItems: 'start', '@media(max-width:959px)': { gridTemplateColumns: 'minmax(0,1fr)', gap: 28 } });
const Info = styled.section({ minWidth: 0 });
const Heading = styled.div(({ theme }) => ({ display: 'flex', flexWrap: 'wrap', alignItems: 'start', justifyContent: 'space-between', gap: 12, '& h1': { fontSize: 32, fontWeight: 800, letterSpacing: '-.025em', overflowWrap: 'anywhere' }, '& p': { marginTop: 8, fontSize: 14, color: theme.color.muted, overflowWrap: 'anywhere' } }));
const Facts = styled.dl(({ theme }) => ({ display: 'grid', gridTemplateColumns: '92px minmax(0,1fr)', gap: '8px 16px', margin: '24px 0', fontSize: 14, '& dt': { color: theme.color.muted }, '& dd': { margin: 0, overflowWrap: 'anywhere' } }));
const NameNote = styled.p(({ theme }) => ({ fontSize: 13, color: theme.color.muted, marginTop: 18 }));
const Identifier = styled.details(({ theme }) => ({ fontSize: 12, color: theme.color.muted, marginTop: 16, '& summary': { minHeight: 44, paddingBlock: 12, cursor: 'pointer' }, '& code': { overflowWrap: 'anywhere' } }));
const PriceError = styled.div({ marginTop: 36 });
