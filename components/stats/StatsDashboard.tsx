'use client';

import { useEffect, useState } from 'react';

import { ContentPanel, ContentSection } from '@/components/ui-patterns/content-section';
import {
  MetricsActions,
  MetricsExternalLink,
  MetricsHero,
  MetricsPanel,
  MetricsPanelMono,
  MetricsPanelTitle,
  StatCell,
  StatGrid,
} from '@/components/ui-patterns/metrics-panel';
import { StatusAlert } from '@/components/ui-patterns/StatusAlert';
import { buildExplorerTxUrl } from '@/lib/analytics-explorer';
import { UI_COPY } from '@/lib/ui-copy';
import type { StatsApiResponse } from '@/lib/stats-api';
import { WebAnalyticsPanel } from '@/components/stats/WebAnalyticsPanel';
import { MentorCard } from '@/components/mentors/MentorCard';
import { ExternalLink } from 'lucide-react';

function fmt(n: number) {
  return new Intl.NumberFormat(undefined, { maximumFractionDigits: 2 }).format(n);
}

function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

export function StatsDashboard() {
  const copy = UI_COPY.stats;
  const [data, setData] = useState<StatsApiResponse | null>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    let cancelled = false;
    fetch('/api/stats')
      .then(async (res) => {
        if (!res.ok) throw new Error('stats fetch failed');
        return res.json() as Promise<StatsApiResponse>;
      })
      .then((json) => {
        if (!cancelled) setData(json);
      })
      .catch(() => {
        if (!cancelled) setError(true);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  if (error) {
    return <StatusAlert variant="error" title={copy.loadError} />;
  }

  if (!data) {
    return <p className="text-sm text-muted-foreground animate-pulse">{copy.loading}</p>;
  }

  return (
    <div className="flex flex-col gap-10">
      <ContentPanel title={copy.howToReadTitle} titleId="stats-how-to-read">
        <ul className="flex flex-col gap-2 pl-4 text-sm text-muted-foreground list-disc marker:text-muted-foreground/70">
          {copy.howToReadBullets.map((line) => (
            <li key={line}>{line}</li>
          ))}
          {data.meta.startBlock != null && (
            <li>{copy.analyticsFromBlock(data.meta.startBlock)}</li>
          )}
        </ul>
      </ContentPanel>

      <WebAnalyticsPanel data={data.webAnalytics} />

      {data.reconcile.pendingTxCount > 0 && (
        <StatusAlert
          variant="warning"
          title={copy.reconcileTitle(data.reconcile.pendingTxCount)}
        />
      )}

      <MetricsPanel>
        <MetricsPanelTitle>{copy.treasuryTitle}</MetricsPanelTitle>
        <MetricsPanelMono>{data.treasury.address}</MetricsPanelMono>
        <MetricsHero
          label={copy.treasuryBalance}
          value={
            data.treasury.balanceCrc != null
              ? `${fmt(data.treasury.balanceCrc)} CRC`
              : copy.treasuryBalanceUnavailable
          }
        />
        <MetricsActions>
          <MetricsExternalLink href={data.treasury.eventsUrl}>
            {copy.viewOnChainActivity}
          </MetricsExternalLink>
          <MetricsExternalLink href={data.treasury.graphUrl}>{copy.trustGraph}</MetricsExternalLink>
        </MetricsActions>
      </MetricsPanel>

      <section className="flex flex-col items-center gap-4">
        <MetricsPanelTitle>{copy.expertsTitle}</MetricsPanelTitle>
        {data.experts.length === 0 ? (
          <p className="text-center text-sm text-muted-foreground">{copy.expertsEmpty}</p>
        ) : (
          <ul className="flex w-full flex-col gap-4 lg:grid lg:grid-cols-2">
            {data.experts.map(({ mentor, paidSessionCount }) => (
              <li
                key={mentor.id}
                className="w-full min-w-0 overflow-hidden rounded-xl border border-border bg-card"
              >
                <MentorCard mentor={mentor} paidSessionCount={paidSessionCount} />
              </li>
            ))}
          </ul>
        )}
      </section>

      <MetricsPanel muted>
        <MetricsPanelTitle>{copy.snapshotTitle}</MetricsPanelTitle>
        <p className="text-center text-xs text-muted-foreground">{copy.snapshotOffChainNote}</p>
        <StatGrid columns={4}>
          <StatCell
            label={copy.activeExperts}
            value={
              <>
                {data.enrichment.activeExperts}
                <span className="text-sm font-normal text-muted-foreground">
                  {' '}
                  / {data.enrichment.totalExperts}
                </span>
              </>
            }
          />
          <StatCell label={copy.paidBookings} value={data.enrichment.paidBookingCount} />
          <StatCell label={copy.bookingIntent} value={data.enrichment.bookingIntentCount} />
          <StatCell label={copy.trustAttestations} value={data.enrichment.trustAttestationCount} />
        </StatGrid>
        {data.enrichment.tagCounts.length > 0 && (
          <div className="flex flex-col items-center gap-2">
            <p className="text-xs font-medium text-muted-foreground">{copy.topSkills}</p>
            <div className="flex flex-wrap justify-center gap-2">
              {data.enrichment.tagCounts.slice(0, 8).map((tag) => (
                <span
                  key={tag.label}
                  className="rounded-full border border-border bg-background px-2.5 py-0.5 text-xs"
                >
                  {tag.label}
                  <span className="text-muted-foreground ml-1">({tag.count})</span>
                </span>
              ))}
            </div>
          </div>
        )}
      </MetricsPanel>

      <ContentSection title={copy.recentPaidTitle}>
        {data.enrichment.recentPaidBookings.length === 0 ? (
          <p className="text-sm text-muted-foreground">{copy.recentPaidEmpty}</p>
        ) : (
          <div className="overflow-x-auto rounded-xl border border-border">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/40 text-left text-xs text-muted-foreground">
                  <th className="px-4 py-2 font-medium">Expert</th>
                  <th className="px-4 py-2 font-medium">Date</th>
                  <th className="px-4 py-2 font-medium sr-only">Tx</th>
                </tr>
              </thead>
              <tbody>
                {data.enrichment.recentPaidBookings.map((row) => (
                  <tr key={row.id} className="border-b border-border last:border-0">
                    <td className="px-4 py-2.5 font-medium">{row.mentorName}</td>
                    <td className="px-4 py-2.5 text-muted-foreground tabular-nums">
                      {fmtDate(row.createdAt)}
                    </td>
                    <td className="px-4 py-2.5 text-right">
                      <a
                        href={buildExplorerTxUrl(row.txHash)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary text-xs hover:underline inline-flex items-center gap-1"
                      >
                        {copy.viewTx}
                        <ExternalLink className="size-3" aria-hidden />
                      </a>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </ContentSection>
    </div>
  );
}
