'use client';

import { Slider } from '@/components/ui/slider';
import { IconTooltip } from '@/components/ui-patterns/IconTooltip';
import {
  EXPERT_SHARE_MAX,
  EXPERT_SHARE_MIN,
  EXPERT_SHARE_STEP,
  clampExpertShare,
  type ExpertSharePercent,
} from '@/lib/crc-pay';
import { UI_COPY } from '@/lib/ui-copy';
import { cn } from '@/lib/utils';

type Props = {
  value: ExpertSharePercent;
  onChange: (value: ExpertSharePercent) => void;
  className?: string;
};

export function ExpertShareSlider({ value, onChange, className }: Props) {
  const treasuryPercent = 100 - value;

  return (
    <IconTooltip
      content={UI_COPY.register.tooltipExpertShareSplit(value, treasuryPercent)}
      side="top"
      render={
        <div
          className={cn('flex w-full cursor-help flex-col gap-2', className)}
          tabIndex={0}
          role="group"
          aria-label="Expert payment share split"
        />
      }
    >
      <p className="text-sm font-medium tabular-nums">
        {value}% me · {treasuryPercent}% THP for Good
      </p>
      <Slider
        min={EXPERT_SHARE_MIN}
        max={EXPERT_SHARE_MAX}
        step={EXPERT_SHARE_STEP}
        value={value}
        onValueChange={(next) => {
          const nextValue = Array.isArray(next) ? next[0] : next;
          onChange(clampExpertShare(nextValue));
        }}
        aria-label="Expert payment share"
      />
      <div className="flex justify-between text-[11px] text-muted-foreground tabular-nums sm:text-xs">
        <span>{EXPERT_SHARE_MIN}% expert</span>
        <span>{EXPERT_SHARE_MAX}% expert</span>
      </div>
    </IconTooltip>
  );
}
