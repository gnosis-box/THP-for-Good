'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ExternalLink } from 'lucide-react';

import { StatusAlert } from '@/components/ui-patterns/StatusAlert';
import { buttonVariants } from '@/components/ui/button';
import { buildExplorerTxUrl } from '@/lib/analytics-explorer';
import { UI_COPY } from '@/lib/ui-copy';
import type { StatsApiResponse } from '@/lib/stats-api';
import { cn, shortenAddress } from '@/lib/utils';

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

function ExplorerLink({
  href,
  children,
  className,
}: {
  href: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className={cn(
        buttonVariants({ variant: 'outline', size: 'sm' }),
        'inline-flex min-h-9 items-center gap-1.5',
        className,
      )}
    >
      {children}
      <ExternalLink className="size-3.5 shrink-0 opacity-70" aria-hidden />
    </a>
  );
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
    return (
      <StatusAlert variant="error" title={copy.loadError} />
    );
  }

  if (!data) {
    return <p className="text-sm text-muted-foreground animate-pulse">{copy.loading}</p>;
  }

  return (
    <div className="flex flex-col gap-10">
      <p className="text-sm text-muted-foreground">{copy.explorerDisclaimer}</p>

      {data.reconcile.pendingTxCount > 0 && (
        <StatusAlert
          variant="warning"
          title={copy.reconcileTitle(data.reconcile.pendingTxCount)}
        />
      )}

      {/* Treasury */}
      <section className="flex flex-col gap-4 rounded-xl border border-border p-4 sm:p-5">
        <h2 className="text-base font-semibold">{copy.treasuryTitle}</h2>
        <p className="text-xs font-mono text-muted-foreground break-all">{data.treasury.address}</p>
        <div>
          <p className="text-xs text-muted-foreground">{copy.treasuryBalance}</p>
          <p className="text-2xl font-semibold tabular-nums">
            {data.treasury.balanceCrc != null
              ? `${fmt(data.treasury.balanceCrc)} CRC`
              : copy.treasuryBalanceUnavailable}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <ExplorerLink href={data.treasury.eventsUrl}>{copy.viewOnChainActivity}</ExplorerLink>
          <ExplorerLink href={data.treasury.graphUrl}>{copy.trustGraph}</ExplorerLink>
        </div>
      </section>

      {/* Group */}
      <section className="flex flex-col gap-3 rounded-xl border border-border p-4 sm:p-5">
        <h2 className="text-base font-semibold">{copy.groupTitle}</h2>
        <p className="text-xs font-mono text-muted-foreground break-all">{data.group.address}</p>
        <div className="flex flex-wrap gap-2">
          <ExplorerLink href={data.group.eventsUrl}>{copy.viewOnChainActivity}</ExplorerLink>
          <ExplorerLink href={data.group.graphUrl}>{copy.trustGraph}</ExplorerLink>
        </div>
      </section>

      {/* Experts */}
      <section className="flex flex-col gap-4">
        <h2 className="text-base font-semibold">{copy.expertsTitle}</h2>
        {data.experts.length === 0 ? (
          <p className="text-sm text-muted-foreground">{copy.expertsEmpty}</p>
        ) : (
          <ul className="flex flex-col divide-y divide-border rounded-xl border border-border">
            {data.experts.map((expert) => (
              <li
                key={expert.id}
                className="flex flex-col gap-2 px-4 py-3 sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="min-w-0">
                  <Link
                    href={`/mentor/${expert.id}`}
                    className="font-medium hover:text-primary truncate block"
                  >
                    {expert.name}
                  </Link>
                  <p className="text-xs font-mono text-muted-foreground truncate">
                    {shortenAddress(expert.address, 6)}
                  </p>
                </div>
                <div className="flex flex-wrap gap-2 shrink-0">
                  <ExplorerLink href={expert.eventsUrl}>{copy.viewOnChainActivity}</ExplorerLink>
                  <ExplorerLink href={expert.graphUrl}>{copy.trustGraph}</ExplorerLink>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* Snapshot */}
      <section className="flex flex-col gap-4 rounded-xl border border-border bg-muted/30 p-4 sm:p-5">
        <div>
          <h2 className="text-base font-semibold">{copy.snapshotTitle}</h2>
          <p className="text-xs text-muted-foreground mt-1">{copy.snapshotOffChainNote}</p>
        </div>
        <dl className="grid grid-cols-2 gap-4 sm:grid-cols-3">
          <div>
            <dt className="text-xs text-muted-foreground">{copy.activeExperts}</dt>
            <dd className="text-lg font-semibold tabular-nums">
              {data.enrichment.activeExperts}
              <span className="text-sm font-normal text-muted-foreground">
                {' '}/ {data.enrichment.totalExperts}
              </span>
            </dd>
          </div>
          <div>
            <dt className="text-xs text-muted-foreground">{copy.paidBookings}</dt>
            <dd className="text-lg font-semibold tabular-nums">{data.enrichment.paidBookingCount}</dd>
          </div>
          <div>
            <dt className="text-xs text-muted-foreground">{copy.trustAttestations}</dt>
            <dd className="text-lg font-semibold tabular-nums">
              {data.enrichment.trustAttestationCount}
            </dd>
          </div>
        </dl>
        {data.enrichment.tagCounts.length > 0 && (
          <div>
            <p className="text-xs font-medium text-muted-foreground mb-2">{copy.topSkills}</p>
            <div className="flex flex-wrap gap-2">
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
      </section>

      {/* Recent paid */}
      <section className="flex flex-col gap-3">
        <h2 className="text-base font-semibold">{copy.recentPaidTitle}</h2>
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
      </section>
    </div>
  );
}
