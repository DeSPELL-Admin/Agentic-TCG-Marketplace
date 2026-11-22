import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import localFont from 'next/font/local';
import { Providers } from './providers';
import { AppShell } from '../components/app-shell';

const pretendard = localFont({ src: '../assets/fonts/PretendardVariable.woff2', variable: '--font-pretendard', display: 'swap', weight: '100 900' });

export const metadata: Metadata = { title: { default: 'Agentic TCG · 카드 탐색', template: '%s · Agentic TCG' }, description: '한국어로 카드를 찾고 원본 참고 시세와 평가 근거를 확인하세요.' };
export default function RootLayout({ children }: { children: ReactNode }) {
  return <html lang="ko" className={pretendard.variable}><body><Providers><AppShell>{children}</AppShell></Providers></body></html>;
}
