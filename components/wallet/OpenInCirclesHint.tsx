'use client';

import { useState, useEffect } from 'react';
import { useWallet } from '@/components/wallet/WalletProvider';

export function OpenInCirclesHint() {
  const { isMiniappHost } = useWallet();
  const [href, setHref] = useState('https://circles.gnosis.io/playground');

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setHref(`https://circles.gnosis.io/playground?url=${encodeURIComponent(window.location.origin)}`);
  }, []);

  if (isMiniappHost) return null;

  return (
    <div
      className="rounded-lg border border-amber-500/40 bg-amber-500/10 px-4 py-3 text-sm text-foreground"
      role="status"
    >
      <p className="font-medium">Open in Circles</p>
      <p className="mt-1 text-muted-foreground">
        Connect your wallet and pay in CRC inside the Circles miniapp.
      </p>
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className="mt-2 inline-block text-sm font-medium text-primary underline underline-offset-2"
      >
        Launch in Circles playground
      </a>
    </div>
  );
}
