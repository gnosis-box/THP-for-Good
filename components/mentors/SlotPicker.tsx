'use client';

import { cn } from '@/lib/utils';

type SlotPickerProps = {
  slots: { id: string; label: string; available: boolean }[];
  bookedSlotIds: Set<string>;
  selectedSlotId: string | null;
  onSelect: (slotId: string) => void;
};

export function SlotPicker({
  slots,
  bookedSlotIds,
  selectedSlotId,
  onSelect,
}: SlotPickerProps) {
  return (
    <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
      {slots.map((slot) => {
        const isBooked = bookedSlotIds.has(slot.id) || !slot.available;
        const isSelected = selectedSlotId === slot.id;

        return (
          <button
            key={slot.id}
            type="button"
            disabled={isBooked}
            onClick={() => onSelect(slot.id)}
            className={cn(
              'rounded-md border px-2 py-2 text-xs font-medium transition-colors sm:text-sm',
              isBooked && 'cursor-not-allowed opacity-40',
              isSelected
                ? 'border-primary bg-primary text-primary-foreground'
                : 'border-border bg-background hover:bg-accent',
            )}
          >
            {slot.label}
          </button>
        );
      })}
    </div>
  );
}
