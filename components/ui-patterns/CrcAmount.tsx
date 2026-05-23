import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

type Props = {
  amount: number | string;
  suffix?: string;
  className?: string;
  variant?: 'default' | 'badge';
};

export function CrcAmount({ amount, suffix = 'CRC', className, variant = 'default' }: Props) {
  const text = (
    <span className={cn('tabular-nums font-medium', className)}>
      {amount} {suffix}
    </span>
  );

  if (variant === 'badge') {
    return (
      <Badge variant="secondary" className="tabular-nums font-semibold">
        {amount} {suffix}
      </Badge>
    );
  }

  return text;
}
