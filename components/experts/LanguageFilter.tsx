'use client';

import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import { filterChipClass } from '@/components/ui-patterns/highlight-pill';
import { CALL_LANGUAGES } from '@/lib/languages';
import { UI_COPY } from '@/lib/ui-copy';

type Props = {
  selected: string[];
  onChange: (codes: string[]) => void;
};

export function LanguageFilter({ selected, onChange }: Props) {
  const anySelected = selected.length === 0;

  function toggleLanguage(code: string) {
    if (selected.includes(code)) {
      const next = selected.filter((c) => c !== code);
      onChange(next);
      return;
    }
    onChange([...selected, code]);
  }

  return (
    <div className="flex flex-col gap-2">
      <p className="text-sm font-medium">{UI_COPY.home.languageFilterLabel}</p>
      <ScrollArea className="motion-scroll-fade-x w-full whitespace-nowrap">
        <div
          role="group"
          aria-label="Filter experts by call language"
          className="inline-flex w-max min-h-11 items-center gap-2 pb-1"
        >
          <button
            type="button"
            aria-pressed={anySelected}
            onClick={() => onChange([])}
            className={filterChipClass(anySelected)}
          >
            {UI_COPY.home.languageFilterAll}
          </button>
          {CALL_LANGUAGES.map(({ code, label }) => (
            <button
              key={code}
              type="button"
              aria-pressed={selected.includes(code)}
              onClick={() => toggleLanguage(code)}
              className={filterChipClass(selected.includes(code))}
            >
              {label}
            </button>
          ))}
        </div>
        <ScrollBar orientation="horizontal" />
      </ScrollArea>
    </div>
  );
}
