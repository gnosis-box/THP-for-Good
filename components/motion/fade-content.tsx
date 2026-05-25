'use client';

import type { ReactNode } from 'react';

import { usePrefersReducedMotion } from '@/hooks/use-prefers-reduced-motion';
import { motionClass } from '@/lib/motion';
import { cn } from '@/lib/utils';

type Props = {
  className?: string;
  children: ReactNode;
};

/** Mount fade-up wrapper — M-P1-03, M-P1-08 */
export function FadeContent({ className, children }: Props) {
  const reducedMotion = usePrefersReducedMotion();

  return (
    <div className={cn(motionClass('', 'motion-fade-up', reducedMotion), className)}>
      {children}
    </div>
  );
}
