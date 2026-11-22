'use client';

import Link from 'next/link';

export default function CardError({ reset }: { reset: () => void }) {
  return <main><h1>카드 정보를 불러오지 못했습니다.</h1><p role="alert">서버 연결을 확인한 뒤 다시 시도하세요.</p><div className="error-actions"><button onClick={reset}>다시 시도</button><Link href="/">카드 목록으로 돌아가기</Link></div></main>;
}
