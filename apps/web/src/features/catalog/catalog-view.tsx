'use client';

import Link from 'next/link';
import styled from '@emotion/styled';
import { CardImage } from '../../components/card-image';
import { getCardDisplayName, formatSet, formatUsdc, getReferencePrice, eligibilityLabels, type CatalogItem } from '../../lib/formatters';

export function CatalogView({ items, query }: { items: CatalogItem[]; query: string }) {
  return <>
    <SearchHeader><Title>카드 검색</Title>
      <SearchForm action="/cards" method="get" role="search"><label htmlFor="query">카드 이름</label><SearchBox><SearchIcon viewBox="0 0 24 24" fill="none" aria-hidden="true"><circle cx="10.5" cy="10.5" r="6.5" stroke="currentColor" strokeWidth="1.7" /><path d="m16 16 4.5 4.5" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" /></SearchIcon><SearchInput key={query} id="query" name="q" defaultValue={query} maxLength={200} placeholder="피카츄, 리자몽, 이브이" /><SearchButton type="submit">검색</SearchButton></SearchBox></SearchForm>
    </SearchHeader>
    <ResultBar><div><h2 id="results-heading">{query ? `“${query}” 검색 결과` : '카드 목록'}</h2><ResultCount>{items.length}종 조회</ResultCount></div>{query && <ClearLink href="/cards">검색 초기화</ClearLink>}<PriceGuide><summary>가격 표시 안내</summary><p>EUR/USD는 해외 참고 시세입니다. 판본·환율을 확인하지 않은 가격은 USDC로 환산하지 않습니다. 데모 가격은 합성 데이터입니다. 출처와 검증 상태는 카드 상세에서 확인하세요.</p></PriceGuide></ResultBar>
    <section aria-labelledby="results-heading">{items.length ? <Grid>{items.map((item, index) => <CardTile key={item.card.id} item={item} query={query} priority={index < 4} />)}</Grid> : <Empty><h3>검색 결과가 없습니다.</h3><p>다른 이름으로 검색하거나 검색 조건을 초기화하세요.</p><Link href="/cards">검색 초기화</Link></Empty>}</section>
    <ScopeNote>한 번에 최대 20종을 조회합니다. 원하는 카드가 보이지 않으면 이름으로 검색하세요.</ScopeNote>
  </>;
}

function CardTile({ item, query, priority }: { item: CatalogItem; query: string; priority: boolean }) {
  const { card, valuation } = item;
  const reference = getReferencePrice(item.prices);
  const available = valuation?.status === 'AVAILABLE';
  const label = available ? valuation.dataSource === 'MOCK' ? '데모 가격' : '추정 적정가' : reference ? '해외 참고 시세' : '평가 정보';
  const amount = available ? formatUsdc(valuation.estimatedPrice) : reference ? `${reference.originalAmount} ${reference.originalCurrency}` : item.valuationFailed ? '가격 조회 실패' : '평가 자료 부족';
  return <Tile href={`/cards/${card.id}${query ? `?${new URLSearchParams({ q: query })}` : ''}`} aria-label={`${getCardDisplayName(card)} 상세 보기`}>
    <CardImage card={card} priority={priority} /><TileText><CardMeta>{formatSet(card.setCode)} / {card.cardNumber}<span>{card.language}</span></CardMeta><h3>{getCardDisplayName(card)}</h3>
      <PriceLine title={reference ? eligibilityLabels[reference.eligibility] : undefined}><span>{label}</span><strong>{amount}</strong></PriceLine>
      {available && valuation.dataSource === 'MOCK' && <Secondary>데모 · 합성 데이터</Secondary>}
      {item.valuationFailed && reference && <Secondary>평가 정보 조회 실패</Secondary>}
      {item.pricesFailed && !available && <Secondary>참고 시세 조회 실패</Secondary>}
      {reference && !available && ['STALE_PRICE', 'STALE_FX', 'VARIANT_MISMATCH'].includes(reference.eligibility) && <Secondary>{eligibilityLabels[reference.eligibility]}</Secondary>}
      {reference && !available && <AccessibleNote>{eligibilityLabels[reference.eligibility]} · 자세한 근거는 상세에서 확인하세요.</AccessibleNote>}
    </TileText>
  </Tile>;
}

const SearchHeader = styled.section({ maxWidth: 680, paddingBottom: 32 });
const Title = styled.h1({ fontSize: 'clamp(28px,3vw,36px)', fontWeight: 650, letterSpacing: '-.035em', marginBottom: 28 });
const SearchForm = styled.form({ maxWidth: 640, '& label': { display: 'block', fontSize: 13, fontWeight: 600, marginBottom: 8 } });
const SearchBox = styled.div(({ theme }) => ({ display: 'flex', alignItems: 'center', gap: 10, padding: '5px 5px 5px 16px', border: `1px solid ${theme.color.input}`, borderRadius: 6, '&:focus-within': { borderColor: theme.color.focus, boxShadow: `0 0 0 1px ${theme.color.focus}` } }));
const SearchIcon = styled.svg(({ theme }) => ({ width: 20, height: 20, flexShrink: 0, color: theme.color.muted, '@media(max-width:374px)': { display: 'none' } }));
const SearchInput = styled.input(({ theme }) => ({ width: '100%', minWidth: 0, flex: 1, height: 44, padding: 0, border: 0, color: theme.color.ink, background: theme.color.surface, outlineOffset: 0, '&::placeholder': { color: theme.color.muted }, '&:focus-visible': { outline: `2px solid ${theme.color.focus}`, outlineOffset: 3 }, '@media(max-width:639px)': { fontSize: 14 } }));
const SearchButton = styled.button(({ theme }) => ({ minHeight: 44, padding: '8px 20px', border: 0, borderRadius: 4, background: theme.color.primary, color: theme.color.surface, fontWeight: 650, flexShrink: 0, '&:hover': { background: theme.color.primaryHover }, '@media(max-width:639px)': { padding: '8px 14px' } }));
const ResultBar = styled.div({ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '8px 20px', padding: '20px 0 28px', '& > div': { display: 'flex', flexWrap: 'wrap', alignItems: 'baseline', gap: 12 }, '& h1,& h2': { fontSize: 16, fontWeight: 600, overflowWrap: 'anywhere' } });
const ResultCount = styled.span(({ theme }) => ({ fontSize: 13, color: theme.color.muted }));
const ClearLink = styled(Link)({ fontSize: 13, paddingBlock: 10, minHeight: 44 });
const PriceGuide = styled.details(({ theme }) => ({ marginLeft: 'auto', fontSize: 13, color: theme.color.muted, '& summary': { minHeight: 44, paddingBlock: 10, cursor: 'pointer' }, '& p': { maxWidth: 560, marginTop: 8 }, '@media(max-width:639px)': { marginLeft: 0, width: '100%' } }));
const Grid = styled.div({ display: 'grid', gridTemplateColumns: 'repeat(4,minmax(0,1fr))', gap: '40px 28px', '@media(max-width:1099px)': { gridTemplateColumns: 'repeat(3,minmax(0,1fr))', gap: '36px 24px' }, '@media(max-width:639px)': { gridTemplateColumns: 'repeat(2,minmax(0,1fr))', gap: '28px 16px' }, '@media(max-width:339px)': { gridTemplateColumns: 'minmax(0,1fr)' } });
const Tile = styled(Link)(({ theme }) => ({ minWidth: 0, color: theme.color.ink, textDecoration: 'none', '&:hover h3,&:focus-visible h3': { color: theme.color.link, textDecoration: 'underline' }, '&:focus-visible': { outlineOffset: 6 } }));
const TileText = styled.div({ paddingTop: 18, '& h3': { fontSize: 18, fontWeight: 650, marginTop: 6, overflowWrap: 'anywhere' }, '@media(max-width:639px)': { paddingTop: 12, '& h3': { fontSize: 16 } } });
const CardMeta = styled.p(({ theme }) => ({ display: 'flex', justifyContent: 'space-between', gap: 8, color: theme.color.muted, fontSize: 12, '& > span': { flexShrink: 0 } }));
const PriceLine = styled.p(({ theme }) => ({ display: 'flex', flexWrap: 'wrap', alignItems: 'baseline', justifyContent: 'space-between', gap: '4px 12px', marginTop: 10, fontVariantNumeric: 'tabular-nums', '& > span': { color: theme.color.muted, fontSize: 12 }, '& strong': { fontSize: 16, fontWeight: 650 }, '@media(max-width:639px)': { display: 'block', '& > span': { display: 'block' }, '& strong': { display: 'block', marginTop: 3, fontSize: 15 } } }));
const Secondary = styled.p(({ theme }) => ({ color: theme.color.muted, fontSize: 12, marginTop: 6 }));
const AccessibleNote = styled.span({ position: 'absolute', width: 1, height: 1, overflow: 'hidden', clipPath: 'inset(50%)', whiteSpace: 'nowrap' });
const Empty = styled.div(({ theme }) => ({ padding: '64px 0', textAlign: 'center', borderBlock: `1px solid ${theme.color.line}`, '& h3': { fontSize: 22 }, '& p': { color: theme.color.muted, margin: '12px 0' }, '& a': { display: 'inline-flex', padding: 12, minHeight: 44 } }));
const ScopeNote = styled.p(({ theme }) => ({ color: theme.color.muted, fontSize: 12, marginTop: 32 }));
