import type { Metadata } from 'next';
import { MarketplaceView } from '../../features/trading/marketplace-view';
export const metadata: Metadata = { title: '고정가 매물' };
export default function MarketplacePage() { return <MarketplaceView />; }
