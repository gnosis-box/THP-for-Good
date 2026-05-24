'use client';

import { useEffect, useRef, useState } from 'react';

import { Badge } from '@/components/ui/badge';
import { useWallet } from '@/components/wallet/WalletProvider';
import { usePrefersReducedMotion } from '@/hooks/use-prefers-reduced-motion';
import { motionClass } from '@/lib/motion';
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

  if (!mounted) {
    return (
      <Badge
        variant="outline"
        className={cn(badgeClassName, idleBadgeClassName)}
        aria-label="Wallet status"
      >
        <span
          className="mr-1.5 inline-block size-2 shrink-0 rounded-full bg-subtle-foreground/80"
          aria-hidden
        />
        <span className="truncate">…</span>
      </Badge>
    );
  }

  return (
    <Badge
      variant={isConnected ? 'default' : 'outline'}
      className={cn(
        badgeClassName,
        !isConnected && idleBadgeClassName,
        showConnectFade && motionClass('', 'motion-wallet-in', reducedMotion),
      )}
      aria-label={isConnected ? `Wallet connected: ${address}` : 'Wallet not connected'}
    >
      <span
        className={
          'mr-1.5 inline-block size-2 shrink-0 rounded-full ' +
          (isConnected ? 'bg-success' : 'bg-subtle-foreground/80')
        }
        aria-hidden
      />
      <span className="truncate">
        {address ? shortenAddress(address, 4) : 'Not connected'}
      </span>
    </Badge>
  );
}
