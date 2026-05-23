import { Suspense } from 'react';

import { CallsView } from '@/components/bookings/CallsView';
import { PageHeader } from '@/components/layout/PageHeader';
import { Skeleton } from '@/components/ui/skeleton';

export default function CallsPage() {
  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-6">
      <PageHeader
        title="Calls"
        subtitle="Sessions you booked (emitted) and sessions booked on your expert profile (received)."
      />
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
