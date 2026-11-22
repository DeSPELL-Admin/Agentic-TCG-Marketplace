'use client';

import Link from 'next/link';
import styled from '@emotion/styled';
import type { CardVariant } from '@tcg/contracts';
import { CardImage } from '../../components/card-image';
import { getCardDisplayName, formatSet } from '../../lib/formatters';

export function LandingView({ cards }: { cards: CardVariant[] }) {
  return <Landing>
    <Introduction><h1>포켓몬 카드</h1><Entry><p>카드 정보와 해외 참고 시세를 확인하세요.</p><SearchLink href="/cards">카드 검색</SearchLink></Entry></Introduction>
    {cards.length > 0 ? <CardShelf aria-label="카드 상세 보기">{cards.map(card => <CardLink key={card.id} href={`/cards/${card.id}`} aria-label={`${getCardDisplayName(card)} 상세 보기`}>
      <CardImage card={card} variant="landing" priority /><CardName>{getCardDisplayName(card)}</CardName><CardSet>{formatSet(card.setCode)} / {card.cardNumber}</CardSet>
    </CardLink>)}</CardShelf> : <Unavailable role="status">카드 미리보기를 불러오지 못했습니다. 카드 검색에서 다시 조회할 수 있습니다.</Unavailable>}
  </Landing>;
}

const Landing = styled.div({ padding: '32px 0 48px', '@media(max-width:639px)': { padding: '12px 0 24px' } });
const Introduction = styled.section(({ theme }) => ({ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', gap: 32, paddingBottom: 64, '& h1': { fontSize: 'clamp(38px,5vw,64px)', fontWeight: 650, letterSpacing: '-.055em' }, '& p': { fontSize: 16, color: theme.color.muted }, '@media(max-width:767px)': { alignItems: 'flex-start', flexDirection: 'column', gap: 16, paddingBottom: 40 } }));
const Entry = styled.div({ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: 20 });
const SearchLink = styled(Link)(({ theme }) => ({ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', minHeight: 48, padding: '10px 30px', borderRadius: 6, color: theme.color.surface, background: theme.color.primary, textDecoration: 'none', fontSize: 15, fontWeight: 600, '&:hover': { background: theme.color.primaryHover } }));
const CardShelf = styled.section({ display: 'grid', gridTemplateColumns: 'repeat(3,minmax(0,1fr))', gap: 48, padding: '8px 0 24px', '@media(max-width:959px)': { gap: 24 }, '@media(max-width:639px)': { gap: 14, paddingTop: 0 } });
const CardLink = styled(Link)(({ theme }) => ({ display: 'block', minWidth: 0, color: theme.color.ink, textDecoration: 'none', '&:hover h2': { textDecoration: 'underline' } }));
const CardName = styled.h2({ fontSize: 20, fontWeight: 600, marginTop: 24, textAlign: 'center', overflowWrap: 'anywhere', '@media(max-width:639px)': { fontSize: 15, marginTop: 16 } });
const CardSet = styled.p(({ theme }) => ({ color: theme.color.muted, textAlign: 'center', fontSize: 13, marginTop: 4, '@media(max-width:639px)': { fontSize: 12 } }));
const Unavailable = styled.p(({ theme }) => ({ color: theme.color.muted, padding: '56px 0' }));
