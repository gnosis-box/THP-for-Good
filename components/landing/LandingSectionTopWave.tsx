'use client';

import { useId } from 'react';

import { LANDING_BAND, type LandingBand } from '@/components/landing/landing-theme';
import { cn } from '@/lib/utils';

type LandingSectionTopWaveProps = {
  band: LandingBand;
  className?: string;
};

/**
 * Wave cap anchored to the top of a band section — extends upward over the
 * previous band so there is no transparent gutter (standalone dividers left a
 * visible strip of the page background between sections).
 */
export function LandingSectionTopWave({ band, className }: LandingSectionTopWaveProps) {
  const gradientId = `landing-wave-${useId().replace(/:/g, '')}`;
  const fill = band === 'ochre' ? 'var(--accent)' : 'var(--background)';

  return (
    <div
      className={cn(
        'pointer-events-none absolute inset-x-0 top-0 z-20 h-10 -translate-y-[calc(100%-1px)] sm:h-14 md:h-16',
        className,
      )}
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
          d="M0,20 C240,52 480,8 720,36 C960,4 1200,40 1440,18 L1440,64 L0,64 Z"
          fill={fill}
        />
        <path
          d="M0,20 C240,52 480,8 720,36 C960,4 1200,40 1440,18"
          fill="none"
          stroke={`url(#${gradientId})`}
          strokeWidth="1.25"
          vectorEffect="non-scaling-stroke"
        />
      </svg>
    </div>
  );
}
