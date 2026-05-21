'use client';

import { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';

type SlotPickerProps = {
  mentorId: number;
  onSelect: (slot: string | null) => void;
  selected: string | null;
};

type DayGroup = { label: string; slots: string[] };

function formatTime(iso: string): string {
  return new Intl.DateTimeFormat(undefined, { hour: '2-digit', minute: '2-digit' }).format(new Date(iso));
}

function groupByDay(slots: string[]): DayGroup[] {
  const map = new Map<string, string[]>();
  for (const iso of slots) {
    const dayKey = new Intl.DateTimeFormat(undefined, {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
    }).format(new Date(iso));
    if (!map.has(dayKey)) map.set(dayKey, []);
    map.get(dayKey)!.push(iso);
  }
  return Array.from(map.entries()).map(([label, s]) => ({ label, slots: s }));
}

export function SlotPicker({ mentorId, onSelect, selected }: SlotPickerProps) {
  const [slots, setSlots] = useState<string[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setSlots(null);
    setError(null);
    fetch(`/api/mentors/${mentorId}/availability`)
      .then((r) => r.json())
      .then((data: unknown) => {
        if (cancelled) return;
        if (Array.isArray(data)) {
          setSlots(data as string[]);
        } else {
          setError('Calendar unavailable');
        }
      })
      .catch(() => {
        if (!cancelled) setError('Could not load availability');
      });
    return () => { cancelled = true; };
  }, [mentorId]);

  if (slots === null && !error) {
    return <p className="text-sm text-muted-foreground">Loading availability…</p>;
  }

  if (error) {
    return <p className="text-sm text-destructive">{error}</p>;
  }

  if (slots!.length === 0) {
    return <p className="text-sm text-muted-foreground">No available slots in the next 14 days.</p>;
  }

  const groups = groupByDay(slots!);

  return (
    <div className="flex flex-col gap-4">
      <p className="text-sm font-medium">Select a slot</p>
      {groups.map(({ label, slots: daySlots }) => (
        <div key={label} className="flex flex-col gap-2">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">{label}</p>
          <div className="flex flex-wrap gap-2">
            {daySlots.map((iso) => {
              const isSelected = selected === iso;
              return (
                <button
                  key={iso}
                  type="button"
                  onClick={() => onSelect(isSelected ? null : iso)}
                  aria-pressed={isSelected}
                  className={cn(
                    'rounded-lg border px-3 py-1.5 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
                    isSelected
                      ? 'border-primary bg-primary text-primary-foreground'
                      : 'border-border bg-background hover:bg-muted',
                  )}
                >
                  {formatTime(iso)}
                </button>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}
