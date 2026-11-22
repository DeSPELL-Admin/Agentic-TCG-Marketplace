'use client';

import type { ReactNode } from 'react';
import Link from 'next/link';
import styled from '@emotion/styled';
import { useTheme } from '@emotion/react';
import { Badge } from './ui';

export function AppShell({ children }: { children: ReactNode }) {
  const { color } = useTheme();
  return <>
    <SkipLink href="#main-content">본문으로 바로가기</SkipLink>
    <Header><HeaderInner><Brand href="/" aria-label="Agentic TCG 홈">
      <svg width="30" height="36" viewBox="0 0 30 36" fill="none" aria-hidden="true"><rect x="1" y="4" width="22" height="29" rx="3" fill={color.mat} /><rect x="7" y="1" width="22" height="29" rx="3" fill={color.coral} /><path d="M13 10h10M13 15h10M13 20h6" stroke={color.surface} strokeWidth="2" strokeLinecap="round" /></svg>
      Agentic TCG</Brand><Navigation aria-label="주요 메뉴"><Link href="/">카드 탐색</Link><GuideLink href="#data-guide">데이터 안내</GuideLink><Badge tone="demo">개발 데모</Badge></Navigation>
    </HeaderInner></Header>
    <PageFrame id="main-content" tabIndex={-1}>{children}</PageFrame>
    <Footer id="data-guide"><strong>카드의 이름과 가격을 읽는 방법</strong>
      <p>한국어 이름은 포켓몬 종명 표기이며 카드의 인쇄 언어와는 별개입니다. 해외 참고 시세는 제공자의 집계·판매 희망 가격으로, 한국어판 실거래가와 다를 수 있습니다.</p>
      <p>데모 가격은 합성 데이터로 구분합니다. 매물·내 카드·Agent·거래 내역은 담당 서비스 연결 후 제공됩니다.</p>
    </Footer>
  </>;
}

const SkipLink = styled.a(({ theme }) => ({ position: 'fixed', top: -80, left: 16, zIndex: 100, padding: 12, color: theme.color.surface, background: theme.color.ink, '&:focus': { top: 8 } }));
const Header = styled.header(({ theme }) => ({ position: 'sticky', top: 0, zIndex: 20, background: theme.color.canvas, borderBottom: `1px solid ${theme.color.line}` }));
const HeaderInner = styled.div({ maxWidth: 1280, margin: '0 auto', padding: '0 32px', minHeight: 76, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 20, '@media(max-width:639px)': { padding: '0 16px', minHeight: 68, gap: 10 } });
const Brand = styled(Link)(({ theme }) => ({ display: 'flex', alignItems: 'center', gap: 10, color: theme.color.ink, fontSize: 20, fontWeight: 800, textDecoration: 'none', whiteSpace: 'nowrap', '@media(max-width:639px)': { fontSize: 16, gap: 7 } }));
const Navigation = styled.nav(({ theme }) => ({ display: 'flex', alignItems: 'center', gap: 24, '& a': { color: theme.color.ink, fontSize: 14, fontWeight: 650, textDecoration: 'none', padding: '12px 0' }, '@media(max-width:639px)': { gap: 12, '& a': { fontSize: 13 } } }));
const GuideLink = styled(Link)({ '@media(max-width:767px)': { display: 'none' } });
const PageFrame = styled.main({ maxWidth: 1280, margin: '0 auto', padding: '36px 32px 56px', minHeight: '60vh', '&:focus': { outline: 'none' }, '@media(max-width:639px)': { padding: '28px 16px 40px' } });
const Footer = styled.footer(({ theme }) => ({ maxWidth: 1216, margin: '0 auto', padding: '24px 0 36px', borderTop: `1px solid ${theme.color.line}`, color: theme.color.muted, fontSize: 13, '& strong': { display: 'block', color: theme.color.ink, marginBottom: 8 }, '& p': { marginTop: 8, maxWidth: 850 }, '@media(max-width:1279px)': { margin: '0 32px' }, '@media(max-width:639px)': { margin: '0 16px' } }));
