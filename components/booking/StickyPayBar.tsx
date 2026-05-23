'use client';

import { Button } from '@/components/ui/button';
import { CrcAmount } from '@/components/ui-patterns/CrcAmount';
import { UI_COPY } from '@/lib/ui-copy';

type Props = {
  priceCrc: number;
  hasSlot: boolean;
  onReview: () => void;
};

export function StickyPayBar({ priceCrc, hasSlot, onReview }: Props) {
  if (!hasSlot) return null;

  return (
    <div className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-background/95 p-4 pb-[max(1rem,env(safe-area-inset-bottom))] backdrop-blur-sm md:hidden">
      <div className="mx-auto flex max-w-lg items-center justify-between gap-3 md:max-w-2xl">
        <div className="flex flex-col gap-0.5">
          <span className="text-xs text-muted-foreground">{UI_COPY.booking.bookSession}</span>
          <CrcAmount amount={priceCrc} className="text-base" />
        </div>
        <Button
          type="button"
          size="lg"
          onClick={onReview}
          className="min-h-11 max-w-[55%] shrink px-3 text-sm sm:max-w-none sm:px-4 sm:text-base"
        >
          {UI_COPY.booking.reviewAndPay}
        </Button>
      </div>
    </div>
  );
}
