'use client';

import { useEffect, useState } from 'react';

export type CrcBalanceState =
  | { status: 'idle' | 'loading' }
  | { status: 'ready'; balance: number; formatted: string }
  | { status: 'not-registered' }
  | { status: 'error'; message: string };

export function useCrcBalance(address: string | null) {
  const [snapshot, setSnapshot] = useState<{
    address: string | null;
    state: CrcBalanceState;
  }>({ address: null, state: { status: 'idle' } });

  useEffect(() => {
    if (!address) return;

    let cancelled = false;
    setSnapshot({ address, state: { status: 'loading' } });

    (async () => {
      try {
        const { Sdk } = await import('@aboutcircles/sdk');
        const sdk = new Sdk();
        const view = await sdk.rpc.profile.getProfileView(address as `0x${string}`);

        if (cancelled) return;

        if (!view.avatarInfo) {
          setSnapshot({ address, state: { status: 'not-registered' } });
          return;
        }

        const raw = view.v2Balance ?? '0';
        const balance = Number(raw);
        const formatted = Number.isFinite(balance)
          ? balance.toLocaleString(undefined, { maximumFractionDigits: 2 })
          : raw;

        setSnapshot({ address, state: { status: 'ready', balance, formatted } });
      } catch (error) {
        if (cancelled) return;
        setSnapshot({
          address,
          state: {
            status: 'error',
            message: error instanceof Error ? error.message : 'Balance lookup failed',
          },
        });
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [address]);

  if (!address) return { status: 'idle' } as const;
  if (snapshot.address !== address) return { status: 'loading' } as const;
  return snapshot.state;
}
