'use client';

import Link from 'next/link';
import styled from '@emotion/styled';
import { Badge } from '../../components/ui';
import { CardImage } from '../../components/card-image';
import { getCardDisplayName, formatSet, formatAttribute, formatProvider, formatVariant, formatUsdc, getReferencePrice, eligibilityLabels, type CatalogItem } from '../../lib/formatters';

export function CatalogView({ items, query }: { items: CatalogItem[]; query: string }) {
  return <>
    <Heading><div><h1>카드 탐색</h1><p>좋아하는 카드를 펼치고, 다음 한 장을 골라보세요.</p></div><Badge tone="demo">카드 카탈로그</Badge></Heading>
    <SearchForm action="/" method="get" role="search"><SearchField><label htmlFor="query">카드 이름</label><SearchInput key={query} id="query" name="q" defaultValue={query} maxLength={200} placeholder="피카츄, 리자몽, 이브이" /></SearchField><SearchButton type="submit">검색</SearchButton></SearchForm>
    <Toolbar><p id="results-heading">{query ? <><strong>“{query}”</strong> 검색 결과</> : '둘러보기'} <strong>{items.length}종</strong></p><span>한국어 표시 이름과 카드 인쇄 언어는 별개입니다.</span></Toolbar>
    <QuickSearch aria-label="카드 빠른 검색">{[{ label: '둘러보기', q: '' }, { label: '피카츄', q: '피카츄' }, { label: '리자몽', q: '리자몽' }, { label: '이브이', q: '이브이' }].map(preset => <QuickLink key={preset.label} href={preset.q ? `/?${new URLSearchParams({ q: preset.q })}` : '/'} aria-current={query === preset.q ? 'page' : undefined}>{preset.label}</QuickLink>)}</QuickSearch>
    <Stage aria-labelledby="results-heading">{items.length ? <Grid>{items.map((item, index) => <CardTile key={item.card.id} item={item} query={query} priority={index < 3} />)}</Grid> : <Empty><h2>검색 결과가 없습니다.</h2><p>다른 카드 이름으로 검색하거나 검색 조건을 초기화하세요.</p><Link href="/">검색 초기화</Link></Empty>}</Stage>
    <ScopeNote>한 번에 최대 20종을 조회하고, 조회된 카드 중 이미지가 있는 카드를 먼저 보여줍니다. 원하는 카드가 보이지 않으면 이름으로 검색하세요.</ScopeNote>
  </>;
}

function CardTile({ item, query, priority }: { item: CatalogItem; query: string; priority: boolean }) {
  const { card, valuation } = item;
  const reference = getReferencePrice(item.prices);
  const hasValuation = valuation?.status === 'AVAILABLE';
  const href = `/cards/${card.id}${query ? `?${new URLSearchParams({ q: query })}` : ''}`;
  return <Tile href={href} aria-label={`${getCardDisplayName(card)} 상세 보기`}>
    <CardImage card={card} priority={priority} />
    <TileText><h2>{getCardDisplayName(card)}</h2>{getCardDisplayName(card) !== card.name && <Original>{card.name}</Original>}
      <Metadata>{formatSet(card.setCode)} / {card.cardNumber}<br />인쇄 언어 {card.language}</Metadata>
      <PriceLabel>{hasValuation ? valuation.dataSource === 'MOCK' ? '데모 가격' : '추정 적정가' : reference ? '해외 참고 시세' : '평가 정보'}</PriceLabel>
      <Price>{hasValuation ? formatUsdc(valuation.estimatedPrice) : reference ? `${reference.originalAmount} ${reference.originalCurrency}` : item.valuationFailed ? '가격 조회 실패' : '평가 자료 부족'}</Price>
      {hasValuation ? <Badge tone={valuation.dataSource === 'MOCK' ? 'demo' : 'neutral'}>{valuation.dataSource === 'MOCK' ? '합성 데이터' : '검증 표본 기반'}</Badge> : reference ? <><ReferenceSource>{formatProvider(reference.provider)} / {formatVariant(reference.providerVariant)}</ReferenceSource><Badge tone={reference.eligibility === 'ELIGIBLE' ? 'neutral' : 'warning'}>{eligibilityLabels[reference.eligibility]}</Badge></> : <Badge tone={item.valuationFailed ? 'error' : 'neutral'}>{item.valuationFailed ? '다시 확인 필요' : '사용 가능한 표본 없음'}</Badge>}
      {item.valuationFailed && reference && <FailureNote>평가 정보는 불러오지 못했습니다.</FailureNote>}
      {item.pricesFailed && !hasValuation && <FailureNote>참고 시세를 불러오지 못했습니다.</FailureNote>}
      <Condition>에디션 {formatAttribute(card.edition)} / 상태 {formatAttribute(card.condition)}</Condition>
    </TileText>
  </Tile>;
}

const Heading = styled.div(({ theme }) => ({ display: 'flex', justifyContent: 'space-between', alignItems: 'end', gap: 16, marginBottom: 28, '& h1': { fontSize: 36, fontWeight: 800, letterSpacing: '-.025em' }, '& p': { color: theme.color.muted, marginTop: 10 }, '@media(max-width:639px)': { display: 'block', '& h1': { fontSize: 30 }, '& > span': { marginTop: 12 } } }));
const SearchForm = styled.form({ display: 'flex', alignItems: 'end', gap: 12, maxWidth: 880, '@media(max-width:639px)': { gap: 8 } });
const SearchField = styled.div({ flex: 1, minWidth: 0, '& label': { display: 'block', fontSize: 14, fontWeight: 600, marginBottom: 6 } });
const SearchInput = styled.input(({ theme }) => ({ width: '100%', height: 50, padding: '0 16px', border: `1px solid ${theme.color.input}`, borderRadius: theme.radius.control, background: theme.color.surface, color: theme.color.ink, '&::placeholder': { color: theme.color.muted } }));
const SearchButton = styled.button(({ theme }) => ({ minHeight: 50, padding: '10px 26px', border: 0, borderRadius: theme.radius.control, background: theme.color.primary, color: theme.color.surface, fontWeight: 700, '&:hover': { background: theme.color.primaryHover }, '@media(max-width:639px)': { padding: '10px 16px' } }));
const Toolbar = styled.div(({ theme }) => ({ display: 'flex', justifyContent: 'space-between', alignItems: 'start', gap: 16, margin: '24px 0 16px', color: theme.color.muted, fontSize: 14, '& strong': { color: theme.color.ink }, '& p': { overflowWrap: 'anywhere' }, '& > span': { fontSize: 13 }, '@media(max-width:767px)': { '& > span': { display: 'none' } } }));
const QuickSearch = styled.nav({ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 18 });
const QuickLink = styled(Link)(({ theme }) => ({ minHeight: 44, padding: '8px 18px', border: `1px solid ${theme.color.input}`, borderRadius: theme.radius.control, color: theme.color.ink, textDecoration: 'none', fontSize: 14, fontWeight: 650, '&[aria-current=page]': { color: theme.color.surface, background: theme.color.ink, borderColor: theme.color.ink }, '&:hover': { background: theme.color.lavenderSoft, color: theme.color.ink }, '@media(max-width:639px)': { padding: '8px 12px', fontSize: 13 } }));
const Stage = styled.section(({ theme }) => ({ padding: 28, background: theme.color.mat, borderRadius: theme.radius.mat, '@media(max-width:959px)': { padding: 20 }, '@media(max-width:639px)': { padding: 10, marginInline: -4, borderRadius: 18 } }));
const Grid = styled.div({ display: 'grid', gridTemplateColumns: 'repeat(3,minmax(0,1fr))', gap: 24, alignItems: 'stretch', '@media(max-width:959px)': { gap: 16 }, '@media(max-width:639px)': { gridTemplateColumns: 'repeat(2,minmax(0,1fr))', gap: '12px 8px' }, '@media(max-width:340px)': { gridTemplateColumns: '1fr' } });
const Tile = styled(Link)(({ theme }) => ({ minWidth: 0, display: 'flex', flexDirection: 'column', padding: 14, border: `1px solid ${theme.color.input}`, borderRadius: theme.radius.card, background: theme.color.surface, color: theme.color.ink, textDecoration: 'none', boxShadow: '0 3px 0 #302C4915', transition: 'transform 150ms ease,border-color 150ms ease', '&:hover,&:focus-visible': { transform: 'translateY(-3px)', borderColor: theme.color.focus }, '@media(max-width:639px)': { padding: 8, borderRadius: 12 } }));
const TileText = styled.div({ paddingTop: 16, '& h2': { fontSize: 18, overflowWrap: 'anywhere' }, '@media(max-width:639px)': { paddingTop: 12, '& h2': { fontSize: 17 } } });
const Original = styled.p(({ theme }) => ({ fontSize: 13, color: theme.color.muted, marginTop: 4, overflowWrap: 'anywhere' }));
const Metadata = styled.p(({ theme }) => ({ fontSize: 13, color: theme.color.muted, margin: '8px 0 14px' }));
const PriceLabel = styled.p(({ theme }) => ({ fontSize: 12, color: theme.color.muted }));
const Price = styled.p({ fontSize: 17, fontWeight: 750, margin: '3px 0 10px', fontVariantNumeric: 'tabular-nums', overflowWrap: 'anywhere', '@media(max-width:639px)': { fontSize: 15 } });
const ReferenceSource = styled.p(({ theme }) => ({ fontSize: 12, color: theme.color.muted, marginBottom: 8 }));
const Condition = styled.p(({ theme }) => ({ fontSize: 12, color: theme.color.muted, marginTop: 12 }));
const FailureNote = styled.p(({ theme }) => ({ fontSize: 12, color: theme.color.error, marginTop: 8 }));
const Empty = styled.div(({ theme }) => ({ padding: '40px 16px', background: theme.color.surface, borderRadius: theme.radius.card, textAlign: 'center', '& h2': { fontSize: 22 }, '& p': { color: theme.color.muted, margin: '12px 0' }, '& a': { display: 'inline-flex', padding: 12 } }));
const ScopeNote = styled.p(({ theme }) => ({ color: theme.color.muted, fontSize: 13, marginTop: 18 }));
