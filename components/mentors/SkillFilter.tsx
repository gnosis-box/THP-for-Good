'use client';

import { cn } from '@/lib/utils';
import type { TagRow } from '@/lib/db';

type Props = {
  tags: TagRow[];
  selected: string;
  onSelect: (tag: string) => void;
};

export function SkillFilter({ tags, selected, onSelect }: Props) {
  return (
    <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
      <PillButton active={selected === ''} onClick={() => onSelect('')}>
        All
      </PillButton>
      {tags.map((tag) => (
        <PillButton
          key={tag.id}
          active={selected === tag.label}
          onClick={() => onSelect(tag.label)}
        >
          {tag.label}
        </PillButton>
      ))}
    </div>
  );
}

function PillButton({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'shrink-0 rounded-full px-3 py-1 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
        active
          ? 'bg-primary text-primary-foreground'
          : 'border border-border bg-background text-foreground hover:bg-muted'
      )}
    >
      {children}
    </button>
  );
}
