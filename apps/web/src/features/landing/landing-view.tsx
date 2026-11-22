'use client';

import Link from 'next/link';
import { useState } from 'react';
import styled from '@emotion/styled';
import type { CardVariant } from '@tcg/contracts';
import { CardImage } from '../../components/card-image';
import { getCardDisplayName, formatSet } from '../../lib/formatters';

export function LandingView({ cards }: { cards: CardVariant[] }) {
  const [selectedId, setSelectedId] = useState(cards[0]?.id);
  const active = cards.find(card => card.id === selectedId) ?? cards[0];
  if (!active) return <Unavailable><h1>포켓몬 카드</h1><p role="status">카드 미리보기를 불러오지 못했습니다.</p><SearchLink href="/cards">카드 검색</SearchLink></Unavailable>;

  return <Showcase>
    <CardInfo id="showcase-card" aria-live="polite" aria-atomic="true">
      <h1>{getCardDisplayName(active)}</h1>{getCardDisplayName(active) !== active.name && <OriginalName>{active.name}</OriginalName>}
      <CardFacts><div><dt>세트</dt><dd>{formatSet(active.setCode)}</dd></div><div><dt>카드 번호</dt><dd>{active.cardNumber}</dd></div><div><dt>인쇄 언어</dt><dd>{active.language}</dd></div></CardFacts>
      <Actions><SearchLink href={`/cards/${active.id}`}>상세 보기</SearchLink><BrowseLink href="/cards">모든 카드 검색</BrowseLink></Actions>
    </CardInfo>
    <MainArtwork href={`/cards/${active.id}`} aria-label={`${getCardDisplayName(active)} 상세 보기`}><CardImage key={active.id} card={active} variant="landing" priority /></MainArtwork>
    <CardPicker aria-label="전시 카드 선택">{cards.map(card => <CardChoice key={card.id} type="button" aria-pressed={card.id === active.id} aria-controls="showcase-card" onClick={() => setSelectedId(card.id)}>
      <CardImage card={card} variant="thumbnail" priority /><span>{getCardDisplayName(card)}</span>
    </CardChoice>)}</CardPicker>
  </Showcase>;
}

const Showcase = styled.div({ display: 'grid', gridTemplateColumns: 'minmax(0,1.25fr) minmax(0,.85fr)', gridTemplateAreas: '"art info" "art picker"', columnGap: 64, minHeight: 660, padding: '24px 0 48px', '@media(max-width:1023px)': { columnGap: 40, minHeight: 570 }, '@media(max-width:767px)': { gridTemplateColumns: 'minmax(0,1fr)', gridTemplateAreas: '"art" "info" "picker"', minHeight: 0, gap: 28, padding: '8px 0 24px' } });
const CardInfo = styled.section({ gridArea: 'info', alignSelf: 'end', minWidth: 0, '& h1': { fontSize: 'clamp(42px,5.5vw,72px)', fontWeight: 550, letterSpacing: '-.055em', overflowWrap: 'anywhere' }, '@media(max-width:767px)': { '& h1': { fontSize: 36 } } });
const OriginalName = styled.p(({ theme }) => ({ fontSize: 18, color: theme.color.muted, marginTop: 6 }));
const CardFacts = styled.dl(({ theme }) => ({ margin: '28px 0 0', display: 'grid', gap: 8, fontSize: 14, '& > div': { display: 'flex', gap: 24 }, '& dt': { width: 72, flexShrink: 0, color: theme.color.muted }, '& dd': { margin: 0 }, '@media(max-width:767px)': { marginTop: 20 } }));
const Actions = styled.div({ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '12px 24px', marginTop: 32 });
const SearchLink = styled(Link)(({ theme }) => ({ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', minHeight: 48, padding: '10px 30px', borderRadius: 6, color: theme.color.surface, background: theme.color.primary, textDecoration: 'none', fontSize: 15, fontWeight: 600, '&:hover': { background: theme.color.primaryHover } }));
const BrowseLink = styled(Link)(({ theme }) => ({ display: 'inline-flex', alignItems: 'center', minHeight: 48, color: theme.color.ink, fontSize: 14 }));
const MainArtwork = styled(Link)({ gridArea: 'art', alignSelf: 'center', display: 'block', minWidth: 0, padding: '8px 0', '@media(max-width:767px)': { maxWidth: 300, width: '100%', margin: '0 auto' } });
const CardPicker = styled.div({ gridArea: 'picker', alignSelf: 'start', display: 'flex', flexWrap: 'wrap', gap: 20, marginTop: 48, '@media(max-width:767px)': { marginTop: 4, gap: 16 } });
const CardChoice = styled.button(({ theme }) => ({ width: 84, padding: '0 4px 12px', border: 0, borderBottom: '2px solid transparent', background: theme.color.surface, color: theme.color.muted, '& > span': { display: 'block', marginTop: 10, fontSize: 13 }, '&[aria-pressed=true]': { borderBottomColor: theme.color.ink, color: theme.color.ink }, '&:hover > span': { textDecoration: 'underline' } }));
const Unavailable = styled.section(({ theme }) => ({ padding: '64px 0', '& p': { color: theme.color.muted, margin: '16px 0 24px' } }));
