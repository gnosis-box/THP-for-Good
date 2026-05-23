import { CallsView } from '@/components/bookings/CallsView';
import { PageHeader } from '@/components/layout/PageHeader';

export default function CallsPage() {
  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-6">
      <PageHeader
        title="Calls"
        subtitle="Sessions you booked (emitted) and sessions booked on your expert profile (received)."
      />
      <CallsView />
    </div>
  );
}
