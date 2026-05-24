'use client';

import { useState } from 'react';
import type { ExpertRow, TagRow } from '@/lib/db';
import { UI_COPY } from '@/lib/ui-copy';
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyTitle,
} from '@/components/ui/empty';
import { PageHeader } from '@/components/layout/PageHeader';
import { AnimatedList, AnimatedListItem } from '@/components/motion/animated-list';
import { MotionEmpty } from '@/components/motion/motion-empty';
import { ExpertCard } from './ExpertCard';
import { ExpertSearch } from './ExpertSearch';
import { SkillFilter } from './SkillFilter';
import { LanguageFilter } from './LanguageFilter';

type Props = {
  experts: ExpertRow[];
  tags: TagRow[];
};

export function ExpertBrowser({ experts, tags }: Props) {
  const [selectedSkill, setSelectedSkill] = useState('');
  const [selectedLanguages, setSelectedLanguages] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState('');

  const filtered = experts.filter((m) => {
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

  const listKey = `${selectedSkill}|${selectedLanguages.join(',')}|${searchQuery}`;

  return (
    <div className="flex w-full flex-col gap-8">
      <PageHeader title={UI_COPY.home.title} subtitle={UI_COPY.home.subtitle} />

      <section className="flex flex-col gap-4">
        <p className="text-sm font-medium">{UI_COPY.home.filterLabel}</p>
        <ExpertSearch value={searchQuery} onChange={setSearchQuery} />
        <SkillFilter tags={tags} selected={selectedSkill} onSelect={setSelectedSkill} />
        <LanguageFilter selected={selectedLanguages} onChange={setSelectedLanguages} />
      </section>

      {filtered.length === 0 ? (
        <MotionEmpty>
          <Empty>
            <EmptyHeader>
              <EmptyTitle>No experts</EmptyTitle>
              <EmptyDescription>{UI_COPY.home.emptySearch}</EmptyDescription>
            </EmptyHeader>
          </Empty>
        </MotionEmpty>
      ) : (
        <AnimatedList
          listKey={listKey}
          className="flex w-full flex-col gap-4 lg:grid lg:grid-cols-2"
        >
          {filtered.map((expert, index) => (
            <AnimatedListItem
              key={expert.id}
              index={index}
              className="w-full min-w-0 overflow-hidden rounded-xl border border-border bg-card"
            >
              <ExpertCard expert={expert} />
            </AnimatedListItem>
          ))}
        </AnimatedList>
      )}
    </div>
  );
}
