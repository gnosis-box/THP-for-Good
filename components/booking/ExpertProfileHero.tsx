'use client';

import { useEffect, useState } from 'react';

import {
  ExpertDetailCardContent,
  type ExpertCirclesData,
} from '@/components/experts/ExpertDetailCardContent';
import { FadeContent } from '@/components/motion/fade-content';
import { usePrefersReducedMotion } from '@/hooks/use-prefers-reduced-motion';
import { toHttpImageUrl } from '@/lib/utils';
import type { ExpertRow } from '@/lib/db';

type Props = { expert: ExpertRow };

export function ExpertProfileHero({ expert }: Props) {
  const [circles, setCircles] = useState<ExpertCirclesData | null>(null);
  const reducedMotion = usePrefersReducedMotion();

  useEffect(() => {
    (async () => {
      const { Sdk } = await import('@aboutcircles/sdk');
      const sdk = new Sdk();
      const view = await sdk.rpc.profile.getProfileView(expert.circles_address as `0x${string}`);
      const stats = view.trustStats as { trustedByCount?: number } | undefined;
      const raw = view.profile as (typeof view.profile & { trustsReceivedCount?: number; picture?: string });
      const trustedBy = stats?.trustedByCount ?? raw?.trustsReceivedCount ?? null;
      setCircles({
        imageUrl: toHttpImageUrl(raw?.picture ?? view.profile?.previewImageUrl ?? view.profile?.imageUrl),
        trustedByCount: typeof trustedBy === 'number' ? trustedBy : null,
      });
    })();
  }, [expert.circles_address]);

  return (
    <FadeContent className="my-3 w-full overflow-hidden rounded-xl border border-border bg-card">
      <ExpertDetailCardContent expert={expert} circles={circles} reducedMotion={reducedMotion} />
    </FadeContent>
  );
}
