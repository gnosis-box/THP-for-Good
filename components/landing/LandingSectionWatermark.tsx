'use client';

import Image from 'next/image';

import { useWallet } from '@/components/wallet/WalletProvider';
import { cn } from '@/lib/utils';

type WatermarkSide = 'left' | 'right';

/** Large edge watermark — hoodie logo, half off-screen, faded on section bg. */
export function LandingSectionWatermark({
  side,
  src,
}: {
  side: WatermarkSide;
  src: string;
}) {
  const { isMiniappHost } = useWallet();

  return (
    <div
      className={cn(
        'pointer-events-none absolute top-1/2 z-0 isolate h-[min(86dvh,36rem)] w-[min(86dvh,36rem)] -translate-y-1/2 sm:h-[min(90dvh,42rem)] sm:w-[min(90dvh,42rem)] md:h-[min(94dvh,48rem)] md:w-[min(94dvh,48rem)]',
        side === 'left'
          ? 'left-0 -translate-x-[46%] sm:-translate-x-[43%] md:-translate-x-[40%]'
          : 'right-0 translate-x-[46%] sm:translate-x-[43%] md:translate-x-[40%]',
      )}
      aria-hidden
    >
      <Image
        src={src}
        alt=""
        fill
        sizes="(max-width: 640px) 90vw, 50vw"
        className={cn(
          'object-contain object-center',
          side === 'left'
            ? '[mask-image:linear-gradient(to_right,black_48%,transparent_92%)]'
            : '[mask-image:linear-gradient(to_left,black_48%,transparent_92%)]',
          isMiniappHost
            ? 'opacity-[0.24] sm:opacity-[0.28] md:opacity-[0.32]'
            : 'opacity-[0.13] sm:opacity-[0.15] md:opacity-[0.17]',
        )}
      />
    </div>
  );
}
