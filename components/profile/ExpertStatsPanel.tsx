'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ExternalLink } from 'lucide-react';

import { buttonVariants } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useWallet } from '@/components/wallet/WalletProvider';
import type { MeStatsResponse } from '@/lib/me-stats-api';
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
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Expert stats</CardTitle>
        <CardDescription>
          On-chain balance and app session metrics for your expert profile.
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <div>
          <p className="text-xs text-muted-foreground">CRC balance (on-chain)</p>
          <p className="text-2xl font-semibold tabular-nums">
            {data.balanceCrc != null ? `${fmt(data.balanceCrc)} CRC` : 'Unavailable'}
          </p>
        </div>
        <dl className="grid grid-cols-3 gap-3 text-sm">
          <div>
            <dt className="text-xs text-muted-foreground">Paid sessions</dt>
            <dd className="font-semibold tabular-nums">{data.paidBookingCount}</dd>
          </div>
          <div>
            <dt className="text-xs text-muted-foreground">Booking intents</dt>
            <dd className="font-semibold tabular-nums">{data.bookingIntentCount}</dd>
          </div>
          <div>
            <dt className="text-xs text-muted-foreground">Trust logged</dt>
            <dd className="font-semibold tabular-nums">{data.trustAttestationCount}</dd>
          </div>
        </dl>
        <div className="flex flex-wrap gap-2">
          <a
            href={data.eventsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className={cn(
              buttonVariants({ variant: 'outline', size: 'sm' }),
              'inline-flex min-h-9 items-center gap-1.5',
            )}
          >
            On-chain activity
            <ExternalLink className="size-3.5 opacity-70" aria-hidden />
          </a>
          <a
            href={data.graphUrl}
            target="_blank"
            rel="noopener noreferrer"
            className={cn(
              buttonVariants({ variant: 'outline', size: 'sm' }),
              'inline-flex min-h-9 items-center gap-1.5',
            )}
          >
            Trust graph
            <ExternalLink className="size-3.5 opacity-70" aria-hidden />
          </a>
          <Link
            href={`/mentor/${data.mentorId}`}
            className={buttonVariants({ variant: 'secondary', size: 'sm' })}
          >
            Public profile
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
