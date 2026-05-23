'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

import {
  MetricsActions,
  MetricsExternalLink,
  MetricsHero,
  MetricsPanel,
  MetricsPanelDescription,
  MetricsPanelTitle,
  StatCell,
  StatGrid,
} from '@/components/ui-patterns/metrics-panel';
import { useWallet } from '@/components/wallet/WalletProvider';
import type { MeStatsResponse } from '@/lib/me-stats-api';
import { buttonVariants } from '@/components/ui/button';
import { cn } from '@/lib/utils';

function fmt(n: number) {
  return new Intl.NumberFormat(undefined, { maximumFractionDigits: 2 }).format(n);
}

export function ExpertStatsPanel() {
  const { address, isConnected } = useWallet();
  const [data, setData] = useState<MeStatsResponse | null>(null);
  const [notExpert, setNotExpert] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!address || !isConnected) {
      setData(null);
      setNotExpert(false);
      return;
    }

    let cancelled = false;
    setLoading(true);
    setNotExpert(false);

    fetch('/api/me/stats', {
      headers: { 'x-wallet-address': address },
    })
      .then(async (res) => {
        if (res.status === 404) {
          if (!cancelled) setNotExpert(true);
          return null;
        }
        if (!res.ok) throw new Error('fetch failed');
        return res.json() as Promise<MeStatsResponse>;
      })
      .then((json) => {
        if (!cancelled) setData(json);
      })
      .catch(() => {
        if (!cancelled) setData(null);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [address, isConnected]);

  if (!isConnected || notExpert || (loading && !data)) return null;
  if (!data) return null;

  return (
    <MetricsPanel>
      <MetricsPanelTitle>Expert stats</MetricsPanelTitle>
      <MetricsPanelDescription>
        On-chain balance and app session metrics for your expert profile.
      </MetricsPanelDescription>
      <MetricsHero
        label="CRC balance (on-chain)"
        value={data.balanceCrc != null ? `${fmt(data.balanceCrc)} CRC` : 'Unavailable'}
      />
      <StatGrid columns={3}>
        <StatCell label="Paid sessions" value={data.paidBookingCount} />
        <StatCell label="Booking intents" value={data.bookingIntentCount} />
        <StatCell label="Trust logged" value={data.trustAttestationCount} />
      </StatGrid>
      <MetricsActions>
        <MetricsExternalLink href={data.eventsUrl}>On-chain activity</MetricsExternalLink>
        <MetricsExternalLink href={data.graphUrl}>Trust graph</MetricsExternalLink>
        <Link
          href={`/expert/${data.expertId}`}
          className={cn(buttonVariants({ variant: 'secondary', size: 'sm' }), 'min-h-9')}
        >
          Public profile
        </Link>
      </MetricsActions>
    </MetricsPanel>
  );
}
