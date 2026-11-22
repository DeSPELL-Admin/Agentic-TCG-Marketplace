'use client';

import type { ReactNode } from 'react';
import { ThemeProvider } from '@emotion/react';
import { EmotionRegistry } from '../styles/emotion-registry';
import { GlobalStyles } from '../styles/global-styles';
import { theme } from '../styles/theme';
import { DemoTradingProvider } from '../features/trading/demo-provider';

export function Providers({ children }: { children: ReactNode }) {
  return <EmotionRegistry><ThemeProvider theme={theme}><GlobalStyles /><DemoTradingProvider>{children}</DemoTradingProvider></ThemeProvider></EmotionRegistry>;
}
