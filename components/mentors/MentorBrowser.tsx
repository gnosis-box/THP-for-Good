'use client';

import { useState } from 'react';
import type { MentorRow, TagRow } from '@/lib/db';
import { UI_COPY } from '@/lib/ui-copy';
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyTitle,
} from '@/components/ui/empty';
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
    <div className="flex flex-col gap-8">
      <section className="flex flex-col gap-2">
        <h1 className="text-2xl font-semibold tracking-tight">{UI_COPY.home.title}</h1>
        <p className="text-sm text-muted-foreground">{UI_COPY.home.subtitle}</p>
      </section>

      <section className="flex flex-col gap-3">
        <p className="text-sm font-medium">{UI_COPY.home.filterLabel}</p>
        <MentorSearch value={searchQuery} onChange={setSearchQuery} />
        <SkillFilter tags={tags} selected={selectedSkill} onSelect={setSelectedSkill} />
      </section>

      {filtered.length === 0 ? (
        <Empty>
          <EmptyHeader>
            <EmptyTitle>No mentors</EmptyTitle>
            <EmptyDescription>{UI_COPY.home.emptySearch}</EmptyDescription>
          </EmptyHeader>
        </Empty>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {filtered.map((mentor) => (
            <MentorCard key={mentor.id} mentor={mentor} />
          ))}
        </div>
      )}
    </div>
  );
}
