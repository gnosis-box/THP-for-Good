'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useWallet } from '@/components/wallet/WalletProvider';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { ExpertLanguageTags, ExpertSkillTags } from '@/components/ui-patterns/ExpertMeta';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyTitle,
} from '@/components/ui/empty';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { TrustButton } from '@/components/bookings/TrustButton';
import { MotionEmpty } from '@/components/motion/motion-empty';
import { StatusAlert } from '@/components/ui-patterns/StatusAlert';
import { usePrefersReducedMotion } from '@/hooks/use-prefers-reduced-motion';
import { motionClass, motionStaggerStyle } from '@/lib/motion';
import { cn, shortenAddress } from '@/lib/utils';
import { UI_COPY } from '@/lib/ui-copy';
import { getDisplayCallLanguages } from '@/lib/languages';
import type { BookingRow, ExpertRow } from '@/lib/db';

type EnrichedBooking = BookingRow & { expert: ExpertRow };
type ReceivedBooking = BookingRow & { expert_name: string };
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
  const router = useRouter();
  const searchParams = useSearchParams();
  const activeTab = searchParams.get('tab') === 'received' ? 'received' : 'emitted';
  const [emitted, setEmitted] = useState<EnrichedBooking[]>([]);
  const [received, setReceived] = useState<EnrichedReceivedBooking[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [skeletonVisible, setSkeletonVisible] = useState(true);
  const reducedMotion = usePrefersReducedMotion();

  useEffect(() => {
    if (loading) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setSkeletonVisible(true);
      return;
    }
    const t = window.setTimeout(() => setSkeletonVisible(false), 180);
    return () => window.clearTimeout(t);
  }, [loading]);

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
        const emittedRows = (await emittedRes.json()) as (BookingRow & { expert_name?: string })[];
        const receivedRows = (await receivedRes.json()) as ReceivedBooking[];

        const enriched = await Promise.all(
          emittedRows.map(async (booking) => {
            const r = await fetch(`/api/experts/${booking.expert_id}`, { signal: controller.signal });
            if (!r.ok) throw new Error(`Expert ${booking.expert_id} not found`);
            const expert = (await r.json()) as ExpertRow;
            return { ...booking, expert };
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
      <Tabs
        value={activeTab}
        onValueChange={(value) => {
          router.replace(value === 'received' ? '/calls?tab=received' : '/calls?tab=emitted', {
            scroll: false,
          });
        }}
      >
        <TabsList className="w-full">
          <TabsTrigger value="emitted" className="min-h-11 flex-1">
            {UI_COPY.calls.emitted}
          </TabsTrigger>
          <TabsTrigger value="received" className="min-h-11 flex-1">
            {UI_COPY.calls.received}
          </TabsTrigger>
        </TabsList>

        {(loading || skeletonVisible) && (
          <div
            className={cn(
              'mt-4 flex flex-col gap-4 transition-opacity duration-200',
              !loading && 'pointer-events-none opacity-0',
            )}
          >
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
            <TabsContent
              value="emitted"
              className={cn('mt-4', motionClass('', 'motion-tab-panel-in', reducedMotion))}
            >
              <CallsEmittedList bookings={emitted} />
            </TabsContent>
            <TabsContent
              value="received"
              className={cn('mt-4', motionClass('', 'motion-tab-panel-in', reducedMotion))}
            >
              <CallsReceivedList bookings={received} />
            </TabsContent>
          </>
        )}
      </Tabs>
    </div>
  );
}

function CallsEmittedList({ bookings }: { bookings: EnrichedBooking[] }) {
  const reducedMotion = usePrefersReducedMotion();

  if (bookings.length === 0) {
    return (
      <MotionEmpty>
        <Empty>
          <EmptyHeader>
            <EmptyTitle>No calls yet</EmptyTitle>
            <EmptyDescription>{UI_COPY.calls.emptyEmitted}</EmptyDescription>
          </EmptyHeader>
        </Empty>
      </MotionEmpty>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      {bookings.map((booking, index) => {
        const { expert } = booking;
        return (
          <Card
            key={booking.id}
            className={motionClass('', 'motion-list-item-in', reducedMotion)}
            style={motionStaggerStyle(index, reducedMotion, 8)}
          >
            <CardHeader className="gap-2">
              <CardTitle className="text-base font-semibold">{expert.name}</CardTitle>
              <ExpertLanguageTags
                languages={getDisplayCallLanguages(expert)}
                variant="card"
                maxVisible={2}
              />
              <ExpertSkillTags skills={expert.skills} maxVisible={2} />
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
              {expert.calendar_link && (
                <a
                  href={expert.calendar_link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-foreground underline-offset-4 hover:underline"
                >
                  Open calendar link
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

function CallsReceivedList({ bookings }: { bookings: EnrichedReceivedBooking[] }) {
  const reducedMotion = usePrefersReducedMotion();

  if (bookings.length === 0) {
    return (
      <MotionEmpty>
        <Empty>
          <EmptyHeader>
            <EmptyTitle>No incoming bookings</EmptyTitle>
            <EmptyDescription>{UI_COPY.calls.emptyReceived}</EmptyDescription>
          </EmptyHeader>
        </Empty>
      </MotionEmpty>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      {bookings.map((booking, index) => (
        <Card
          key={booking.id}
          className={motionClass('', 'motion-list-item-in', reducedMotion)}
          style={motionStaggerStyle(index, reducedMotion, 8)}
        >
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
            <span>
              {UI_COPY.calls.callDomainLabel}:{' '}
              <span className="text-foreground">
                {booking.call_domain?.trim() || UI_COPY.calls.callNotProvided}
              </span>
            </span>
            <span>
              {UI_COPY.calls.callContextLabel}:{' '}
              <span className="text-foreground whitespace-pre-wrap">
                {booking.call_context?.trim() || UI_COPY.calls.callNotProvided}
              </span>
            </span>
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
