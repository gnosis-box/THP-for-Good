'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { SlidersHorizontal } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';

import type { ExpertRow, TagRow } from '@/lib/db';
import { UI_COPY } from '@/lib/ui-copy';
import {
  buildExpertFilterSearchParams,
  countSheetFilters,
  parseExpertFilterParams,
  type ExpertFilterState,
} from '@/lib/expert-filters';
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyTitle,
} from '@/components/ui/empty';
import { Button } from '@/components/ui/button';
import { PageHeader } from '@/components/layout/PageHeader';
import { AnimatedList, AnimatedListItem } from '@/components/motion/animated-list';
import { FadeContent } from '@/components/motion/fade-content';
import { MotionEmpty } from '@/components/motion/motion-empty';
import { ExpertCard } from './ExpertCard';
import { ExpertSearch } from './ExpertSearch';
import { ExpertFilterSheet } from './ExpertFilterSheet';
import { ActiveFilterChips } from './ActiveFilterChips';

type Props = {
  experts: ExpertRow[];
  tags: TagRow[];
};

function ExpertSearchField({
  urlQ,
  urlFilters,
  onPushFilters,
}: {
  urlQ: string;
  urlFilters: ExpertFilterState;
  onPushFilters: (next: ExpertFilterState, replace?: boolean) => void;
}) {
  const [searchQuery, setSearchQuery] = useState(urlQ);

  useEffect(() => {
    const nextQ = searchQuery.trim() || undefined;
    if ((urlFilters.q ?? undefined) === nextQ) return;

    const timeout = window.setTimeout(() => {
      onPushFilters({ ...urlFilters, q: nextQ }, true);
    }, 300);

    return () => window.clearTimeout(timeout);
  }, [searchQuery, urlFilters, onPushFilters]);

  return <ExpertSearch value={searchQuery} onChange={setSearchQuery} />;
}

export function ExpertBrowser({ experts, tags }: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const urlFilters = useMemo(
    () => parseExpertFilterParams(searchParams),
    [searchParams],
  );
  const urlQ = urlFilters.q ?? '';

  const [sheetOpen, setSheetOpen] = useState(false);

  const pushFilters = useCallback(
    (next: ExpertFilterState, replace = false) => {
      const qs = buildExpertFilterSearchParams(next).toString();
      const href = qs ? `/?${qs}` : '/';
      if (replace) {
        router.replace(href, { scroll: false });
      } else {
        router.push(href);
      }
    },
    [router],
  );

  const sheetFilterCount = countSheetFilters(urlFilters);
  const listKey = `${urlFilters.skills?.join(',') ?? ''}|${urlFilters.languages?.join(',') ?? ''}|${urlQ}`;

  function openSheet() {
    setSheetOpen(true);
  }

  function applySheetFilters(next: { skills?: string[]; languages?: string[] }) {
    pushFilters({
      ...urlFilters,
      skills: next.skills?.length ? next.skills : undefined,
      languages: next.languages?.length ? next.languages : undefined,
    });
    setSheetOpen(false);
  }

  function removeSkill(skill: string) {
    pushFilters({
      ...urlFilters,
      skills: urlFilters.skills?.filter((entry) => entry !== skill),
    });
  }

  function removeLanguage(code: string) {
    pushFilters({
      ...urlFilters,
      languages: urlFilters.languages?.filter((entry) => entry !== code),
    });
  }

  function clearSheetFilters() {
    pushFilters({ ...urlFilters, skills: undefined, languages: undefined });
  }

  return (
    <div className="flex w-full flex-col gap-8">
      <FadeContent>
        <PageHeader title={UI_COPY.home.title} subtitle={UI_COPY.home.subtitle} />
      </FadeContent>

      <section className="flex flex-col gap-3">
        <ExpertSearchField
          key={urlQ}
          urlQ={urlQ}
          urlFilters={urlFilters}
          onPushFilters={pushFilters}
        />
        <div className="flex flex-wrap items-center gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="gap-1.5"
            onClick={openSheet}
            aria-label={UI_COPY.home.filtersButton(sheetFilterCount)}
          >
            <SlidersHorizontal className="size-4" aria-hidden />
            {UI_COPY.home.filtersButton(sheetFilterCount)}
          </Button>
        </div>
        <ActiveFilterChips
          filters={urlFilters}
          onRemoveSkill={removeSkill}
          onRemoveLanguage={removeLanguage}
          onClearAll={clearSheetFilters}
        />
      </section>

      <ExpertFilterSheet
        open={sheetOpen}
        onOpenChange={setSheetOpen}
        tags={tags}
        value={urlFilters}
        onApply={applySheetFilters}
      />

      {experts.length === 0 ? (
        <MotionEmpty>
          <Empty>
            <EmptyHeader>
              <EmptyTitle>No experts</EmptyTitle>
              <EmptyDescription>{UI_COPY.home.emptySearch}</EmptyDescription>
            </EmptyHeader>
          </Empty>
        </MotionEmpty>
      ) : (
        <AnimatedList
          listKey={listKey}
          className="flex w-full flex-col gap-4"
        >
          {experts.map((expert, index) => (
            <AnimatedListItem
              key={expert.id}
              index={index}
              className="w-full min-w-0 overflow-hidden rounded-xl border border-border bg-card"
            >
              <ExpertCard expert={expert} />
            </AnimatedListItem>
          ))}
        </AnimatedList>
      )}
    </div>
  );
}
