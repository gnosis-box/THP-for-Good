'use client';

import { ExpertDetailCardContent } from '@/components/experts/ExpertDetailCardContent';
import { FadeContent } from '@/components/motion/fade-content';
import { useExpertTrustStats } from '@/hooks/use-expert-trust-stats';
import { usePrefersReducedMotion } from '@/hooks/use-prefers-reduced-motion';
import type { ExpertRow } from '@/lib/db';

type Props = { expert: ExpertRow };

export function ExpertProfileHero({ expert }: Props) {
  const trustStats = useExpertTrustStats(expert.circles_address);
  const reducedMotion = usePrefersReducedMotion();

  return (
    <FadeContent className="my-3 w-full overflow-hidden rounded-xl border border-border bg-card">
      <ExpertDetailCardContent expert={expert} trustStats={trustStats} reducedMotion={reducedMotion} />
    </FadeContent>
  );
}
