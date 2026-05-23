'use client';

import { useEffect, useState } from 'react';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Empty, EmptyDescription, EmptyHeader, EmptyTitle } from '@/components/ui/empty';
import { Spinner } from '@/components/ui/spinner';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { StatusAlert } from '@/components/ui-patterns/StatusAlert';

type SlotPickerProps = {
  mentorId: number;
  selected: string | null;
  onSelect: (slot: string | null) => void;
};

type DayGroup = { label: string; slots: string[] };

function fmtTime(iso: string) {
  return new Intl.DateTimeFormat(undefined, { hour: '2-digit', minute: '2-digit' }).format(
    new Date(iso),
  );
}

function fmtDay(iso: string) {
  return new Intl.DateTimeFormat(undefined, {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  }).format(new Date(iso));
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
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setSlots(null);
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setError(null);
    fetch(`/api/mentors/${mentorId}/availability`)
      .then((r) => r.json())
      .then((data: unknown) => {
        if (cancelled) return;
        if (Array.isArray(data)) setSlots(data as string[]);
        else setError('Calendar unavailable');
      })
      .catch(() => {
        if (!cancelled) setError('Could not load availability');
      });
    return () => {
      cancelled = true;
    };
  }, [mentorId]);

  if (error) {
    return <StatusAlert variant="error" title="Availability error" description={error} />;
  }

  if (slots === null) {
    return (
      <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
        <Spinner className="size-4" />
        Loading availability…
      </div>
    );
  }

  if (slots.length === 0) {
    return (
      <Empty>
        <EmptyHeader>
          <EmptyTitle>No slots</EmptyTitle>
          <EmptyDescription>No available slots in the next 14 days.</EmptyDescription>
        </EmptyHeader>
      </Empty>
    );
  }

  const groups = groupByDay(slots);

  return (
    <div className="flex w-full flex-col items-center gap-4">
      <p className="text-sm font-medium text-center">Select a slot</p>
      <div className="flex w-full max-w-md flex-col gap-3">
        {groups.map(({ label, slots: daySlots }) => (
          <Card key={label} size="sm" className="w-full gap-3 py-3">
            <CardHeader className="items-center px-4 pb-0 text-center">
              <CardTitle className="text-xs font-semibold uppercase tracking-wide text-chart-2">
                {label}
              </CardTitle>
            </CardHeader>
            <CardContent className="px-4 pt-0">
              <ToggleGroup
                value={selected && daySlots.includes(selected) ? [selected] : []}
                onValueChange={(values) => {
                  const iso = values[values.length - 1];
                  if (!iso) onSelect(null);
                  else onSelect(iso === selected ? null : iso);
                }}
                className="flex flex-wrap justify-center gap-2"
              >
                {daySlots.map((iso) => (
                  <ToggleGroupItem
                    key={iso}
                    value={iso}
                    className="min-h-11 rounded-lg border border-border bg-card px-4 hover:bg-muted data-pressed:border-primary data-pressed:bg-primary data-pressed:text-primary-foreground"
                    aria-label={fmtTime(iso)}
                  >
                    {fmtTime(iso)}
                  </ToggleGroupItem>
                ))}
              </ToggleGroup>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
