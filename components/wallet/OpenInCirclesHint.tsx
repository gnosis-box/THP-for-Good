'use client';

import { useWallet } from '@/components/wallet/WalletProvider';

function playgroundUrl() {
  if (typeof window === 'undefined') return 'https://circles.gnosis.io/playground';
  const appUrl = encodeURIComponent(window.location.href);
  return `https://circles.gnosis.io/playground?url=${appUrl}`;
}

export function OpenInCirclesHint() {
  const { isMiniappHost } = useWallet();

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
        href={playgroundUrl()}
        target="_blank"
        rel="noopener noreferrer"
        className="mt-2 inline-block text-sm font-medium text-primary underline underline-offset-2"
      >
        Launch in Circles playground
      </a>
    </div>
  );
}
