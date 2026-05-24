import { Skeleton } from '@/components/ui/skeleton';

/**
 * Home page loading skeleton — mirrors MentorBrowser layout:
 * PageHeader + filter section + mentor card grid
 */
export default function HomeLoading() {
  return (
    <div className="flex w-full flex-col gap-8">
      {/* PageHeader skeleton */}
      <header className="flex flex-col items-center gap-2 text-center">
        <Skeleton className="h-8 w-48 rounded-lg" />
        <Skeleton className="h-4 w-72 rounded-md" />
      </header>

      {/* Filter section skeleton */}
      <section className="flex flex-col gap-4">
        <Skeleton className="h-4 w-24 rounded-md" />
        {/* Search bar */}
        <Skeleton className="h-10 w-full rounded-lg" />
        {/* Skill filter chips */}
        <div className="flex flex-wrap gap-2">
          {[1, 2, 3, 4, 5].map((i) => (
            <Skeleton key={i} className="h-8 w-20 rounded-full" />
          ))}
        </div>
        {/* Language filter chips */}
        <div className="flex flex-wrap gap-2">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-8 w-16 rounded-full" />
          ))}
        </div>
      </section>

      {/* Mentor card grid skeleton */}
      <ul className="flex w-full flex-col gap-4">
        {[1, 2, 3, 4].map((i) => (
          <li
            key={i}
            className="w-full min-w-0 overflow-hidden rounded-xl border border-border bg-card"
          >
            <MentorCardSkeleton />
          </li>
        ))}
      </ul>
    </div>
  );
}

function MentorCardSkeleton() {
  return (
    <div className="flex w-full items-start gap-3 px-3 py-3 sm:px-4 sm:py-4">
      {/* Avatar */}
      <Skeleton className="size-11 shrink-0 rounded-full sm:size-12" />
      <div className="min-w-0 flex-1 space-y-2">
        {/* Name + trust | price row */}
        <div className="flex items-center justify-between gap-2">
          <div className="flex min-w-0 flex-1 items-center gap-2">
            <Skeleton className="h-4 w-20 shrink-0 rounded-md" />
            <Skeleton className="h-6 w-14 shrink-0 rounded-full" />
          </div>
          <Skeleton className="h-5 w-14 shrink-0 rounded-md" />
        </div>
        {/* Languages | trusted by row */}
        <div className="flex items-center justify-between gap-2">
          <Skeleton className="h-4 w-28 shrink-0 rounded-sm" />
          <Skeleton className="h-3 w-16 shrink-0 rounded-sm" />
        </div>
        {/* Skill tags */}
        <div className="flex flex-wrap gap-1.5">
          {[1, 2].map((i) => (
            <Skeleton key={i} className="h-5 w-16 rounded-full" />
          ))}
        </div>
        {/* Split share */}
        <Skeleton className="h-3 w-32 rounded-sm" />
      </div>
    </div>
  );
}
