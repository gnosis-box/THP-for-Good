'use client';

import { useState } from 'react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useWallet } from '@/hooks/use-wallet';
import {
  addAttestation,
  getAttestationForBooking,
  updateAttestationTrustHash,
} from '@/lib/trust-storage';
import { GNOSISSCAN_TX_URL } from '@/lib/config';
import { buildTrustAddTransactions } from '@/lib/trust-transfer';
import type { Mentor } from '@/lib/types';

type TrustTagPickerProps = {
  mentor: Mentor;
  bookingId: string;
  onTrusted?: () => void;
};

export function TrustTagPicker({ mentor, bookingId, onTrusted }: TrustTagPickerProps) {
  const { address, isConnected } = useWallet();
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [txHash, setTxHash] = useState<string | null>(null);

  const existing = address
    ? getAttestationForBooking(mentor.id, address)
    : undefined;

  async function handleTrust() {
    if (!address || !selectedTag) return;

    setLoading(true);
    setError(null);

    try {
      const txs = await buildTrustAddTransactions(
        address as `0x${string}`,
        mentor.walletAddress,
      );
      const { sendTransactions } = await import('@aboutcircles/miniapp-sdk');
      const hashes = await sendTransactions(txs);
      const hash = (hashes[0] ?? '') as `0x${string}`;

      if (!hash) {
        throw new Error('Trust succeeded but no transaction hash was returned.');
      }

      if (!existing) {
        addAttestation({
          mentorId: mentor.id,
          tag: selectedTag,
          studentAddress: address as `0x${string}`,
          trustTxHash: hash,
          at: new Date().toISOString(),
        });
      } else {
        updateAttestationTrustHash(mentor.id, address, hash);
      }

      setTxHash(hash);
      onTrusted?.();
      void bookingId;
    } catch (trustError) {
      setError(
        trustError instanceof Error
          ? trustError.message
          : 'Trust failed — are you a registered Circles avatar?',
      );
    } finally {
      setLoading(false);
    }
  }

  if (existing?.trustTxHash || txHash) {
    const hash = txHash ?? existing?.trustTxHash;
    return (
      <div className="space-y-2 text-sm">
        <p className="text-emerald-700">
          Trusted {existing?.tag ?? selectedTag} on Circles
        </p>
        {hash ? (
          <a
            href={`${GNOSISSCAN_TX_URL}/${hash}`}
            target="_blank"
            rel="noreferrer"
            className="font-mono text-xs text-primary underline"
          >
            {hash.slice(0, 10)}…
          </a>
        ) : null}
      </div>
    );
  }

  if (!isConnected) {
    return <p className="text-sm text-muted-foreground">Connect via Circles to trust.</p>;
  }

  return (
    <div className="space-y-3">
      <p className="text-sm font-medium">Trust mentor for which skill?</p>
      <div className="flex flex-wrap gap-2">
        {mentor.tags.map((tag) => (
          <button
            key={tag}
            type="button"
            onClick={() => setSelectedTag(tag)}
            className="rounded-full"
          >
            <Badge variant={selectedTag === tag ? 'default' : 'outline'}>{tag}</Badge>
          </button>
        ))}
      </div>
      <Button
        type="button"
        size="sm"
        disabled={!selectedTag || loading}
        onClick={() => void handleTrust()}
      >
        {loading ? 'Trusting…' : `TRUST ${selectedTag ?? '[tag]'}`}
      </Button>
      {error ? <p className="text-sm text-destructive">{error}</p> : null}
    </div>
  );
}
