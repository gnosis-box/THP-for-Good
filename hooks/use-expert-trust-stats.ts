'use client';

import { useEffect, useState } from 'react';
import { getProfileImageUrl, getTrustedByCount } from '@/lib/expert-trust-stats';

export type ExpertTrustStatsState =
  | { status: 'loading' }
  | { status: 'ready'; trustedByCount: number; imageUrl?: string }
  | { status: 'error' };

export function useExpertTrustStats(address: string | null | undefined): ExpertTrustStatsState {
  const [state, setState] = useState<ExpertTrustStatsState>({ status: 'loading' });

  useEffect(() => {
    if (!address) {
      setState({ status: 'error' });
      return;
    }

    let cancelled = false;
    setState({ status: 'loading' });

    (async () => {
      try {
        const { Sdk } = await import('@aboutcircles/sdk');
        const sdk = new Sdk();
        const view = await sdk.rpc.profile.getProfileView(address as `0x${string}`);

        if (cancelled) return;

        setState({
          status: 'ready',
          trustedByCount: getTrustedByCount(view),
          imageUrl: getProfileImageUrl(view),
        });
      } catch {
        if (cancelled) return;
        setState({ status: 'error' });
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [address]);

  return state;
}
