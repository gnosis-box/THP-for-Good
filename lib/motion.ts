import type { CSSProperties } from 'react';

import { cn } from '@/lib/utils';

/** CSS custom-property stagger delay; empty when reduced motion or over cap. */
export function staggerDelay(index: number, reducedMotion: boolean, cap = 8): string | undefined {
  if (reducedMotion || index >= cap) return undefined;
  return `${index * 50}ms`;
}

export function motionClass(base: string, animated: string, reducedMotion: boolean): string {
  return cn(base, !reducedMotion && animated);
}

export function motionStaggerStyle(
  index: number,
  reducedMotion: boolean,
  cap = 8,
): CSSProperties | undefined {
  const delay = staggerDelay(index, reducedMotion, cap);
  return delay ? { animationDelay: delay } : undefined;
}
