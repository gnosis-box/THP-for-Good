'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { MetricsExternalLink } from '@/components/ui-patterns/metrics-panel';
import { UI_COPY } from '@/lib/ui-copy';
import type { StatsExpertPayload } from '@/lib/stats-api';
import { toHttpImageUrl } from '@/lib/utils';

type Props = {
  expert: StatsExpertPayload;
};

export function StatsExpertCard({ expert }: Props) {
  const [imageUrl, setImageUrl] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      const { Sdk } = await import('@aboutcircles/sdk');
      const sdk = new Sdk();
      const view = await sdk.rpc.profile.getProfileView(expert.address as `0x${string}`);
      const raw = view.profile as (typeof view.profile & { picture?: string });
      setImageUrl(
        toHttpImageUrl(raw?.picture ?? view.profile?.previewImageUrl ?? view.profile?.imageUrl) ??
          null,
      );
    })();
  }, [expert.address]);

  const copy = UI_COPY.stats;

  return (
    <li className="w-full min-w-0 overflow-hidden rounded-xl border border-border bg-card">
      <Link
        href={`/mentor/${expert.id}`}
        className="block w-full min-w-0 transition-colors hover:bg-muted/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-inset"
      >
        <div className="flex w-full items-start gap-3 px-3 py-3 sm:px-4 sm:py-4">
          <Avatar className="size-11 shrink-0 sm:size-12">
            {imageUrl ? <AvatarImage src={imageUrl} alt="" /> : null}
            <AvatarFallback className="text-sm font-semibold">
              {expert.name.charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div className="min-w-0 flex-1 space-y-1">
            <div className="flex items-start justify-between gap-2">
              <p className="truncate font-semibold leading-tight sm:text-base">{expert.name}</p>
              <p className="shrink-0 text-sm tabular-nums text-foreground">
                {copy.expertPaidSessions(expert.paidSessionCount)}
              </p>
            </div>
          </div>
        </div>
      </Link>
      <div className="flex flex-wrap justify-center gap-2 border-t border-border px-3 py-3 sm:px-4">
        <MetricsExternalLink href={expert.eventsUrl}>{copy.viewOnChainActivity}</MetricsExternalLink>
        <MetricsExternalLink href={expert.graphUrl}>{copy.trustGraph}</MetricsExternalLink>
      </div>
    </li>
  );
}
