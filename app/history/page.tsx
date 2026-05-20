import { BookingHistory } from '@/components/bookings/BookingHistory';

export default function HistoryPage() {
  return (
    <div className="mx-auto flex max-w-4xl flex-col gap-6">
      <h1 className="text-2xl font-semibold tracking-tight">My Calls</h1>
      <BookingHistory />
    </div>
  );
}
