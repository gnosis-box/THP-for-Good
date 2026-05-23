'use client';

import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import { UI_COPY } from '@/lib/ui-copy';
import type { TagRow } from '@/lib/db';

type Props = {
  tags: TagRow[];
  selected: string;
  onSelect: (tag: string) => void;
};

export function SkillFilter({ tags, selected, onSelect }: Props) {
  return (
    <ScrollArea className="w-full whitespace-nowrap">
      <ToggleGroup
        value={selected ? [selected] : ['']}
        onValueChange={(values) => {
          const v = values[values.length - 1] ?? '';
          onSelect(v === '' ? '' : v);
        }}
        className="inline-flex w-max min-h-11 gap-2 pb-1"
      >
        <ToggleGroupItem value="" className="min-h-11 shrink-0 rounded-full px-4">
          {UI_COPY.home.filterAll}
        </ToggleGroupItem>
        {tags.map((tag) => (
          <ToggleGroupItem
            key={tag.id}
            value={tag.label}
            className="min-h-11 shrink-0 rounded-full px-4"
          >
            {tag.label}
          </ToggleGroupItem>
        ))}
      </ToggleGroup>
      <ScrollBar orientation="horizontal" />
    </ScrollArea>
  );
}
