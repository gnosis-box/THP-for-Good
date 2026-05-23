'use client';

import { useState, type MouseEvent, type SyntheticEvent } from 'react';
import { useWallet } from '@/components/wallet/WalletProvider';
import { useTrustRelation } from '@/hooks/use-trust-relation';
import { addTrust } from '@/lib/trust-actions';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { UI_COPY } from '@/lib/ui-copy';

type Props = {
  expertAddress: string;
  expertName: string;
  compact?: boolean;
  className?: string;
};

function stopBubble(event: SyntheticEvent) {
  event.preventDefault();
  event.stopPropagation();
}

export function ExpertTrustControl({
  expertAddress,
  expertName,
  compact = false,
  className,
}: Props) {
  const { address, isConnected } = useWallet();
  const [refetchTick, setRefetchTick] = useState(0);
  const [actionLoading, setActionLoading] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);
  const relation = useTrustRelation(expertAddress, refetchTick);

  async function handleTrust(event: MouseEvent<HTMLButtonElement>) {
    stopBubble(event);
    if (!address) return;
    setActionLoading(true);
    setActionError(null);
    try {
      await addTrust(address, expertAddress);
      setRefetchTick((t) => t + 1);
    } catch (err) {
      setActionError(err instanceof Error ? err.message : UI_COPY.trustCard.trustFailed);
    } finally {
      setActionLoading(false);
    }
  }

  if (
    relation.status === 'disconnected' ||
    relation.status === 'self' ||
    !isConnected
  ) {
    return null;
  }

  const pillSize = compact ? 'h-7 px-2 text-[10px]' : 'h-8 px-2.5 text-xs';

  return (
    <div
      className={cn('inline-flex flex-col gap-0.5', className)}
      onClick={stopBubble}
      onPointerDown={stopBubble}
    >
      {relation.status === 'loading' && (
        <Badge variant="secondary" className={cn('font-normal animate-pulse', pillSize)}>
          {UI_COPY.trustCard.loading}
        </Badge>
      )}

      {relation.status === 'none' && (
        <Button
          type="button"
          variant="outline"
          size="sm"
          className={cn('shrink-0', pillSize)}
          onClick={handleTrust}
          disabled={actionLoading || !address}
        >
          {actionLoading ? UI_COPY.trustCard.trusting : UI_COPY.trustCard.trust}
        </Button>
      )}

      {relation.status === 'incoming' && (
        <div className="flex flex-wrap items-center gap-1">
          <Badge
            variant="secondary"
            className={cn('border-trust/20 bg-muted text-muted-foreground font-medium', pillSize)}
          >
            {UI_COPY.trustCard.trustsYou}
          </Badge>
          <Button
            type="button"
            variant="outline"
            size="sm"
            className={cn('shrink-0', pillSize)}
            onClick={handleTrust}
            disabled={actionLoading || !address}
          >
            {actionLoading ? UI_COPY.trustCard.trusting : UI_COPY.trustCard.trustBack}
          </Button>
        </div>
      )}

      {relation.status === 'outgoing' && (
        <Badge
          variant="secondary"
          className={cn('border-trust/20 bg-muted text-muted-foreground font-medium', pillSize)}
        >
          {UI_COPY.trustCard.youTrust}
        </Badge>
      )}

      {relation.status === 'mutual' && (
        <Badge
          variant="secondary"
          className={cn('border-trust/30 bg-trust/10 text-trust font-medium', pillSize)}
        >
          {UI_COPY.trustCard.mutual}
        </Badge>
      )}

      {actionError ? (
        <p className="max-w-[12rem] text-[10px] leading-tight text-destructive">{actionError}</p>
      ) : null}
    </div>
  );
}
