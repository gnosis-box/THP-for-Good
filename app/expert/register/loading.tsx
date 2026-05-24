import { Skeleton } from '@/components/ui/skeleton';

/**
 * /expert/register loading skeleton — mirrors RegisterForm layout:
 * PageHeader + form fields (name, bio, price, calendar link, skills, languages)
 */
export default function RegisterLoading() {
  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-6">
      {/* PageHeader skeleton */}
      <header className="flex flex-col items-center gap-2 text-center">
        <Skeleton className="h-8 w-52 rounded-lg" />
        <Skeleton className="h-4 w-80 rounded-md" />
      </header>

      {/* Form card */}
      <div className="flex flex-col gap-5 rounded-xl border border-border bg-card p-6">
        {/* Name field */}
        <FormFieldSkeleton labelWidth="w-16" />

        {/* Bio field (textarea) */}
        <div className="flex flex-col gap-2">
          <Skeleton className="h-4 w-12 rounded-sm" />
          <Skeleton className="h-24 w-full rounded-lg" />
        </div>

        {/* Price field */}
        <FormFieldSkeleton labelWidth="w-28" />

        {/* Calendar link field */}
        <FormFieldSkeleton labelWidth="w-24" />

        {/* Skills / tags section */}
        <div className="flex flex-col gap-2">
          <Skeleton className="h-4 w-14 rounded-sm" />
          <div className="flex flex-wrap gap-2">
            {[1, 2, 3, 4].map((i) => (
              <Skeleton key={i} className="h-8 w-20 rounded-full" />
            ))}
          </div>
        </div>

        {/* Languages section */}
        <div className="flex flex-col gap-2">
          <Skeleton className="h-4 w-24 rounded-sm" />
          <div className="flex flex-wrap gap-2">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-8 w-16 rounded-full" />
            ))}
          </div>
        </div>

        {/* Submit button */}
        <Skeleton className="h-11 w-full rounded-lg" />
      </div>
    </div>
  );
}

function FormFieldSkeleton({ labelWidth }: { labelWidth: string }) {
  return (
    <div className="flex flex-col gap-2">
      <Skeleton className={`h-4 ${labelWidth} rounded-sm`} />
      <Skeleton className="h-10 w-full rounded-lg" />
    </div>
  );
}
