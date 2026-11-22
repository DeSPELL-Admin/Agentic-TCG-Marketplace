'use client';

import type { ReactNode } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import styled from '@emotion/styled';
import { useTheme } from '@emotion/react';

export function AppShell({ children }: { children: ReactNode }) {
  const { color } = useTheme();
  const pathname = usePathname();
  return <>
    <SkipLink href="#main-content">본문으로 바로가기</SkipLink>
    <Header><HeaderInner><Brand href="/" aria-label="Agentic TCG 홈">
      <svg width="30" height="36" viewBox="0 0 30 36" fill="none" aria-hidden="true"><rect x="1" y="6" width="21" height="28" rx="2" stroke={color.ink} /><rect x="8" y="1" width="21" height="28" rx="2" fill={color.coral} /><path d="m18.5 9 5 6-5 6-5-6 5-6Z" stroke={color.surface} strokeWidth="1.5" /></svg>
      Agentic TCG</Brand><Navigation aria-label="주요 메뉴"><Link href="/" aria-current={pathname === '/' ? 'page' : undefined}>홈</Link><Link href="/cards" aria-current={pathname.startsWith('/cards') ? 'page' : undefined}>카드 검색</Link></Navigation>
    </HeaderInner></Header>
    <PageFrame id="main-content" tabIndex={-1}>{children}</PageFrame>
    <Footer id="data-guide"><FooterBrand>Agentic TCG</FooterBrand><details><summary>데이터 안내</summary>
      <p>한국어 이름은 포켓몬 종명 표기이며 카드의 인쇄 언어와는 별개입니다. 해외 참고 시세는 제공자의 집계·판매 희망 가격으로, 한국어판 실거래가와 다를 수 있습니다.</p>
      <p>데모 가격은 합성 데이터로 구분합니다. 매물·내 카드·Agent·거래 내역은 담당 서비스 연결 후 제공됩니다.</p>
    </details></Footer>
  </>;
}

const SkipLink = styled.a(({ theme }) => ({ position: 'fixed', top: -80, left: 16, zIndex: 100, padding: 12, color: theme.color.surface, background: theme.color.ink, '&:focus': { top: 8 } }));
const Header = styled.header(({ theme }) => ({ position: 'sticky', top: 0, zIndex: 20, background: theme.color.canvas, borderBottom: `1px solid ${theme.color.line}` }));
const HeaderInner = styled.div({ maxWidth: 1320, margin: '0 auto', padding: '0 40px', minHeight: 80, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 20, '@media(max-width:639px)': { padding: '0 20px', minHeight: 68, gap: 10 } });
const Brand = styled(Link)(({ theme }) => ({ display: 'flex', alignItems: 'center', gap: 10, color: theme.color.ink, fontSize: 20, fontWeight: 800, textDecoration: 'none', whiteSpace: 'nowrap', '@media(max-width:639px)': { fontSize: 16, gap: 7 } }));
const Navigation = styled.nav(({ theme }) => ({ display: 'flex', alignItems: 'center', gap: 24, '& a': { display: 'inline-flex', alignItems: 'center', justifyContent: 'center', minWidth: 44, minHeight: 44, color: theme.color.ink, fontSize: 14, fontWeight: 650, textDecoration: 'none', padding: '12px 0', '&[aria-current=page]': { textDecoration: 'underline', textUnderlineOffset: 8 }, '&:hover': { textDecoration: 'underline' } }, '@media(max-width:639px)': { gap: 12, '& a': { fontSize: 13 } } }));
const PageFrame = styled.main({ maxWidth: 1320, margin: '0 auto', padding: '40px 40px 64px', minHeight: '65vh', '&:focus': { outline: 'none' }, '@media(max-width:639px)': { padding: '28px 20px 40px' } });
const Footer = styled.footer(({ theme }) => ({ maxWidth: 1240, margin: '0 auto', padding: '28px 0 36px', borderTop: `1px solid ${theme.color.line}`, color: theme.color.muted, fontSize: 13, display: 'flex', justifyContent: 'space-between', gap: 32, '& summary': { cursor: 'pointer', minHeight: 44, paddingBlock: 10, color: theme.color.ink }, '& details': { maxWidth: 700 }, '& p': { marginTop: 10 }, '@media(max-width:1319px)': { margin: '0 40px' }, '@media(max-width:639px)': { margin: '0 20px', display: 'block' } }));
const FooterBrand = styled.strong(({ theme }) => ({ color: theme.color.ink, fontSize: 16, paddingTop: 8 }));
