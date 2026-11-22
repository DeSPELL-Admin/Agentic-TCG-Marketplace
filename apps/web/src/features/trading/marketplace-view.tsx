'use client';

import { useEffect, useState, type FormEvent } from 'react';
import Link from 'next/link';
import { Button } from '../../components/ui';
import { formatUsdc, getCardDisplayName } from '../../lib/formatters';
import { useDemoTrading } from './demo-provider';
import { demoUserId, parseUsdcInput, usdcDecimal } from './demo-model';
import { previewCards } from './demo-cards';
import { Actions, CardCell, EmptyRows, Field, Filters, PreviewPage, QuietButton, RecordTable, ResultNote, Section, StateBadge } from './trading-ui';

export function MarketplaceView() {
  const { state, dispatch } = useDemoTrading();
  const [filter, setFilter] = useState('ACTIVE');
  const [query, setQuery] = useState('');
  const [selected, setSelected] = useState('');
  const [price, setPrice] = useState('');
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  useEffect(() => { if (selected) document.getElementById('order-price')?.focus(); }, [selected]);
  const listing = state.listings.find(row => row.id === selected && row.status === 'ACTIVE');
  const rows = state.listings.filter(row => (filter === 'ALL' || row.status === filter) && previewCards.some(card => card.id === row.cardVariantId && `${card.name} ${getCardDisplayName(card)}`.toLowerCase().includes(query.trim().toLowerCase())));
  function createOrder(event: FormEvent) {
    event.preventDefault(); const amount = parseUsdcInput(price);
    if (!amount) { setError('0보다 큰 금액을 소수점 6자리 이내로 입력해 주세요.'); return; }
    if (!listing) return;
    dispatch({ type: 'CREATE_ORDER', cardId: listing.cardVariantId, amount, id: crypto.randomUUID() }); setSelected(''); setError(''); setNotice('구매 주문을 미리보기에 추가했어요. 매칭이나 결제는 실행하지 않았어요. 거래 관리에서 확인할 수 있어요.');
  }
  return <PreviewPage title="고정가 매물" description="예시 매물의 가격과 상태를 확인하고 Agent의 구매 주문 화면을 준비할 수 있어요." actions={<Link href="/activity">거래 관리</Link>}>
    <Filters><label>카드 이름<input value={query} onChange={e => setQuery(e.target.value)} placeholder="카드 이름 검색" /></label><label>매물 상태<select value={filter} onChange={e => setFilter(e.target.value)}><option value="ALL">전체</option><option value="ACTIVE">판매 중</option><option value="RESERVED">예약 중</option><option value="SOLD">판매 완료</option><option value="CANCELLED">취소</option></select></label></Filters>
    <RecordTable label={`예시 매물 ${rows.length}건`} headings={['카드', '판매자', '고정가', '상태', '관리']}>
      {rows.map(row => <tr key={row.id}><td data-label="카드"><CardCell id={row.cardVariantId} /></td><td data-label="판매자">{row.sellerId === demoUserId ? '내 매물' : `판매자 ${row.sellerId.slice(-1)} (예시)`}</td><td data-label="고정가">{formatUsdc(row.price)}</td><td data-label="상태"><StateBadge status={row.status === 'ACTIVE' ? 'LISTED' : row.status} /></td><td data-label="관리">{row.status === 'ACTIVE' && (row.sellerId === demoUserId ? <QuietButton type="button" onClick={() => { dispatch({ type: 'CANCEL_LISTING', id: row.id }); setNotice('내 매물의 등록 취소 상태를 반영했어요. 실제 등록은 변경되지 않아요.'); }}>등록 취소</QuietButton> : <QuietButton type="button" onClick={() => { setSelected(row.id); setPrice(usdcDecimal(row.price)); setError(''); setNotice(''); }}>주문 작성</QuietButton>)}</td></tr>)}
    </RecordTable>{!rows.length && <EmptyRows />}
    {listing && <Section><h2>구매 주문 미리보기</h2><CardCell id={listing.cardVariantId} /><ResultNote>이 금액을 Agent 구매 주문의 상한으로 기록해요. 즉시 구매나 결제는 진행하지 않아요.</ResultNote><form onSubmit={createOrder} noValidate><Field id="order-price" label="최대 구매 가격 (USDC)" error={error}><input id="order-price" inputMode="decimal" value={price} onChange={e => setPrice(e.target.value)} aria-invalid={Boolean(error)} aria-describedby={error ? 'order-price-error' : undefined} /></Field><Actions><Button type="submit">주문 추가 (미리보기)</Button><QuietButton type="button" onClick={() => { setSelected(''); setError(''); }}>닫기</QuietButton></Actions></form></Section>}
    <ResultNote role="status">{notice}</ResultNote>
  </PreviewPage>;
}
