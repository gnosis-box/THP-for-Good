export const dynamic = 'force-dynamic';

import type { Metadata } from 'next';
import { Suspense } from 'react';

import { getAllExperts, getAllTags, getStatsEnrichment } from '@/lib/db';
import {
  filterExpertsClientSide,
  parseExpertFilterParams,
  recordToURLSearchParams,
} from '@/lib/expert-filters';
import { fetchTreasuryBalanceCrc } from '@/lib/analytics-rpc';
import {
  buildDefaultOpenGraph,
  buildDefaultTwitter,
  DEFAULT_OG_IMAGE_PATH,
} from '@/lib/site-metadata';
import { UI_COPY } from '@/lib/ui-copy';
import { HomeHero } from '@/components/home/HomeHero';
import { ExpertBrowser } from '@/components/experts/ExpertBrowser';
import { Skeleton } from '@/components/ui/skeleton';

export async function generateMetadata(): Promise<Metadata> {
  const hero = UI_COPY.home.hero;
  const title = hero.title;
  const description = hero.subtitle;

  return {
    title,
    description,
    alternates: { canonical: '/' },
    openGraph: buildDefaultOpenGraph({
      url: '/',
      title,
      description,
      images: [{ url: DEFAULT_OG_IMAGE_PATH, alt: title }],
    }),
    twitter: buildDefaultTwitter({
      title,
      description,
    }),
  };
}

async function getFastTreasurySnapshot(timeoutMs = 1200): Promise<number | null> {
  try {
    const timer = new Promise<null>((resolve) => {
      setTimeout(() => resolve(null), timeoutMs);
    });
    return await Promise.race([fetchTreasuryBalanceCrc(), timer]);
  } catch {
    return null;
  }
}

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
  const enrichment = getStatsEnrichment();
  const treasuryBalanceCrc = await getFastTreasurySnapshot();

  return (
    <div className="flex w-full flex-col gap-8">
      <HomeHero paidSessions={enrichment.paidBookingCount} treasuryBalanceCrc={treasuryBalanceCrc} />
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
    </div>
  );
}
