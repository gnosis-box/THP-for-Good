export const dynamic = 'force-dynamic';

import { Suspense } from 'react';

import { getAllExperts, getAllTags } from '@/lib/db';
import {
  filterExpertsClientSide,
  parseExpertFilterParams,
  recordToURLSearchParams,
} from '@/lib/expert-filters';
import { ExpertBrowser } from '@/components/experts/ExpertBrowser';
import { Skeleton } from '@/components/ui/skeleton';

export default async function HomePage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const raw = await searchParams;
  const filters = parseExpertFilterParams(recordToURLSearchParams(raw));
  const experts = filterExpertsClientSide(
    getAllExperts({
      skills: filters.skills,
      callLanguages: filters.languages,
    }),
    { q: filters.q },
  );
  const tags = getAllTags();

  return (
    <Suspense
      fallback={
        <div className="flex flex-col gap-4">
          <Skeleton className="h-11 w-full rounded-lg" />
          <Skeleton className="h-10 w-32 rounded-lg" />
          <Skeleton className="h-40 w-full rounded-xl" />
        </div>
      }
    >
      <ExpertBrowser experts={experts} tags={tags} />
    </Suspense>
  );
}
