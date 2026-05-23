import { UI_COPY } from '@/lib/ui-copy';
import type { WebAnalyticsPayload } from '@/lib/stats-api';
import {
  MetricsExternalLink,
  MetricsPanel,
  MetricsPanelTitle,
  StatCell,
  StatFlexGrid,
} from '@/components/ui-patterns/metrics-panel';

function fmtDurationMinutes(seconds: number): string {
  const minutes = Math.max(1, Math.round(seconds / 60));
  return `${minutes}m`;
}

function fmtPercent(rate: number): string {
  return `${Math.round(rate * 100)}%`;
}

export function WebAnalyticsPanel({ data }: { data: WebAnalyticsPayload }) {
  const copy = UI_COPY.stats;

  return (
    <MetricsPanel className="gap-3 p-3 sm:gap-4 sm:p-4">
      <MetricsPanelTitle>{copy.umamiTitle}</MetricsPanelTitle>

      {!data.available ? (
        <div className="flex flex-col gap-2.5">
          <p className="text-center text-sm text-muted-foreground">{copy.webAnalyticsUnavailable}</p>
          <MetricsExternalLink href={data.dashboardUrl} fullWidth>
            {copy.viewPublicAnalyticsDashboard}
          </MetricsExternalLink>
        </div>
      ) : (
        <>
          <StatFlexGrid>
            <StatCell compact label={copy.webAnalyticsVisitors} value={data.visitors ?? 0} />
            <StatCell compact label={copy.webAnalyticsVisits} value={data.visits ?? 0} />
            <StatCell compact label={copy.webAnalyticsViews} value={data.pageviews ?? 0} />
            <StatCell
              compact
              label={copy.webAnalyticsBounce}
              value={data.bounceRate != null ? fmtPercent(data.bounceRate) : '—'}
            />
            <StatCell
              compact
              label={copy.webAnalyticsDuration}
              value={
                data.avgVisitSeconds != null ? fmtDurationMinutes(data.avgVisitSeconds) : '—'
              }
            />
          </StatFlexGrid>

          <MetricsExternalLink href={data.dashboardUrl} fullWidth>
            {copy.viewPublicAnalyticsDashboard}
          </MetricsExternalLink>
        </>
      )}
    </MetricsPanel>
  );
}
