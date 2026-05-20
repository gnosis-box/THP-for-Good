'use client';

import { useMemo, useState } from 'react';

import { MentorCard } from '@/components/mentors/MentorCard';
import { MentorSearch } from '@/components/mentors/MentorSearch';
import { filterMentors } from '@/lib/mentors';
import type { Mentor } from '@/lib/types';

type MentorGridProps = {
  mentors: Mentor[];
};

export function MentorGrid({ mentors }: MentorGridProps) {
  const [query, setQuery] = useState('');

  const filtered = useMemo(() => filterMentors(query, mentors), [query, mentors]);

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-6">
      <div className="space-y-2 text-center">
        <h1 className="text-2xl font-semibold tracking-tight">THP for Good</h1>
        <p className="text-sm text-muted-foreground">
          Get a call with a mentor, pay in CRC, help someone get a free bootcamp tuition.
        </p>
      </div>

      <MentorSearch value={query} onChange={setQuery} />

      {filtered.length === 0 ? (
        <p className="py-8 text-center text-sm text-muted-foreground">
          No mentors match your search.
        </p>
      ) : (
        <div className="grid grid-cols-2 gap-3 sm:gap-4">
          {filtered.map((mentor) => (
            <MentorCard key={mentor.id} mentor={mentor} />
          ))}
        </div>
      )}
    </div>
  );
}
