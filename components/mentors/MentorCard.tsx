'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { toHttpImageUrl, fetchCirclesScore } from '@/lib/utils';
import type { MentorRow } from '@/lib/db';

type CirclesData = { imageUrl?: string; trustsReceivedCount: number; score: number | null };

export function MentorCard({ mentor }: { mentor: MentorRow }) {
  const [circles, setCircles] = useState<CirclesData | null>(null);

  useEffect(() => {
    (async () => {
      const [{ Sdk }, score] = await Promise.all([
        import('@aboutcircles/sdk'),
        fetchCirclesScore(mentor.circles_address),
      ]);
      const sdk = new Sdk();
      const view = await sdk.rpc.profile.getProfileView(mentor.circles_address as `0x${string}`);
      const raw = view.profile as (typeof view.profile & { trustsReceivedCount?: number; picture?: string });
      setCircles({
        imageUrl: toHttpImageUrl(raw?.picture ?? view.profile?.previewImageUrl ?? view.profile?.imageUrl),
        trustsReceivedCount: raw?.trustsReceivedCount ?? 0,
        score,
      });
    })();
  }, [mentor.circles_address]);

  return (
    <Link href={`/mentor/${mentor.id}`} className="block focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-xl">
      <Card className="h-full transition-shadow hover:shadow-md">
        <CardHeader>
          <div className="flex items-center gap-3">
            {circles?.imageUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={circles.imageUrl}
                alt={mentor.name}
                className="size-12 shrink-0 rounded-full object-cover"
              />
            ) : (
              <div className="flex size-12 shrink-0 items-center justify-center rounded-full bg-muted text-base font-semibold text-muted-foreground select-none">
                {mentor.name.charAt(0).toUpperCase()}
              </div>
            )}
            <div className="flex flex-col gap-0.5 min-w-0">
              <CardTitle className="text-base font-semibold">{mentor.name}</CardTitle>
              {circles !== null && (
                <span className="text-xs text-muted-foreground">
                  {circles.score !== null
                    ? `Score: ${circles.score}/100`
                    : `${circles.trustsReceivedCount} trusted by`}
                </span>
              )}
            </div>
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

        <CardFooter className="text-sm text-muted-foreground">
          {mentor.price_crc} CRC / session
        </CardFooter>
      </Card>
    </Link>
  );
}
