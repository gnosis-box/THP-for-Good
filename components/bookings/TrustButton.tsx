'use client';

import { useState } from 'react';
import { useWallet } from '@/components/wallet/WalletProvider';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

type Props = {
  mentorAddress: string;
  mentorName: string;
  mentorSkills: string[];
  bookingId: number;
};

export function TrustButton({ mentorAddress, mentorName, bookingId }: Props) {
  const { address } = useWallet();
  const [trusted, setTrusted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleTrust() {
    if (!address || trusted || loading) return;
    setLoading(true);
    setError(null);

    try {
      const [{ Sdk }, { circlesConfig }, { sendTransactions }] = await Promise.all([
        import('@aboutcircles/sdk'),
        import('@aboutcircles/sdk-utils'),
        import('@aboutcircles/miniapp-sdk'),
      ]);

      // contractRunner bridges sdk write calls → miniapp-sdk sendTransactions
      const contractRunner = {
        address: address as `0x${string}`,
        publicClient: null as unknown,
        init: async () => {},
        sendTransaction: (txs: { to: string; data: string; value?: bigint }[]) =>
          sendTransactions(txs.map((tx) => ({ to: tx.to, data: tx.data, value: String(tx.value ?? '0') }))),
      };

      const sdk = new Sdk(circlesConfig[100], contractRunner);
      const avatar = await sdk.getAvatar(address as `0x${string}`);
      await avatar.trust.add(mentorAddress as `0x${string}`);

      // Best-effort: record trust on the server. Ignore failures — on-chain is source of truth.
      fetch('/api/trust', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ booking_id: bookingId }),
      }).catch(() => undefined);

      setTrusted(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Trust failed. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  if (trusted) {
    return (
      <Badge variant="secondary" className="text-xs text-green-700 bg-green-100 border-green-200">
        Trusted {mentorName} ✓
      </Badge>
    );
  }

  return (
    <div className="flex flex-col gap-1">
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={handleTrust}
        disabled={loading || !address}
      >
        {loading ? 'Trusting…' : `TRUST ${mentorName}`}
      </Button>
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  );
}
