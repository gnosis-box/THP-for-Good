'use client';

import { useEffect, useState } from 'react';

import type { MentorCirclesOverlay } from '@/lib/types';

export function useMentorCirclesOverlay(walletAddress: `0x${string}` | undefined) {
  const [snapshot, setSnapshot] = useState<{
    address: `0x${string}` | null;
    overlay: MentorCirclesOverlay | null;
  }>({ address: null, overlay: null });

  useEffect(() => {
    if (!walletAddress) return;

    let cancelled = false;

    (async () => {
      try {
        const { Sdk } = await import('@aboutcircles/sdk');
        const sdk = new Sdk();
        const view = await sdk.rpc.profile.getProfileView(walletAddress);

        if (cancelled) return;

        if (!view.avatarInfo) {
          setSnapshot({ address: walletAddress, overlay: null });
          return;
        }

        const profile = view.profile as { imageUrl?: string; previewImageUrl?: string };
        setSnapshot({
          address: walletAddress,
          overlay: {
            imageUrl: profile?.previewImageUrl ?? profile?.imageUrl,
            trustsCount: view.trustStats?.trustsCount,
            trustedByCount: view.trustStats?.trustedByCount,
            v2Balance: view.v2Balance,
          },
        });
      } catch {
        if (!cancelled) {
          setSnapshot({ address: walletAddress, overlay: null });
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [walletAddress]);

  const loading = Boolean(walletAddress && snapshot.address !== walletAddress);

  return {
    overlay: snapshot.address === walletAddress ? snapshot.overlay : null,
    loading,
  };
}
