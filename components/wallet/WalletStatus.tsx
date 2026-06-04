'use client';

import { useEffect, useRef, useState } from 'react';

import { Badge } from '@/components/ui/badge';
import { IconTooltip } from '@/components/ui-patterns/IconTooltip';
import { useWallet } from '@/components/wallet/WalletProvider';
import { usePrefersReducedMotion } from '@/hooks/use-prefers-reduced-motion';
import { motionClass } from '@/lib/motion';
import { UI_COPY } from '@/lib/ui-copy';
import { cn, shortenAddress } from '@/lib/utils';

const badgeClassName =
  'max-h-11 min-h-11 max-w-[7.5rem] items-center truncate px-2.5 py-2 font-mono text-xs sm:max-w-[10rem] md:max-w-none md:text-sm';

const idleBadgeClassName =
  'border-border bg-muted/60 text-subtle-foreground hover:bg-muted/60';

export function WalletStatus() {
  const { address, isConnected } = useWallet();
  const reducedMotion = usePrefersReducedMotion();
  const [mounted, setMounted] = useState(false);
  const [showConnectFade, setShowConnectFade] = useState(false);
  const wasConnected = useRef(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (isConnected && address && !wasConnected.current) {
      wasConnected.current = true;
      setShowConnectFade(true);
    }
    if (!isConnected) {
      wasConnected.current = false;
      setShowConnectFade(false);
    }
  }, [isConnected, address]);

  const connected = mounted && isConnected && !!address;
  const tooltipContent = connected
    ? UI_COPY.wallet.tooltipConnected(address!)
    : UI_COPY.wallet.tooltipDisconnected;

  return (
    <IconTooltip
      content={tooltipContent}
      render={
        <Badge
          variant={connected ? 'default' : 'outline'}
          className={cn(
            badgeClassName,
            !connected && idleBadgeClassName,
            showConnectFade && motionClass('', 'motion-wallet-in', reducedMotion),
          )}
          aria-label={
            connected ? `Wallet connected: ${address}` : 'Wallet not connected'
          }
        />
      }
    >
      <span
        className={
          'mr-1.5 inline-block size-2 shrink-0 rounded-full ' +
          (connected ? 'bg-success' : 'bg-subtle-foreground/80')
        }
        aria-hidden
      />
      <span className="truncate">
        {mounted ? (address ? shortenAddress(address, 4) : 'Not connected') : '…'}
      </span>
    </IconTooltip>
  );
}
