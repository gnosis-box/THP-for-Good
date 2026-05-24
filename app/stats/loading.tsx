import { Skeleton } from '@/components/ui/skeleton';

/**
 * /stats loading skeleton — mirrors StatsDashboard layout:
 * PageHeader + how-to-read panel + web analytics + treasury metrics +
 * experts grid + snapshot stats + recent paid table
 */
export default function StatsLoading() {
  return (
    <main className="mx-auto flex max-w-2xl flex-col gap-6 px-4 py-10">
      {/* PageHeader skeleton */}
      <header className="flex flex-col items-center gap-2 text-center">
        <Skeleton className="h-8 w-48 rounded-lg" />
        <Skeleton className="h-4 w-72 rounded-md" />
      </header>

      <div className="flex flex-col gap-10">
        {/* How-to-read content panel */}
        <div className="flex flex-col gap-3 rounded-xl border border-border bg-card p-6">
          <Skeleton className="h-5 w-40 rounded-md" />
          <div className="flex flex-col gap-2 pl-4">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-3 w-full rounded-sm" />
            ))}
          </div>
        </div>

        {/* Web analytics panel */}
        <div className="flex flex-col items-center gap-4 rounded-xl border border-border bg-card p-6">
          <Skeleton className="h-5 w-32 rounded-md" />
          <div className="grid w-full grid-cols-3 gap-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex flex-col items-center gap-1">
                <Skeleton className="h-3 w-16 rounded-sm" />
                <Skeleton className="h-7 w-12 rounded-md" />
              </div>
            ))}
          </div>
        </div>

        {/* Treasury metrics panel */}
        <div className="flex flex-col items-center gap-4 rounded-xl border border-border bg-card p-6">
          <Skeleton className="h-5 w-36 rounded-md" />
          <Skeleton className="h-3 w-64 rounded-sm" />
          <div className="flex flex-col items-center gap-1">
            <Skeleton className="h-3 w-20 rounded-sm" />
            <Skeleton className="h-9 w-32 rounded-md" />
          </div>
          <div className="flex gap-3">
            <Skeleton className="h-8 w-36 rounded-lg" />
            <Skeleton className="h-8 w-28 rounded-lg" />
          </div>
        </div>

        {/* Experts grid */}
        <section className="flex flex-col items-center gap-4">
          <Skeleton className="h-5 w-24 rounded-md" />
          <ul className="flex w-full flex-col gap-4 lg:grid lg:grid-cols-2">
            {[1, 2].map((i) => (
              <li
                key={i}
                className="w-full min-w-0 overflow-hidden rounded-xl border border-border bg-card"
              >
                <div className="flex w-full items-start gap-3 px-3 py-3 sm:px-4 sm:py-4">
                  <Skeleton className="size-11 shrink-0 rounded-full sm:size-12" />
                  <div className="min-w-0 flex-1 space-y-2">
                    <Skeleton className="h-5 w-28 rounded-md" />
                    <Skeleton className="h-3 w-20 rounded-sm" />
                    <Skeleton className="h-5 w-14 rounded-full" />
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </section>

        {/* Snapshot stats panel */}
        <div className="flex flex-col items-center gap-4 rounded-xl border border-border bg-muted/40 p-6">
          <Skeleton className="h-5 w-36 rounded-md" />
          <Skeleton className="h-3 w-52 rounded-sm" />
          <div className="grid w-full grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="flex flex-col items-center gap-1">
                <Skeleton className="h-3 w-14 rounded-sm" />
                <Skeleton className="h-7 w-10 rounded-md" />
              </div>
            ))}
          </div>
          {/* Top skills */}
          <div className="flex flex-wrap justify-center gap-2">
            {[1, 2, 3, 4].map((i) => (
              <Skeleton key={i} className="h-6 w-20 rounded-full" />
            ))}
          </div>
        </div>

        {/* Recent paid bookings table */}
        <div className="flex flex-col gap-3">
          <Skeleton className="h-5 w-44 rounded-md" />
          <div className="overflow-hidden rounded-xl border border-border">
            <div className="border-b border-border bg-muted/40 px-4 py-2">
              <Skeleton className="h-3 w-full rounded-sm" />
            </div>
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="flex items-center justify-between border-b border-border px-4 py-2.5 last:border-0"
              >
                <Skeleton className="h-4 w-24 rounded-md" />
                <Skeleton className="h-4 w-28 rounded-md" />
                <Skeleton className="h-3 w-14 rounded-sm" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}
