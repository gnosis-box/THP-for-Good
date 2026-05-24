'use client';

import { useEffect, useState } from 'react';

import { CrcAmount } from '@/components/ui-patterns/CrcAmount';
import { ExpertSkillTags, ExpertLanguageTags, ExpertSplitShare } from '@/components/ui-patterns/ExpertMeta';
import { ExpertTrustControl } from '@/components/ui-patterns/ExpertTrustControl';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { FadeContent } from '@/components/motion/fade-content';
import { toHttpImageUrl } from '@/lib/utils';
import type { ExpertRow } from '@/lib/db';

type Props = { expert: ExpertRow };

export function ExpertProfileHero({ expert }: Props) {
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [trustedBy, setTrustedBy] = useState<number | null>(null);
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
      const count = stats?.trustedByCount ?? raw?.trustsReceivedCount ?? null;
      setTrustedBy(typeof count === 'number' ? count : null);
      setImageUrl(toHttpImageUrl(raw?.picture ?? view.profile?.previewImageUrl ?? view.profile?.imageUrl) ?? null);
    })();
  }, [expert.circles_address]);

  return (
    <FadeContent className="flex flex-col items-center gap-4 text-center">
      <Avatar className="size-16 shrink-0">
        {imageUrl ? <AvatarImage src={imageUrl} alt={expert.name} /> : null}
        <AvatarFallback className="text-lg font-semibold">
          {expert.name.charAt(0).toUpperCase()}
        </AvatarFallback>
      </Avatar>
      <div className="flex w-full max-w-lg flex-col items-center gap-2">
        <h1 className="text-display text-xl font-semibold tracking-tight sm:text-2xl">{expert.name}</h1>
        <CrcAmount amount={expert.price_crc} variant="highlight" className="sm:text-base" />
        <div className="flex flex-wrap items-center justify-center gap-1.5">
          {trustedBy !== null && (
            <p className="text-xs text-subtle-foreground">Trusted by {trustedBy}</p>
          )}
          <ExpertTrustControl expertAddress={expert.circles_address} expertName={expert.name} />
        </div>
        <ExpertLanguageTags languages={callLanguages} className="sm:text-sm" prefix="Sessions" />
        <ExpertSkillTags skills={expert.skills} className="justify-center" />
        <ExpertSplitShare expertPercent={share} variant="inline" className="mt-1 w-full" />
      </div>
    </FadeContent>
  );
}
