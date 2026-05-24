'use client';

import type { ReactNode } from 'react';

import { usePrefersReducedMotion } from '@/hooks/use-prefers-reduced-motion';
import { motionClass, motionStaggerStyle } from '@/lib/motion';
import { cn } from '@/lib/utils';

type AnimatedListProps = {
  /** Changes on filter/search to re-run entrance stagger */
  listKey: string;
  className?: string;
  children: ReactNode;
};

export function AnimatedList({ listKey, className, children }: AnimatedListProps) {
  return (
    <ul key={listKey} className={className}>
      {children}
    </ul>
  );
}

type AnimatedListItemProps = {
  index: number;
  className?: string;
  children: ReactNode;
  cap?: number;
};

export function AnimatedListItem({ index, className, children, cap = 12 }: AnimatedListItemProps) {
  const reducedMotion = usePrefersReducedMotion();

  return (
    <li
      className={cn(motionClass('', 'motion-list-item-in', reducedMotion), className)}
      style={motionStaggerStyle(index, reducedMotion, cap)}
    >
      {children}
    </li>
  );
}
