'use client';

import { Sprout } from 'lucide-react';
import { motion } from 'motion/react';

import { usePrefersReducedMotion } from '@/hooks/use-prefers-reduced-motion';
import { cn } from '@/lib/utils';

type LandingSeamBadgeProps = {
  /** `index` = numbered waypoint marker; `join` = accent seal before the closing CTA. */
  variant?: 'index' | 'join';
  /** Two-digit step label for the `index` variant, e.g. "01". */
  label?: string;
};

const seamBadgeShellClass =
  'pointer-events-none absolute left-1/2 top-0 z-10 -translate-x-1/2 -translate-y-1/2';

const seamBadgeFaceClass =
  'flex h-7 min-w-12 items-center justify-center border border-[#5a9f76] px-3 sm:h-8';

const seamBadgeVariantClass = {
  index: 'bg-[#0a1210] font-mono text-xs font-semibold tabular-nums tracking-[0.18em] text-[#5a9f76]',
  join: 'bg-[#5a9f76] text-[#0a1210]',
} as const;

/** Flat editorial marker pinned on the seam rule between two bands. */
export function LandingSeamBadge({ variant = 'index', label }: LandingSeamBadgeProps) {
  const reducedMotion = usePrefersReducedMotion();

  const face = (
    <span className={cn(seamBadgeFaceClass, seamBadgeVariantClass[variant])}>
      {variant === 'join' ? <Sprout className="size-4" strokeWidth={2} /> : label}
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
