import { Check } from 'lucide-react';

import { cn } from '@/lib/utils';
import { UI_COPY } from '@/lib/ui-copy';

const STEPS = [
  UI_COPY.booking.stepTime,
  UI_COPY.booking.stepDetails,
  UI_COPY.booking.stepPay,
] as const;

type Props = {
  hasSlot: boolean;
  hasEmail: boolean;
};

function stepIndex(hasSlot: boolean, hasEmail: boolean): number {
  if (!hasSlot) return 0;
  if (!hasEmail) return 1;
  return 2;
}

export function BookingStepper({ hasSlot, hasEmail }: Props) {
  const current = stepIndex(hasSlot, hasEmail);

  return (
    <ol className="flex items-center gap-2" aria-label="Booking progress">
      {STEPS.map((label, i) => {
        const done = i < current;
        const active = i === current;
        return (
          <li key={label} className="flex flex-1 flex-col items-center gap-1.5">
            <div
              className={cn(
                'flex size-8 items-center justify-center rounded-full border text-xs font-semibold transition-colors',
                done && 'border-primary bg-primary text-primary-foreground',
                active && !done && 'border-primary text-primary',
                !done && !active && 'border-border text-muted-foreground',
              )}
              aria-current={active ? 'step' : undefined}
            >
              {done ? <Check className="size-4" aria-hidden /> : i + 1}
            </div>
            <span
              className={cn(
                'text-center text-[10px] font-medium leading-tight sm:text-xs',
                active ? 'text-foreground' : 'text-muted-foreground',
              )}
            >
              {label}
            </span>
          </li>
        );
      })}
    </ol>
  );
}
