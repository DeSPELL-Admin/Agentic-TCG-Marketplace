'use client';

import Link from 'next/link';
import styled from '@emotion/styled';
import { CardImage } from '../../components/card-image';
import { getCardDisplayName, formatSet, getReferencePrice } from '../../lib/formatters';
import type { DiscoveryData } from '../../lib/discovery';

export function LandingView({ discovery }: { discovery: DiscoveryData }) {
  const { spotlight, family, spotlightFailed, familyFailed } = discovery;
  const differentArt = new Set(spotlight.map(item => item.card.imageUrl).filter(Boolean)).size > 1;
  return <>
    <DiscoveryHero>
      <Introduction><h1>{differentArt ? '같은 피카츄, 다른 그림.' : '피카츄 카드 살펴보기'}</h1><p>세트와 그림이 다른 카드를 모아보세요. 마음에 드는 카드에서 인쇄 정보와 해외 참고 시세를 확인할 수 있습니다.</p><SearchLink href="/cards?q=Pikachu">피카츄 카드 보기</SearchLink><BrowseLink href="/cards">전체 카드 검색</BrowseLink></Introduction>
      <FeaturedCards aria-label="피카츄 카드 비교">{spotlight.map(({ card, prices, pricesFailed }, index) => {
        const reference = getReferencePrice(prices);
        return <FeaturedCard key={card.id} data-secondary={index > 0 || undefined}><ArtworkLink href={`/cards/${card.id}?q=Pikachu`} aria-label={`${getCardDisplayName(card)} ${formatSet(card.setCode)} ${card.cardNumber} 상세 보기`}><CardImage card={card} priority /></ArtworkLink><CardCaption><h2>{formatSet(card.setCode)}</h2><span>카드 번호 {card.cardNumber} / {card.language}</span>{reference ? <p>해외 참고 시세 <strong>{reference.originalAmount} {reference.originalCurrency}</strong></p> : <p>{pricesFailed ? '참고 시세 조회 실패' : '대표 참고 시세 없음'}</p>}<PriceDetail href={`/cards/${card.id}?q=Pikachu`}>출처·판본 확인</PriceDetail></CardCaption></FeaturedCard>;
      })}{!spotlight.length && <Empty role="status">{spotlightFailed ? '피카츄 카드를 불러오지 못했습니다.' : '조회된 피카츄 카드가 없습니다.'}<Link href="/cards?q=Pikachu">검색에서 다시 확인</Link></Empty>}</FeaturedCards>
    </DiscoveryHero>
    <CollectionSection aria-labelledby="family-heading"><SectionHeading><div><h2 id="family-heading">이브이와 진화형</h2><p>그림을 골라 살펴보거나, 이름으로 다른 카드를 찾아보세요.</p></div><Link href="/cards">전체 카드 검색</Link></SectionHeading>
      <FamilyGrid>{family.map(card => <FamilyCard key={card.id}><ArtworkLink href={`/cards/${card.id}?${new URLSearchParams({ q: card.name })}`} aria-label={`${getCardDisplayName(card)} ${formatSet(card.setCode)} 상세 보기`}><CardImage card={card} /></ArtworkLink><h3><Link href={`/cards?${new URLSearchParams({ q: card.name })}`}>{getCardDisplayName(card)}</Link></h3><p>{formatSet(card.setCode)} / {card.cardNumber}</p></FamilyCard>)}</FamilyGrid>
      {familyFailed && <SectionNote role="status">일부 카드를 불러오지 못했습니다. 검색에서 다시 확인할 수 있습니다.</SectionNote>}{!family.length && !familyFailed && <SectionNote>조회된 카드가 없습니다. 이름으로 검색해 보세요.</SectionNote>}
    </CollectionSection>
    <PriceNote><h2>참고 시세를 확인할 때</h2><p>위 EUR/USD 가격은 해외 제공자의 참고 시세입니다. 한국어판 실거래가와 다를 수 있습니다. 카드 상세에서 언어·판본·상태와 출처를 확인하세요.</p></PriceNote>
  </>;
}

const DiscoveryHero = styled.section({ display: 'grid', gridTemplateColumns: 'minmax(0,.8fr) minmax(0,1.4fr)', alignItems: 'center', gap: 64, padding: '16px 0 64px', '@media(max-width:1023px)': { gap: 32 }, '@media(max-width:767px)': { gridTemplateColumns: 'minmax(0,1fr)', gap: 32, padding: '8px 0 48px' } });
const Introduction = styled.div(({ theme }) => ({ minWidth: 0, '& h1': { maxWidth: 360, fontSize: 'clamp(36px,4.2vw,56px)', fontWeight: 600, letterSpacing: '-.045em', textWrap: 'balance' }, '& p': { maxWidth: 330, color: theme.color.muted, fontSize: 15, margin: '24px 0 28px', lineHeight: 1.9 }, '@media(max-width:767px)': { '& h1': { maxWidth: 'none', fontSize: 34 }, '& p': { maxWidth: 440, margin: '16px 0 20px' } } }));
const SearchLink = styled(Link)(({ theme }) => ({ display: 'inline-flex', alignItems: 'center', minHeight: 48, padding: '10px 24px', borderRadius: 6, color: theme.color.surface, background: theme.color.primary, textDecoration: 'none', fontSize: 14, fontWeight: 600, '&:hover': { background: theme.color.primaryHover } }));
const BrowseLink = styled(Link)(({ theme }) => ({ display: 'inline-flex', alignItems: 'center', minHeight: 48, marginLeft: 20, fontSize: 14, color: theme.color.ink }));
const FeaturedCards = styled.div({ display: 'grid', gridTemplateColumns: 'minmax(0,1.13fr) minmax(0,1fr)', alignItems: 'start', gap: 36, padding: '12px 8px 0', '@media(max-width:1023px)': { gap: 24, paddingInline: 0 }, '@media(max-width:639px)': { gap: 20 } });
const FeaturedCard = styled.article({ minWidth: 0, maxWidth: 270, marginInline: 'auto', width: '100%', '&[data-secondary]': { maxWidth: 230, paddingTop: 88 }, '@media(max-width:639px)': { '&[data-secondary]': { paddingTop: 48 } } });
const ArtworkLink = styled(Link)({ display: 'block', minWidth: 0 });
const CardCaption = styled.div(({ theme }) => ({ paddingTop: 18, '& h2': { fontSize: 17, fontWeight: 550 }, '& > span': { display: 'block', color: theme.color.muted, fontSize: 12, marginTop: 4 }, '& p': { fontSize: 12, color: theme.color.muted, marginTop: 12 }, '& strong': { display: 'block', color: theme.color.ink, fontSize: 16, fontWeight: 600, marginTop: 2 }, '@media(max-width:639px)': { '& h2': { fontSize: 15 }, '& strong': { fontSize: 14 } } }));
const PriceDetail = styled(Link)(({ theme }) => ({ display: 'inline-flex', alignItems: 'center', minHeight: 44, fontSize: 12, color: theme.color.ink }));
const Empty = styled.div(({ theme }) => ({ gridColumn: '1 / -1', padding: '80px 0', color: theme.color.muted, fontSize: 14, '& a': { display: 'block', paddingBlock: 12 } }));
const CollectionSection = styled.section(({ theme }) => ({ borderTop: `1px solid ${theme.color.line}`, padding: '36px 0 48px' }));
const SectionHeading = styled.div(({ theme }) => ({ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'baseline', gap: 16, marginBottom: 32, '& h2': { fontSize: 26, fontWeight: 550, letterSpacing: '-.025em' }, '& p': { fontSize: 14, color: theme.color.muted, marginTop: 10 }, '& > a': { display: 'inline-flex', alignItems: 'center', minHeight: 44, fontSize: 14, color: theme.color.ink } }));
const FamilyGrid = styled.div({ display: 'grid', gridTemplateColumns: 'repeat(4,minmax(0,1fr))', gap: 40, '@media(max-width:767px)': { gridTemplateColumns: 'repeat(2,minmax(0,1fr))', gap: '32px 24px' } });
const FamilyCard = styled.article(({ theme }) => ({ minWidth: 0, width: '100%', maxWidth: 216, marginInline: 'auto', '& h3': { fontSize: 18, fontWeight: 550, marginTop: 18 }, '& h3 a': { display: 'inline-flex', alignItems: 'center', minHeight: 44, color: theme.color.ink }, '& p': { fontSize: 12, color: theme.color.muted } }));
const SectionNote = styled.p(({ theme }) => ({ marginTop: 20, fontSize: 14, color: theme.color.muted }));
const PriceNote = styled.section(({ theme }) => ({ display: 'grid', gridTemplateColumns: '240px minmax(0,1fr)', gap: 32, borderTop: `1px solid ${theme.color.line}`, padding: '32px 0 8px', '& h2': { fontSize: 16, fontWeight: 550 }, '& p': { fontSize: 13, color: theme.color.muted, maxWidth: 640, lineHeight: 1.8 }, '@media(max-width:767px)': { gridTemplateColumns: 'minmax(0,1fr)', gap: 12 } }));
