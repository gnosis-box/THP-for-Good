'use client';

import { useState, useEffect } from 'react';
import { ExternalLink } from 'lucide-react';

import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { buttonVariants } from '@/components/ui/button';
import { useWallet } from '@/components/wallet/WalletProvider';
import { UI_COPY } from '@/lib/ui-copy';
import { cn } from '@/lib/utils';

export function OpenInCirclesHint() {
  const { isMiniappHost } = useWallet();
  const [href, setHref] = useState('https://circles.gnosis.io/playground');

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setHref(`https://circles.gnosis.io/playground?url=${encodeURIComponent(window.location.origin)}`);
  }, []);

  if (isMiniappHost) return null;

  return (
    <Alert className="border-warning/40 bg-warning/10" role="status">
      <ExternalLink aria-hidden />
      <AlertTitle>{UI_COPY.circlesHint.title}</AlertTitle>
      <AlertDescription className="flex flex-col gap-2">
        <p>{UI_COPY.circlesHint.body}</p>
        <a
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          className={cn(buttonVariants({ variant: 'outline', size: 'sm' }), 'inline-flex min-h-11 w-fit items-center')}
        >
          {UI_COPY.circlesHint.cta}
        </a>
      </AlertDescription>
    </Alert>
  );
}
