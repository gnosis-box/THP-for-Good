'use client';

import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import { filterChipClass } from '@/components/ui-patterns/highlight-pill';
import { UI_COPY } from '@/lib/ui-copy';
import type { TagRow } from '@/lib/db';

type Props = {
  tags: TagRow[];
  selected: string;
  onSelect: (tag: string) => void;
};

export function SkillFilter({ tags, selected, onSelect }: Props) {
  return (
    <ScrollArea className="motion-scroll-fade-x w-full whitespace-nowrap">
      <div
        role="group"
        aria-label="Filter experts by skill"
        className="inline-flex w-max min-h-11 items-center gap-2 pb-1"
      >
        <button
          type="button"
          aria-pressed={selected === ''}
          onClick={() => onSelect('')}
          className={filterChipClass(selected === '')}
        >
          {UI_COPY.home.filterAll}
        </button>
        {tags.map((tag) => (
          <button
            key={tag.id}
            type="button"
            aria-pressed={selected === tag.label}
            onClick={() => onSelect(tag.label)}
            className={filterChipClass(selected === tag.label)}
          >
            {tag.label}
          </button>
        ))}
      </div>
      <ScrollBar orientation="horizontal" />
    </ScrollArea>
  );
}
