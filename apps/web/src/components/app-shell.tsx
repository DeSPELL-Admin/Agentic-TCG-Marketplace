'use client';

import { useEffect, useRef, useState, type ReactNode } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import styled from '@emotion/styled';
import { useTheme } from '@emotion/react';
import { AgentChat } from '../features/chat/agent-chat';

export function AppShell({ children }: { children: ReactNode }) {
  const { color } = useTheme();
  const pathname = usePathname();
  const [chatOpen, setChatOpen] = useState(true);
  const [mobileChat, setMobileChat] = useState(false);
  const browse = useRef<HTMLDivElement>(null);
  useEffect(() => { if (browse.current) browse.current.scrollTop = 0; }, [pathname]);
  return <>
    <SkipLink href={mobileChat ? '#agent-message' : '#main-content'}>{mobileChat ? '대화 입력으로 바로가기' : '본문으로 바로가기'}</SkipLink>
    <Header><HeaderInner data-chat-open={chatOpen}><Brand href="/" aria-label="Agentic TCG 홈">
      <svg width="30" height="36" viewBox="0 0 30 36" fill="none" aria-hidden="true"><rect x="1" y="6" width="21" height="28" rx="2" stroke={color.ink} /><rect x="8" y="1" width="21" height="28" rx="2" fill={color.coral} /><path d="m18.5 9 5 6-5 6-5-6 5-6Z" stroke={color.surface} strokeWidth="1.5" /></svg>
      Agentic TCG</Brand><Navigation aria-label="주요 메뉴"><Link href="/" aria-current={pathname === '/' ? 'page' : undefined} onClick={() => setMobileChat(false)}>홈</Link><Link href="/cards" aria-current={pathname.startsWith('/cards') ? 'page' : undefined} onClick={() => setMobileChat(false)}>카드 검색</Link><ChatToggle type="button" aria-controls="agent-panel" aria-pressed={chatOpen} onClick={() => setChatOpen(open => !open)}>에이전트 {chatOpen ? '접기' : '열기'}</ChatToggle></Navigation>
    </HeaderInner></Header>
    <MobileTabs aria-label="작업 화면"><button type="button" aria-controls="browse-pane" aria-pressed={!mobileChat} onClick={() => setMobileChat(false)}>카드 탐색</button><button type="button" aria-controls="agent-panel" aria-pressed={mobileChat} onClick={() => setMobileChat(true)}>에이전트 대화</button></MobileTabs>
    <Workspace data-chat-open={chatOpen} data-mobile-chat={mobileChat}><BrowsePane ref={browse} id="browse-pane">
    <ServiceNav aria-label="서비스 메뉴">{[['/cards', '카드 검색'], ['/marketplace', '매물'], ['/collection', '내 카드'], ['/activity', '거래 관리'], ['/agent', '에이전트 설정'], ['/agent/logs', 'Agent 로그']].map(([href, label]) => <Link key={href} href={href!} aria-current={(pathname === href || href === '/cards' && pathname.startsWith('/cards/')) ? 'page' : undefined}>{label}</Link>)}</ServiceNav>
    <PageFrame id="main-content" tabIndex={-1}>{children}</PageFrame>
    <Footer id="data-guide"><FooterBrand>Agentic TCG</FooterBrand><details><summary>데이터 안내</summary>
      <p>한국어 이름은 포켓몬 종명 표기이며 카드의 인쇄 언어와는 별개입니다. 해외 참고 시세는 제공자의 집계·판매 희망 가격으로, 한국어판 실거래가와 다를 수 있습니다.</p>
      <p>데모 가격은 합성 데이터로 구분합니다. 매물·내 카드·거래 관리·Agent 설정과 로그는 화면 미리보기이며 실제 주문·결제를 실행하지 않아요.</p>
    </details></Footer></BrowsePane><AgentChat /></Workspace>
  </>;
}

const SkipLink = styled.a(({ theme }) => ({ position: 'fixed', top: -80, left: 16, zIndex: 100, padding: 12, color: theme.color.surface, background: theme.color.ink, '&:focus': { top: 8 } }));
const Header = styled.header(({ theme }) => ({ position: 'sticky', top: 0, zIndex: 20, height: 72, background: theme.color.canvas, borderBottom: `1px solid ${theme.color.line}`, '@media(max-width:639px)': { height: 68 } }));
const HeaderInner = styled.div({ maxWidth: 1280, margin: '0 auto', padding: '0 32px', minHeight: 71, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 20, '&[data-chat-open=true]': { maxWidth: 'none' }, '@media(max-width:639px)': { padding: '0 20px', minHeight: 67, gap: 10 } });
const Brand = styled(Link)(({ theme }) => ({ display: 'flex', alignItems: 'center', gap: 10, color: theme.color.ink, fontSize: 19, fontWeight: 650, textDecoration: 'none', whiteSpace: 'nowrap', '@media(max-width:639px)': { fontSize: 16, gap: 7 } }));
const Navigation = styled.nav(({ theme }) => ({ display: 'flex', alignItems: 'center', gap: 24, '& a': { display: 'inline-flex', alignItems: 'center', justifyContent: 'center', minWidth: 44, minHeight: 44, color: theme.color.ink, fontSize: 14, fontWeight: 650, textDecoration: 'none', padding: '12px 0', '&[aria-current=page]': { textDecoration: 'underline', textUnderlineOffset: 8 }, '&:hover': { textDecoration: 'underline' } }, '@media(max-width:639px)': { gap: 12, '& a': { fontSize: 13 } } }));
const ChatToggle = styled.button(({ theme }) => ({ minHeight: 44, padding: '8px 14px', border: `1px solid ${theme.color.line}`, borderRadius: 6, background: theme.color.surface, color: theme.color.ink, fontSize: 13, '@media(max-width:899px)': { display: 'none' } }));
const MobileTabs = styled.nav(({ theme }) => ({ display: 'none', '@media(max-width:899px)': { display: 'flex', height: 48, borderBottom: `1px solid ${theme.color.line}`, paddingInline: 20, gap: 24, '& button': { minHeight: 44, padding: '8px 0', border: 0, borderBottom: '2px solid transparent', background: theme.color.surface, color: theme.color.muted, fontSize: 14 }, '& button[aria-pressed=true]': { borderBottomColor: theme.color.ink, color: theme.color.ink } } }));
const Workspace = styled.div({ display: 'grid', gridTemplateColumns: 'minmax(0,1fr) 360px', height: 'calc(100dvh - 72px)', minHeight: 0, overflow: 'hidden', '&[data-chat-open=false]': { gridTemplateColumns: 'minmax(0,1fr)', '& > aside': { display: 'none' } }, '@media(max-width:899px)': { height: 'calc(100dvh - 120px)', gridTemplateColumns: 'minmax(0,1fr)', '& > aside': { display: 'none', borderLeft: 0 }, '&[data-mobile-chat=true] > div': { display: 'none' }, '&[data-mobile-chat=true] > aside': { display: 'flex' } }, '@media(max-width:639px)': { height: 'calc(100dvh - 116px)' } });
const BrowsePane = styled.div({ minWidth: 0, minHeight: 0, overflowY: 'auto', overscrollBehavior: 'contain', containerType: 'inline-size', containerName: 'browse', scrollPaddingTop: 80 });
const ServiceNav = styled.nav(({ theme }) => ({ display: 'flex', gap: 24, position: 'sticky', top: 0, zIndex: 10, minHeight: 52, padding: '0 32px', overflowX: 'auto', scrollbarWidth: 'thin', background: theme.color.surface, borderBottom: `1px solid ${theme.color.line}`, '& a': { display: 'inline-flex', alignItems: 'center', flexShrink: 0, minHeight: 52, color: theme.color.muted, fontSize: 13, textDecoration: 'none', whiteSpace: 'nowrap', borderBottom: '2px solid transparent' }, '& a[aria-current=page]': { color: theme.color.ink, borderBottomColor: theme.color.ink }, '& a:hover': { color: theme.color.link }, '@media(max-width:639px)': { paddingInline: 20, gap: 20 } }));
const PageFrame = styled.main({ maxWidth: 1280, margin: '0 auto', padding: '32px 32px 48px', minHeight: 'calc(100svh - 190px)', '&:focus': { outline: 'none' }, '@media(max-width:639px)': { padding: '28px 20px 40px' } });
const Footer = styled.footer(({ theme }) => ({ width: 'calc(100% - 64px)', maxWidth: 1216, margin: '0 auto', padding: '28px 0 36px', borderTop: `1px solid ${theme.color.line}`, color: theme.color.muted, fontSize: 13, display: 'flex', justifyContent: 'space-between', gap: 32, '& summary': { cursor: 'pointer', minHeight: 44, paddingBlock: 10, color: theme.color.ink }, '& details': { maxWidth: 700 }, '& p': { marginTop: 10 }, '@media(max-width:639px)': { width: 'calc(100% - 40px)', display: 'block' } }));
const FooterBrand = styled.strong(({ theme }) => ({ color: theme.color.ink, fontSize: 16, paddingTop: 8 }));
