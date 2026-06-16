'use client';

import { useWallet } from '@/components/wallet/WalletProvider';
import { UI_COPY } from '@/lib/ui-copy';

/** Miniapp-only affordance — short iframes hide the ochre section below the hero. */
export function LandingScrollHint() {
  const { isMiniappHost } = useWallet();

  if (!isMiniappHost) return null;

  return (
    <p className="relative z-10 mt-1 text-xs text-muted-foreground/75">{UI_COPY.landing.scrollHint}</p>
  );
}
