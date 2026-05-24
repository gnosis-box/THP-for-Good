'use client';

import type { ReactNode } from 'react';

import { usePrefersReducedMotion } from '@/hooks/use-prefers-reduced-motion';
import { motionClass } from '@/lib/motion';
import { cn } from '@/lib/utils';

type Props = {
  className?: string;
  children: ReactNode;
};

export function MotionEmpty({ className, children }: Props) {
  const reducedMotion = usePrefersReducedMotion();

  return (
    <div className={cn(motionClass('', 'motion-empty-in', reducedMotion), className)}>
      {children}
    </div>
  );
}
