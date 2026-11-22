'use client';

import { useEffect, useRef, useState } from 'react';
import styled from '@emotion/styled';
import type { CardVariant } from '@tcg/contracts';
import { getCardDisplayName, formatSet } from '../lib/formatters';

export function CardImage({ card, variant = 'tile', priority = false }: { card: CardVariant; variant?: 'tile' | 'detail' | 'spotlight'; priority?: boolean }) {
  const detail = variant === 'detail';
  const [failedSource, setFailedSource] = useState<string | null>(null);
  const imageRef = useRef<HTMLImageElement>(null);
  useEffect(() => {
    // SSR 이미지 요청이 hydration 전에 실패해 error 이벤트를 놓친 경우도 복구한다.
    if (card.imageUrl && imageRef.current?.complete && imageRef.current.naturalWidth === 0) setFailedSource(card.imageUrl);
  }, [card.imageUrl]);
  const label = getCardDisplayName(card);
  return <ImageSlot data-variant={variant}>
    {card.imageUrl && failedSource !== card.imageUrl
      ? <Artwork ref={imageRef} src={card.imageUrl} alt={detail ? `${label} 카드 앞면` : ''} width={630} height={880} loading={priority || detail ? 'eager' : 'lazy'} fetchPriority={priority || detail ? 'high' : 'auto'} decoding="async" onError={() => setFailedSource(card.imageUrl!)} />
      : <Fallback role={detail ? 'img' : undefined} aria-label={detail ? `${label} 이미지 없음` : undefined} aria-hidden={!detail || undefined}><span>이미지 없음</span><strong>{label}</strong><span>{formatSet(card.setCode)} / {card.cardNumber}</span></Fallback>}
  </ImageSlot>;
}

const ImageSlot = styled.div(({ theme }) => ({
  position: 'relative', width: '100%', height: 286, background: theme.color.surface,
  '&[data-variant=detail]': { height: 'auto', aspectRatio: '63 / 88', maxWidth: 350, margin: '0 auto' },
  '&[data-variant=spotlight]': { height: 214, width: 154, flexShrink: 0 },
  '@media(max-width:959px)': { height: 250 },
  '@media(max-width:639px)': { height: 218, '&[data-variant=detail]': { maxWidth: 252 }, '&[data-variant=spotlight]': { height: 170, width: 122 } },
}));
const Artwork = styled.img({ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'contain', filter: 'drop-shadow(0 3px 5px #24212D18)' });
const Fallback = styled.div(({ theme }) => ({ position: 'absolute', inset: 16, padding: 16, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', textAlign: 'center', gap: 12, border: `1px dashed ${theme.color.input}`, borderRadius: 8, color: theme.color.muted, fontSize: 12, '& strong': { fontSize: 'clamp(16px, 2vw, 24px)', color: theme.color.ink, overflowWrap: 'anywhere' }, '@media(max-width:639px)': { inset: 8, padding: 10 } }));
