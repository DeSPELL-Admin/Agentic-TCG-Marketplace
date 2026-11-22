import type { MarketPricesResponse, MarketPrice } from '@tcg/contracts';

const priceTypes = { ASKING_LOW: '최저 판매 희망가', PROVIDER_MARKET: '제공자 시장 집계가', PROVIDER_AVERAGE: '제공자 평균가', PROVIDER_TREND: '제공자 추세가' };
const eligibility: Record<MarketPrice['eligibility'], string> = { ELIGIBLE: '평가 사용 가능', UNVERIFIED_VARIANT: '판본·환율 검증 필요', STALE_PRICE: '가격 자료 만료', STALE_FX: '환율 자료 만료', VARIANT_MISMATCH: '카드 속성 불일치', UNSUPPORTED_PRICE_TYPE: '참고 전용 가격 유형' };
export function MarketPrices({ prices }: { prices: MarketPricesResponse }) {
  return <section aria-labelledby="market-prices-heading">
    <h2 id="market-prices-heading">외부 참고 시세</h2>
    <p>해외 제공자의 집계·판매 희망 가격이며, 한국어판 실거래가가 아닙니다. 원본 통화로 표시합니다.</p>
    {prices.items.length === 0 ? <p>수집된 외부 가격 자료가 없습니다.</p> : <ul>{prices.items.map(price => <li key={price.id}>
      <p><strong>{price.originalAmount} {price.originalCurrency}</strong> · {price.provider} / {price.providerVariant} / {priceTypes[price.priceType]}</p>
      <p>{eligibility[price.eligibility]} · 관측 시각 (UTC): <time dateTime={price.observedAt}>{price.observedAt}</time> · <a href={price.sourceUrl} target="_blank" rel="noreferrer">수집 출처</a></p>
      {price.assessment && <p>확인 속성: {price.assessment.language} / {price.assessment.edition} / {price.assessment.condition} · <a href={price.assessment.matchEvidenceUrl} target="_blank" rel="noreferrer">판본 확인 근거</a> · 원본 통화 1단위 = {price.assessment.fxRate} USDC · <a href={price.assessment.fxSourceUrl} target="_blank" rel="noreferrer">환율 근거</a> ({price.assessment.fxObservedAt})</p>}
    </li>)}</ul>}
    <p>가격 유효기간: {prices.maxAgeHours}시간. 적정가 반영에는 카드 속성과 별도의 USDC 환율 근거 확인이 필요합니다.</p>
  </section>;
}
