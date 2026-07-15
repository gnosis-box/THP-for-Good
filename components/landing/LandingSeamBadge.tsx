'use client';

import { Sprout } from 'lucide-react';
import { motion } from 'motion/react';

import { usePrefersReducedMotion } from '@/hooks/use-prefers-reduced-motion';

const seamBadgeShellClass =
  'pointer-events-none absolute left-1/2 top-0 z-10 -translate-x-1/2 -translate-y-1/2';

const seamBadgeFaceClass =
  'flex h-7 min-w-12 items-center justify-center border border-[#5a9f76] bg-[#5a9f76] px-3 text-[#0a1210] sm:h-8';

/** Flat accent seal pinned on the seam rule before the closing CTA. */
export function LandingSeamBadge() {
  const reducedMotion = usePrefersReducedMotion();

  const face = (
    <span className={seamBadgeFaceClass}>
      <Sprout className="size-4" strokeWidth={2} />
    </span>
  );

  if (reducedMotion) {
    return (
      <span className={seamBadgeShellClass} aria-hidden>
        {face}
      </span>
    );
  }

  return (
    <motion.span
      className={seamBadgeShellClass}
      aria-hidden
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true, amount: 1 }}
      transition={{ duration: 0.35, ease: 'easeOut' }}
    >
      {face}
    </motion.span>
  );
}
