'use client';

import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { SlotPicker } from '@/components/mentors/SlotPicker';
import { PayButton } from '@/components/mentors/PayButton';
import type { MentorRow } from '@/lib/db';

export function MentorDetail({ mentor }: { mentor: MentorRow }) {
  const router = useRouter();

  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-6">
      <div>
        <Button variant="ghost" size="sm" onClick={() => router.back()} className="-ml-2">
          ← Back
        </Button>
      </div>

      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-semibold tracking-tight">{mentor.name}</h1>
        {mentor.skills.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {mentor.skills.map((skill) => (
              <span key={skill} className="rounded-full bg-muted px-3 py-1 text-sm font-medium">
                {skill}
              </span>
            ))}
          </div>
        )}
      </div>

      {mentor.bio && (
        <p className="text-sm leading-relaxed text-muted-foreground">{mentor.bio}</p>
      )}

      <Separator />

      <SlotPicker calendarLink={mentor.calendar_link} />

      <Separator />

      <PayButton mentor={mentor} />
    </div>
  );
}
