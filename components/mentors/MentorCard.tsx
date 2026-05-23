'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { CrcAmount } from '@/components/ui-patterns/CrcAmount';
import { splitLine } from '@/lib/ui-copy';
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
      className="block rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
    >
      <Card className="h-full border-border/80 transition-colors hover:border-primary/30 hover:shadow-md">
        <CardHeader>
          <div className="flex items-start justify-between gap-2">
            <div className="flex min-w-0 items-center gap-3">
              <Avatar className="size-12 shrink-0">
                {circles?.imageUrl ? (
                  <AvatarImage src={circles.imageUrl} alt={mentor.name} />
                ) : null}
                <AvatarFallback className="font-semibold">
                  {mentor.name.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="flex min-w-0 flex-col gap-0.5">
                <CardTitle className="truncate text-base font-semibold">{mentor.name}</CardTitle>
                {circles !== null && circles.trustedByCount !== null && (
                  <span className="text-xs text-muted-foreground">
                    Trusted by {circles.trustedByCount}
                  </span>
                )}
              </div>
            </div>
            <CrcAmount amount={mentor.price_crc} variant="badge" />
          </div>
        </CardHeader>

        {mentor.skills.length > 0 && (
          <CardContent className="flex flex-wrap gap-1.5">
            {mentor.skills.map((skill) => (
              <Badge key={skill} variant="secondary">
                {skill}
              </Badge>
            ))}
          </CardContent>
        )}

        <CardFooter>
          <span className="text-xs text-accent">{splitLine(share, 100 - share)}</span>
        </CardFooter>
      </Card>
    </Link>
  );
}
