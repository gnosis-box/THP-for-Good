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
    <div className="flex w-full flex-col gap-8">
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
        <ul className="flex w-full flex-col overflow-hidden rounded-xl bg-card ring-1 ring-foreground/10 lg:grid lg:grid-cols-2 lg:gap-4 lg:overflow-visible lg:rounded-none lg:bg-transparent lg:ring-0">
          {filtered.map((mentor) => (
            <li
              key={mentor.id}
              className="w-full min-w-0 border-b border-border/60 last:border-b-0 lg:overflow-hidden lg:rounded-xl lg:border-b-0 lg:bg-card lg:ring-1 lg:ring-foreground/10"
            >
              <MentorCard mentor={mentor} />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
