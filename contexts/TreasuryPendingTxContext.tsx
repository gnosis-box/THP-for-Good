'use client';

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useRef,
  type ReactNode,
} from 'react';

export type TreasuryPendingSource = 'donation' | 'pay';

export type SpawnRect = {
  x: number;
  y: number;
  width: number;
  height: number;
};

export type TreasuryPendingTx = {
  txHash: string;
  nominalCrc: number;
  source: TreasuryPendingSource;
  spawnRect?: SpawnRect;
  createdAt: number;
};

type TreasuryPendingTxContextValue = {
  registerPending: (tx: Omit<TreasuryPendingTx, 'createdAt'>) => void;
  isPending: (txHash: string) => boolean;
  consumePending: (txHash: string) => TreasuryPendingTx | null;
  getPending: (txHash: string) => TreasuryPendingTx | null;
};

const TreasuryPendingTxContext = createContext<TreasuryPendingTxContextValue | null>(null);

const PENDING_TTL_MS = 120_000;

export function TreasuryPendingTxProvider({ children }: { children: ReactNode }) {
  const pendingRef = useRef<Map<string, TreasuryPendingTx>>(new Map());

  const prune = useCallback(() => {
    const now = Date.now();
    for (const [key, entry] of pendingRef.current.entries()) {
      if (now - entry.createdAt > PENDING_TTL_MS) pendingRef.current.delete(key);
    }
  }, []);

  const registerPending = useCallback(
    (tx: Omit<TreasuryPendingTx, 'createdAt'>) => {
      prune();
      pendingRef.current.set(tx.txHash.toLowerCase(), { ...tx, createdAt: Date.now() });
    },
    [prune],
  );

  const isPending = useCallback(
    (txHash: string) => {
      prune();
      return pendingRef.current.has(txHash.toLowerCase());
    },
    [prune],
  );

  const consumePending = useCallback(
    (txHash: string) => {
      prune();
      const key = txHash.toLowerCase();
      const entry = pendingRef.current.get(key) ?? null;
      if (entry) pendingRef.current.delete(key);
      return entry;
    },
    [prune],
  );

  const getPending = useCallback(
    (txHash: string) => {
      prune();
      return pendingRef.current.get(txHash.toLowerCase()) ?? null;
    },
    [prune],
  );

  const value = useMemo(
    () => ({ registerPending, isPending, consumePending, getPending }),
    [registerPending, isPending, consumePending, getPending],
  );

  return (
    <TreasuryPendingTxContext.Provider value={value}>{children}</TreasuryPendingTxContext.Provider>
  );
}

export function useTreasuryPendingTx() {
  const ctx = useContext(TreasuryPendingTxContext);
  if (!ctx) {
    throw new Error('useTreasuryPendingTx must be used within TreasuryPendingTxProvider');
  }
  return ctx;
}

/** Optional hook for components that may render outside provider during SSR. */
export function useTreasuryPendingTxOptional() {
  return useContext(TreasuryPendingTxContext);
}
