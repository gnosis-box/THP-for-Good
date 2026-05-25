import { Skeleton } from '@/components/ui/skeleton';

/**
 * /calls loading skeleton — mirrors CallsView layout:
 * PageHeader + Tabs (emitted/received) + booking cards
 */
export default function CallsLoading() {
  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-6">
      {/* PageHeader skeleton */}
      <header className="flex flex-col items-center gap-2 text-center">
        <Skeleton className="h-8 w-28 rounded-lg" />
        <Skeleton className="h-4 w-80 rounded-md" />
      </header>

      {/* Tabs bar skeleton */}
      <Skeleton className="h-11 w-full rounded-lg" />

      {/* Booking cards skeleton */}
      <div className="flex flex-col gap-4">
        {[1, 2, 3].map((i) => (
          <BookingCardSkeleton key={i} />
        ))}
      </div>
    </div>
  );
}

function BookingCardSkeleton() {
  return (
    <div className="rounded-xl border border-border bg-card">
      {/* CardHeader */}
      <div className="flex flex-col gap-2 p-6 pb-0">
        <Skeleton className="h-5 w-36 rounded-md" />
        {/* Skill badges */}
        <div className="flex flex-wrap gap-1.5 pt-1">
          {[1, 2].map((i) => (
            <Skeleton key={i} className="h-5 w-14 rounded-full" />
          ))}
        </div>
      </div>
      {/* CardContent */}
      <div className="flex flex-col gap-1.5 p-6 pt-4">
        <Skeleton className="h-4 w-40 rounded-md" />
        <Skeleton className="h-3 w-48 rounded-sm" />
        <Skeleton className="h-3 w-32 rounded-sm" />
      </div>
      {/* CardFooter — trust button */}
      <div className="p-6 pt-0">
        <Skeleton className="h-9 w-32 rounded-lg" />
      </div>
    </div>
  );
}
