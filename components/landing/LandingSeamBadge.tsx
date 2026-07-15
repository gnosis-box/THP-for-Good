'use client';

import { Sprout } from 'lucide-react';
import { motion } from 'motion/react';

import { usePrefersReducedMotion } from '@/hooks/use-prefers-reduced-motion';
import { cn } from '@/lib/utils';

type LandingSeamBadgeProps = {
  /** `index` = numbered waypoint medallion; `join` = accent seal before the closing CTA. */
  variant?: 'index' | 'join';
  /** Two-digit step label for the `index` variant, e.g. "01". */
  label?: string;
};

const seamBadgeShellClass =
  'pointer-events-none absolute left-1/2 top-0 z-10 -translate-x-1/2 -translate-y-1/2';

const seamBadgeFaceClass = 'flex size-11 items-center justify-center rounded-full sm:size-12';

const seamBadgeVariantClass = {
  index:
    'bg-[#141f1c] font-mono text-xs font-semibold tabular-nums text-[#5a9f76] ring-1 ring-inset ring-[#5a9f76]/50 shadow-[0_10px_24px_-10px_rgba(4,10,8,0.75),inset_0_1px_0_rgba(255,255,255,0.08)]',
  join: 'bg-[#5a9f76] text-[#0a1210] shadow-[0_10px_24px_-10px_rgba(4,10,8,0.75),inset_0_1px_0_rgba(255,255,255,0.25)]',
} as const;

/** Seal pinned across the seam where a band sheet rises over the previous one. */
export function LandingSeamBadge({ variant = 'index', label }: LandingSeamBadgeProps) {
  const reducedMotion = usePrefersReducedMotion();

  const face = (
    <span className={cn(seamBadgeFaceClass, seamBadgeVariantClass[variant])}>
      {variant === 'join' ? <Sprout className="size-5" strokeWidth={2} /> : label}
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
      initial={{ opacity: 0, scale: 0.6 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true, amount: 1 }}
      transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
    >
      {face}
    </motion.span>
  );
}
