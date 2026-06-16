'use client';

import Image from 'next/image';

import { useWallet } from '@/components/wallet/WalletProvider';
import { cn } from '@/lib/utils';

/** Large left-edge watermark — hoodie logo, half off-screen, faded on dark bg. */
export function LandingBackgroundLogo() {
  const { isMiniappHost } = useWallet();

  return (
    <div
      className="pointer-events-none absolute top-1/2 left-0 z-0 isolate h-[min(86dvh,36rem)] w-[min(86dvh,36rem)] -translate-x-[46%] -translate-y-1/2 sm:h-[min(90dvh,42rem)] sm:w-[min(90dvh,42rem)] sm:-translate-x-[43%] md:h-[min(94dvh,48rem)] md:w-[min(94dvh,48rem)] md:-translate-x-[40%]"
      aria-hidden
    >
      <Image
        src="/landing-watermark-logo.png"
        alt=""
        fill
        sizes="(max-width: 640px) 90vw, 50vw"
        className={cn(
          'object-contain object-center [mask-image:linear-gradient(to_right,black_48%,transparent_92%)]',
          isMiniappHost
            ? 'opacity-[0.24] sm:opacity-[0.28] md:opacity-[0.32]'
            : 'opacity-[0.13] sm:opacity-[0.15] md:opacity-[0.17]',
        )}
      />
    </div>
  );
}
