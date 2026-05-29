import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import type { ExpertTrustStatsState } from '@/hooks/use-expert-trust-stats';

type Props = {
  trustStats: ExpertTrustStatsState;
  className?: string;
};

/** "Trusted by N" with loading skeleton; hidden on fetch error. */
export function TrustedByCount({ trustStats, className }: Props) {
  if (trustStats.status === 'error') return null;

  if (trustStats.status === 'loading') {
    return (
      <Skeleton
        aria-hidden
        className={cn('h-3 w-16 shrink-0 rounded-sm', className)}
      />
    );
  }

  return (
    <span
      className={cn(
        'shrink-0 whitespace-nowrap text-right text-[10px] text-subtle-foreground sm:text-xs',
        className,
      )}
    >
      Trusted by {trustStats.trustedByCount}
    </span>
  );
}
