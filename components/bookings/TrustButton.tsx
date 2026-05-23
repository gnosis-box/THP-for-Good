'use client';

import { useState, useEffect } from 'react';
import { useWallet } from '@/components/wallet/WalletProvider';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { resolveTrustRelation } from '@/lib/trust-relation';
import { addTrust, removeTrust } from '@/lib/trust-actions';
import { trackUmamiEvent } from '@/lib/analytics-umami';

type TrustState =
  | { kind: 'loading' }
  | { kind: 'none' }
  | { kind: 'incoming' }
  | { kind: 'outgoing' }
  | { kind: 'mutual' };

type Props = {
  mentorAddress: string;
  mentorName: string;
  mentorSkills: string[];
  mentorId: number;
  bookingId: number;
};

export function TrustButton({ mentorAddress, mentorName, bookingId, mentorId }: Props) {
  const { address } = useWallet();
  const [trustState, setTrustState] = useState<TrustState>({ kind: 'loading' });
  const [refetchTick, setRefetchTick] = useState(0);
  const [actionLoading, setActionLoading] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [mentorAvatar, setMentorAvatar] = useState<string | null>(null);

  useEffect(() => {
    if (!address) return;
    let cancelled = false;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setTrustState({ kind: 'loading' });
    resolveTrustRelation(address, mentorAddress)
      .then((kind) => {
        if (cancelled) return;
        setTrustState({ kind });
      })
      .catch(() => {
        if (!cancelled) setTrustState({ kind: 'none' });
      });
    return () => { cancelled = true; };
  }, [address, mentorAddress, refetchTick]);

  useEffect(() => {
    if (!mentorAddress) return;
    (async () => {
      try {
        const { Sdk } = await import('@aboutcircles/sdk');
        const sdk = new Sdk();
        const view = await sdk.rpc.profile.getProfileView(mentorAddress as `0x${string}`);
        if (view?.avatarInfo?.cidV0) {
          const profile = await sdk.rpc.profile.getProfileByCid(view.avatarInfo.cidV0);
          if (profile?.previewImageUrl) setMentorAvatar(profile.previewImageUrl);
          else if (profile?.imageUrl) setMentorAvatar(profile.imageUrl);
        }
      } catch {
        // no avatar — fine
      }
    })();
  }, [mentorAddress]);

  async function handleTrust() {
    if (!address) return;
    trackUmamiEvent('trust_click', { mentor_id: mentorId });
    setActionLoading(true);
    setActionError(null);
    try {
      const trustTxHash = await addTrust(address, mentorAddress);

      fetch('/api/trust', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          booking_id: bookingId,
          trust_tx_hash: trustTxHash ?? undefined,
        }),
      }).catch(() => undefined);

      setRefetchTick((t) => t + 1);
    } catch (err) {
      setActionError(err instanceof Error ? err.message : 'Trust failed. Please try again.');
    } finally {
      setActionLoading(false);
    }
  }

  async function handleUntrust() {
    if (!address) return;
    setActionLoading(true);
    setActionError(null);
    try {
      await removeTrust(address, mentorAddress);

      setShowModal(false);
      setRefetchTick((t) => t + 1);
    } catch (err) {
      setActionError(err instanceof Error ? err.message : 'Untrust failed. Please try again.');
    } finally {
      setActionLoading(false);
    }
  }

  if (trustState.kind === 'loading') {
    return (
      <Badge variant="secondary" className="text-xs text-muted-foreground animate-pulse">
        Loading trust…
      </Badge>
    );
  }

  if (trustState.kind === 'none' || trustState.kind === 'incoming') {
    return (
      <div className="flex flex-col gap-1">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={handleTrust}
          disabled={actionLoading || !address}
        >
          {actionLoading ? 'Trusting…' : `TRUST ${mentorName}`}
        </Button>
        {actionError && <p className="text-xs text-destructive">{actionError}</p>}
      </div>
    );
  }

  const label = trustState.kind === 'mutual' ? 'Two-way trust' : 'Outgoing trust';

  return (
    <>
      <div className="flex flex-col gap-1">
        <Button
          type="button"
          variant="secondary"
          size="sm"
          className="text-muted-foreground"
          onClick={() => setShowModal(true)}
          disabled={actionLoading}
        >
          {label}
        </Button>
        {actionError && <p className="text-xs text-destructive">{actionError}</p>}
      </div>

      {showModal && (
        <UntrustModal
          mentorName={mentorName}
          mentorAvatar={mentorAvatar}
          loading={actionLoading}
          onConfirm={handleUntrust}
          onCancel={() => { setShowModal(false); setActionError(null); }}
        />
      )}
    </>
  );
}

function UntrustModal({
  mentorName,
  mentorAvatar,
  loading,
  onConfirm,
  onCancel,
}: {
  mentorName: string;
  mentorAvatar: string | null;
  loading: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center sm:items-center p-4"
      onClick={onCancel}
    >
      {/* backdrop */}
      <div className="absolute inset-0 bg-black/50" />

      <div
        className="relative z-10 w-full max-w-sm rounded-2xl bg-background p-6 flex flex-col gap-4 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Avatars row */}
        <div className="flex items-center justify-center gap-1">
          <div className="size-14 rounded-full bg-muted overflow-hidden border-2 border-background shadow-md flex items-center justify-center text-xl font-bold">
            {/* my side — generic person icon */}
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="size-8 text-muted-foreground">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" />
            </svg>
          </div>
          {/* trust link indicator */}
          <div className="flex items-center gap-0.5 text-muted-foreground">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="size-4">
              <path strokeLinecap="round" strokeLinejoin="round" d="M13.19 8.688a4.5 4.5 0 0 1 1.242 7.244l-4.5 4.5a4.5 4.5 0 0 1-6.364-6.364l1.757-1.757m13.35-.622 1.757-1.757a4.5 4.5 0 0 0-6.364-6.364l-4.5 4.5a4.5 4.5 0 0 0 1.242 7.244" />
            </svg>
          </div>
          <div className="size-14 rounded-full bg-muted overflow-hidden border-2 border-background shadow-md flex items-center justify-center">
            {mentorAvatar ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={mentorAvatar} alt={mentorName} className="size-full object-cover" />
            ) : (
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="size-8 text-muted-foreground">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" />
              </svg>
            )}
          </div>
        </div>

        {/* Text */}
        <div className="flex flex-col gap-2">
          <p className="text-base font-semibold">You trust {mentorName}</p>
          <p className="text-sm text-muted-foreground leading-relaxed">
            This means you have verified their humanity and accept their personal CRC.
            Untrust to stop accepting their CRC.
          </p>
        </div>

        {/* Action */}
        <Button
          variant="destructive"
          className="w-full"
          onClick={onConfirm}
          disabled={loading}
        >
          {loading ? 'Untrusting…' : 'Untrust'}
        </Button>
      </div>
    </div>
  );
}
