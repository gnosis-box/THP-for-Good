'use client';

import { useId } from 'react';

import { LANDING_BAND, type LandingBand } from '@/components/landing/landing-theme';
import { cn } from '@/lib/utils';

type LandingSectionDividerProps = {
  /** Color of the section below the divider. */
  to: LandingBand;
  className?: string;
};

/**
 * Organic wave seam between alternating landing bands.
 * Static SVG — no layout shift, respects reduced motion by default.
 */
export function LandingSectionDivider({ to, className }: LandingSectionDividerProps) {
  const gradientId = `landing-divider-${useId().replace(/:/g, '')}`;
  const fill = to === 'ochre' ? LANDING_BAND.ochre : LANDING_BAND.dark;

  return (
    <div
      className={cn('relative -mt-px h-10 w-full shrink-0 overflow-hidden sm:h-14 md:h-16', className)}
      aria-hidden
    >
      <svg
        className="block h-full w-full"
        viewBox="0 0 1440 64"
        preserveAspectRatio="none"
        role="presentation"
      >
        <defs>
          <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor={LANDING_BAND.accentLine} stopOpacity="0" />
            <stop offset="35%" stopColor={LANDING_BAND.accentLine} stopOpacity="0.35" />
            <stop offset="65%" stopColor={LANDING_BAND.accentLine} stopOpacity="0.35" />
            <stop offset="100%" stopColor={LANDING_BAND.accentLine} stopOpacity="0" />
          </linearGradient>
        </defs>
        <path
          d="M0,64 L0,28 C240,4 480,52 720,30 C960,8 1200,44 1440,22 L1440,64 Z"
          fill={fill}
        />
        <path
          d="M0,28 C240,4 480,52 720,30 C960,8 1200,44 1440,22"
          fill="none"
          stroke={`url(#${gradientId})`}
          strokeWidth="1.25"
          vectorEffect="non-scaling-stroke"
        />
      </svg>
    </div>
  );
}
