import { StatsDashboard } from '@/components/stats/StatsDashboard';
import { UI_COPY } from '@/lib/ui-copy';

export default function StatsPage() {
  return (
    <main className="mx-auto flex max-w-2xl flex-col gap-6 px-4 py-10">
      <header className="flex flex-col gap-2">
        <h1 className="text-2xl font-bold tracking-tight">{UI_COPY.stats.title}</h1>
        <p className="text-sm text-muted-foreground">{UI_COPY.stats.subtitle}</p>
      </header>
      <StatsDashboard />
    </main>
  );
}
