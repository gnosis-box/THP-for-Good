'use client';

import { useState, type MouseEvent, type SyntheticEvent } from 'react';
import { useWallet } from '@/components/wallet/WalletProvider';
import { useTrustRelation } from '@/hooks/use-trust-relation';
import { usePrefersReducedMotion } from '@/hooks/use-prefers-reduced-motion';
import { addTrust } from '@/lib/trust-actions';
import { motionClass } from '@/lib/motion';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { IconTooltip } from '@/components/ui-patterns/IconTooltip';
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
  const reducedMotion = usePrefersReducedMotion();
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

  const pillSize = compact ? 'h-6 px-1.5 text-[10px]' : 'h-8 px-2.5 text-xs';
  const incomingLayout = compact ? 'flex flex-nowrap items-center gap-1' : 'flex flex-wrap items-center gap-1';
  const rootLayout = compact ? 'inline-flex flex-row items-center gap-1' : 'inline-flex flex-col gap-0.5';

  if (relation.status === 'loading') {
    return (
      <div className={cn('inline-flex', className)} onClick={stopBubble} onPointerDown={stopBubble}>
        <span
          className={cn('inline-block rounded-full bg-muted', pillSize, compact ? 'w-14' : 'w-16')}
          aria-label={UI_COPY.trustCard.loading}
        />
      </div>
    );
  }

  return (
    <div
      className={cn(
        rootLayout,
        motionClass('', 'motion-trust-fade-in', reducedMotion),
        className,
      )}
      onClick={stopBubble}
      onPointerDown={stopBubble}
    >
      {relation.status === 'none' && (
        <IconTooltip
          content={UI_COPY.trustCard.tooltipTrust}
          render={
            <Button
              type="button"
              variant="outline"
              size="sm"
              className={cn('shrink-0', pillSize)}
              onClick={handleTrust}
              disabled={actionLoading || !address}
            />
          }
        >
          {actionLoading ? UI_COPY.trustCard.trusting : UI_COPY.trustCard.trust}
        </IconTooltip>
      )}

      {relation.status === 'incoming' && (
        <div className={incomingLayout}>
          <IconTooltip
            content={UI_COPY.trustCard.tooltipTrustsYou}
            render={
              <span className="inline-flex">
                <Badge
                  variant="secondary"
                  className={cn(
                    'border-trust/20 bg-muted text-muted-foreground font-medium',
                    pillSize,
                  )}
                >
                  {UI_COPY.trustCard.trustsYou}
                </Badge>
              </span>
            }
          />
          <IconTooltip
            content={UI_COPY.trustCard.tooltipTrustBack}
            render={
              <Button
                type="button"
                variant="outline"
                size="sm"
                className={cn('shrink-0', pillSize)}
                onClick={handleTrust}
                disabled={actionLoading || !address}
              />
            }
          >
            {actionLoading ? UI_COPY.trustCard.trusting : UI_COPY.trustCard.trustBack}
          </IconTooltip>
        </div>
      )}

      {relation.status === 'outgoing' && (
        <IconTooltip
          content={UI_COPY.trustCard.tooltipYouTrust}
          render={
            <span className="inline-flex">
              <Badge
                variant="secondary"
                className={cn(
                  'border-trust/20 bg-muted text-muted-foreground font-medium',
                  pillSize,
                )}
              >
                {UI_COPY.trustCard.youTrust}
              </Badge>
            </span>
          }
        />
      )}

      {relation.status === 'mutual' && (
        <IconTooltip
          content={UI_COPY.trustCard.tooltipMutual}
          render={
            <span className="inline-flex">
              <Badge
                variant="secondary"
                className={cn('border-trust/30 bg-trust/10 text-trust font-medium', pillSize)}
              >
                {UI_COPY.trustCard.mutual}
              </Badge>
            </span>
          }
        />
      )}

      {actionError ? (
        <p className="max-w-[12rem] text-[10px] leading-tight text-destructive">{actionError}</p>
      ) : null}
    </div>
  );
}
