import type { ReactNode } from 'react';
import { ExternalLink } from 'lucide-react';

import { buttonVariants } from '@/components/ui/button';
import { cn } from '@/lib/utils';

/** Bordered KPI / treasury / analytics card — title and stats centered. */
export function MetricsPanel({
  className,
  muted,
  children,
  ...props
}: React.ComponentProps<'section'> & { muted?: boolean }) {
  return (
    <section
      className={cn(
        'flex flex-col gap-4 rounded-xl border border-border p-4 sm:p-5',
        muted && 'bg-muted/30',
        className,
      )}
      {...props}
    >
      {children}
    </section>
  );
}

export function MetricsPanelTitle({
  className,
  children,
  ...props
}: React.ComponentProps<'h2'>) {
  return (
    <h2 className={cn('text-center text-base font-semibold', className)} {...props}>
      {children}
    </h2>
  );
}

export function MetricsPanelDescription({
  className,
  children,
  ...props
}: React.ComponentProps<'p'>) {
  return (
    <p className={cn('text-center text-xs text-muted-foreground', className)} {...props}>
      {children}
    </p>
  );
}

export function MetricsPanelMono({
  className,
  children,
  ...props
}: React.ComponentProps<'p'>) {
  return (
    <p
      className={cn('break-all text-center text-xs font-mono text-muted-foreground', className)}
      {...props}
    >
      {children}
    </p>
  );
}

/** Primary metric — label above, large value below (treasury balance, expert CRC). */
export function MetricsHero({
  label,
  value,
  className,
}: {
  label: string;
  value: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn('flex flex-col items-center gap-1 text-center', className)}>
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="text-2xl font-semibold tabular-nums">{value}</p>
    </div>
  );
}

/** Grid KPI cell — label above, value below. */
export function StatCell({
  label,
  value,
  className,
  compact,
}: {
  label: string;
  value: ReactNode;
  className?: string;
  compact?: boolean;
}) {
  return (
    <div
      className={cn(
        'flex flex-col items-center text-center',
        compact ? 'min-w-[4.25rem] flex-[1_1_4.25rem] gap-0.5' : 'gap-1',
        className,
      )}
    >
      <p className={cn('text-muted-foreground', compact ? 'text-[11px] leading-tight' : 'text-xs')}>
        {label}
      </p>
      <p className={cn('font-semibold tabular-nums', compact ? 'text-base' : 'text-lg')}>{value}</p>
    </div>
  );
}

const STAT_GRID_COLUMNS = {
  2: 'grid-cols-2',
  3: 'grid-cols-2 sm:grid-cols-3',
  4: 'grid-cols-2 sm:grid-cols-4',
  5: 'grid-cols-2 sm:grid-cols-5',
} as const;

export function StatGrid({
  columns = 4,
  className,
  children,
}: {
  columns?: keyof typeof STAT_GRID_COLUMNS;
  className?: string;
  children: ReactNode;
}) {
  return (
    <div className={cn('grid gap-4', STAT_GRID_COLUMNS[columns], className)}>{children}</div>
  );
}

/** Flex-wrap KPI row — keeps more metrics on one line on narrow viewports. */
export function StatFlexGrid({ className, children }: { className?: string; children: ReactNode }) {
  return (
    <div
      className={cn(
        'flex flex-wrap justify-center gap-x-1.5 gap-y-2 sm:gap-x-2 sm:gap-y-2.5',
        className,
      )}
    >
      {children}
    </div>
  );
}

export function MetricsActions({
  className,
  children,
}: {
  className?: string;
  children: ReactNode;
}) {
  return (
    <div className={cn('flex flex-wrap justify-center gap-2', className)}>{children}</div>
  );
}

export function MetricsExternalLink({
  href,
  children,
  fullWidth,
  className,
}: {
  href: string;
  children: ReactNode;
  fullWidth?: boolean;
  className?: string;
}) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className={cn(
        buttonVariants({ variant: 'outline', size: 'sm' }),
        'inline-flex min-h-9 items-center justify-center gap-1.5',
        fullWidth && 'w-full',
        className,
      )}
    >
      {children}
      <ExternalLink className="size-3.5 shrink-0 opacity-70" aria-hidden />
    </a>
  );
}
