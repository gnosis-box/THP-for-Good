'use client';

import { useEffect, useState } from 'react';

import type { MentorSharePercent } from '@/lib/crc-pay';
import {
  formatCrc,
  queryTrustPathLimits,
  type TrustPathLimits,
} from '@/lib/trust-eligible-balance';

export type TrustEligibleBalanceState =
  | { status: 'idle' | 'loading' }
  | { status: 'ready'; limits: TrustPathLimits; formatted: { expert: string; foundation: string; bookable: string } }
  | { status: 'error'; message: string };

export function useTrustEligibleBalance(
  from: string | null,
  expert: string | null,
  priceCrc: number,
  mentorSharePercent: MentorSharePercent,
) {
  const [snapshot, setSnapshot] = useState<{
    key: string;
    state: TrustEligibleBalanceState;
  }>({ key: '', state: { status: 'idle' } });

  useEffect(() => {
    if (!from || !expert || priceCrc <= 0) {
      setSnapshot({ key: '', state: { status: 'idle' } });
      return;
    }

    const key = `${from}:${expert}:${priceCrc}:${mentorSharePercent}`;
    let cancelled = false;
    setSnapshot({ key, state: { status: 'loading' } });

    queryTrustPathLimits(
      from as `0x${string}`,
      expert as `0x${string}`,
      priceCrc,
      mentorSharePercent,
    )
      .then((limits) => {
        if (cancelled) return;
        setSnapshot({
          key,
          state: {
            status: 'ready',
            limits,
            formatted: {
              expert: formatCrc(limits.toExpertCrc),
              foundation: formatCrc(limits.toFoundationCrc),
              bookable: formatCrc(limits.bookableCrc),
            },
          },
        });
      })
      .catch((error: unknown) => {
        if (cancelled) return;
        setSnapshot({
          key,
          state: {
            status: 'error',
            message: error instanceof Error ? error.message : 'Trust path lookup failed',
          },
        });
      });

    return () => {
      cancelled = true;
    };
  }, [from, expert, priceCrc, mentorSharePercent]);

  if (!from || !expert || priceCrc <= 0) return { status: 'idle' } as const;
  const key = `${from}:${expert}:${priceCrc}:${mentorSharePercent}`;
  if (snapshot.key !== key) return { status: 'loading' } as const;
  return snapshot.state;
}
