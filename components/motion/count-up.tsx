'use client';

import { useEffect, useRef, useState } from 'react';

import { usePrefersReducedMotion } from '@/hooks/use-prefers-reduced-motion';
import { cn } from '@/lib/utils';

type Props = {
  value: number;
  format?: (n: number) => string;
  duration?: number;
  className?: string;
  suffix?: string;
};

const defaultFormat = (n: number) => String(Math.round(n));

export function CountUp({
  value,
  format = defaultFormat,
  duration = 800,
  className,
  suffix,
}: Props) {
  const reducedMotion = usePrefersReducedMotion();
  const [display, setDisplay] = useState(reducedMotion ? value : 0);
  const rafRef = useRef<number | null>(null);
  const startRef = useRef<number | null>(null);
  const fromRef = useRef(0);

  useEffect(() => {
    if (reducedMotion) {
      setDisplay(value);
      return;
    }

    fromRef.current = display;
    startRef.current = null;

    const animate = (timestamp: number) => {
      if (startRef.current === null) startRef.current = timestamp;
      const elapsed = timestamp - startRef.current;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - (1 - progress) ** 3;
      const next = fromRef.current + (value - fromRef.current) * eased;
      setDisplay(next);

      if (progress < 1) {
        rafRef.current = requestAnimationFrame(animate);
      }
    };

    rafRef.current = requestAnimationFrame(animate);

    return () => {
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- re-run when target value changes
  }, [value, duration, reducedMotion]);

  return (
    <span className={cn('tabular-nums', className)}>
      {format(display)}
      {suffix}
    </span>
  );
}
