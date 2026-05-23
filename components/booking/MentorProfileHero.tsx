'use client';

import { useEffect, useState } from 'react';

import { CrcAmount } from '@/components/ui-patterns/CrcAmount';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { splitLine } from '@/lib/ui-copy';
import { toHttpImageUrl } from '@/lib/utils';
import type { MentorRow } from '@/lib/db';

type Props = { mentor: MentorRow };

export function MentorProfileHero({ mentor }: Props) {
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [trustedBy, setTrustedBy] = useState<number | null>(null);
  const share = mentor.mentor_share_percent ?? 20;

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
    <div className="flex flex-col gap-4">
      <div className="flex items-start gap-4">
        <Avatar className="size-16 shrink-0">
          {imageUrl ? <AvatarImage src={imageUrl} alt={mentor.name} /> : null}
          <AvatarFallback className="text-lg font-semibold">
            {mentor.name.charAt(0).toUpperCase()}
          </AvatarFallback>
        </Avatar>
        <div className="flex min-w-0 flex-1 flex-col gap-2">
          <div className="flex items-start justify-between gap-2">
            <h1 className="text-display text-xl font-semibold tracking-tight sm:text-2xl">
              {mentor.name}
            </h1>
            <CrcAmount amount={mentor.price_crc} variant="badge" />
          </div>
          {trustedBy !== null && (
            <p className="text-xs text-muted-foreground">Trusted by {trustedBy}</p>
          )}
          {mentor.skills.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {mentor.skills.map((skill) => (
                <Badge key={skill} variant="secondary">
                  {skill}
                </Badge>
              ))}
            </div>
          )}
          <p className="text-xs text-accent">{splitLine(share, 100 - share)}</p>
        </div>
      </div>
    </div>
  );
}
