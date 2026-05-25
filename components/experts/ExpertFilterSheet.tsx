'use client';

import { useState } from 'react';

import { Button } from '@/components/ui/button';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { tagChipClass } from '@/components/ui-patterns/highlight-pill';
import { CALL_LANGUAGES } from '@/lib/languages';
import { UI_COPY } from '@/lib/ui-copy';
import type { ExpertFilterState } from '@/lib/expert-filters';
import type { TagRow } from '@/lib/db';

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  tags: TagRow[];
  value: ExpertFilterState;
  onApply: (value: ExpertFilterState) => void;
};

function FilterSheetBody({
  tags,
  value,
  onApply,
  onClose,
}: {
  tags: TagRow[];
  value: ExpertFilterState;
  onApply: (value: ExpertFilterState) => void;
  onClose: () => void;
}) {
  const [draft, setDraft] = useState<ExpertFilterState>({
    skills: value.skills ?? [],
    languages: value.languages ?? [],
  });

  function toggleSkill(skill: string) {
    const current = draft.skills ?? [];
    setDraft({
      ...draft,
      skills: current.includes(skill)
        ? current.filter((entry) => entry !== skill)
        : [...current, skill],
    });
  }

  function toggleLanguage(code: string) {
    const current = draft.languages ?? [];
    setDraft({
      ...draft,
      languages: current.includes(code)
        ? current.filter((entry) => entry !== code)
        : [...current, code],
    });
  }

  function clearDraft() {
    setDraft({ skills: [], languages: [] });
  }

  function handleApply() {
    onApply(draft);
    onClose();
  }

  return (
    <>
      <SheetHeader>
        <SheetTitle>{UI_COPY.home.filtersTitle}</SheetTitle>
        <SheetDescription>{UI_COPY.home.filtersDescription}</SheetDescription>
      </SheetHeader>

      <section className="flex flex-col gap-3 px-4">
        <h3 className="text-sm font-medium">{UI_COPY.home.filterLabel}</h3>
        <div role="group" aria-label="Filter by skill" className="flex flex-wrap gap-2">
          {tags.map((tag) => {
            const selected = (draft.skills ?? []).includes(tag.label);
            return (
              <button
                key={tag.id}
                type="button"
                aria-pressed={selected}
                onClick={() => toggleSkill(tag.label)}
                className={tagChipClass(selected)}
              >
                {tag.label}
              </button>
            );
          })}
        </div>
      </section>

      <section className="flex flex-col gap-3 px-4 pt-5">
        <div className="flex flex-col gap-1">
          <h3 className="text-sm font-medium">{UI_COPY.home.languageFilterLabel}</h3>
          <p className="text-xs text-muted-foreground">{UI_COPY.home.languageFilterHelper}</p>
        </div>
        <div
          role="group"
          aria-label="Filter by session language"
          className="flex flex-wrap gap-2"
        >
          {CALL_LANGUAGES.map(({ code, label }) => {
            const selected = (draft.languages ?? []).includes(code);
            return (
              <button
                key={code}
                type="button"
                aria-pressed={selected}
                onClick={() => toggleLanguage(code)}
                className={tagChipClass(selected)}
              >
                {label}
              </button>
            );
          })}
        </div>
      </section>

      <SheetFooter className="flex-row gap-2 px-4 pt-2 sm:flex-row">
        <Button type="button" variant="outline" onClick={clearDraft} className="flex-1">
          {UI_COPY.home.clearAllFilters}
        </Button>
        <Button type="button" onClick={handleApply} className="flex-1">
          {UI_COPY.home.applyFilters}
        </Button>
      </SheetFooter>
    </>
  );
}

export function ExpertFilterSheet({ open, onOpenChange, tags, value, onApply }: Props) {
  const sheetKey = `${value.skills?.join(',') ?? ''}|${value.languages?.join(',') ?? ''}`;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" className="max-h-[85vh] overflow-y-auto rounded-t-xl pb-6">
        {open ? (
          <FilterSheetBody
            key={sheetKey}
            tags={tags}
            value={value}
            onApply={onApply}
            onClose={() => onOpenChange(false)}
          />
        ) : null}
      </SheetContent>
    </Sheet>
  );
}
