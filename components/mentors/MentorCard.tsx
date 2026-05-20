'use client';

import Link from 'next/link';

import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { useMentorCirclesOverlay } from '@/hooks/use-mentor-circles-overlay';
import { BOOKING_PRICE_CRC } from '@/lib/config';
import type { Mentor } from '@/lib/types';

type MentorCardProps = {
  mentor: Mentor;
};

export function MentorCard({ mentor }: MentorCardProps) {
  const { overlay, loading } = useMentorCirclesOverlay(mentor.walletAddress);

  return (
    <Link href={`/mentors/${mentor.id}`} className="block h-full">
      <Card className="h-full transition-colors hover:border-primary/40">
        <CardHeader className="flex flex-row items-start gap-3 space-y-0 pb-3">
          {loading ? (
            <Skeleton className="size-12 shrink-0 rounded-full" />
          ) : overlay?.imageUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={overlay.imageUrl}
              alt=""
              className="size-12 shrink-0 rounded-full object-cover"
            />
          ) : (
            <div className="flex size-12 shrink-0 items-center justify-center rounded-full bg-muted text-sm font-semibold">
              {mentor.name.slice(0, 1)}
            </div>
          )}
          <div className="min-w-0 flex-1">
            <CardTitle className="text-base">{mentor.name}</CardTitle>
            <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">{mentor.bio}</p>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex flex-wrap gap-1.5">
            {mentor.tags.map((tag) => (
              <Badge key={tag} variant="secondary">
                {tag}
              </Badge>
            ))}
          </div>
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>{BOOKING_PRICE_CRC} CRC / call</span>
            {overlay?.trustedByCount !== undefined ? (
              <span>{overlay.trustedByCount} trusts</span>
            ) : null}
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
