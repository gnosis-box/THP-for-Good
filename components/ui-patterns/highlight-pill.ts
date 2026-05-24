import { cn } from '@/lib/utils';

const FILTER_CHIP_BASE =
  'inline-flex min-h-9 shrink-0 items-center rounded-md px-3 py-1.5 text-sm font-semibold leading-snug transition-all duration-[var(--motion-fast)] active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring';

/** Violet splash + orange text — shared by price, skills, languages on cards. */
export function highlightPillClass(className?: string) {
  return cn(
    'inline-flex shrink-0 items-center rounded-md px-2 py-0.5 font-semibold leading-snug',
    'bg-linear-to-br from-primary/25 via-primary/15 to-primary/5 text-accent',
    'ring-1 ring-primary/30 shadow-[0_1px_8px_oklch(0.52_0.28_285/20%)]',
    className,
  );
}

/** Filter chips: highlight when idle, solid primary when selected (inverted). */
export function filterChipClass(selected: boolean, className?: string) {
  return cn(
    FILTER_CHIP_BASE,
    selected
      ? 'bg-primary text-primary-foreground ring-1 ring-primary/50 shadow-[0_1px_8px_oklch(0.52_0.28_285/25%)]'
      : cn(
          'bg-linear-to-br from-primary/25 via-primary/15 to-primary/5 text-accent',
          'ring-1 ring-primary/30 shadow-[0_1px_8px_oklch(0.52_0.28_285/20%)]',
          'hover:from-primary/32 hover:via-primary/20',
        ),
    className,
  );
}
