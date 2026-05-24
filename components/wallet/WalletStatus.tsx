'use client';

import { useEffect, useRef, useState } from 'react';

import { Badge } from '@/components/ui/badge';
import { useWallet } from '@/components/wallet/WalletProvider';
import { usePrefersReducedMotion } from '@/hooks/use-prefers-reduced-motion';
import { motionClass } from '@/lib/motion';
import { cn, shortenAddress } from '@/lib/utils';

const badgeClassName =
  'max-h-11 min-h-11 max-w-[7.5rem] items-center truncate px-2.5 py-2 font-mono text-xs sm:max-w-[10rem] md:max-w-none md:text-sm';

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
        variant="secondary"
        className={badgeClassName}
        aria-label="Wallet status"
      >
        <span
          className="mr-1.5 inline-block size-2 shrink-0 rounded-full bg-muted-foreground"
          aria-hidden
        />
        <span className="truncate text-muted-foreground">…</span>
      </Badge>
    );
  }

  return (
    <Badge
      variant={isConnected ? 'default' : 'secondary'}
      className={cn(
        badgeClassName,
        showConnectFade && motionClass('', 'motion-wallet-in', reducedMotion),
      )}
      aria-label={isConnected ? `Wallet connected: ${address}` : 'Wallet not connected'}
    >
      <span
        className={
          'mr-1.5 inline-block size-2 shrink-0 rounded-full ' +
          (isConnected ? 'bg-emerald-500' : 'bg-muted-foreground')
        }
        aria-hidden
      />
      <span className="truncate">{address ? shortenAddress(address, 4) : 'Not connected'}</span>
    </Badge>
  );
}
