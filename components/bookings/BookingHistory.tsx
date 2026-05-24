'use client';

import { useEffect, useState } from 'react';
import { useWallet } from '@/components/wallet/WalletProvider';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { TrustButton } from '@/components/bookings/TrustButton';
import { shortenAddress } from '@/lib/utils';
import type { BookingRow, ExpertRow } from '@/lib/db';

type EnrichedBooking = BookingRow & { expert: ExpertRow };

export function BookingHistory() {
  const { address, isConnected } = useWallet();
  const [bookings, setBookings] = useState<EnrichedBooking[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!address) return;

    // Fetch bookings then enrich each with the expert's data in parallel.
    // API note: /api/bookings?address= returns BookingRow[].
    // /api/experts/:id returns ExpertRow.
    const controller = new AbortController();

    Promise.resolve()
      .then(() => {
        setLoading(true);
        setError(null);
        return fetch(`/api/bookings?address=${encodeURIComponent(address)}`, {
          signal: controller.signal,
        });
      })
      .then((res) => {
        if (!res.ok) throw new Error('Failed to fetch bookings');
        return res.json() as Promise<BookingRow[]>;
      })
      .then((rows) =>
        Promise.all(
          rows.map((booking) =>
            fetch(`/api/experts/${booking.expert_id}`, { signal: controller.signal })
              .then((r) => {
                if (!r.ok) throw new Error(`Expert ${booking.expert_id} not found`);
                return r.json() as Promise<ExpertRow>;
              })
              .then((expert) => ({ ...booking, expert }))
          )
        )
      )
      .then((enriched) => setBookings(enriched))
      .catch((err: unknown) => {
        if (err instanceof Error && err.name === 'AbortError') return;
        setError(err instanceof Error ? err.message : 'Failed to load bookings.');
      })
      .finally(() => setLoading(false));

    return () => controller.abort();
  }, [address]);

  if (!isConnected) {
    return (
      <p className="text-sm text-muted-foreground">
        Connect your wallet to see your bookings.
      </p>
    );
  }

  if (loading) {
    return (
      <div className="flex flex-col gap-4">
        {[1, 2, 3].map((n) => (
          <Skeleton key={n} className="h-32 w-full rounded-xl" />
        ))}
      </div>
    );
  }

  if (error) {
    return <p className="text-sm text-destructive">{error}</p>;
  }

  if (bookings.length === 0) {
    return <p className="text-sm text-muted-foreground">You have no bookings yet.</p>;
  }

  return (
    <div className="flex flex-col gap-4">
      {bookings.map((booking) => {
        const { expert } = booking;
        const dateLabel = new Date(booking.created_at).toLocaleDateString(undefined, {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
        });

        return (
          <Card key={booking.id}>
            <CardHeader>
              <CardTitle className="text-base font-semibold">{expert.name}</CardTitle>
              {expert.skills.length > 0 && (
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {expert.skills.map((skill) => (
                    <Badge key={skill} variant="secondary">
                      {skill}
                    </Badge>
                  ))}
                </div>
              )}
            </CardHeader>

            <CardContent className="flex flex-col gap-1.5 text-sm text-muted-foreground">
              <span>{dateLabel}</span>
              {booking.tx_hash && (
                <a
                  href={`https://explorer.aboutcircles.com/tx/${booking.tx_hash}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-mono text-xs text-trust underline-offset-4 hover:underline"
                >
                  {shortenAddress(booking.tx_hash, 6)}
                </a>
              )}
            </CardContent>

            <CardFooter>
              <TrustButton
                expertAddress={expert.circles_address}
                expertName={expert.name}
                expertSkills={expert.skills}
                expertId={expert.id}
                bookingId={booking.id}
              />
            </CardFooter>
          </Card>
        );
      })}
    </div>
  );
}
