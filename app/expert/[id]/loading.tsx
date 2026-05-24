import { Skeleton } from '@/components/ui/skeleton';

/**
 * /expert/[id] loading skeleton — mirrors ExpertDetail layout:
 * Profile hero (avatar + name + bio) + skills + slot picker + pay button
 */
export default function ExpertDetailLoading() {
  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-6">
      {/* Profile hero section */}
      <div className="flex flex-col items-center gap-4 py-4">
        <Skeleton className="size-20 rounded-full" />
        <div className="flex flex-col items-center gap-2">
          <Skeleton className="h-7 w-40 rounded-lg" />
          <Skeleton className="h-4 w-28 rounded-md" />
        </div>
        {/* Trust badge */}
        <Skeleton className="h-8 w-36 rounded-lg" />
      </div>

      {/* Bio / description */}
      <div className="flex flex-col gap-2 rounded-xl border border-border bg-card p-6">
        <Skeleton className="h-5 w-20 rounded-md" />
        <div className="flex flex-col gap-1.5">
          <Skeleton className="h-3 w-full rounded-sm" />
          <Skeleton className="h-3 w-full rounded-sm" />
          <Skeleton className="h-3 w-3/4 rounded-sm" />
        </div>
      </div>

      {/* Skill tags */}
      <div className="flex flex-col gap-3 rounded-xl border border-border bg-card p-6">
        <Skeleton className="h-5 w-16 rounded-md" />
        <div className="flex flex-wrap gap-2">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-6 w-20 rounded-full" />
          ))}
        </div>
      </div>

      {/* Languages */}
      <div className="flex flex-col gap-3 rounded-xl border border-border bg-card p-6">
        <Skeleton className="h-5 w-24 rounded-md" />
        <div className="flex flex-wrap gap-2">
          {[1, 2].map((i) => (
            <Skeleton key={i} className="h-6 w-14 rounded-full" />
          ))}
        </div>
      </div>

      {/* Slot picker */}
      <div className="flex flex-col gap-3 rounded-xl border border-border bg-card p-6">
        <Skeleton className="h-5 w-32 rounded-md" />
        <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Skeleton key={i} className="h-10 rounded-lg" />
          ))}
        </div>
      </div>

      {/* Pay button area */}
      <div className="flex flex-col items-center gap-3 py-4">
        <Skeleton className="h-4 w-44 rounded-md" />
        <Skeleton className="h-12 w-full max-w-xs rounded-xl" />
      </div>
    </div>
  );
}
