'use client';

import type { ReactNode } from 'react';
import { motion } from 'motion/react';

import { usePrefersReducedMotion } from '@/hooks/use-prefers-reduced-motion';
import { cn } from '@/lib/utils';

type Props = {
  className?: string;
  children: ReactNode;
  delay?: number;
  as?: 'div' | 'li';
  /** When true, content is visible immediately (e.g. above-the-fold hero). */
  immediate?: boolean;
  /** When true, animates only on first entry instead of every viewport pass. */
  once?: boolean;
};

const motionProps = (delay: number, once: boolean) => ({
  initial: { opacity: 0, y: 16 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once, amount: 0.35 as const },
  transition: { duration: 0.35, ease: 'easeOut' as const, delay },
});

/** Scroll-triggered fade-up — re-animates on every viewport entry unless `once`. */
export function ScrollReveal({
  className,
  children,
  delay = 0,
  as = 'div',
  immediate = false,
  once = false,
}: Props) {
  const reducedMotion = usePrefersReducedMotion();

  if (immediate || reducedMotion) {
    const Tag = as;
    return <Tag className={className}>{children}</Tag>;
  }

  if (as === 'li') {
    return (
      <motion.li className={cn(className)} {...motionProps(delay, once)}>
        {children}
      </motion.li>
    );
  }

  return (
    <motion.div className={cn(className)} {...motionProps(delay, once)}>
      {children}
    </motion.div>
  );
}
