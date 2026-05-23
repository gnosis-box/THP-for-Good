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
import { PageHeader } from '@/components/layout/PageHeader';
import { MentorCard } from './MentorCard';
import { MentorSearch } from './MentorSearch';
import { SkillFilter } from './SkillFilter';
import { LanguageFilter } from './LanguageFilter';

type Props = {
  mentors: MentorRow[];
  tags: TagRow[];
};

export function MentorBrowser({ mentors, tags }: Props) {
  const [selectedSkill, setSelectedSkill] = useState('');
  const [selectedLanguages, setSelectedLanguages] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState('');

  const filtered = mentors.filter((m) => {
    const matchSkill = !selectedSkill || m.skills.includes(selectedSkill);
    const callLanguages = m.call_languages.length > 0 ? m.call_languages : m.spoken_languages;
    const matchLanguage =
      selectedLanguages.length === 0 ||
      selectedLanguages.some((code) => callLanguages.includes(code));
    const q = searchQuery.toLowerCase();
    const matchSearch =
      !q ||
      m.name.toLowerCase().includes(q) ||
      (m.bio ?? '').toLowerCase().includes(q) ||
      m.skills.some((s) => s.toLowerCase().includes(q));
    return matchSkill && matchLanguage && matchSearch;
  });

  return (
    <div className="flex w-full flex-col gap-8">
      <PageHeader title={UI_COPY.home.title} subtitle={UI_COPY.home.subtitle} />

      <section className="flex flex-col gap-4">
        <p className="text-sm font-medium">{UI_COPY.home.filterLabel}</p>
        <MentorSearch value={searchQuery} onChange={setSearchQuery} />
        <SkillFilter tags={tags} selected={selectedSkill} onSelect={setSelectedSkill} />
        <LanguageFilter selected={selectedLanguages} onChange={setSelectedLanguages} />
      </section>

      {filtered.length === 0 ? (
        <Empty>
          <EmptyHeader>
            <EmptyTitle>No mentors</EmptyTitle>
            <EmptyDescription>{UI_COPY.home.emptySearch}</EmptyDescription>
          </EmptyHeader>
        </Empty>
      ) : (
        <ul className="flex w-full flex-col gap-4 lg:grid lg:grid-cols-2">
          {filtered.map((mentor) => (
            <li
              key={mentor.id}
              className="w-full min-w-0 overflow-hidden rounded-xl border border-border bg-card"
            >
              <MentorCard mentor={mentor} />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
