'use client';

import { useEffect, useState } from 'react';
import { useWallet } from '@/components/wallet/WalletProvider';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { TrustButton } from '@/components/bookings/TrustButton';
import { shortenAddress } from '@/lib/utils';
import type { BookingRow, MentorRow } from '@/lib/db';
import { cn } from '@/lib/utils';

type EnrichedBooking = BookingRow & { mentor: MentorRow };
type ReceivedBooking = BookingRow & { mentor_name: string };
type EnrichedReceivedBooking = ReceivedBooking & { booker_name: string | null; booker_avatar: string | null };

type Tab = 'emitted' | 'received';

function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

export function CallsView() {
  const { address, isConnected } = useWallet();
  const [tab, setTab] = useState<Tab>('emitted');
  const [emitted, setEmitted] = useState<EnrichedBooking[]>([]);
  const [received, setReceived] = useState<EnrichedReceivedBooking[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!address) return;
    const controller = new AbortController();
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setLoading(true);
    setError(null);

    Promise.all([
      fetch(`/api/bookings?address=${encodeURIComponent(address)}`, { signal: controller.signal }),
      fetch(`/api/bookings?provider_address=${encodeURIComponent(address)}`, {
        signal: controller.signal,
      }),
    ])
      .then(async ([emittedRes, receivedRes]) => {
        if (!emittedRes.ok) throw new Error('Failed to fetch emitted calls');
        if (!receivedRes.ok) throw new Error('Failed to fetch received calls');
        const emittedRows = (await emittedRes.json()) as (BookingRow & { mentor_name?: string })[];
        const receivedRows = (await receivedRes.json()) as ReceivedBooking[];

        const enriched = await Promise.all(
          emittedRows.map(async (booking) => {
            const r = await fetch(`/api/mentors/${booking.mentor_id}`, { signal: controller.signal });
            if (!r.ok) throw new Error(`Mentor ${booking.mentor_id} not found`);
            const mentor = (await r.json()) as MentorRow;
            return { ...booking, mentor };
          }),
        );

        const { Sdk } = await import('@aboutcircles/sdk');
        const sdk = new Sdk();
        const enrichedReceived = await Promise.all(
          receivedRows.map(async (booking) => {
            try {
              const view = await sdk.rpc.profile.getProfileView(booking.booker_address as `0x${string}`);
              if (view?.avatarInfo?.cidV0) {
                const profile = await sdk.rpc.profile.getProfileByCid(view.avatarInfo.cidV0);
                return {
                  ...booking,
                  booker_name: profile?.name ?? null,
                  booker_avatar: profile?.previewImageUrl ?? profile?.imageUrl ?? null,
                };
              }
            } catch { /* ignore */ }
            return { ...booking, booker_name: null, booker_avatar: null };
          }),
        );

        setEmitted(enriched);
        setReceived(enrichedReceived);
      })
      .catch((err: unknown) => {
        if (err instanceof Error && err.name === 'AbortError') return;
        setError(err instanceof Error ? err.message : 'Failed to load calls.');
      })
      .finally(() => setLoading(false));

    return () => controller.abort();
  }, [address]);

  if (!isConnected) {
    return (
      <p className="text-sm text-muted-foreground">Connect your wallet to see your calls.</p>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex gap-2 border-b border-border">
        {(['emitted', 'received'] as const).map((key) => (
          <button
            key={key}
            type="button"
            onClick={() => setTab(key)}
            className={cn(
              'px-4 py-2 text-sm font-medium capitalize transition-colors border-b-2 -mb-px',
              tab === key
                ? 'border-primary text-foreground'
                : 'border-transparent text-muted-foreground hover:text-foreground',
            )}
          >
            {key === 'emitted' ? 'Emitted' : 'Received'}
          </button>
        ))}
      </div>

      {loading && (
        <div className="flex flex-col gap-4">
          {[1, 2].map((n) => (
            <Skeleton key={n} className="h-32 w-full rounded-xl" />
          ))}
        </div>
      )}

      {error && <p className="text-sm text-destructive">{error}</p>}

      {!loading && !error && tab === 'emitted' && (
        <CallsEmittedList bookings={emitted} />
      )}

      {!loading && !error && tab === 'received' && (
        <CallsReceivedList bookings={received} />
      )}
    </div>
  );
}

function CallsEmittedList({ bookings }: { bookings: EnrichedBooking[] }) {
  if (bookings.length === 0) {
    return <p className="text-sm text-muted-foreground">You have no emitted calls yet.</p>;
  }

  return (
    <div className="flex flex-col gap-4">
      {bookings.map((booking) => {
        const { mentor } = booking;
        return (
          <Card key={booking.id}>
            <CardHeader>
              <CardTitle className="text-base font-semibold">{mentor.name}</CardTitle>
              {mentor.skills.length > 0 && (
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {mentor.skills.map((skill) => (
                    <Badge key={skill} variant="secondary">
                      {skill}
                    </Badge>
                  ))}
                </div>
              )}
            </CardHeader>
            <CardContent className="flex flex-col gap-1.5 text-sm text-muted-foreground">
              <span>{fmtDate(booking.created_at)}</span>
              {booking.slot_time && (
                <span>
                  Slot:{' '}
                  {new Intl.DateTimeFormat(undefined, {
                    dateStyle: 'medium',
                    timeStyle: 'short',
                  }).format(new Date(booking.slot_time))}
                </span>
              )}
              {booking.tx_hash && (
                <a
                  href={`https://explorer.aboutcircles.com/tx/${booking.tx_hash}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-mono text-xs text-primary underline-offset-4 hover:underline"
                >
                  {shortenAddress(booking.tx_hash, 6)}
                </a>
              )}
              {mentor.calendar_link && (
                <a
                  href={mentor.calendar_link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-primary underline-offset-4 hover:underline"
                >
                  Open calendar link
                </a>
              )}
            </CardContent>
            <CardFooter>
              <TrustButton
                mentorAddress={mentor.circles_address}
                mentorName={mentor.name}
                mentorSkills={mentor.skills}
                bookingId={booking.id}
              />
            </CardFooter>
          </Card>
        );
      })}
    </div>
  );
}

function CallsReceivedList({ bookings }: { bookings: EnrichedReceivedBooking[] }) {
  if (bookings.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        No one has booked your expert profile yet.
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      {bookings.map((booking) => (
        <Card key={booking.id}>
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="size-10 rounded-full bg-muted overflow-hidden shrink-0 flex items-center justify-center">
                {booking.booker_avatar ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={booking.booker_avatar} alt={booking.booker_name ?? ''} className="size-full object-cover" />
                ) : (
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="size-5 text-muted-foreground">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" />
                  </svg>
                )}
              </div>
              <CardTitle className="text-base font-semibold">
                {booking.booker_name ?? shortenAddress(booking.booker_address, 6)}
              </CardTitle>
            </div>
          </CardHeader>
          <CardContent className="flex flex-col gap-1.5 text-sm text-muted-foreground">
            <span>{fmtDate(booking.created_at)}</span>
            {booking.slot_time && (
              <span>
                Slot:{' '}
                {new Intl.DateTimeFormat(undefined, {
                  dateStyle: 'medium',
                  timeStyle: 'short',
                }).format(new Date(booking.slot_time))}
              </span>
            )}
            {booking.tx_hash && (
              <a
                href={`https://explorer.aboutcircles.com/tx/${booking.tx_hash}`}
                target="_blank"
                rel="noopener noreferrer"
                className="font-mono text-xs text-primary underline-offset-4 hover:underline"
              >
                {shortenAddress(booking.tx_hash, 6)}
              </a>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
