'use client';

import type { ReactNode } from 'react';

import { useWallet } from '@/components/wallet/WalletProvider';
import { cn } from '@/lib/utils';

/** Landing layout — tighter top anchor in miniapp iframe so hero + CTA stay in view. */
export function LandingScene({ children }: { children: ReactNode }) {
  const { isMiniappHost } = useWallet();

  return (
    <div
      className={cn(
        'relative flex min-h-0 flex-1 flex-col items-center px-5',
        'supports-[padding:max(0px)]:px-[max(1.25rem,env(safe-area-inset-left))]',
        'supports-[padding:max(0px)]:pr-[max(1.25rem,env(safe-area-inset-right))]',
        'pb-[calc(7rem+env(safe-area-inset-bottom,0px))] pt-[max(1.5rem,env(safe-area-inset-top,0px))] sm:px-8 sm:pb-32',
        'md:min-h-[calc(100dvh-4rem)]',
        isMiniappHost
          ? 'min-h-0 justify-start pt-8 sm:pt-10'
          : 'min-h-[calc(100dvh-3.5rem)] justify-center',
        !isMiniappHost && 'sm:justify-center',
        isMiniappHost && 'sm:justify-start',
      )}
    >
      {children}
    </div>
  );
}
