'use client';

import { usePrefersReducedMotion } from '@/hooks/use-prefers-reduced-motion';
import { motionClass } from '@/lib/motion';
import { cn } from '@/lib/utils';

function CornerRing({
  className,
  driftClass,
  reducedMotion,
}: {
  className?: string;
  driftClass: string;
  reducedMotion: boolean;
}) {
  return (
    <svg
      viewBox="0 0 120 120"
      aria-hidden
      className={cn(
        'h-28 w-28 sm:h-32 sm:w-32',
        motionClass('', driftClass, reducedMotion),
        className,
      )}
    >
      <circle
        cx="60"
        cy="60"
        r="52"
        fill="none"
        stroke="currentColor"
        strokeWidth="1"
        strokeDasharray="82 245"
        strokeLinecap="round"
        className="opacity-40"
      />
      <circle
        cx="60"
        cy="60"
        r="38"
        fill="none"
        stroke="currentColor"
        strokeWidth="1"
        strokeDasharray="60 179"
        strokeLinecap="round"
        className="opacity-25"
      />
    </svg>
  );
}

export function LandingCornerOrnaments() {
  const reducedMotion = usePrefersReducedMotion();

  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-0 z-0 h-56" aria-hidden>
      <div className="absolute -bottom-20 -left-20 h-56 w-56 rounded-full bg-primary/25 blur-3xl landing-corner-glow" />
      <CornerRing
        driftClass="landing-corner-drift"
        reducedMotion={reducedMotion}
        className="absolute bottom-4 left-2 text-primary sm:bottom-6 sm:left-6"
      />

      <div className="absolute -bottom-20 -right-20 h-56 w-56 rounded-full bg-accent/20 blur-3xl landing-corner-glow [animation-delay:2.5s]" />
      <CornerRing
        driftClass="landing-corner-drift-reverse"
        reducedMotion={reducedMotion}
        className="absolute bottom-4 right-2 text-accent sm:bottom-6 sm:right-6"
      />
    </div>
  );
}
