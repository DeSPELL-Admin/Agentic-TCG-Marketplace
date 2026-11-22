import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import localFont from 'next/font/local';
import { Providers } from './providers';
import { AppShell } from '../components/app-shell';

const pretendard = localFont({ src: '../assets/fonts/PretendardVariable.woff2', variable: '--font-pretendard', display: 'swap', weight: '100 900' });

export const metadata: Metadata = { title: { default: 'Agentic TCG', template: '%s | Agentic TCG' }, description: '포켓몬 카드 정보와 해외 참고 시세를 확인하세요.' };
export default function RootLayout({ children }: { children: ReactNode }) {
  return <html lang="ko" className={pretendard.variable}><body><Providers><AppShell>{children}</AppShell></Providers></body></html>;
}
