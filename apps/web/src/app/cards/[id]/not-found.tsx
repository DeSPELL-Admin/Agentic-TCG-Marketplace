import Link from 'next/link';

export default function CardNotFound() {
  return <main><h1>카드를 찾을 수 없습니다.</h1><p>카드 주소를 확인하거나 목록에서 다시 선택하세요.</p><Link href="/">카드 목록으로 돌아가기</Link></main>;
}
