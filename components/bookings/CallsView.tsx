'use client';

import { useEffect, useState } from 'react';
import { useWallet } from '@/components/wallet/WalletProvider';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyTitle,
} from '@/components/ui/empty';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { TrustButton } from '@/components/bookings/TrustButton';
import { StatusAlert } from '@/components/ui-patterns/StatusAlert';
import { shortenAddress } from '@/lib/utils';
import { UI_COPY } from '@/lib/ui-copy';
import type { BookingRow, MentorRow } from '@/lib/db';

type EnrichedBooking = BookingRow & { mentor: MentorRow };
type ReceivedBooking = BookingRow & { mentor_name: string };
type EnrichedReceivedBooking = ReceivedBooking & { booker_name: string | null; booker_avatar: string | null };

function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

export function CallsView() {
  const { address, isConnected } = useWallet();
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
            } catch {
              /* ignore */
            }
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
      <Tabs defaultValue="emitted">
        <TabsList className="w-full">
          <TabsTrigger value="emitted" className="min-h-11 flex-1">
            {UI_COPY.calls.emitted}
          </TabsTrigger>
          <TabsTrigger value="received" className="min-h-11 flex-1">
            {UI_COPY.calls.received}
          </TabsTrigger>
        </TabsList>

        {loading && (
          <div className="mt-4 flex flex-col gap-4">
            {[1, 2].map((n) => (
              <Skeleton key={n} className="h-32 w-full rounded-xl" />
            ))}
          </div>
        )}

        {error && (
          <div className="mt-4">
            <StatusAlert variant="error" title="Could not load calls" description={error} />
          </div>
        )}

        {!loading && !error && (
          <>
            <TabsContent value="emitted" className="mt-4">
              <CallsEmittedList bookings={emitted} />
            </TabsContent>
            <TabsContent value="received" className="mt-4">
              <CallsReceivedList bookings={received} />
            </TabsContent>
          </>
        )}
      </Tabs>
    </div>
  );
}

function CallsEmittedList({ bookings }: { bookings: EnrichedBooking[] }) {
  if (bookings.length === 0) {
    return (
      <Empty>
        <EmptyHeader>
          <EmptyTitle>No calls yet</EmptyTitle>
          <EmptyDescription>{UI_COPY.calls.emptyEmitted}</EmptyDescription>
        </EmptyHeader>
      </Empty>
    );
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
                  className="font-mono text-xs text-trust underline-offset-4 hover:underline"
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
                mentorId={mentor.id}
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
      <Empty>
        <EmptyHeader>
          <EmptyTitle>No incoming bookings</EmptyTitle>
          <EmptyDescription>{UI_COPY.calls.emptyReceived}</EmptyDescription>
        </EmptyHeader>
      </Empty>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      {bookings.map((booking) => (
        <Card key={booking.id}>
          <CardHeader>
            <div className="flex items-center gap-3">
              <Avatar className="size-10 shrink-0">
                {booking.booker_avatar ? (
                  <AvatarImage src={booking.booker_avatar} alt={booking.booker_name ?? ''} />
                ) : null}
                <AvatarFallback>{(booking.booker_name ?? '?').charAt(0)}</AvatarFallback>
              </Avatar>
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
                className="font-mono text-xs text-trust underline-offset-4 hover:underline"
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
