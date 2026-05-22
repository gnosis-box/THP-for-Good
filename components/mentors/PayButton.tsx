'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useWallet } from '@/components/wallet/WalletProvider';
import type { MentorRow } from '@/lib/db';

type PayState =
  | { kind: 'idle' }
  | { kind: 'loading' }
  | { kind: 'success'; hash: string; slotTime: string }
  | { kind: 'error'; message: string };

function fmtSlot(iso: string) {
  return new Intl.DateTimeFormat(undefined, {
    weekday: 'long', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit',
  }).format(new Date(iso));
}

export function PayButton({ mentor, selectedSlot }: { mentor: MentorRow; selectedSlot: string | null }) {
  const { address, isConnected } = useWallet();
  const [email, setEmail] = useState('');
  const [state, setState] = useState<PayState>({ kind: 'idle' });

  const isSelf = !!address && address.toLowerCase() === mentor.circles_address.toLowerCase();
  const canPay = isConnected && !!selectedSlot && !!email.trim() && !isSelf && state.kind !== 'loading';

  async function handlePay() {
    if (!selectedSlot || !address) return;
    setState({ kind: 'loading' });

    try {
      const [{ TransferBuilder }, { circlesConfig }, { sendTransactions }] = await Promise.all([
        import('@aboutcircles/sdk-transfers'),
        import('@aboutcircles/sdk-utils'),
        import('@aboutcircles/miniapp-sdk'),
      ]);

      const builder = new TransferBuilder(circlesConfig[100]);
      const amount = BigInt(mentor.price_crc) * 10n ** 18n;
      const txs = await builder.constructAdvancedTransfer(
        address as `0x${string}`,
        mentor.circles_address as `0x${string}`,
        amount,
      );
      const hashes = await sendTransactions(
        txs.map((tx) => ({ to: tx.to, data: tx.data, value: tx.value.toString() })),
      );
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
          attendee_name: address,
        }),
      });

      setState({ kind: 'success', hash: txHash, slotTime: selectedSlot });
    } catch (err) {
      setState({ kind: 'error', message: err instanceof Error ? err.message : 'Unexpected error' });
    }
  }

  if (state.kind === 'success') {
    return (
      <div className="flex flex-col gap-2 rounded-lg border border-border bg-muted/50 p-4">
        <p className="text-sm font-medium">Booking confirmed!</p>
        <p className="text-sm text-muted-foreground">{fmtSlot(state.slotTime)}</p>
        <p className="text-xs text-muted-foreground">A calendar invite has been sent to {email}.</p>
        <p className="text-xs text-muted-foreground break-all">
          Tx:{' '}
          <a href={`https://gnosisscan.io/tx/${state.hash}`} target="_blank" rel="noopener noreferrer"
            className="text-primary underline underline-offset-2">
            {state.hash.slice(0, 10)}…{state.hash.slice(-8)}
          </a>
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3">
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
      {state.kind === 'error' && (
        <p className="text-sm text-destructive">{state.message}</p>
      )}
    </div>
  );
}
