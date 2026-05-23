'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Card } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { CrcAmount } from '@/components/ui-patterns/CrcAmount';
import { splitLine } from '@/lib/ui-copy';
import { toHttpImageUrl } from '@/lib/utils';
import type { MentorRow } from '@/lib/db';

type CirclesData = { imageUrl?: string; trustedByCount: number | null };

export function MentorCard({ mentor }: { mentor: MentorRow }) {
  const [circles, setCircles] = useState<CirclesData | null>(null);
  const share = mentor.mentor_share_percent ?? 20;
  const skillsLabel = mentor.skills.join(' · ');

  useEffect(() => {
    (async () => {
      const { Sdk } = await import('@aboutcircles/sdk');
      const sdk = new Sdk();
      const view = await sdk.rpc.profile.getProfileView(mentor.circles_address as `0x${string}`);
      const stats = view.trustStats as { trustedByCount?: number } | undefined;
      const raw = view.profile as (typeof view.profile & { trustsReceivedCount?: number; picture?: string });
      const trustedBy =
        stats?.trustedByCount ?? raw?.trustsReceivedCount ?? null;
      setCircles({
        imageUrl: toHttpImageUrl(raw?.picture ?? view.profile?.previewImageUrl ?? view.profile?.imageUrl),
        trustedByCount: typeof trustedBy === 'number' ? trustedBy : null,
      });
    })();
  }, [mentor.circles_address]);

  return (
    <Link
      href={`/mentor/${mentor.id}`}
      aria-label={`Book ${mentor.name}, ${mentor.price_crc} CRC per session`}
      className="block w-full min-w-0 rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
    >
      <Card className="w-full border-border/80 py-0 transition-colors hover:border-primary/30 hover:shadow-md">
        <div className="flex w-full items-start gap-3 p-3 sm:p-4">
          <Avatar className="size-11 shrink-0 sm:size-12">
            {circles?.imageUrl ? (
              <AvatarImage src={circles.imageUrl} alt="" />
            ) : null}
            <AvatarFallback className="text-sm font-semibold">
              {mentor.name.charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div className="min-w-0 flex-1 space-y-1">
            <div className="flex items-start justify-between gap-2">
              <p className="truncate font-semibold leading-tight sm:text-base">{mentor.name}</p>
              <CrcAmount amount={mentor.price_crc} variant="badge" />
            </div>
            {circles !== null && circles.trustedByCount !== null && (
              <p className="text-xs text-muted-foreground">Trusted by {circles.trustedByCount}</p>
            )}
            {mentor.skills.length > 0 && (
              <p className="truncate text-xs text-muted-foreground" title={skillsLabel}>
                {skillsLabel}
              </p>
            )}
            <p className="truncate text-xs text-accent">{splitLine(share, 100 - share)}</p>
          </div>
        </div>
      </Card>
    </Link>
  );
}
