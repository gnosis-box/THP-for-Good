import { Badge } from '@/components/ui/badge';
import { highlightPillClass } from '@/components/ui-patterns/highlight-pill';
import { cn } from '@/lib/utils';

type Props = {
  amount: number | string;
  suffix?: string;
  className?: string;
  variant?: 'default' | 'badge' | 'highlight';
};

export function CrcAmount({ amount, suffix = 'CRC', className, variant = 'default' }: Props) {
  if (variant === 'badge') {
    return (
      <Badge variant="secondary" className="tabular-nums font-semibold">
        {amount} {suffix}
      </Badge>
    );
  }

  if (variant === 'highlight') {
    return (
      <span className={highlightPillClass(cn('tabular-nums text-sm', className))}>
        {amount} {suffix}
      </span>
    );
  }

  return (
    <span className={cn('tabular-nums font-medium', className)}>
      {amount} {suffix}
    </span>
  );
}
