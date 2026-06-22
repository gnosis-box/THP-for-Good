'use client';

import { useId } from 'react';

import { LANDING_BAND, type LandingBand } from '@/components/landing/landing-theme';
import { cn } from '@/lib/utils';

/** Wave cap height — keep in sync with LandingBandSection overlap margin. */
export const LANDING_WAVE_HEIGHT_CLASS = 'h-10 sm:h-14 md:h-16';

type LandingSectionTopWaveProps = {
  band: LandingBand;
  className?: string;
};

/**
 * Minimal organic seam — wave cap overlaps the previous band (no transparent gutter).
 * Fill uses theme tokens so it matches the section surface exactly.
 */
export function LandingSectionTopWave({ band, className }: LandingSectionTopWaveProps) {
  const gradientId = `landing-wave-${useId().replace(/:/g, '')}`;
  const fill = band === 'ochre' ? 'var(--accent)' : 'var(--background)';

  return (
    <div
      className={cn(
        'pointer-events-none absolute inset-x-0 top-0 z-30',
        LANDING_WAVE_HEIGHT_CLASS,
        '-translate-y-[calc(100%-1px)]',
        className,
      )}
      aria-hidden
    >
      <svg
        className="block h-full w-full drop-shadow-[0_1px_0_rgba(90,159,118,0.12)]"
        viewBox="0 0 1440 72"
        preserveAspectRatio="none"
        role="presentation"
      >
        <defs>
          <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor={LANDING_BAND.accentLine} stopOpacity="0" />
            <stop offset="42%" stopColor={LANDING_BAND.accentLine} stopOpacity="0.28" />
            <stop offset="58%" stopColor={LANDING_BAND.accentLine} stopOpacity="0.28" />
            <stop offset="100%" stopColor={LANDING_BAND.accentLine} stopOpacity="0" />
          </linearGradient>
        </defs>
        {/* Soft single-curve fill — modern, not busy */}
        <path
          d="M0,72 L0,36 C360,8 720,52 1080,28 C1260,16 1380,44 1440,32 L1440,72 Z"
          fill={fill}
        />
        {/* Hairline crest */}
        <path
          d="M0,36 C360,8 720,52 1080,28 C1260,16 1380,44 1440,32"
          fill="none"
          stroke={`url(#${gradientId})`}
          strokeWidth="1"
          vectorEffect="non-scaling-stroke"
        />
      </svg>
    </div>
  );
}

export const landingWaveOverlapClass = '-mt-10 sm:-mt-14 md:-mt-16';
