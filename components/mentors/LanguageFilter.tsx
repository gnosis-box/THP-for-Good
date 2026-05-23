'use client';

import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import { SESSION_LANGUAGES } from '@/lib/languages';
import { UI_COPY } from '@/lib/ui-copy';

type Props = {
  selected: string[];
  onChange: (codes: string[]) => void;
};

export function LanguageFilter({ selected, onChange }: Props) {
  return (
    <div className="flex flex-col gap-2">
      <p className="text-sm font-medium">{UI_COPY.home.languageFilterLabel}</p>
      <ScrollArea className="w-full whitespace-nowrap">
        <div className="inline-flex w-max min-h-11 items-center gap-2 pb-1">
          <button
            type="button"
            aria-pressed={selected.length === 0}
            onClick={() => onChange([])}
            className={cn(
              'inline-flex min-h-11 shrink-0 items-center rounded-full border px-4 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
              selected.length === 0
                ? 'border-primary bg-primary text-primary-foreground'
                : 'border-border bg-background hover:bg-muted',
            )}
          >
            {UI_COPY.home.languageFilterAll}
          </button>
          <ToggleGroup
            value={selected}
            onValueChange={onChange}
            multiple
            aria-label="Filter experts by call language"
            className="inline-flex gap-2"
          >
            {SESSION_LANGUAGES.map(({ code, label }) => (
              <ToggleGroupItem
                key={code}
                value={code}
                className="min-h-11 shrink-0 rounded-full px-4"
              >
                {label}
              </ToggleGroupItem>
            ))}
          </ToggleGroup>
        </div>
        <ScrollBar orientation="horizontal" />
      </ScrollArea>
    </div>
  );
}
