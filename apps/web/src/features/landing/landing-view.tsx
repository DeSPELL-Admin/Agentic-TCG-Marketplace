'use client';

import Link from 'next/link';
import styled from '@emotion/styled';
import { CardImage } from '../../components/card-image';
import { getCardDisplayName, formatSet, getReferencePrice } from '../../lib/formatters';
import type { DiscoveryData } from '../../lib/discovery';

export function LandingView({ discovery }: { discovery: DiscoveryData }) {
  const { spotlight, family, spotlightFailed, familyFailed } = discovery;
  return <>
    <DiscoveryHero>
      <Introduction><h1>카드 거래는 AI 에이전트에게</h1><p>원하는 카드와 예산, 거래 조건은 내가 정하고 거래는 에이전트에게 맡기는 TCG 플랫폼이에요. 카드 정보와 참고 시세부터 확인해 보세요.</p><SearchLink href="/cards">거래할 카드 찾기</SearchLink><BrowseLink href="#family-heading">카드 둘러보기</BrowseLink></Introduction>
      <FeaturedCards aria-label="피카츄 카드 비교">{spotlight.map(({ card, prices, pricesFailed }, index) => {
        const reference = getReferencePrice(prices);
        return <FeaturedCard key={card.id} data-secondary={index > 0 || undefined}><ArtworkLink href={`/cards/${card.id}?q=Pikachu`} aria-label={`${getCardDisplayName(card)} ${formatSet(card.setCode)} ${card.cardNumber} 상세 보기`}><CardImage card={card} priority /></ArtworkLink><CardCaption><h2>{formatSet(card.setCode)}</h2><span>카드 번호 {card.cardNumber} / {card.language}</span>{reference ? <p>해외 참고 시세 <strong>{reference.originalAmount} {reference.originalCurrency}</strong></p> : <p>{pricesFailed ? '시세를 불러오지 못했어요' : '확인할 수 있는 시세가 없어요'}</p>}<PriceDetail href={`/cards/${card.id}?q=Pikachu`}>시세 자세히 보기</PriceDetail></CardCaption></FeaturedCard>;
      })}{!spotlight.length && <Empty role="status">{spotlightFailed ? '피카츄 카드를 불러오지 못했어요.' : '아직 보여드릴 피카츄 카드가 없어요.'}<Link href="/cards?q=Pikachu">피카츄 검색하기</Link></Empty>}</FeaturedCards>
    </DiscoveryHero>
    <CollectionSection aria-labelledby="family-heading"><SectionHeading><div><h2 id="family-heading">이브이와 진화형도 둘러보세요</h2><p>카드를 누르면 자세히 볼 수 있어요. 이름을 누르면 해당 포켓몬의 카드를 모아서 보여드려요.</p></div><Link href="/cards">다른 카드 찾기</Link></SectionHeading>
      <FamilyGrid>{family.map(card => <FamilyCard key={card.id}><ArtworkLink href={`/cards/${card.id}?${new URLSearchParams({ q: card.name })}`} aria-label={`${getCardDisplayName(card)} ${formatSet(card.setCode)} 상세 보기`}><CardImage card={card} /></ArtworkLink><h3><Link href={`/cards?${new URLSearchParams({ q: card.name })}`}>{getCardDisplayName(card)}</Link></h3><p>{formatSet(card.setCode)} / {card.cardNumber}</p></FamilyCard>)}</FamilyGrid>
      {familyFailed && <SectionNote role="status">일부 카드를 불러오지 못했어요. 이름으로 검색해 다시 확인해 주세요.</SectionNote>}{!family.length && !familyFailed && <SectionNote>아직 보여드릴 카드가 없어요. 다른 포켓몬 이름으로 검색해 보세요.</SectionNote>}
    </CollectionSection>
    <PriceNote><h2>시세는 이렇게 확인해 주세요</h2><p>표시된 EUR/USD 금액은 해외 사이트의 참고 가격이에요. 한국어판 거래 가격과는 다를 수 있어요. 자세한 가격 출처와 카드의 언어·판본·상태는 상세 화면에서 확인해 주세요.</p></PriceNote>
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
