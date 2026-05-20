'use client';

import { useMemo, useState } from 'react';

import { BookingSuccess } from '@/components/mentors/BookingSuccess';
import { SlotPicker } from '@/components/mentors/SlotPicker';
import { OpenInCirclesHint } from '@/components/wallet/OpenInCirclesHint';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { useCrcBalance } from '@/hooks/use-crc-balance';
import { useMentorCirclesOverlay } from '@/hooks/use-mentor-circles-overlay';
import { useWallet } from '@/hooks/use-wallet';
import { addBooking, getBookings, isSlotBooked } from '@/lib/bookings-storage';
import { BOOKING_PRICE_CRC, FOUNDATION_ADDRESS } from '@/lib/config';
import { buildCrcPaymentTransactions } from '@/lib/crc-transfer';
import type { Booking, Mentor } from '@/lib/types';

type MentorDetailProps = {
  mentor: Mentor;
};

export function MentorDetail({ mentor }: MentorDetailProps) {
  const { address, isConnected, isMiniappHost } = useWallet();
  const balanceState = useCrcBalance(address);
  const { overlay, loading } = useMentorCirclesOverlay(mentor.walletAddress);
  const [selectedSlotId, setSelectedSlotId] = useState<string | null>(null);
  const [paying, setPaying] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successBooking, setSuccessBooking] = useState<Booking | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  const bookedSlotIds = useMemo(() => {
    void refreshKey;
    return new Set(
      getBookings()
        .filter((booking) => booking.mentorId === mentor.id)
        .map((booking) => booking.slotId),
    );
  }, [mentor.id, refreshKey]);

  const selectedSlot = mentor.slots.find((slot) => slot.id === selectedSlotId);
  const slotAlreadyBooked = selectedSlotId ? isSlotBooked(mentor.id, selectedSlotId) : false;

  const insufficientBalance =
    balanceState.status === 'ready' && balanceState.balance < BOOKING_PRICE_CRC;

  const canPay =
    isConnected &&
    Boolean(selectedSlotId) &&
    !slotAlreadyBooked &&
    !paying &&
    !successBooking &&
    balanceState.status === 'ready' &&
    !insufficientBalance;

  async function handlePay() {
    if (!address || !selectedSlotId || !selectedSlot) return;

    setPaying(true);
    setError(null);

    try {
      const txs = await buildCrcPaymentTransactions(
        address as `0x${string}`,
        FOUNDATION_ADDRESS,
        BOOKING_PRICE_CRC,
      );

      const { sendTransactions } = await import('@aboutcircles/miniapp-sdk');
      const hashes = await sendTransactions(txs);
      const txHash = (hashes[0] ?? '') as `0x${string}`;

      if (!txHash) {
        throw new Error('Payment succeeded but no transaction hash was returned.');
      }

      const booking: Booking = {
        id: crypto.randomUUID(),
        mentorId: mentor.id,
        slotId: selectedSlotId,
        studentAddress: address as `0x${string}`,
        amountCrc: String(BOOKING_PRICE_CRC),
        txHash,
        paidAt: new Date().toISOString(),
        status: 'booked',
      };

      addBooking(booking);
      setSuccessBooking(booking);
      setRefreshKey((value) => value + 1);

      void fetch('/api/notify-booking', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mentorId: mentor.id,
          mentorName: mentor.name,
          slotLabel: selectedSlot.label,
          studentAddress: address,
          txHash,
          notifyEmail: mentor.notifyEmail,
          notifyWebhook: mentor.notifyWebhook,
        }),
      }).catch(() => {
        if (mentor.notifyEmail) {
          const subject = encodeURIComponent(`THP booking: ${selectedSlot.label}`);
          const body = encodeURIComponent(
            `New paid booking\nMentor: ${mentor.name}\nSlot: ${selectedSlot.label}\nStudent: ${address}\nTx: ${txHash}`,
          );
          window.open(`mailto:${mentor.notifyEmail}?subject=${subject}&body=${body}`);
        }
      });
    } catch (payError) {
      setError(payError instanceof Error ? payError.message : 'Payment failed');
    } finally {
      setPaying(false);
    }
  }

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col gap-6">
      <Card>
        <CardHeader className="flex flex-row items-start gap-4 space-y-0">
          {loading ? (
            <Skeleton className="size-16 shrink-0 rounded-full" />
          ) : overlay?.imageUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={overlay.imageUrl}
              alt=""
              className="size-16 shrink-0 rounded-full object-cover"
            />
          ) : (
            <div className="flex size-16 shrink-0 items-center justify-center rounded-full bg-muted text-lg font-semibold">
              {mentor.name.slice(0, 1)}
            </div>
          )}
          <div className="min-w-0 flex-1 space-y-2">
            <CardTitle className="text-2xl">{mentor.name}</CardTitle>
            <CardDescription>{mentor.bio}</CardDescription>
            <div className="flex flex-wrap gap-1.5">
              {mentor.tags.map((tag) => (
                <Badge key={tag} variant="secondary">
                  {tag}
                </Badge>
              ))}
            </div>
            {overlay?.trustedByCount !== undefined ? (
              <p className="text-xs text-muted-foreground">
                Trusted by {overlay.trustedByCount} · Trusting {overlay.trustsCount ?? 0}
              </p>
            ) : null}
          </div>
        </CardHeader>
      </Card>

      {!isMiniappHost ? <OpenInCirclesHint /> : null}

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Pick a slot</CardTitle>
          <CardDescription>{BOOKING_PRICE_CRC} CRC per call — paid to THP for Good</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <SlotPicker
            slots={mentor.slots}
            bookedSlotIds={bookedSlotIds}
            selectedSlotId={selectedSlotId}
            onSelect={setSelectedSlotId}
          />

          {balanceState.status === 'ready' ? (
            <p className="text-sm text-muted-foreground">
              Your balance: <strong>{balanceState.formatted} CRC</strong>
            </p>
          ) : null}

          {balanceState.status === 'not-registered' ? (
            <p className="text-sm text-amber-700">
              Your wallet is not a registered Circles avatar. You may still attempt payment if the
              host allows it.
            </p>
          ) : null}

          {insufficientBalance ? (
            <p className="text-sm text-destructive">
              You need at least {BOOKING_PRICE_CRC} CRC to book this call.
            </p>
          ) : null}

          {!isConnected ? (
            <p className="text-sm text-muted-foreground">Connect via Circles to pay.</p>
          ) : null}

          <Button
            type="button"
            className="w-full"
            disabled={!canPay}
            onClick={() => void handlePay()}
          >
            {paying ? 'Processing…' : `PAY ${BOOKING_PRICE_CRC} CRC`}
          </Button>

          {error ? <p className="text-sm text-destructive">{error}</p> : null}
        </CardContent>
      </Card>

      {successBooking && selectedSlot ? (
        <BookingSuccess
          booking={successBooking}
          mentorName={mentor.name}
          slotLabel={selectedSlot.label}
        />
      ) : null}
    </div>
  );
}
