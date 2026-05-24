'use client';

import { useTreasuryCoinDevFire } from '@/hooks/use-treasury-coin-dev-fire';

/** Dev-only: URL ?demo-coin=… auto-fire + window.__THP_TREASURY_DEMO__ (no UI). */
export function TreasuryCoinDevController() {
  useTreasuryCoinDevFire({
    registerWindowApi: true,
    autoFireFromUrl: true,
  });
  return null;
}
