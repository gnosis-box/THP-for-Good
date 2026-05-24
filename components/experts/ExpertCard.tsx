'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { CrcAmount } from '@/components/ui-patterns/CrcAmount';
import { ExpertSkillTags, ExpertLanguageTags, ExpertSplitShare } from '@/components/ui-patterns/ExpertMeta';
import { ExpertTrustControl } from '@/components/ui-patterns/ExpertTrustControl';
import { UI_COPY } from '@/lib/ui-copy';
import { motionClass } from '@/lib/motion';
import { usePrefersReducedMotion } from '@/hooks/use-prefers-reduced-motion';
import { cn, toHttpImageUrl } from '@/lib/utils';
import type { ExpertRow } from '@/lib/db';

type CirclesData = { imageUrl?: string; trustedByCount: number | null };

export function ExpertCard({
  expert,
  paidSessionCount,
}: {
  expert: ExpertRow;
  paidSessionCount?: number;
}) {
  const [circles, setCircles] = useState<CirclesData | null>(null);
  const reducedMotion = usePrefersReducedMotion();
  const share = expert.expert_share_percent ?? 20;
  const callLanguages =
    expert.call_languages.length > 0 ? expert.call_languages : expert.spoken_languages;

  useEffect(() => {
    (async () => {
      const { Sdk } = await import('@aboutcircles/sdk');
      const sdk = new Sdk();
      const view = await sdk.rpc.profile.getProfileView(expert.circles_address as `0x${string}`);
      const stats = view.trustStats as { trustedByCount?: number } | undefined;
      const raw = view.profile as (typeof view.profile & { trustsReceivedCount?: number; picture?: string });
      const trustedBy =
        stats?.trustedByCount ?? raw?.trustsReceivedCount ?? null;
      setCircles({
        imageUrl: toHttpImageUrl(raw?.picture ?? view.profile?.previewImageUrl ?? view.profile?.imageUrl),
        trustedByCount: typeof trustedBy === 'number' ? trustedBy : null,
      });
    })();
  }, [expert.circles_address]);

  return (
    <Link
      href={`/expert/${expert.id}`}
      aria-label={`Book ${expert.name}, ${expert.price_crc} CRC per session`}
      className={cn(
        'motion-card-hover group/split flex h-full min-h-0 w-full flex-col transition-colors hover:bg-muted/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-inset',
      )}
    >
      <div className="flex flex-1 items-start gap-3 px-3 py-3 sm:px-4 sm:py-4">
          <Avatar className="size-11 shrink-0 sm:size-12">
            {circles?.imageUrl ? (
              <AvatarImage
                src={circles.imageUrl}
                alt=""
                className={motionClass('', 'motion-trust-fade-in', reducedMotion)}
              />
            ) : null}
            <AvatarFallback className="text-sm font-semibold">
              {expert.name.charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div className="min-w-0 flex-1 space-y-1">
            <div className="flex items-start justify-between gap-2">
              <div className="flex min-w-0 flex-wrap items-baseline gap-x-2 gap-y-0.5">
                <p className="truncate font-semibold leading-tight sm:text-base">{expert.name}</p>
                <ExpertLanguageTags languages={callLanguages} className="shrink-0" />
              </div>
              {paidSessionCount != null ? (
                <p className="shrink-0 text-sm tabular-nums text-foreground">
                  {UI_COPY.stats.expertPaidSessions(paidSessionCount)}
                </p>
              ) : (
                <CrcAmount amount={expert.price_crc} variant="highlight" />
              )}
            </div>
            <div className="flex flex-wrap items-center gap-1.5">
              {circles !== null && circles.trustedByCount !== null && (
                <p className="text-xs text-muted-foreground">Trusted by {circles.trustedByCount}</p>
              )}
              <ExpertTrustControl
                expertAddress={expert.circles_address}
                expertName={expert.name}
                compact
              />
            </div>
            <ExpertSkillTags skills={expert.skills} />
          </div>
        </div>
        <ExpertSplitShare
          expertPercent={share}
          variant="footer"
          className="transition-[filter] duration-[var(--motion-fast)] group-hover/split:brightness-110"
        />
    </Link>
  );
}
