'use client';

import { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';

type SlotPickerProps = {
  mentorId: number;
  selected: string | null;
  onSelect: (slot: string | null) => void;
};

type DayGroup = { label: string; slots: string[] };

function fmtTime(iso: string) {
  return new Intl.DateTimeFormat(undefined, { hour: '2-digit', minute: '2-digit' }).format(new Date(iso));
}

function fmtDay(iso: string) {
  return new Intl.DateTimeFormat(undefined, { weekday: 'short', month: 'short', day: 'numeric' }).format(new Date(iso));
}

function groupByDay(slots: string[]): DayGroup[] {
  const map = new Map<string, string[]>();
  for (const iso of slots) {
    const key = fmtDay(iso);
    if (!map.has(key)) map.set(key, []);
    map.get(key)!.push(iso);
  }
  return Array.from(map.entries()).map(([label, s]) => ({ label, slots: s }));
}

export function SlotPicker({ mentorId, selected, onSelect }: SlotPickerProps) {
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
        if (Array.isArray(data)) setSlots(data as string[]);
        else setError('Calendar unavailable');
      })
      .catch(() => { if (!cancelled) setError('Could not load availability'); });
    return () => { cancelled = true; };
  }, [mentorId]);

  if (error) return <p className="text-sm text-destructive">{error}</p>;

  if (slots === null) return <p className="text-sm text-muted-foreground">Loading availability…</p>;

  if (slots.length === 0) {
    return <p className="text-sm text-muted-foreground">No available slots in the next 14 days.</p>;
  }

  const groups = groupByDay(slots);

  return (
    <div className="flex flex-col gap-5">
      <p className="text-sm font-medium">Select a slot</p>
      {groups.map(({ label, slots: daySlots }) => (
        <div key={label} className="flex flex-col gap-2">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{label}</p>
          <div className="flex flex-wrap gap-2">
            {daySlots.map((iso) => {
              const active = selected === iso;
              return (
                <button
                  key={iso}
                  type="button"
                  onClick={() => onSelect(active ? null : iso)}
                  aria-pressed={active}
                  className={cn(
                    'rounded-lg border px-3 py-1.5 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
                    active
                      ? 'border-primary bg-primary text-primary-foreground'
                      : 'border-border bg-background hover:bg-muted',
                  )}
                >
                  {fmtTime(iso)}
                </button>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}
