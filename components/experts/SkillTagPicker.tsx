'use client';

import { useState } from 'react';

import {
  MultiSelectSearch,
  type MultiSelectOption,
} from '@/components/ui-patterns/multi-select-search';
import {
  findTagByLabelCaseInsensitive,
  isSkillSelectedCaseInsensitive,
  normalizeSkillLabel,
} from '@/lib/skill-tags';
import { cn } from '@/lib/utils';
import type { TagRow } from '@/lib/db';

type Props = {
  tags: TagRow[];
  setTags: React.Dispatch<React.SetStateAction<TagRow[]>>;
  selected: string[];
  onSelectedChange: (skills: string[]) => void;
  loading?: boolean;
  size?: 'sm' | 'md';
  label?: string;
  required?: boolean;
  helperText?: string;
  /** Register/edit → approved; admin promote → pending. */
  newTagStatus?: TagRow['status'];
};

const sizeClasses = {
  sm: { input: 'h-8 text-xs' },
  md: { input: 'h-11 text-sm' },
} as const;

export function SkillTagPicker({
  tags,
  setTags,
  selected,
  onSelectedChange,
  loading = false,
  size = 'md',
  label = 'Skills',
  required = false,
  helperText = 'Select the skills that match your expertise.',
  newTagStatus = 'approved',
}: Props) {
  const styles = sizeClasses[size];
  const [addMessage, setAddMessage] = useState<string | null>(null);

  const searchOptions: MultiSelectOption[] = tags.map((tag) => ({
    value: tag.label,
    label: tag.label,
    hint: tag.status === 'pending' ? '(pending)' : undefined,
  }));

  function addSkill(label: string): boolean {
    const trimmed = normalizeSkillLabel(label);
    if (!trimmed) return false;

    const existing = findTagByLabelCaseInsensitive(tags, trimmed);
    const canonical = existing?.label ?? trimmed;

    if (isSkillSelectedCaseInsensitive(selected, canonical)) {
      setAddMessage('This skill is already selected.');
      return false;
    }

    setTags((prev) => mergeSkillTag(prev, canonical, newTagStatus));
    onSelectedChange([...selected, canonical]);
    setAddMessage(null);
    return true;
  }

  function handleCreateSkill(raw: string): boolean {
    const trimmed = normalizeSkillLabel(raw);
    if (!trimmed) return false;

    const existing = findTagByLabelCaseInsensitive(tags, trimmed);
    if (existing) {
      return addSkill(existing.label);
    }

    return addSkill(trimmed);
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

      <MultiSelectSearch
        options={searchOptions}
        selectedValues={selected}
        onSelectedChange={onSelectedChange}
        placeholder="Search or add a skill…"
        ariaLabel={label}
        loading={loading}
        allowCreate
        getCreateLabel={(query) => `Add skill “${query}”`}
        onCreateValue={handleCreateSkill}
        emptyListMessage="All listed skills are selected."
        inputClassName={styles.input}
      />

      {addMessage ? <p className="text-xs text-destructive">{addMessage}</p> : null}
      {selected.length > 0 ? (
        <p className="text-xs text-muted-foreground">
          {selected.length} skill{selected.length === 1 ? '' : 's'} selected
        </p>
      ) : null}
    </div>
  );
}

export function mergeSkillTag(
  tags: TagRow[],
  label: string,
  status: TagRow['status'] = 'approved',
): TagRow[] {
  const trimmed = normalizeSkillLabel(label);
  if (!trimmed) return tags;
  if (tags.some((tag) => tag.label.toLowerCase() === trimmed.toLowerCase())) {
    return tags;
  }
  return [...tags, { id: -(tags.length + 1), label: trimmed, status }];
}

/**
 * @deprecated Prefer `SkillTagPicker` with internal add flow. Kept for legacy call sites.
 */
export function addExpertSkillDraft(
  tags: TagRow[],
  setTags: React.Dispatch<React.SetStateAction<TagRow[]>>,
  selected: string[],
  onSelectedChange: (skills: string[]) => void,
  label: string,
  status: TagRow['status'] = 'approved',
): boolean {
  const trimmed = normalizeSkillLabel(label);
  if (!trimmed) return false;
  if (isSkillSelectedCaseInsensitive(selected, trimmed)) return false;

  const existing = findTagByLabelCaseInsensitive(tags, trimmed);
  const resolved = existing?.label ?? trimmed;
  if (isSkillSelectedCaseInsensitive(selected, resolved)) return false;

  setTags((prev) => mergeSkillTag(prev, resolved, status));
  onSelectedChange([...selected, resolved]);
  return true;
}
