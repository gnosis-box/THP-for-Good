'use client';

import { X } from 'lucide-react';

import { filterChipClass } from '@/components/ui-patterns/highlight-pill';
import { languageLabel } from '@/lib/languages';
import { UI_COPY } from '@/lib/ui-copy';
import type { ExpertFilterState } from '@/lib/expert-filters';
import { cn } from '@/lib/utils';

type Props = {
  filters: ExpertFilterState;
  onRemoveSkill: (skill: string) => void;
  onRemoveLanguage: (code: string) => void;
  onClearAll: () => void;
  className?: string;
};

export function ActiveFilterChips({
  filters,
  onRemoveSkill,
  onRemoveLanguage,
  onClearAll,
  className,
}: Props) {
  const skills = filters.skills ?? [];
  const languages = filters.languages ?? [];
  const hasAny = skills.length > 0 || languages.length > 0;

  if (!hasAny) return null;

  return (
    <div className={cn('flex flex-wrap items-center gap-2', className)}>
      <span className="text-xs font-medium text-muted-foreground">
        {UI_COPY.home.activeFiltersLabel}
      </span>
      {skills.map((skill) => (
        <button
          key={`skill-${skill}`}
          type="button"
          onClick={() => onRemoveSkill(skill)}
          className={filterChipClass(true, 'gap-1 pr-1.5')}
          aria-label={`Remove ${skill} filter`}
        >
          {skill}
          <X className="size-3" aria-hidden />
        </button>
      ))}
      {languages.map((code) => (
        <button
          key={`lang-${code}`}
          type="button"
          onClick={() => onRemoveLanguage(code)}
          className={filterChipClass(true, 'gap-1 pr-1.5')}
          aria-label={`Remove ${languageLabel(code)} filter`}
        >
          {languageLabel(code)}
          <X className="size-3" aria-hidden />
        </button>
      ))}
      <button
        type="button"
        onClick={onClearAll}
        className="text-xs font-medium text-muted-foreground underline-offset-2 hover:text-foreground hover:underline"
      >
        {UI_COPY.home.clearAllFilters}
      </button>
    </div>
  );
}
