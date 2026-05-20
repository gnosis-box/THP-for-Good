import { CallList } from '@/components/calls/CallList';
import { PageNav } from '@/components/layout/PageNav';

export default function CallsPage() {
  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">My calls</h1>
        <p className="text-sm text-muted-foreground">
          After your call, trust your mentor on Circles for the skill they helped with.
        </p>
      </div>
      <CallList />
      <PageNav />
    </div>
  );
}
