import { Suspense } from 'react';

import { CallsView } from '@/components/bookings/CallsView';
import { Skeleton } from '@/components/ui/skeleton';

export default function CallsPage() {
  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Calls</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Sessions you booked (emitted) and sessions booked on your expert profile (received).
        </p>
      </div>
      <Suspense
        fallback={
          <div className="flex flex-col gap-4">
            <Skeleton className="h-11 w-full rounded-lg" />
            <Skeleton className="h-32 w-full rounded-xl" />
          </div>
        }
      >
        <CallsView />
      </Suspense>
    </div>
  );
}
