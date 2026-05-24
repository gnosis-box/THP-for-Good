'use client';

import { useCallback, useEffect, useRef } from 'react';
import { useSearchParams } from 'next/navigation';

import { dispatchPayTreasuryFeedback } from '@/components/motion/pay-treasury-feedback';
import { useTreasuryPendingTx } from '@/contexts/TreasuryPendingTxContext';
import { dispatchLocalTreasuryCoin } from '@/lib/treasury-coin-events';
import {
  demoButtonSpawnRect,
  demoPayButtonSpawnRect,
  demoTxHash,
  parseTreasuryDemoSearchParams,
  type TreasuryDemoFireOptions,
} from '@/lib/treasury-coin-demo';

declare global {
  interface Window {
    __THP_TREASURY_DEMO__?: {
      fireInbound: (options?: TreasuryDemoFireOptions) => string;
      fireDonate: (nominalCrc?: number) => string;
      firePay: (nominalCrc?: number) => string;
    };
  }
}

const IS_DEV = process.env.NODE_ENV === 'development';

type Options = {
  nominalCrc?: number;
  onFired?: (txHash: string) => void;
  registerWindowApi?: boolean;
  autoFireFromUrl?: boolean;
};

export function useTreasuryCoinDevFire({
  nominalCrc = 10,
  onFired,
  registerWindowApi = false,
  autoFireFromUrl = false,
}: Options = {}) {
  const { registerPending } = useTreasuryPendingTx();
  const searchParams = useSearchParams();
  const autoFiredRef = useRef(false);

  const firePay = useCallback(
    (crc = nominalCrc) => {
      const txHash = demoTxHash('pay');
      const spawnRect = demoPayButtonSpawnRect();
      registerPending({
        txHash,
        nominalCrc: crc,
        source: 'pay',
        spawnRect,
      });
      dispatchPayTreasuryFeedback(txHash, crc, spawnRect);
      onFired?.(txHash);
      return txHash;
    },
    [nominalCrc, onFired, registerPending],
  );

  const fireInbound = useCallback(
    (options: TreasuryDemoFireOptions = {}) => {
      const crc = options.nominalCrc ?? nominalCrc;
      const spawn = options.spawn ?? 'external';
      const txHash = demoTxHash('local');
      let spawnRect = options.spawnRect;

      if (!spawnRect && spawn === 'button') {
        spawnRect = demoButtonSpawnRect();
      }

      if (spawn === 'button') {
        registerPending({
          txHash,
          nominalCrc: crc,
          source: 'donation',
          spawnRect,
        });
      }

      dispatchLocalTreasuryCoin({ txHash, nominalCrc: crc, spawnRect });
      onFired?.(txHash);
      return txHash;
    },
    [nominalCrc, onFired, registerPending],
  );

  const fireDonate = useCallback(
    (crc = nominalCrc) => fireInbound({ nominalCrc: crc, spawn: 'button' }),
    [fireInbound, nominalCrc],
  );

  useEffect(() => {
    if (!IS_DEV || !registerWindowApi) return;

    window.__THP_TREASURY_DEMO__ = {
      fireInbound: (options) => fireInbound(options ?? {}),
      fireDonate: (crc) => fireDonate(crc),
      firePay: (crc) => firePay(crc),
    };

    return () => {
      delete window.__THP_TREASURY_DEMO__;
    };
  }, [fireDonate, fireInbound, firePay, registerWindowApi]);

  useEffect(() => {
    if (!IS_DEV || !autoFireFromUrl || autoFiredRef.current) return;

    const parsed = parseTreasuryDemoSearchParams(searchParams.toString());
    if (!parsed) return;

    autoFiredRef.current = true;
    const { nominalCrc: crc, spawn } = parsed;

    queueMicrotask(() => {
      if (spawn === 'pay') {
        firePay(crc);
        return;
      }
      fireInbound({ nominalCrc: crc, spawn: spawn === 'button' ? 'button' : 'external' });
    });
  }, [autoFireFromUrl, searchParams, fireInbound, firePay]);

  return { fireInbound, fireDonate, firePay };
}
