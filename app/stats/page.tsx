import { PageHeader } from '@/components/layout/PageHeader';
import { StatsDashboard } from '@/components/stats/StatsDashboard';
import { UI_COPY } from '@/lib/ui-copy';

export default function StatsPage() {
  return (
    <main className="mx-auto flex max-w-2xl flex-col gap-6 px-4 py-10">
      <PageHeader title={UI_COPY.stats.title} subtitle={UI_COPY.stats.subtitle} />
      <StatsDashboard />
    </main>
  );
}
