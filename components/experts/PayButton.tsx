'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button, buttonVariants } from '@/components/ui/button';
import { Spinner } from '@/components/ui/spinner';
import { BookingSuccessDialog } from '@/components/booking/BookingSuccessDialog';
import { PaymentSummary } from '@/components/booking/PaymentSummary';
import { TrustPathPanel } from '@/components/booking/TrustPathPanel';
import { StatusAlert } from '@/components/ui-patterns/StatusAlert';
import { useToast } from '@/components/ui/toast';
import { useTreasuryPendingTx } from '@/contexts/TreasuryPendingTxContext';
import { useWallet } from '@/components/wallet/WalletProvider';
import { useCrcBalance } from '@/hooks/use-crc-balance';
import { useTrustEligibleBalance } from '@/hooks/use-trust-eligible-balance';
import {
  buildSplitPayTransactions,
  clampExpertShare,
  splitLegCrc,
  type ExpertSharePercent,
} from '@/lib/crc-pay';
import { mapPayError } from '@/lib/pay-copy';
import { postBookingWithRetry } from '@/lib/booking-client';
import { isValidBookingContext, isValidBookingDomain, normalizeBookingText } from '@/lib/booking-context';
import { trackUmamiEvent } from '@/lib/analytics-umami';
import {
  aboutTreasuryPayPath,
  storeTreasuryPayCelebration,
} from '@/lib/treasury-pay-celebration';
import { UI_COPY } from '@/lib/ui-copy';
import { cn } from '@/lib/utils';
import type { ExpertRow } from '@/lib/db';

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
  expert: ExpertRow;
  selectedSlot: string | null;
  email: string;
  onEmailChange: (v: string) => void;
  callDomain: string;
  onCallDomainChange: (v: string) => void;
  callContext: string;
  onCallContextChange: (v: string) => void;
  onSuccess?: () => void;
  showEmail?: boolean;
  compact?: boolean;
};

export function PayButton({
  expert,
  selectedSlot,
  email,
  onEmailChange,
  callDomain,
  onCallDomainChange,
  callContext,
  onCallContextChange,
  onSuccess,
  showEmail = true,
  compact = false,
}: Props) {
  const router = useRouter();
  const { address, isConnected } = useWallet();
  const { showToast } = useToast();
  const { registerPending } = useTreasuryPendingTx();
  const payButtonRef = useRef<HTMLButtonElement>(null);
  const balance = useCrcBalance(address);
  const sharePercent = clampExpertShare(expert.expert_share_percent ?? 20) as ExpertSharePercent;
  const { expertLegCrc, treasuryLegCrc } = splitLegCrc(expert.price_crc, sharePercent);
  const trustEligible = useTrustEligibleBalance(
    address,
    expert.circles_address,
    expert.price_crc,
    sharePercent,
  );
  const [bookerName, setBookerName] = useState<string | null>(null);
  const [state, setState] = useState<PayState>({ kind: 'idle' });
  const [successDialogOpen, setSuccessDialogOpen] = useState(false);
  const [showValidationErrors, setShowValidationErrors] = useState(false);

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

  const isSelf = !!address && address.toLowerCase() === expert.circles_address.toLowerCase();
  const insufficientBalance =
    balance.status === 'ready' && balance.balance < expert.price_crc;
  const isValidEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
  const normalizedDomain = normalizeBookingText(callDomain);
  const normalizedContext = normalizeBookingText(callContext);
  const hasValidDomain = isValidBookingDomain(normalizedDomain);
  const hasValidContext = isValidBookingContext(normalizedContext);
  const canPay =
    isConnected &&
    !!selectedSlot &&
    isValidEmail &&
    hasValidDomain &&
    hasValidContext &&
    !isSelf &&
    state.kind !== 'loading' &&
    balance.status === 'ready' &&
    !insufficientBalance;

  async function handlePay() {
    if (!selectedSlot || !address) return;
    if (!isValidEmail || !hasValidDomain || !hasValidContext) {
      setShowValidationErrors(true);
      return;
    }
    setShowValidationErrors(false);
    setState({ kind: 'loading' });

    try {
      const slotRes = await fetch(`/api/experts/${expert.id}/availability`);
      if (slotRes.ok) {
        const openSlots = (await slotRes.json()) as string[];
        if (Array.isArray(openSlots) && !openSlots.includes(selectedSlot)) {
          throw new Error('This time slot is no longer available. Please pick another one.');
        }
      }

      const { sendTransactions } = await import('@aboutcircles/miniapp-sdk');
      const txs = await buildSplitPayTransactions(
        address as `0x${string}`,
        expert.circles_address as `0x${string}`,
        expert.price_crc,
        sharePercent,
      );
      const hashes = await sendTransactions(txs);
      const txHash = hashes[0];

      const booking = await postBookingWithRetry({
        expert_id: expert.id,
        booker_address: address,
        tx_hash: txHash,
        slot_time: selectedSlot,
        call_domain: normalizedDomain,
        call_context: normalizedContext,
        attendee_email: email.trim(),
        attendee_name: bookerName ?? address,
      });

      trackUmamiEvent('pay_success', { expert_id: expert.id });
      onSuccess?.();

      if (treasuryLegCrc > 0) {
        const rect = payButtonRef.current?.getBoundingClientRect();
        registerPending({
          txHash,
          nominalCrc: treasuryLegCrc,
          source: 'pay',
          spawnRect: rect
            ? { x: rect.left, y: rect.top, width: rect.width, height: rect.height }
            : undefined,
        });
        storeTreasuryPayCelebration(txHash, treasuryLegCrc);
        setState({ kind: 'idle' });
        router.push(aboutTreasuryPayPath(txHash));
        return;
      }

      setState({
        kind: 'success',
        hash: txHash,
        slotTime: selectedSlot,
        calendarEventUrl: booking.calendar_event_url ?? null,
      });
      setSuccessDialogOpen(true);
    } catch (err) {
      const message = mapPayError(err);
      setState({ kind: 'error' });
      showToast(message, 'error');
    }
  }

  const success = state.kind === 'success' ? state : null;
  const calUrl = success?.calendarEventUrl ?? expert.calendar_link ?? null;

  return (
    <>
      {success ? (
        <BookingSuccessDialog
          open={successDialogOpen}
          onOpenChange={setSuccessDialogOpen}
          expertName={expert.name}
          slotLabel={fmtSlot(success.slotTime)}
          txHash={success.hash}
          calendarEventUrl={success.calendarEventUrl}
          calendarLink={expert.calendar_link}
          calInviteSent={!!expert.cal_event_type_id}
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
                {expert.cal_event_type_id
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
                {expert.calendar_link ? (
                  <Button
                    variant="outline"
                    size="sm"
                    className="min-h-11"
                    onClick={() => window.open(expert.calendar_link, '_blank', 'noopener,noreferrer')}
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
                {UI_COPY.booking.successTrustReminder(expert.name)}
              </p>
            </div>
          }
        />
      ) : success ? null : (
        <div className="flex flex-col gap-3">
          {!compact && (
            <div className="pay-drawer-section">
              <TrustPathPanel
                trustEligible={trustEligible}
                expertLegCrc={expertLegCrc}
                treasuryLegCrc={treasuryLegCrc}
                expertName={expert.name}
                priceCrc={expert.price_crc}
              />
            </div>
          )}
          <div className="pay-drawer-section">
            <PaymentSummary
              balance={balance}
              sharePercent={sharePercent}
              email={email}
              onEmailChange={onEmailChange}
              callDomain={callDomain}
              onCallDomainChange={onCallDomainChange}
              callContext={callContext}
              onCallContextChange={onCallContextChange}
              showValidation={showValidationErrors}
              showEmail={showEmail}
            />
          </div>
          {balance.status === 'not-registered' && (
            <div className="pay-drawer-section">
              <StatusAlert
                variant="warning"
                title="Wallet not registered"
                description="Your wallet is not a registered Circles avatar. Open the app in the Circles playground to pay with CRC."
                className="motion-alert-in"
              />
            </div>
          )}
          {insufficientBalance && (
            <p className="pay-drawer-section text-sm text-destructive">
              You need at least {expert.price_crc} CRC to book this call.
            </p>
          )}
          <div className="pay-drawer-section">
            <Button
              ref={payButtonRef}
              data-treasury-pay-btn
              disabled={!canPay}
              onClick={handlePay}
              size="lg"
              className="relative min-h-11 w-full overflow-hidden"
            >
              <span
                className={cn(
                  'inline-flex items-center justify-center transition-opacity duration-[var(--motion-fast)]',
                  state.kind === 'loading' ? 'opacity-0' : 'opacity-100',
                )}
              >
                {`Pay ${expert.price_crc} CRC to book`}
              </span>
              {state.kind === 'loading' ? (
                <span className="absolute inset-0 inline-flex items-center justify-center gap-2">
                  <Spinner />
                  Processing…
                </span>
              ) : null}
            </Button>
          </div>
          {!selectedSlot && (
            <p className="text-center text-xs text-muted-foreground">
              {UI_COPY.booking.selectSlotFirst}
            </p>
          )}
          {selectedSlot && (!hasValidDomain || !hasValidContext) && (
            <p className="text-center text-xs text-muted-foreground">
              {UI_COPY.booking.completeDetailsFirst}
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
