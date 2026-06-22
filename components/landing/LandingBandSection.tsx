import type { ReactNode } from 'react';

import {
  landingBandAtmosphereClass,
  landingBandSurfaceClass,
  landingSectionInnerClass,
  landingSectionShellClass,
  type LandingBand,
} from '@/components/landing/landing-theme';
import { landingWaveOverlapClass, LandingSectionTopWave } from '@/components/landing/LandingSectionTopWave';
import { LandingSectionWatermark } from '@/components/landing/LandingSectionWatermark';
import { cn } from '@/lib/utils';

type LandingBandSectionProps = {
  band: LandingBand;
  ariaLabel: string;
  watermark?: { side: 'left' | 'right'; src: string };
  centered?: boolean;
  /** Organic seam overlapping the previous scroll band. */
  showTopWave?: boolean;
  className?: string;
  children: ReactNode;
};

export function LandingBandSection({
  band,
  ariaLabel,
  watermark,
  centered = false,
  showTopWave = false,
  className,
  children,
}: LandingBandSectionProps) {
  return (
    <section
      className={cn(
        landingSectionShellClass,
        landingBandSurfaceClass(band),
        centered && 'items-center text-center',
        showTopWave && landingWaveOverlapClass,
        className,
      )}
      aria-label={ariaLabel}
    >
      {showTopWave ? <LandingSectionTopWave band={band} /> : null}
      <div className={cn(landingBandAtmosphereClass(band), 'overflow-hidden')} aria-hidden />
      {watermark ? (
        <LandingSectionWatermark side={watermark.side} src={watermark.src} band={band} />
      ) : null}
      <div className={cn(landingSectionInnerClass, centered && 'items-center')}>{children}</div>
    </section>
  );
}
