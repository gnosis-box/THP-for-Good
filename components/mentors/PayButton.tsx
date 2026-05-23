'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Button, buttonVariants } from '@/components/ui/button';
import { Spinner } from '@/components/ui/spinner';
import { BookingSuccessDialog } from '@/components/booking/BookingSuccessDialog';
import { PaymentSummary } from '@/components/booking/PaymentSummary';
import { TrustPathPanel } from '@/components/booking/TrustPathPanel';
import { StatusAlert } from '@/components/ui-patterns/StatusAlert';
import { useToast } from '@/components/ui/toast';
import { useWallet } from '@/components/wallet/WalletProvider';
import { useCrcBalance } from '@/hooks/use-crc-balance';
import { useTrustEligibleBalance } from '@/hooks/use-trust-eligible-balance';
import {
  buildSplitPayTransactions,
  clampMentorShare,
  splitLegCrc,
  type MentorSharePercent,
} from '@/lib/crc-pay';
import { mapPayError } from '@/lib/pay-copy';
import { trackUmamiEvent } from '@/lib/analytics-umami';
import { UI_COPY } from '@/lib/ui-copy';
import { cn } from '@/lib/utils';
import type { MentorRow } from '@/lib/db';

type PayState =
  | { kind: 'idle' }
  | { kind: 'loading' }
  | {
      kind: 'success';
      hash: string;
      slotTime: string;
      calendarEventUrl: string | null;
    }
  | { kind: 'error' };

function fmtSlot(iso: string) {
  return new Intl.DateTimeFormat(undefined, {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(iso));
}

type Props = {
  mentor: MentorRow;
  selectedSlot: string | null;
  email: string;
  onEmailChange: (v: string) => void;
  onSuccess?: () => void;
  showEmail?: boolean;
  compact?: boolean;
};

export function PayButton({
  mentor,
  selectedSlot,
  email,
  onEmailChange,
  onSuccess,
  showEmail = true,
  compact = false,
}: Props) {
  const { address, isConnected } = useWallet();
  const { showToast } = useToast();
  const balance = useCrcBalance(address);
  const sharePercent = clampMentorShare(mentor.mentor_share_percent ?? 20) as MentorSharePercent;
  const { expertLegCrc, treasuryLegCrc } = splitLegCrc(mentor.price_crc, sharePercent);
  const trustEligible = useTrustEligibleBalance(
    address,
    mentor.circles_address,
    mentor.price_crc,
    sharePercent,
  );
  const [bookerName, setBookerName] = useState<string | null>(null);
  const [state, setState] = useState<PayState>({ kind: 'idle' });
  const [successDialogOpen, setSuccessDialogOpen] = useState(false);

  useEffect(() => {
    if (!address) return;
    (async () => {
      try {
        const { Sdk } = await import('@aboutcircles/sdk');
        const sdk = new Sdk();
        const view = await sdk.rpc.profile.getProfileView(address as `0x${string}`);
        if (view?.avatarInfo?.cidV0) {
          const profile = await sdk.rpc.profile.getProfileByCid(view.avatarInfo.cidV0);
          if (profile?.name) setBookerName(profile.name);
        }
      } catch {
        // fall back to address
      }
    })();
  }, [address]);

  const isSelf = !!address && address.toLowerCase() === mentor.circles_address.toLowerCase();
  const insufficientBalance =
    balance.status === 'ready' && balance.balance < mentor.price_crc;
  const isValidEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
  const canPay =
    isConnected &&
    !!selectedSlot &&
    isValidEmail &&
    !isSelf &&
    state.kind !== 'loading' &&
    balance.status === 'ready' &&
    !insufficientBalance;

  async function handlePay() {
    if (!selectedSlot || !address) return;
    setState({ kind: 'loading' });

    try {
      const slotRes = await fetch(`/api/mentors/${mentor.id}/availability`);
      if (slotRes.ok) {
        const openSlots = (await slotRes.json()) as string[];
        if (Array.isArray(openSlots) && !openSlots.includes(selectedSlot)) {
          throw new Error('This time slot is no longer available. Please pick another one.');
        }
      }

      const { sendTransactions } = await import('@aboutcircles/miniapp-sdk');
      const txs = await buildSplitPayTransactions(
        address as `0x${string}`,
        mentor.circles_address as `0x${string}`,
        mentor.price_crc,
        sharePercent,
      );
      const hashes = await sendTransactions(txs);
      const txHash = hashes[0];

      const bookingRes = await fetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mentor_id: mentor.id,
          booker_address: address,
          tx_hash: txHash,
          slot_time: selectedSlot,
          attendee_email: email.trim(),
          attendee_name: bookerName ?? address,
        }),
      });

      if (!bookingRes.ok) {
        const detail = (await bookingRes.json().catch(() => null)) as { error?: string } | null;
        throw new Error(
          detail?.error ??
            'Payment succeeded but booking could not be saved. Check My Calls or contact support.',
        );
      }

      const booking = (await bookingRes.json()) as {
        id: number;
        calendar_event_url?: string | null;
      };

      setState({
        kind: 'success',
        hash: txHash,
        slotTime: selectedSlot,
        calendarEventUrl: booking.calendar_event_url ?? null,
      });
      setSuccessDialogOpen(true);
      trackUmamiEvent('pay_success', { mentor_id: mentor.id });
      onSuccess?.();
    } catch (err) {
      const message = mapPayError(err);
      setState({ kind: 'error' });
      showToast(message, 'error');
    }
  }

  const success = state.kind === 'success' ? state : null;
  const calUrl = success?.calendarEventUrl ?? mentor.calendar_link ?? null;

  return (
    <>
      {success ? (
        <BookingSuccessDialog
          open={successDialogOpen}
          onOpenChange={setSuccessDialogOpen}
          mentorName={mentor.name}
          slotLabel={fmtSlot(success.slotTime)}
          txHash={success.hash}
          calendarEventUrl={success.calendarEventUrl}
          calendarLink={mentor.calendar_link}
          calInviteSent={!!mentor.cal_event_type_id}
        />
      ) : null}

      {success && !successDialogOpen ? (
        <StatusAlert
          variant="success"
          title="Booking confirmed!"
          description={
            <div className="flex flex-col gap-3">
              <p>{fmtSlot(success.slotTime)}</p>
              <p>
                {mentor.cal_event_type_id
                  ? 'A calendar invite has been sent to your email.'
                  : 'Complete scheduling using the expert calendar link below.'}
              </p>
              <p className="break-all font-mono text-xs">
                Tx:{' '}
                <a
                  href={`https://explorer.aboutcircles.com/tx/${success.hash}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-trust underline underline-offset-2"
                >
                  {success.hash.slice(0, 10)}…{success.hash.slice(-8)}
                </a>
              </p>
              <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap">
                {success.calendarEventUrl ? (
                  <Button
                    variant="default"
                    size="sm"
                    className="min-h-11"
                    onClick={() =>
                      window.open(success.calendarEventUrl!, '_blank', 'noopener,noreferrer')
                    }
                  >
                    {UI_COPY.booking.openCalBooking}
                  </Button>
                ) : null}
                {mentor.calendar_link ? (
                  <Button
                    variant="outline"
                    size="sm"
                    className="min-h-11"
                    onClick={() => window.open(mentor.calendar_link, '_blank', 'noopener,noreferrer')}
                  >
                    {UI_COPY.booking.openExpertCalendar}
                  </Button>
                ) : null}
                <Link
                  href="/calls?tab=emitted"
                  className={cn(buttonVariants({ variant: 'outline', size: 'sm' }), 'min-h-11')}
                >
                  {UI_COPY.booking.viewMyCalls}
                </Link>
              </div>
              {calUrl ? null : (
                <p className="text-xs text-muted-foreground">
                  Open your expert&apos;s calendar from My Calls once the invite arrives.
                </p>
              )}
              <p className="text-sm text-muted-foreground">
                {UI_COPY.booking.successTrustReminder(mentor.name)}
              </p>
            </div>
          }
        />
      ) : success ? null : (
        <div className="flex flex-col gap-3">
          {!compact && (
            <TrustPathPanel
              trustEligible={trustEligible}
              expertLegCrc={expertLegCrc}
              treasuryLegCrc={treasuryLegCrc}
              mentorName={mentor.name}
              priceCrc={mentor.price_crc}
            />
          )}
          <PaymentSummary
            balance={balance}
            sharePercent={sharePercent}
            email={email}
            onEmailChange={onEmailChange}
            showEmail={showEmail}
          />
          {balance.status === 'not-registered' && (
            <StatusAlert
              variant="warning"
              title="Wallet not registered"
              description="Your wallet is not a registered Circles avatar. Open the app in the Circles playground to pay with CRC."
            />
          )}
          {insufficientBalance && (
            <p className="text-sm text-destructive">
              You need at least {mentor.price_crc} CRC to book this call.
            </p>
          )}
          <Button disabled={!canPay} onClick={handlePay} size="lg" className="min-h-11 w-full">
            {state.kind === 'loading' ? (
              <>
                <Spinner className="mr-2" />
                Processing…
              </>
            ) : (
              `Pay ${mentor.price_crc} CRC to book`
            )}
          </Button>
          {!selectedSlot && (
            <p className="text-center text-xs text-muted-foreground">
              {UI_COPY.booking.selectSlotFirst}
            </p>
          )}
          {isSelf && (
            <p className="text-center text-xs text-muted-foreground">
              You can&apos;t book your own session.
            </p>
          )}
          {!isConnected && (
            <p className="text-center text-xs text-muted-foreground">
              Connect your wallet to book a session.
            </p>
          )}
        </div>
      )}
    </>
  );
}
