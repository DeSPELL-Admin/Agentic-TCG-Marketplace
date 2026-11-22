'use client';

import { useEffect, useState, type FormEvent } from 'react';
import Link from 'next/link';
import { Button } from '../../components/ui';
import { useDemoTrading } from './demo-provider';
import { parseUsdcInput } from './demo-model';
import { Actions, CardCell, EmptyRows, Field, Filters, Metrics, PreviewPage, QuietButton, RecordTable, ResultNote, Section, StateBadge } from './trading-ui';

export function CollectionView() {
  const { state, dispatch } = useDemoTrading();
  const [filter, setFilter] = useState('OWNED');
  const [selected, setSelected] = useState('');
  const [price, setPrice] = useState('');
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  useEffect(() => { if (selected) document.getElementById('listing-price')?.focus(); }, [selected]);
  const rows = state.inventory.filter(row => filter === 'ALL' || (filter === 'OWNED' ? row.status !== 'TRANSFERRED' : row.status === filter));
  const inventory = state.inventory.find(row => row.id === selected && row.status === 'AVAILABLE');
  function list(event: FormEvent) {
    event.preventDefault(); const amount = parseUsdcInput(price);
    if (!amount) { setError('0보다 큰 판매 가격을 소수점 6자리 이내로 입력해 주세요.'); return; }
    if (!inventory) return;
    dispatch({ type: 'LIST', inventoryId: inventory.id, amount, id: crypto.randomUUID() }); setSelected(''); setError(''); setNotice('판매 중 상태를 미리보기에 반영했어요. 고정가 매물에서 내 매물을 확인할 수 있어요.');
  }
  return <PreviewPage title="내 카드" description="보유 카드와 판매·예약 상태를 확인하는 화면이에요. 아래 카드는 예시 보유 목록입니다." actions={<Link href="/activity?view=trades">거래 내역 보기</Link>}>
    <Metrics items={[{ label: '현재 보유', value: `${state.inventory.filter(row => row.status !== 'TRANSFERRED').length}장` }, { label: '판매 중', value: `${state.inventory.filter(row => row.status === 'LISTED').length}장` }, { label: '예약 중', value: `${state.inventory.filter(row => row.status === 'RESERVED').length}장` }]} />
    <Filters><label>보유 상태<select value={filter} onChange={e => setFilter(e.target.value)}><option value="OWNED">현재 보유</option><option value="ALL">이전 완료 포함 전체</option><option value="AVAILABLE">보유 중</option><option value="LISTED">판매 중</option><option value="RESERVED">예약 중</option><option value="TRANSFERRED">이전 완료</option></select></label></Filters>
    <RecordTable label={`예시 보유 카드 ${rows.length}장`} headings={['카드', '보유 번호', '상태', '관리']}>
      {rows.map(row => <tr key={row.id}><td data-label="카드"><CardCell id={row.cardVariantId} /></td><td data-label="보유 번호">#{row.id.slice(-4)}</td><td data-label="상태"><StateBadge status={row.status} /></td><td data-label="관리">{row.status === 'AVAILABLE' && <QuietButton type="button" onClick={() => { setSelected(row.id); setPrice(''); setError(''); setNotice(''); }}>판매 등록</QuietButton>}{row.status === 'LISTED' && <Link href="/marketplace">내 매물 확인</Link>}</td></tr>)}
    </RecordTable>{!rows.length && <EmptyRows />}
    {inventory && <Section><h2>매물 등록 미리보기</h2><CardCell id={inventory.cardVariantId} /><ResultNote>가격을 입력하면 이 화면의 보유 상태와 매물 목록만 바뀌어요.</ResultNote><form onSubmit={list} noValidate><Field id="listing-price" label="판매 가격 (USDC)" error={error}><input id="listing-price" inputMode="decimal" value={price} onChange={e => setPrice(e.target.value)} aria-invalid={Boolean(error)} aria-describedby={error ? 'listing-price-error' : undefined} /></Field><Actions><Button type="submit">매물 등록 (미리보기)</Button><QuietButton type="button" onClick={() => setSelected('')}>닫기</QuietButton></Actions></form></Section>}
    <ResultNote role="status">{notice}</ResultNote>
  </PreviewPage>;
}
