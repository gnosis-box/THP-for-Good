'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { CrcAmount } from '@/components/ui-patterns/CrcAmount';
import { MentorSkillTags, MentorLanguageTags, MentorSplitShare } from '@/components/ui-patterns/MentorMeta';
import { TrustRelationBadge } from '@/components/ui-patterns/TrustRelationBadge';
import { useTrustRelation } from '@/hooks/use-trust-relation';
import { toHttpImageUrl } from '@/lib/utils';
import type { MentorRow } from '@/lib/db';

type CirclesData = { imageUrl?: string; trustedByCount: number | null };

export function MentorCard({ mentor }: { mentor: MentorRow }) {
  const [circles, setCircles] = useState<CirclesData | null>(null);
  const trustRelation = useTrustRelation(mentor.circles_address);
  const share = mentor.mentor_share_percent ?? 20;
  const callLanguages =
    mentor.call_languages.length > 0 ? mentor.call_languages : mentor.spoken_languages;

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
      className="block w-full min-w-0 transition-colors hover:bg-muted/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-inset"
    >
      <div className="flex w-full items-start gap-3 px-3 py-3 sm:px-4 sm:py-4">
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
            <CrcAmount amount={mentor.price_crc} className="shrink-0 text-sm text-foreground" />
          </div>
          <div className="flex flex-wrap items-center gap-1.5">
            {circles !== null && circles.trustedByCount !== null && (
              <p className="text-xs text-muted-foreground">Trusted by {circles.trustedByCount}</p>
            )}
            <TrustRelationBadge relation={trustRelation} />
          </div>
          <MentorLanguageTags languages={callLanguages} />
          <MentorSkillTags skills={mentor.skills} />
          <MentorSplitShare expertPercent={share} />
        </div>
      </div>
    </Link>
  );
}
