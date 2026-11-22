'use client';

import { useEffect, useRef, useState } from 'react';
import styled from '@emotion/styled';
import type { CardVariant } from '@tcg/contracts';
import { getCardDisplayName, formatSet } from '../lib/formatters';

export function CardImage({ card, detail = false, priority = false }: { card: CardVariant; detail?: boolean; priority?: boolean }) {
  const [failedSource, setFailedSource] = useState<string | null>(null);
  const imageRef = useRef<HTMLImageElement>(null);
  useEffect(() => {
    // SSR 이미지 요청이 hydration 전에 실패해 error 이벤트를 놓친 경우도 복구한다.
    if (card.imageUrl && imageRef.current?.complete && imageRef.current.naturalWidth === 0) setFailedSource(card.imageUrl);
  }, [card.imageUrl]);
  const label = getCardDisplayName(card);
  return <ImageSlot data-detail={detail || undefined}>
    {card.imageUrl && failedSource !== card.imageUrl
      ? <Artwork ref={imageRef} src={card.imageUrl} alt={detail ? `${label} 카드 앞면` : ''} width={630} height={880} loading={priority || detail ? 'eager' : 'lazy'} fetchPriority={priority || detail ? 'high' : 'auto'} decoding="async" onError={() => setFailedSource(card.imageUrl!)} />
      : <Fallback role={detail ? 'img' : undefined} aria-label={detail ? `${label} 이미지 없음` : undefined} aria-hidden={!detail || undefined}><span>이미지 없음</span><strong>{label}</strong><span>{formatSet(card.setCode)} / {card.cardNumber}</span></Fallback>}
  </ImageSlot>;
}

const ImageSlot = styled.div(({ theme }) => ({
  position: 'relative', width: '100%', height: 290, background: theme.color.coralSoft, borderRadius: 9, overflow: 'hidden',
  '&[data-detail]': { height: 'auto', aspectRatio: '63 / 88', maxWidth: 360, margin: '0 auto', borderRadius: theme.radius.mat, background: theme.color.mat },
  '@media(max-width:959px)': { height: 240 },
  '@media(max-width:639px)': { height: 'auto', aspectRatio: '63 / 88', '&[data-detail]': { maxWidth: 280 } },
}));
const Artwork = styled.img({ position: 'absolute', inset: 12, width: 'calc(100% - 24px)', height: 'calc(100% - 24px)', objectFit: 'contain', filter: 'drop-shadow(0 4px 5px #302C4922)', '[data-detail] &': { inset: 28, width: 'calc(100% - 56px)', height: 'calc(100% - 56px)', filter: 'drop-shadow(6px 8px 0 #302C4924)' }, '@media(max-width:639px)': { inset: 6, width: 'calc(100% - 12px)', height: 'calc(100% - 12px)', '[data-detail] &': { inset: 24, width: 'calc(100% - 48px)', height: 'calc(100% - 48px)' } } });
const Fallback = styled.div(({ theme }) => ({ position: 'absolute', inset: 16, padding: 16, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', textAlign: 'center', gap: 12, border: `1px dashed ${theme.color.input}`, borderRadius: 8, color: theme.color.muted, fontSize: 12, '& strong': { fontSize: 'clamp(16px, 2vw, 24px)', color: theme.color.ink, overflowWrap: 'anywhere' }, '@media(max-width:639px)': { inset: 8, padding: 10 } }));
