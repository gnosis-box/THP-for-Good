'use client';

import { Suspense } from 'react';

import { TreasuryPendingTxProvider } from '@/contexts/TreasuryPendingTxContext';
import { PayTreasuryFeedback } from '@/components/motion/pay-treasury-feedback';
import { TreasuryCoinDevController } from '@/components/treasury/TreasuryCoinDevController';

// Optional floating UI — off by default (TREASURY_COIN_DEV_PANEL_ENABLED in TreasuryCoinDevPanel.tsx):
// import { TreasuryCoinDevPanel } from '@/components/treasury/TreasuryCoinDevPanel';
// <Suspense fallback={null}><TreasuryCoinDevPanel /></Suspense>

export function TreasuryProviders({ children }: { children: React.ReactNode }) {
  return (
    <TreasuryPendingTxProvider>
      {children}
      <PayTreasuryFeedback />
      {process.env.NODE_ENV === 'development' && (
        <Suspense fallback={null}>
          <TreasuryCoinDevController />
        </Suspense>
      )}
    </TreasuryPendingTxProvider>
  );
}
