import { Skeleton } from '@/components/ui/skeleton';

/**
 * /expert/[id] loading skeleton — mirrors ExpertDetail layout:
 * stepper + profile card (incl. bio) + availability
 */
export default function ExpertDetailLoading() {
  return (
    <div className="mx-auto flex max-w-lg flex-col gap-6 pb-28 md:max-w-2xl md:pb-8">
      <Skeleton className="h-9 w-16 rounded-md" />

      {/* Booking stepper */}
      <div className="mx-auto flex w-full max-w-sm items-start sm:max-w-md">
        {[1, 2, 3].map((i) => (
          <div key={i} className="flex min-w-0 flex-1 flex-col items-center gap-1.5">
            <div className="flex w-full items-center">
              <div className="flex h-8 flex-1 items-center sm:h-9">
                {i > 1 ? <Skeleton className="h-0.5 w-full rounded-full" /> : null}
              </div>
              <Skeleton className="size-8 shrink-0 rounded-full sm:size-9" />
              <div className="flex h-8 flex-1 items-center sm:h-9">
                {i < 3 ? <Skeleton className="h-0.5 w-full rounded-full" /> : null}
              </div>
            </div>
            <Skeleton className="h-3 w-16 rounded-sm" />
          </div>
        ))}
      </div>

      {/* Profile card (matches ExpertProfileHero / ExpertCard) */}
      <div className="overflow-hidden rounded-xl border border-border bg-card">
        <div className="flex items-start gap-3 px-3 py-3 sm:px-4 sm:py-4">
          <Skeleton className="size-11 shrink-0 rounded-full sm:size-12" />
          <div className="min-w-0 flex-1 space-y-2">
            <div className="flex items-center justify-between gap-2">
              <div className="flex flex-1 items-center gap-2">
                <Skeleton className="h-4 w-20 rounded-md" />
                <Skeleton className="h-6 w-14 shrink-0 rounded-full" />
              </div>
              <Skeleton className="h-5 w-14 shrink-0 rounded-md" />
            </div>
            <div className="flex items-center justify-between gap-2">
              <Skeleton className="h-4 w-36 rounded-sm" />
              <Skeleton className="h-3 w-16 shrink-0 rounded-sm" />
            </div>
          </div>
        </div>
        <div className="border-t border-border px-3 py-2 text-center sm:px-4 sm:py-2.5">
          <Skeleton className="mx-auto h-4 w-12 rounded-md" />
          <div className="mt-1 flex flex-wrap justify-center gap-1.5">
            {[1, 2, 3, 4].map((i) => (
              <Skeleton key={i} className="h-5 w-16 rounded-full" />
            ))}
          </div>
        </div>
        <div className="border-t border-border px-3 pb-3 pt-2.5 text-center sm:px-4 sm:pb-4 sm:pt-3">
          <Skeleton className="mx-auto h-4 w-14 rounded-md" />
          <div className="mt-2 flex flex-col gap-1.5">
            <Skeleton className="h-3 w-full rounded-sm" />
            <Skeleton className="h-3 w-full rounded-sm" />
            <Skeleton className="h-3 w-3/4 rounded-sm" />
          </div>
        </div>
        <Skeleton className="h-6 w-full rounded-none" />
      </div>

      {/* Slot picker */}
      <div className="flex flex-col gap-3">
        <Skeleton className="mx-auto h-4 w-48 rounded-md" />
        <div className="mx-auto grid w-full max-w-md grid-cols-3 gap-2 sm:grid-cols-4">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Skeleton key={i} className="h-10 rounded-lg" />
          ))}
        </div>
      </div>
    </div>
  );
}
