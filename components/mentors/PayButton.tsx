'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useWallet } from '@/components/wallet/WalletProvider';
import type { MentorRow } from '@/lib/db';


type PayState =
  | { kind: 'idle' }
  | { kind: 'loading' }
  | { kind: 'success'; hash: string }
  | { kind: 'error'; message: string };

type PayButtonProps = {
  mentor: MentorRow;
  selectedSlot: string | null;
};

export function PayButton({ mentor, selectedSlot }: PayButtonProps) {
  const { address, isConnected } = useWallet();
  const [state, setState] = useState<PayState>({ kind: 'idle' });

  const isDisabled = !selectedSlot || !isConnected || state.kind === 'loading';

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
        amount
      );

      const hashes = await sendTransactions(
        txs.map((tx) => ({
          to: tx.to,
          data: tx.data,
          value: tx.value.toString(),
        }))
      );

      const txHash = hashes[0];

      // Record booking
      await fetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mentor_id: mentor.id,
          booker_address: address,
          tx_hash: txHash,
        }),
      });

      setState({ kind: 'success', hash: txHash });
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : 'An unexpected error occurred';
      setState({ kind: 'error', message });
    }
  }

  if (state.kind === 'success') {
    return (
      <div className="flex flex-col gap-3 rounded-lg border border-border bg-muted/50 p-4">
        <p className="text-sm font-medium text-foreground">Booking confirmed!</p>
        <p className="text-sm text-muted-foreground">
          Your slot:{' '}
          <span className="font-medium text-foreground">{selectedSlot}</span>
        </p>
        <p className="text-xs text-muted-foreground break-all">
          Tx:{' '}
          <a
            href={`https://gnosisscan.io/tx/${state.hash}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary underline underline-offset-2"
          >
            {state.hash.slice(0, 10)}…{state.hash.slice(-8)}
          </a>
        </p>
        <Button
          variant="outline"
          size="sm"
          onClick={() => window.open(mentor.calendar_link, '_blank', 'noopener,noreferrer')}
        >
          Open calendar link
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2">
      <Button
        disabled={isDisabled}
        onClick={handlePay}
        size="lg"
        className="w-full"
      >
        {state.kind === 'loading'
          ? 'Processing…'
          : `PAY ${mentor.price_crc} CRC to book`}
      </Button>
      {!isConnected && (
        <p className="text-xs text-muted-foreground text-center">
          Connect your wallet to book a session
        </p>
      )}
      {state.kind === 'error' && (
        <p className="text-sm text-destructive">{state.message}</p>
      )}
    </div>
  );
}
