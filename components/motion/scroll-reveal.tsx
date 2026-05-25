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
};

const motionProps = (delay: number) => ({
  initial: { opacity: 0, y: 16 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, amount: 0.4 as const },
  transition: { duration: 0.35, ease: 'easeOut' as const, delay },
});

/** Scroll-triggered fade-up — M-P2-04 */
export function ScrollReveal({ className, children, delay = 0, as = 'div' }: Props) {
  const reducedMotion = usePrefersReducedMotion();

  if (reducedMotion) {
    const Tag = as;
    return <Tag className={className}>{children}</Tag>;
  }

  if (as === 'li') {
    return (
      <motion.li className={cn(className)} {...motionProps(delay)}>
        {children}
      </motion.li>
    );
  }

  return (
    <motion.div className={cn(className)} {...motionProps(delay)}>
      {children}
    </motion.div>
  );
}
