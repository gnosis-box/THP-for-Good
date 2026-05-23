'use client';

import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { shortenAddress } from '@/lib/utils';
import type { AdminHealthStats } from '@/lib/db';

type Props = {
  stats: AdminHealthStats;
};

function StatCard({
  label,
  value,
  hint,
  variant = 'default',
}: {
  label: string;
  value: number;
  hint?: string;
  variant?: 'default' | 'warning' | 'success';
}) {
  const valueClass =
    variant === 'warning'
      ? 'text-warning'
      : variant === 'success'
        ? 'text-success'
        : 'text-foreground';

  return (
    <Card size="sm">
      <CardHeader className="pb-0">
        <CardTitle className="text-xs font-medium text-muted-foreground">{label}</CardTitle>
      </CardHeader>
      <CardContent className="pt-1">
        <p className={`text-2xl font-semibold tabular-nums ${valueClass}`}>{value}</p>
        {hint ? <p className="mt-1 text-xs text-muted-foreground">{hint}</p> : null}
      </CardContent>
    </Card>
  );
}

function fmtWhen(iso: string) {
  return new Date(iso).toLocaleString(undefined, {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function PlatformHealthSection({ stats }: Props) {
  const { bookings, mentors, tags, recentBookings } = stats;

  return (
    <section className="flex flex-col gap-4">
      <div className="flex flex-col gap-1">
        <h2 className="text-base font-semibold">Platform health</h2>
        <p className="text-sm text-muted-foreground">
          Snapshot from SQLite — on-chain CRC volume remains the source of truth for payments.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
        <StatCard label="Bookings today" value={bookings.today} />
        <StatCard label="Bookings (7 days)" value={bookings.last7Days} />
        <StatCard label="Total bookings" value={bookings.total} />
        <StatCard
          label="Paid (tx on file)"
          value={bookings.withTx}
          variant={bookings.withTx > 0 ? 'success' : 'default'}
        />
        <StatCard
          label="Missing tx hash"
          value={bookings.withoutTx}
          variant={bookings.withoutTx > 0 ? 'warning' : 'default'}
          hint="Incomplete booking records"
        />
        <StatCard
          label="Awaiting TRUST"
          value={bookings.withoutTrust}
          variant={bookings.withoutTrust > 0 ? 'warning' : 'default'}
          hint="Paid bookings without attestation"
        />
        <StatCard label="Active experts" value={mentors.active} />
        <StatCard
          label="No Cal.com"
          value={mentors.activeWithoutCal}
          variant={mentors.activeWithoutCal > 0 ? 'warning' : 'default'}
          hint="Active but not bookable in-app"
        />
        <StatCard label="Inactive experts" value={mentors.inactive} />
        <StatCard
          label="Pending tags"
          value={tags.pending}
          variant={tags.pending > 0 ? 'warning' : 'default'}
        />
      </div>

      <Card size="sm">
        <CardHeader>
          <CardTitle className="text-sm font-semibold">Recent bookings</CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          {recentBookings.length === 0 ? (
            <p className="text-sm text-muted-foreground">No bookings yet.</p>
          ) : (
            <ul className="flex flex-col gap-3">
              {recentBookings.map((booking) => (
                <li
                  key={booking.id}
                  className="flex flex-col gap-1 border-b border-border/60 pb-3 last:border-b-0 last:pb-0 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div className="min-w-0">
                    <p className="text-sm font-medium">
                      {booking.mentor_name}{' '}
                      <span className="font-normal text-muted-foreground">
                        ← {shortenAddress(booking.booker_address, 4)}
                      </span>
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {fmtWhen(booking.created_at)}
                      {booking.slot_time ? ` · ${fmtWhen(booking.slot_time)}` : ''}
                    </p>
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    {booking.tx_hash ? (
                      <a
                        href={`https://explorer.aboutcircles.com/tx/${booking.tx_hash}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="font-mono text-xs text-trust underline underline-offset-2"
                      >
                        tx {booking.tx_hash.slice(0, 8)}…
                      </a>
                    ) : (
                      <Badge variant="secondary" className="text-xs text-warning">
                        No tx
                      </Badge>
                    )}
                    {booking.has_trust ? (
                      <Badge variant="secondary" className="text-xs text-success">
                        TRUST ✓
                      </Badge>
                    ) : booking.tx_hash ? (
                      <Badge variant="secondary" className="text-xs">
                        TRUST pending
                      </Badge>
                    ) : null}
                  </div>
                </li>
              ))}
            </ul>
          )}
          <p className="mt-3 text-xs text-muted-foreground">
            Participant view: <Link href="/calls" className="text-primary underline underline-offset-2">/calls</Link>
          </p>
        </CardContent>
      </Card>
    </section>
  );
}
