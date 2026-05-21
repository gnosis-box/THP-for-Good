"use client";

import type { TimeSlot } from "@/lib/mentors";
import { cn } from "@/lib/utils";

export function SlotGrid({
  slots,
  selectedId,
  onSelect,
}: {
  slots: TimeSlot[];
  selectedId: string | null;
  onSelect: (slot: TimeSlot) => void;
}) {
  return (
    <div className="grid grid-cols-3 gap-2">
      {slots.map((slot) => {
        const selected = selectedId === slot.id;
        return (
          <button
            key={slot.id}
            type="button"
            onClick={() => onSelect(slot)}
            aria-pressed={selected}
            aria-label={slot.label}
            className={cn(
              "flex min-h-16 flex-col items-center justify-center rounded-lg border px-1 py-2 text-center text-[10px] leading-tight font-medium whitespace-pre-line transition-colors",
              selected
                ? "border-primary bg-primary/10 text-primary ring-1 ring-primary"
                : "border-border bg-card text-muted-foreground hover:border-primary/40 hover:bg-primary/5",
            )}
          >
            {slot.shortLabel}
          </button>
        );
      })}
    </div>
  );
}
