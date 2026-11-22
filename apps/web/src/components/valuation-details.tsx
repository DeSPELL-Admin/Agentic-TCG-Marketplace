import type { Valuation } from '@tcg/contracts';
import { formatUsdc } from '../lib/api';

export function ValuationDetails({ valuation }: { valuation: Valuation }) {
  const isMock = valuation.dataSource === 'MOCK';
  return <section aria-labelledby="valuation-heading" className="valuation-detail">
    <h2 id="valuation-heading">{isMock ? 'Mock 적정가' : '추정 적정가'}</h2>
    <p className="price">{valuation.status === 'AVAILABLE' ? formatUsdc(valuation.estimatedPrice) : '가격 데이터 부족'}</p>
    {valuation.status === 'INSUFFICIENT_DATA' && <p>평가에 사용할 표본이 없어 가격을 제공하지 않습니다.</p>}
    {isMock && <p className="notice">시연용 합성 가격입니다. 실제 시장가격이나 구매 판단에 사용할 수 없습니다.</p>}
    <dl>
      <dt>데이터 구분</dt><dd>{isMock ? 'Mock / 합성 데이터' : '시장 데이터'}</dd>
      <dt>가격 표본 수</dt><dd>{valuation.sampleSize}개</dd>
      <dt>신뢰 수준</dt><dd>{{ LOW: '낮음', MEDIUM: '보통', HIGH: '높음' }[valuation.confidence]}</dd>
      <dt>평가 시각 (UTC)</dt><dd><time dateTime={valuation.evaluatedAt}>{valuation.evaluatedAt}</time></dd>
      <dt>출처</dt><dd>{valuation.sourceSummary?.length ? <ul>{valuation.sourceSummary.map(source => <li key={source}>{source}</li>)}</ul> : '제공된 출처 없음'}</dd>
    </dl>
    <p>평가 시각은 계산 시점입니다. 가격 표본의 최신성이나 실제 거래 가능 가격을 보장하지 않습니다.</p>
  </section>;
}
