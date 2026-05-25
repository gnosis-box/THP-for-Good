'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

import { usePrefersReducedMotion } from '@/hooks/use-prefers-reduced-motion';

export type CoinBurst = {
  id: string;
  nominalCrc: number;
  startX: number;
  startY: number;
  txHash: string;
};

const MAX_CONCURRENT = 3;
const MERGE_WINDOW_MS = 2_000;

type Options = {
  onImpact: (id: string, nominalCrc: number) => void;
};

export function useCoinBurstQueue({ onImpact }: Options) {
  const reducedMotion = usePrefersReducedMotion();
  const [active, setActive] = useState<CoinBurst[]>([]);
  const queueRef = useRef<CoinBurst[]>([]);
  const recentRef = useRef<number[]>([]);

  const drainQueue = useCallback(() => {
    setActive((current) => {
      const slots = MAX_CONCURRENT - current.length;
      if (slots <= 0) return current;
      const next = queueRef.current.splice(0, slots);
      return next.length ? [...current, ...next] : current;
    });
  }, []);

  const enqueue = useCallback(
    (burst: Omit<CoinBurst, 'id'>) => {
      const now = Date.now();
      recentRef.current = recentRef.current.filter((t) => now - t < MERGE_WINDOW_MS);
      recentRef.current.push(now);

      if (reducedMotion) {
        onImpact(burst.txHash, burst.nominalCrc);
        return;
      }

      const item: CoinBurst = { ...burst, id: `${burst.txHash}-${now}` };
      queueRef.current.push(item);
      drainQueue();
    },
    [drainQueue, onImpact, reducedMotion],
  );

  const complete = useCallback(
    (id: string, nominalCrc: number) => {
      setActive((current) => current.filter((b) => b.id !== id));
      onImpact(id, nominalCrc);
      drainQueue();
    },
    [drainQueue, onImpact],
  );

  useEffect(() => {
    if (active.length < MAX_CONCURRENT && queueRef.current.length > 0) drainQueue();
  }, [active.length, drainQueue]);

  return { active, enqueue, complete };
}
