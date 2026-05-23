import { ExternalLink } from 'lucide-react';

import { buttonVariants } from '@/components/ui/button';
import { UI_COPY } from '@/lib/ui-copy';
import type { WebAnalyticsPayload } from '@/lib/stats-api';
import { cn } from '@/lib/utils';

function fmtDurationMinutes(seconds: number): string {
  const minutes = Math.max(1, Math.round(seconds / 60));
  return `${minutes}m`;
}

function fmtPercent(rate: number): string {
  return `${Math.round(rate * 100)}%`;
}

function DashboardLink({ href, label }: { href: string; label: string }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className={cn(
        buttonVariants({ variant: 'outline', size: 'sm' }),
        'inline-flex min-h-9 w-full items-center justify-center gap-1.5',
      )}
    >
      {label}
      <ExternalLink className="size-3.5 shrink-0 opacity-70" aria-hidden />
    </a>
  );
}

function StatCell({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="flex flex-col items-center gap-1 text-center">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="text-lg font-semibold tabular-nums">{value}</p>
    </div>
  );
}

export function WebAnalyticsPanel({ data }: { data: WebAnalyticsPayload }) {
  const copy = UI_COPY.stats;

  return (
    <section className="flex flex-col gap-4 rounded-xl border border-border p-4 sm:p-5">
      <div className="flex flex-col gap-1">
        <h2 className="text-base font-semibold">{copy.umamiTitle}</h2>
        <p className="text-xs text-muted-foreground">{copy.umamiNote}</p>
        {data.available && (
          <p className="text-xs text-muted-foreground">{copy.webAnalyticsPeriod(data.periodDays)}</p>
        )}
      </div>

      {!data.available ? (
        <div className="flex flex-col gap-3">
          <p className="text-sm text-muted-foreground">{copy.webAnalyticsUnavailable}</p>
          <DashboardLink href={data.dashboardUrl} label={copy.viewPublicAnalyticsDashboard} />
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-5">
            <StatCell label={copy.webAnalyticsVisitors} value={data.visitors ?? 0} />
            <StatCell label={copy.webAnalyticsVisits} value={data.visits ?? 0} />
            <StatCell label={copy.webAnalyticsViews} value={data.pageviews ?? 0} />
            <StatCell
              label={copy.webAnalyticsBounce}
              value={data.bounceRate != null ? fmtPercent(data.bounceRate) : '—'}
            />
            <StatCell
              label={copy.webAnalyticsDuration}
              value={
                data.avgVisitSeconds != null ? fmtDurationMinutes(data.avgVisitSeconds) : '—'
              }
            />
          </div>

          <DashboardLink href={data.dashboardUrl} label={copy.viewPublicAnalyticsDashboard} />
        </>
      )}
    </section>
  );
}
