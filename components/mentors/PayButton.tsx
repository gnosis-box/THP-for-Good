'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/toast';
import { useWallet } from '@/components/wallet/WalletProvider';
import { useCrcBalance } from '@/hooks/use-crc-balance';
import {
  buildSplitPayTransactions,
  clampMentorShare,
  type MentorSharePercent,
} from '@/lib/crc-pay';
import type { MentorRow } from '@/lib/db';

type PayState =
  | { kind: 'idle' }
  | { kind: 'loading' }
  | { kind: 'success'; hash: string; slotTime: string }
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

function mapPayError(err: unknown): string {
  const msg = err instanceof Error ? err.message.toLowerCase() : '';
  if (
    msg.includes('insufficient') ||
    msg.includes('balance') ||
    msg.includes('funds') ||
    msg.includes('not enough')
  ) {
    return 'Not enough CRC';
  }
  return err instanceof Error ? err.message : 'Payment failed';
}

export function PayButton({ mentor, selectedSlot }: { mentor: MentorRow; selectedSlot: string | null }) {
  const { address, isConnected } = useWallet();
  const { showToast } = useToast();
  const balance = useCrcBalance(address);
  const [email, setEmail] = useState('');
  const [bookerName, setBookerName] = useState<string | null>(null);
  const [state, setState] = useState<PayState>({ kind: 'idle' });

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

  const sharePercent = clampMentorShare(mentor.mentor_share_percent ?? 20) as MentorSharePercent;
  const isSelf = !!address && address.toLowerCase() === mentor.circles_address.toLowerCase();
  const insufficientBalance =
    balance.status === 'ready' && balance.balance < mentor.price_crc;
  const canPay =
    isConnected &&
    !!selectedSlot &&
    !!email.trim() &&
    !isSelf &&
    state.kind !== 'loading' &&
    balance.status === 'ready' &&
    !insufficientBalance;

  async function handlePay() {
    if (!selectedSlot || !address) return;
    setState({ kind: 'loading' });

    try {
      const { sendTransactions } = await import('@aboutcircles/miniapp-sdk');
      const txs = await buildSplitPayTransactions(
        address as `0x${string}`,
        mentor.circles_address as `0x${string}`,
        mentor.price_crc,
        sharePercent,
      );
      const hashes = await sendTransactions(txs);
      const txHash = hashes[0];

      await fetch('/api/bookings', {
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

      setState({ kind: 'success', hash: txHash, slotTime: selectedSlot });
    } catch (err) {
      const message = mapPayError(err);
      setState({ kind: 'error' });
      showToast(message, 'error');
    }
  }

  if (state.kind === 'success') {
    return (
      <div className="flex flex-col gap-3 rounded-lg border border-border bg-muted/50 p-4">
        <p className="text-sm font-medium">Booking confirmed!</p>
        <p className="text-sm text-muted-foreground">{fmtSlot(state.slotTime)}</p>
        <p className="text-xs text-muted-foreground">
          {mentor.cal_event_type_id
            ? 'A calendar invite has been sent to your email.'
            : 'Complete scheduling using the expert calendar link below.'}
        </p>
        <p className="text-xs text-muted-foreground break-all">
          Tx:{' '}
          <a
            href={`https://explorer.aboutcircles.com/tx/${state.hash}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary underline underline-offset-2"
          >
            {state.hash.slice(0, 10)}…{state.hash.slice(-8)}
          </a>
        </p>
        {mentor.calendar_link && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => window.open(mentor.calendar_link, '_blank', 'noopener,noreferrer')}
          >
            Open calendar link
          </Button>
        )}
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      {balance.status === 'ready' && (
        <p className="text-sm text-muted-foreground">
          Your balance: <strong>{balance.formatted} CRC</strong>
        </p>
      )}
      {balance.status === 'not-registered' && (
        <p className="text-sm text-amber-700">
          Your wallet is not a registered Circles avatar. Open the app in the Circles playground to
          pay with CRC.
        </p>
      )}
      {insufficientBalance && (
        <p className="text-sm text-destructive">
          You need at least {mentor.price_crc} CRC to book this call.
        </p>
      )}
      <p className="text-xs text-muted-foreground">
        Payment split: {sharePercent}% to expert, {100 - sharePercent}% to foundation.
      </p>
      {selectedSlot && (
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Your email (for calendar invite)"
          className="h-9 rounded-lg border border-border bg-background px-3 text-sm outline-none focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/50"
        />
      )}
      <Button disabled={!canPay} onClick={handlePay} size="lg" className="w-full">
        {state.kind === 'loading' ? 'Processing…' : `Pay ${mentor.price_crc} CRC to book`}
      </Button>
      {!selectedSlot && (
        <p className="text-xs text-muted-foreground text-center">Select a slot above first.</p>
      )}
      {isSelf && (
        <p className="text-xs text-muted-foreground text-center">You can&apos;t book your own session.</p>
      )}
      {!isConnected && (
        <p className="text-xs text-muted-foreground text-center">Connect your wallet to book a session.</p>
      )}
    </div>
  );
}
