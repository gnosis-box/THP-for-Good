'use client';

import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Empty, EmptyDescription, EmptyHeader, EmptyTitle } from '@/components/ui/empty';
import { Skeleton } from '@/components/ui/skeleton';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { StatusAlert } from '@/components/ui-patterns/StatusAlert';
import { usePrefersReducedMotion } from '@/hooks/use-prefers-reduced-motion';

type SlotPickerProps = {
  expertId: number;
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

function SlotPickerSkeleton() {
  return (
    <div className="flex w-full flex-col items-center gap-4" aria-busy="true" aria-label="Loading availability">
      <Skeleton className="h-4 w-28" />
      <div className="flex w-full max-w-md flex-col gap-3">
        {[0, 1].map((day) => (
          <Card key={day} size="sm" className="w-full gap-3 py-3">
            <CardHeader className="items-center px-4 pb-0 text-center">
              <Skeleton className="h-3 w-24" />
            </CardHeader>
            <CardContent className="flex flex-wrap justify-center gap-2 px-4 pt-0">
              {[0, 1, 2, 3].map((pill) => (
                <Skeleton key={pill} className="h-11 w-20 shrink-0 rounded-lg" />
              ))}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

function SlotPickerContent({
  groups,
  selected,
  onSelect,
}: {
  groups: DayGroup[];
  selected: string | null;
  onSelect: (slot: string | null) => void;
}) {
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
                    className="h-11 w-20 shrink-0 justify-center rounded-lg bg-muted text-foreground transition-transform duration-[var(--motion-fast)] hover:bg-muted/80 data-pressed:scale-[1.02] data-pressed:bg-primary data-pressed:text-primary-foreground data-pressed:ring-2 data-pressed:ring-primary/60 data-pressed:motion-slot-selected"
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

export function SlotPicker({ expertId, selected, onSelect }: SlotPickerProps) {
  const reducedMotion = usePrefersReducedMotion();
  const [slots, setSlots] = useState<string[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setSlots(null);
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setError(null);
    fetch(`/api/experts/${expertId}/availability`)
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
  }, [expertId]);

  if (error) {
    return <StatusAlert variant="error" title="Availability error" description={error} />;
  }

  if (slots !== null && slots.length === 0) {
    return (
      <Empty>
        <EmptyHeader>
          <EmptyTitle>No slots</EmptyTitle>
          <EmptyDescription>No available slots in the next 14 days.</EmptyDescription>
        </EmptyHeader>
      </Empty>
    );
  }

  if (reducedMotion) {
    if (slots === null) return <SlotPickerSkeleton />;
    return (
      <SlotPickerContent groups={groupByDay(slots)} selected={selected} onSelect={onSelect} />
    );
  }

  return (
    <AnimatePresence mode="wait">
      {slots === null ? (
        <motion.div
          key="skeleton"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
        >
          <SlotPickerSkeleton />
        </motion.div>
      ) : (
        <motion.div
          key="content"
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25, ease: 'easeOut' }}
        >
          <SlotPickerContent groups={groupByDay(slots)} selected={selected} onSelect={onSelect} />
        </motion.div>
      )}
    </AnimatePresence>
  );
}
