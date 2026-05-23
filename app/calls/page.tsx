import { CallsView } from '@/components/bookings/CallsView';

export default function CallsPage() {
  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-6">
      <div>
        <h1 className="font-display text-3xl font-bold tracking-tight">Calls</h1>
        <p className="mt-1.5 text-base text-muted-foreground">
          Sessions you booked and sessions booked on your expert profile.
        </p>
      </div>
      <CallsView />
    </div>
  );
}
