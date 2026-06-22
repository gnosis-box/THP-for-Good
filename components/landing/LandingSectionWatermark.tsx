'use client';

import Image from 'next/image';
import { motion } from 'motion/react';

import { useWallet } from '@/components/wallet/WalletProvider';
import { usePrefersReducedMotion } from '@/hooks/use-prefers-reduced-motion';
import { cn } from '@/lib/utils';

type WatermarkSide = 'left' | 'right';
type WatermarkBand = 'dark' | 'ochre';

function resolveWatermarkBand(src: string, band?: WatermarkBand): WatermarkBand {
  if (band) return band;
  if (src.includes('beige-green')) return 'ochre';
  return 'dark';
}

/** Large edge watermark — hoodie logo, half off-screen, faded on section bg. */
export function LandingSectionWatermark({
  side,
  src,
  band,
}: {
  side: WatermarkSide;
  src: string;
  /** Dark sections (hero, gnosis) vs ochre band (promise). Defaults from `src`. */
  band?: WatermarkBand;
}) {
  const { isMiniappHost } = useWallet();
  const reducedMotion = usePrefersReducedMotion();
  const watermarkBand = resolveWatermarkBand(src, band);

  const opacityClass =
    watermarkBand === 'ochre'
      ? isMiniappHost
        ? 'opacity-[0.28] sm:opacity-[0.32] md:opacity-[0.36]'
        : 'opacity-[0.16] sm:opacity-[0.18] md:opacity-[0.20]'
      : isMiniappHost
        ? 'opacity-[0.24] sm:opacity-[0.28] md:opacity-[0.32]'
        : 'opacity-[0.13] sm:opacity-[0.15] md:opacity-[0.17]';

  // Position via Tailwind transform classes; motion animates opacity only so the
  // half-off-screen translate is never overridden.
  const positionClass = cn(
    'pointer-events-none absolute top-1/2 z-0 isolate h-[min(86dvh,36rem)] w-[min(86dvh,36rem)] -translate-y-1/2 sm:h-[min(90dvh,42rem)] sm:w-[min(90dvh,42rem)] md:h-[min(94dvh,48rem)] md:w-[min(94dvh,48rem)]',
    side === 'left'
      ? 'left-0 -translate-x-[46%] sm:-translate-x-[43%] md:-translate-x-[40%]'
      : 'right-0 translate-x-[46%] sm:translate-x-[43%] md:translate-x-[40%]',
  );

  const image = (
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
        opacityClass,
      )}
    />
  );

  if (reducedMotion) {
    return (
      <div className={positionClass} aria-hidden>
        {image}
      </div>
    );
  }

  return (
    <motion.div
      className={positionClass}
      aria-hidden
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.9, ease: 'easeOut' }}
    >
      {image}
    </motion.div>
  );
}
