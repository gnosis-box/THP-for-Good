import { Skeleton } from '@/components/ui/skeleton';

/**
 * /expert/register loading skeleton — mirrors RegisterForm layout:
 * PageHeader (scrolls) + sticky preview card + form sections
 */
export default function RegisterLoading() {
  return (
    <div className="flex flex-col gap-5">
      <header className="flex flex-col items-center gap-2 text-center">
        <Skeleton className="h-8 w-52 rounded-lg" />
        <Skeleton className="h-4 w-80 max-w-full rounded-md" />
      </header>

      <div className="mx-auto w-full max-w-lg px-4 pb-3 md:max-w-2xl md:px-6">
        <div className="overflow-hidden rounded-xl border border-border bg-card">
          <div className="flex items-start gap-3 px-3 py-3 sm:px-4 sm:py-4">
            <Skeleton className="size-11 shrink-0 rounded-full sm:size-12" />
            <div className="min-w-0 flex-1 space-y-2">
              <div className="flex items-center justify-between gap-2">
                <Skeleton className="h-4 w-24 rounded-md" />
                <Skeleton className="h-5 w-14 rounded-md" />
              </div>
              <Skeleton className="h-4 w-40 rounded-sm" />
            </div>
          </div>
          <div className="border-t border-border px-3 py-2 sm:px-4 sm:py-2.5">
            <Skeleton className="mx-auto h-4 w-12 rounded-md" />
            <div className="mt-2 flex flex-wrap justify-center gap-1.5">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-5 w-16 rounded-full" />
              ))}
            </div>
          </div>
          <Skeleton className="h-7 w-full rounded-none" />
          <Skeleton className="h-8 w-full rounded-none" />
          <Skeleton className="h-7 w-full rounded-none" />
        </div>
      </div>

      <div className="flex flex-col gap-5">
        <SectionSkeleton fields={2} />
        <SectionSkeleton fields={3} withTags />
        <SectionSkeleton fields={1} />
        <SectionSkeleton fields={2} />
        <Skeleton className="h-11 w-40 rounded-lg" />
      </div>
    </div>
  );
}

function SectionSkeleton({
  fields,
  withTags = false,
}: {
  fields: number;
  withTags?: boolean;
}) {
  return (
    <div className="flex flex-col gap-3 rounded-xl border border-border bg-card p-4">
      <Skeleton className="h-5 w-32 rounded-md" />
      {Array.from({ length: fields }, (_, i) => (
        <FormFieldSkeleton key={i} labelWidth="w-24" />
      ))}
      {withTags ? (
        <div className="flex flex-wrap gap-2">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-8 w-20 rounded-full" />
          ))}
        </div>
      ) : null}
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
