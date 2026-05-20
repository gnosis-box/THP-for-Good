'use client';

import { cn } from '@/lib/utils';

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'] as const;
const TIMES = ['09:00', '11:00', '14:00', '16:00'] as const;

type SlotPickerProps = {
  onSelect: (slot: string) => void;
  selected: string | null;
};

export function SlotPicker({ onSelect, selected }: SlotPickerProps) {
  return (
    <div className="flex flex-col gap-3">
      <p className="text-sm font-medium">Select your slot</p>
      <div className="overflow-x-auto">
        <div className="min-w-[360px]">
          {/* Header row */}
          <div className="grid grid-cols-6 gap-1.5 mb-1.5">
            <div /> {/* empty corner */}
            {DAYS.map((day) => (
              <div
                key={day}
                className="text-center text-xs font-medium text-muted-foreground py-1"
              >
                {day}
              </div>
            ))}
          </div>
          {/* Time rows */}
          {TIMES.map((time) => (
            <div key={time} className="grid grid-cols-6 gap-1.5 mb-1.5">
              <div className="flex items-center justify-end pr-2 text-xs text-muted-foreground whitespace-nowrap">
                {time}
              </div>
              {DAYS.map((day) => {
                const slot = `${day} ${time}`;
                const isSelected = selected === slot;
                return (
                  <button
                    key={slot}
                    type="button"
                    onClick={() => onSelect(slot)}
                    className={cn(
                      'rounded-md border py-2 text-xs font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
                      isSelected
                        ? 'border-primary bg-primary text-primary-foreground'
                        : 'border-border bg-background hover:bg-muted text-foreground'
                    )}
                    aria-pressed={isSelected}
                    aria-label={slot}
                  >
                    {isSelected ? '✓' : ''}
                  </button>
                );
              })}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
