'use client';

import { useEffect, useState } from 'react';

import { CrcAmount } from '@/components/ui-patterns/CrcAmount';
import { MentorSkillTags, MentorLanguageTags, MentorSplitShare } from '@/components/ui-patterns/MentorMeta';
import { ExpertTrustControl } from '@/components/ui-patterns/ExpertTrustControl';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { toHttpImageUrl } from '@/lib/utils';
import type { MentorRow } from '@/lib/db';

type Props = { mentor: MentorRow };

export function MentorProfileHero({ mentor }: Props) {
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [trustedBy, setTrustedBy] = useState<number | null>(null);
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
      const count = stats?.trustedByCount ?? raw?.trustsReceivedCount ?? null;
      setTrustedBy(typeof count === 'number' ? count : null);
      setImageUrl(toHttpImageUrl(raw?.picture ?? view.profile?.previewImageUrl ?? view.profile?.imageUrl) ?? null);
    })();
  }, [mentor.circles_address]);

  return (
    <div className="flex flex-col items-center gap-4 text-center">
      <Avatar className="size-16 shrink-0">
        {imageUrl ? <AvatarImage src={imageUrl} alt={mentor.name} /> : null}
        <AvatarFallback className="text-lg font-semibold">
          {mentor.name.charAt(0).toUpperCase()}
        </AvatarFallback>
      </Avatar>
      <div className="flex w-full max-w-lg flex-col items-center gap-2">
        <h1 className="text-display text-xl font-semibold tracking-tight sm:text-2xl">{mentor.name}</h1>
        <CrcAmount amount={mentor.price_crc} className="text-sm sm:text-base" />
        <div className="flex flex-wrap items-center justify-center gap-1.5">
          {trustedBy !== null && (
            <p className="text-xs text-muted-foreground">Trusted by {trustedBy}</p>
          )}
          <ExpertTrustControl expertAddress={mentor.circles_address} expertName={mentor.name} />
        </div>
        <MentorLanguageTags languages={callLanguages} className="sm:text-sm" prefix="Sessions" />
        <MentorSkillTags skills={mentor.skills} className="justify-center sm:[&_span]:text-sm" />
        <MentorSplitShare expertPercent={share} className="sm:text-sm" />
      </div>
    </div>
  );
}
