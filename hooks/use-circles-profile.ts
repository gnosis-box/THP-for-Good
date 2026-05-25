'use client';

import { useEffect, useState } from 'react';
import { toHttpImageUrl } from '@/lib/utils';

export type CirclesProfileState =
  | { status: 'idle' | 'loading' }
  | { status: 'found'; name: string; bio: string | null; imageUrl: string | null }
  | { status: 'not-registered' }
  | { status: 'error'; message: string };

export function useCirclesProfile(address: string | null) {
  const [snapshot, setSnapshot] = useState<{
    address: string | null;
    state: CirclesProfileState;
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

        let name = view.profile?.name?.trim() ?? '';
        let bio: string | null = null;

        if (view.avatarInfo.cidV0) {
          try {
            const full = await sdk.rpc.profile.getProfileByCid(view.avatarInfo.cidV0);
            if (full?.name?.trim()) name = full.name.trim();
            if (full?.description?.trim()) bio = full.description.trim();
          } catch {
            // IPFS optional; keep indexed view fields
          }
        }

        if (!name) {
          setSnapshot({ address, state: { status: 'not-registered' } });
          return;
        }

        const raw = view.profile as (typeof view.profile & { picture?: string }) | undefined;
        const imageUrl =
          toHttpImageUrl(raw?.picture ?? view.profile?.previewImageUrl ?? view.profile?.imageUrl) ??
          null;

        setSnapshot({ address, state: { status: 'found', name, bio, imageUrl } });
      } catch (error) {
        if (cancelled) return;
        setSnapshot({
          address,
          state: {
            status: 'error',
            message: error instanceof Error ? error.message : 'Profile lookup failed',
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
