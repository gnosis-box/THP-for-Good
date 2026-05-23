'use client';

import { useState, useEffect } from 'react';
import { ExternalLink } from 'lucide-react';

import { buttonVariants } from '@/components/ui/button';
import { useWallet } from '@/components/wallet/WalletProvider';
import { UI_COPY } from '@/lib/ui-copy';
import { cn } from '@/lib/utils';

export function OpenInCirclesHint() {
  const { isMiniappHost } = useWallet();
  const [href, setHref] = useState('https://circles.gnosis.io/playground');
  const copy = UI_COPY.circlesHint;

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setHref(`https://circles.gnosis.io/playground?url=${encodeURIComponent(window.location.origin)}`);
  }, []);

  if (isMiniappHost) return null;

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      role="status"
      aria-label={`${copy.title}. ${copy.body}`}
      className={cn(
        buttonVariants({ size: 'lg' }),
        'flex min-h-14 w-full items-center justify-center gap-2.5 px-4 text-base font-semibold',
      )}
    >
      <ExternalLink className="size-5 shrink-0" aria-hidden />
      {copy.cta}
    </a>
  );
}
