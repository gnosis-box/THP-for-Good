import type { SpawnRect } from '@/contexts/TreasuryPendingTxContext';

export type LocalTreasuryCoinDetail = {
  txHash: string;
  nominalCrc: number;
  spawnRect?: SpawnRect;
};

export const TREASURY_LOCAL_COIN_EVENT = 'thp:treasury-local';

export function dispatchLocalTreasuryCoin(detail: LocalTreasuryCoinDetail) {
  if (typeof window === 'undefined') return;
  window.dispatchEvent(new CustomEvent(TREASURY_LOCAL_COIN_EVENT, { detail }));
}
