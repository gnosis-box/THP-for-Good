'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { CrcAmount } from '@/components/ui-patterns/CrcAmount';
import { MentorSkillTags, MentorSplitShare } from '@/components/ui-patterns/MentorMeta';
import { toHttpImageUrl } from '@/lib/utils';
import type { MentorRow } from '@/lib/db';

type CirclesData = { imageUrl?: string; trustedByCount: number | null };

export function MentorCard({ mentor }: { mentor: MentorRow }) {
  const [circles, setCircles] = useState<CirclesData | null>(null);
  const share = mentor.mentor_share_percent ?? 20;

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
      className="group block w-full min-w-0 rounded-2xl bg-card ring-1 ring-foreground/10 transition-[transform,box-shadow] duration-200 hover:-translate-y-[3px] hover:shadow-[var(--shadow-card-hover)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
    >
      <div className="flex w-full items-start gap-4 p-4">
        <Avatar className="size-12 shrink-0">
          {circles?.imageUrl ? (
            <AvatarImage src={circles.imageUrl} alt="" />
          ) : null}
          <AvatarFallback className="bg-primary/20 text-sm font-bold text-primary">
            {mentor.name.charAt(0).toUpperCase()}
          </AvatarFallback>
        </Avatar>
        <div className="min-w-0 flex-1 space-y-2">
          <div className="flex items-start justify-between gap-2">
            <p className="truncate font-display text-base font-semibold leading-tight">{mentor.name}</p>
            <CrcAmount amount={mentor.price_crc} className="shrink-0 text-sm font-semibold text-accent" />
          </div>
          {circles !== null && circles.trustedByCount !== null && (
            <p className="text-xs text-muted-foreground">Trusted by {circles.trustedByCount}</p>
          )}
          <MentorSkillTags skills={mentor.skills} />
          <MentorSplitShare expertPercent={share} />
        </div>
      </div>
    </Link>
  );
}
