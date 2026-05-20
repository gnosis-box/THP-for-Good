'use client';

import Link from 'next/link';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import type { MentorRow } from '@/lib/db';

export function MentorCard({ mentor }: { mentor: MentorRow }) {
  return (
    <Link href={`/mentor/${mentor.id}`} className="block focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-xl">
      <Card className="h-full transition-shadow hover:shadow-md">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="flex size-12 shrink-0 items-center justify-center rounded-full bg-muted text-base font-semibold text-muted-foreground select-none">
              {mentor.name.charAt(0).toUpperCase()}
            </div>
            <CardTitle className="text-base font-semibold">{mentor.name}</CardTitle>
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
