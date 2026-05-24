'use client';

import { useState } from 'react';
import { Globe } from 'lucide-react';
import { highlightPillClass } from '@/components/ui-patterns/highlight-pill';
import { formatSessionLanguages } from '@/lib/languages';
import { cn } from '@/lib/utils';

type SkillTagsProps = {
  skills: string[];
  className?: string;
  maxVisible?: number;
};

export function ExpertSkillTags({ skills, className, maxVisible }: SkillTagsProps) {
  const [expanded, setExpanded] = useState(false);

  if (skills.length === 0) return null;

  const hasCap = maxVisible != null && maxVisible >= 0 && skills.length > maxVisible;
  const visibleSkills =
    hasCap && !expanded ? skills.slice(0, maxVisible) : skills;
  const hiddenCount = hasCap && !expanded ? skills.length - maxVisible! : 0;
  const hiddenSkills = hasCap && !expanded ? skills.slice(maxVisible!) : [];

  return (
    <div className={cn('flex flex-wrap items-center gap-1.5', className)} aria-label="Expertise">
      {visibleSkills.map((skill) => (
        <span key={skill} className={highlightPillClass('skill', 'text-xs')}>
          {skill}
        </span>
      ))}
      {hiddenCount > 0 ? (
        <button
          type="button"
          onClick={(event) => {
            event.preventDefault();
            event.stopPropagation();
            setExpanded((open) => !open);
          }}
          className={cn(
            highlightPillClass('skill', 'text-xs'),
            'cursor-pointer touch-manipulation hover:opacity-90',
          )}
          aria-expanded={expanded}
          aria-label={
            expanded
              ? 'Collapse skills'
              : `Show ${hiddenCount} more skills: ${hiddenSkills.join(', ')}`
          }
        >
          {expanded ? '−' : `+${hiddenCount}`}
          <span aria-hidden className="ml-0.5 text-[10px] opacity-80">
            {expanded ? '▴' : '▾'}
          </span>
        </button>
      ) : null}
    </div>
  );
}

type SplitShareProps = {
  expertPercent: number;
  className?: string;
  /** Card footer: flush bottom, full bleed. Inline: rounded standalone bar. */
  variant?: 'footer' | 'inline';
};

const MIN_TREASURY_LABEL_PERCENT = 14;
/** Minimum width so "10% expert" stays readable on narrow cards. */
const EXPERT_LABEL_MIN_WIDTH = '4.875rem';

export function ExpertSplitShare({
  expertPercent,
  className,
  variant = 'inline',
}: SplitShareProps) {
  const clampedExpert = Math.max(0, Math.min(100, expertPercent));
  const treasuryPercent = 100 - clampedExpert;
  const isFooter = variant === 'footer';

  return (
    <div
      className={cn(
        'relative flex w-full overflow-hidden',
        isFooter ? 'h-7 shrink-0 rounded-b-xl border-t border-border/60' : 'h-7 rounded-lg',
        className,
      )}
      role="img"
      aria-label={`${treasuryPercent}% to THP for Good, ${clampedExpert}% to expert`}
    >
      {treasuryPercent > 0 ? (
        <div
          className="relative flex h-full min-w-0 flex-1 items-center bg-primary px-2 sm:px-2.5"
        >
          {treasuryPercent >= MIN_TREASURY_LABEL_PERCENT ? (
            <span className="relative z-[1] truncate text-[11px] font-semibold tracking-tight text-primary-foreground sm:text-xs">
              {treasuryPercent}% THP for Good
            </span>
          ) : null}
        </div>
      ) : null}

      {clampedExpert > 0 ? (
        <div
          className={cn(
            'relative flex h-full shrink-0 items-center justify-end border-white/25 bg-accent px-2 shadow-[inset_1px_0_0_oklch(0_0_0/15%)] sm:px-2.5',
            treasuryPercent > 0 && 'border-l',
            treasuryPercent === 0 && 'w-full',
          )}
          style={
            treasuryPercent > 0
              ? { flex: `0 0 max(${clampedExpert}%, ${EXPERT_LABEL_MIN_WIDTH})` }
              : undefined
          }
        >
          <span className="relative z-[1] whitespace-nowrap text-[11px] font-semibold tracking-tight text-accent-foreground sm:text-xs">
            {clampedExpert}% expert
          </span>
        </div>
      ) : null}

      <div
        className="pointer-events-none absolute inset-0 z-[3] bg-linear-to-b from-white/25 via-white/5 to-black/15"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute inset-x-0 top-0 z-[3] h-px bg-white/35"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute inset-0 z-[3] bg-linear-to-r from-transparent via-white/8 to-transparent opacity-80"
        aria-hidden
      />
    </div>
  );
}

type LanguageTagsProps = {
  languages: string[];
  className?: string;
  /** card: globe + "English · French"; prose: "Sessions in English, French" */
  variant?: 'card' | 'prose';
  prefix?: string;
  maxVisible?: number;
};

export function ExpertLanguageTags({
  languages,
  className,
  variant = 'prose',
  prefix = 'Sessions in',
  maxVisible,
}: LanguageTagsProps) {
  const [expanded, setExpanded] = useState(false);

  if (languages.length === 0) return null;

  const fullLabel = formatSessionLanguages(languages, 'full');
  const hasCap = maxVisible != null && maxVisible >= 0 && languages.length > maxVisible;
  const visibleCodes =
    hasCap && !expanded ? languages.slice(0, maxVisible) : languages;
  const hiddenCount = hasCap && !expanded ? languages.length - maxVisible! : 0;
  const displayText =
    variant === 'card'
      ? formatSessionLanguages(visibleCodes, 'card')
      : `${prefix} ${formatSessionLanguages(visibleCodes, 'full')}`;

  const rowClass =
    variant === 'card'
      ? 'text-xs text-muted-foreground sm:text-sm'
      : 'text-sm text-muted-foreground';

  const ariaLabel =
    variant === 'prose' ? `${prefix} ${fullLabel}` : `Session languages: ${fullLabel}`;

  return (
    <p
      className={cn('flex min-w-0 items-center gap-1.5', rowClass, className)}
      aria-label={ariaLabel}
    >
      <Globe className="size-3.5 shrink-0 opacity-80 sm:size-4" aria-hidden />
      <span className="min-w-0 truncate">{displayText}</span>
      {hiddenCount > 0 ? (
        <button
          type="button"
          onClick={(event) => {
            event.preventDefault();
            event.stopPropagation();
            setExpanded((open) => !open);
          }}
          className="shrink-0 text-xs font-medium text-foreground underline-offset-2 hover:underline touch-manipulation"
          aria-expanded={expanded}
          aria-label={expanded ? 'Collapse languages' : `Show ${hiddenCount} more languages`}
        >
          {expanded ? 'Less' : `+${hiddenCount}`}
        </button>
      ) : null}
    </p>
  );
}
