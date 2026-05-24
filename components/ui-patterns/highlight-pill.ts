import { cn } from '@/lib/utils';

const FILTER_CHIP_BASE =
  'inline-flex min-h-9 shrink-0 items-center rounded-md px-3 py-1.5 text-sm font-semibold leading-snug transition-all duration-[var(--motion-fast)] active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring';

export type PillRole = 'price' | 'skill' | 'language';

/** Role-based highlight pills — price (amber), skill (neutral), language (muted secondary). */
export function highlightPillClass(role: PillRole, className?: string) {
  if (role === 'price') {
    return cn(
      'inline-flex shrink-0 items-center rounded-md px-2 py-0.5 font-semibold leading-snug tabular-nums',
      'bg-[var(--pill-price-bg)] text-[var(--pill-price-text)] ring-1 ring-accent/25',
      className,
    );
  }

  if (role === 'language') {
    return cn(
      'inline-flex shrink-0 items-center rounded-md border px-2 py-0.5 font-medium leading-snug',
      'border-[var(--pill-language-border)] bg-[var(--pill-language-bg)] text-[var(--pill-language-text)]',
      className,
    );
  }

  return cn(
    'inline-flex shrink-0 items-center rounded-md border px-2 py-0.5 font-semibold leading-snug',
    'border-[var(--pill-skill-border)] bg-[var(--pill-skill-bg)] text-[var(--pill-skill-text)]',
    className,
  );
}

/** Filter chips: neutral idle, primary when selected. */
export function filterChipClass(selected: boolean, className?: string) {
  return cn(
    FILTER_CHIP_BASE,
    selected
      ? 'bg-primary text-primary-foreground ring-1 ring-primary/50'
      : cn(
          'border border-border bg-transparent text-muted-foreground',
          'hover:bg-muted hover:text-foreground',
        ),
    className,
  );
}

/** Tag picker chips in forms — neutral idle, primary when selected. */
export function tagChipClass(selected: boolean, className?: string) {
  return cn(
    'inline-flex min-h-9 shrink-0 items-center rounded-md px-3 py-1.5 text-sm font-medium transition-colors',
    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
    selected
      ? 'bg-primary text-primary-foreground'
      : cn(
          'border border-border bg-[var(--pill-skill-bg)] text-[var(--pill-skill-text)]',
          'hover:bg-muted',
        ),
    className,
  );
}
