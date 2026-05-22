'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { SlotPicker } from '@/components/mentors/SlotPicker';
import { PayButton } from '@/components/mentors/PayButton';
import type { MentorRow } from '@/lib/db';

export function MentorDetail({ mentor }: { mentor: MentorRow }) {
  const router = useRouter();
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);

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

      {mentor.cal_event_type_id ? (
        <SlotPicker mentorId={mentor.id} selected={selectedSlot} onSelect={setSelectedSlot} />
      ) : (
        <p className="text-sm text-muted-foreground">Availability not configured for this mentor yet.</p>
      )}

      <Separator />

      <PayButton mentor={mentor} selectedSlot={selectedSlot} />
    </div>
  );
}
