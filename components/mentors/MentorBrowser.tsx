'use client';

import { useState } from 'react';
import type { MentorRow, TagRow } from '@/lib/db';
import { MentorCard } from './MentorCard';
import { MentorSearch } from './MentorSearch';
import { SkillFilter } from './SkillFilter';

type Props = {
  mentors: MentorRow[];
  tags: TagRow[];
};

export function MentorBrowser({ mentors, tags }: Props) {
  const [selectedSkill, setSelectedSkill] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  const filtered = mentors.filter((m) => {
    const matchSkill = !selectedSkill || m.skills.includes(selectedSkill);
    const q = searchQuery.toLowerCase();
    const matchSearch =
      !q ||
      m.name.toLowerCase().includes(q) ||
      (m.bio ?? '').toLowerCase().includes(q) ||
      m.skills.some((s) => s.toLowerCase().includes(q));
    return matchSkill && matchSearch;
  });

  return (
    <div className="mx-auto flex max-w-4xl flex-col gap-8">
      <section className="flex flex-col gap-2">
        <h1 className="text-2xl font-semibold tracking-tight">Get a call with an Expert</h1>
        <p className="text-sm text-muted-foreground">
          Pay in CRC, help someone get a free bootcamp tuition
        </p>
      </section>

      <section className="flex flex-col gap-3">
        <p className="text-sm font-medium">Which domain do you want help with?</p>
        <MentorSearch value={searchQuery} onChange={setSearchQuery} />
        <SkillFilter tags={tags} selected={selectedSkill} onSelect={setSelectedSkill} />
      </section>

      {filtered.length === 0 ? (
        <p className="text-sm text-muted-foreground">No mentors found for this search.</p>
      ) : (
        <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
          {filtered.map((mentor) => (
            <MentorCard key={mentor.id} mentor={mentor} />
          ))}
        </div>
      )}
    </div>
  );
}
