'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { tagChipClass } from '@/components/ui-patterns/highlight-pill';
import { cn } from '@/lib/utils';
import type { TagRow } from '@/lib/db';

type Props = {
  tags: TagRow[];
  selected: string[];
  onSelectedChange: (skills: string[]) => void;
  loading?: boolean;
  size?: 'sm' | 'md';
  label?: string;
  required?: boolean;
  helperText?: string;
  newSkill: string;
  onNewSkillChange: (value: string) => void;
  onAddNewSkill: () => void;
};

const sizeClasses = {
  sm: {
    pill: 'min-h-8 rounded-full px-2.5 py-0.5 text-xs',
    input: 'h-8 text-xs',
    addButton: 'h-8 text-xs',
  },
  md: {
    pill: 'min-h-11 rounded-full px-4 text-sm',
    input: 'h-11 text-sm',
    addButton: 'h-11 text-sm',
  },
} as const;

export function SkillTagPicker({
  tags,
  selected,
  onSelectedChange,
  loading = false,
  size = 'md',
  label = 'Skills',
  required = false,
  helperText = 'Select the skills that match your expertise.',
  newSkill,
  onNewSkillChange,
  onAddNewSkill,
}: Props) {
  const styles = sizeClasses[size];

  function toggleSkill(skill: string) {
    onSelectedChange(
      selected.includes(skill) ? selected.filter((s) => s !== skill) : [...selected, skill],
    );
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter') {
      e.preventDefault();
      onAddNewSkill();
    }
  }

  return (
    <div className="flex flex-col gap-1.5">
      <span className={cn('font-medium', size === 'sm' ? 'text-xs' : 'text-sm')}>
        {label}
        {required ? <span className="text-destructive"> *</span> : null}
      </span>
      {helperText ? (
        <p className="text-xs text-muted-foreground">{helperText}</p>
      ) : null}
      {loading ? (
        <p className="text-xs text-muted-foreground">Loading skills…</p>
      ) : (
        <>
          <div className="flex flex-wrap gap-2" role="group" aria-label={label}>
            {tags.map((tag) => {
              const active = selected.includes(tag.label);
              return (
                <button
                  key={tag.id}
                  type="button"
                  aria-pressed={active}
                  onClick={() => toggleSkill(tag.label)}
                  className={cn(styles.pill, tagChipClass(active))}
                >
                  {tag.label}
                  {tag.status === 'pending' ? (
                    <span className="ml-1 text-[10px] opacity-70">(pending)</span>
                  ) : null}
                </button>
              );
            })}
          </div>
          {selected.length > 0 ? (
            <p className="text-xs text-muted-foreground">
              {selected.length} skill{selected.length === 1 ? '' : 's'} selected
            </p>
          ) : null}
        </>
      )}
      <div className="flex gap-2">
        <Input
          type="text"
          value={newSkill}
          onChange={(e) => onNewSkillChange(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Add a skill…"
          className={cn('flex-1', styles.input)}
        />
        <Button
          type="button"
          variant="outline"
          onClick={onAddNewSkill}
          disabled={!newSkill.trim()}
          className={cn('shrink-0', styles.addButton)}
        >
          Add
        </Button>
      </div>
    </div>
  );
}

export function mergeSkillTag(
  tags: TagRow[],
  label: string,
  status: TagRow['status'] = 'approved',
): TagRow[] {
  if (tags.some((t) => t.label.toLowerCase() === label.toLowerCase())) {
    return tags;
  }
  return [...tags, { id: -(tags.length + 1), label, status }];
}
