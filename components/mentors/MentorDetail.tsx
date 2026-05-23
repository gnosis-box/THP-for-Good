'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { SlotPicker } from '@/components/mentors/SlotPicker';
import { PayButton } from '@/components/mentors/PayButton';
import { MentorEditForm } from '@/components/mentors/MentorEditForm';
import { useWallet } from '@/components/wallet/WalletProvider';
import type { MentorRow } from '@/lib/db';

export function MentorDetail({ mentor: initialMentor }: { mentor: MentorRow }) {
  const router = useRouter();
  const { address } = useWallet();
  const [mentor, setMentor] = useState(initialMentor);
  const [editing, setEditing] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);

  const isSelf = !!address && address.toLowerCase() === mentor.circles_address.toLowerCase();

  async function reloadMentor() {
    const res = await fetch(`/api/mentors/${mentor.id}`);
    if (res.ok) {
      const updated = (await res.json()) as MentorRow;
      setMentor(updated);
    }
    setEditing(false);
  }

  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-6">
      <div className="flex items-center justify-between">
        <Button variant="ghost" size="sm" onClick={() => router.back()} className="-ml-2">
          ← Back
        </Button>
        {isSelf && !editing && (
          <Button variant="outline" size="sm" onClick={() => setEditing(true)}>
            Edit my profile
          </Button>
        )}
      </div>

      {editing ? (
        <MentorEditForm
          mentor={mentor}
          walletAddress={address!}
          onSaved={reloadMentor}
          onCancel={() => setEditing(false)}
        />
      ) : (
        <>
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
            <p className="text-sm text-muted-foreground">
              {isSelf
                ? 'No availability configured yet. Click "Edit my profile" to connect your Cal.com.'
                : 'Availability not configured for this mentor yet.'}
            </p>
          )}

          <Separator />

          <PayButton mentor={mentor} selectedSlot={selectedSlot} />
        </>
      )}
    </div>
  );
}
