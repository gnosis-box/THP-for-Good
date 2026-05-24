import { highlightPillClass } from '@/components/ui-patterns/highlight-pill';
import { cn } from '@/lib/utils';

type SkillTagsProps = {
  skills: string[];
  className?: string;
};

export function ExpertSkillTags({ skills, className }: SkillTagsProps) {
  if (skills.length === 0) return null;

  return (
    <div className={cn('flex flex-wrap gap-1.5', className)} aria-label="Expertise">
      {skills.map((skill) => (
        <span key={skill} className={highlightPillClass('skill', 'text-xs')}>
          {skill}
        </span>
      ))}
    </div>
  );
}

type SplitShareProps = {
  expertPercent: number;
  className?: string;
  /** Card footer: flush bottom, full bleed. Inline: rounded standalone bar. */
  variant?: 'footer' | 'inline';
};

const MIN_LABEL_PERCENT = 14;

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
      aria-label={`${clampedExpert}% to expert, ${treasuryPercent}% to THP for Good`}
    >
      {clampedExpert > 0 ? (
        <div
          className="relative flex h-full min-w-0 items-center bg-primary px-2 sm:px-2.5"
          style={{ width: clampedExpert === 100 ? '100%' : `${clampedExpert}%` }}
        >
          {clampedExpert >= MIN_LABEL_PERCENT ? (
            <span className="relative z-[1] truncate text-[11px] font-semibold tracking-tight text-primary-foreground sm:text-xs">
              {clampedExpert}% expert
            </span>
          ) : null}
        </div>
      ) : null}

      {treasuryPercent > 0 ? (
        <div
          className={cn(
            'relative flex h-full min-w-0 items-center bg-accent px-2 sm:px-2.5',
            clampedExpert === 0 ? 'w-full justify-end' : 'flex-1 justify-end',
          )}
        >
          {treasuryPercent >= MIN_LABEL_PERCENT ? (
            <span className="relative z-[1] truncate text-[11px] font-semibold tracking-tight text-accent-foreground sm:text-xs">
              {treasuryPercent}% THP for Good
            </span>
          ) : null}
        </div>
      ) : null}

      {clampedExpert > 0 && treasuryPercent > 0 ? (
        <div
          className="pointer-events-none absolute top-0 bottom-0 z-[2] w-px bg-white/25 shadow-[1px_0_0_oklch(0_0_0/15%)]"
          style={{ left: `${clampedExpert}%` }}
          aria-hidden
        />
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
  prefix?: string;
};

export function ExpertLanguageTags({ languages, className, prefix = 'Calls' }: LanguageTagsProps) {
  if (languages.length === 0) return null;

  return (
    <div
      className={cn('flex flex-wrap items-center gap-1.5', className)}
      aria-label={`${prefix}: ${languages.map((c) => c.toUpperCase()).join(', ')}`}
    >
      {languages.map((code) => (
        <span key={code} className={highlightPillClass('skill', 'text-[11px] uppercase tracking-wide sm:text-xs')}>
          {code}
        </span>
      ))}
    </div>
  );
}
