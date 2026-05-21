import { Skeleton } from "@/components/ui/skeleton";

export function MentorCardSkeleton() {
  return (
    <div className="flex min-h-[11.5rem] flex-col items-center rounded-xl border border-border bg-card p-4">
      <Skeleton className="h-20 w-20 rounded-full" />
      <Skeleton className="mt-3 h-4 w-16" />
      <div className="mt-2 flex gap-1">
        <Skeleton className="h-5 w-10 rounded-full" />
        <Skeleton className="h-5 w-10 rounded-full" />
      </div>
    </div>
  );
}
