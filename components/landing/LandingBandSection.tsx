import type { ReactNode } from 'react';

import {
  landingBandAtmosphereClass,
  landingBandSurfaceClass,
  landingSectionInnerClass,
  landingSectionShellClass,
  type LandingBand,
} from '@/components/landing/landing-theme';
import { LandingSectionWatermark } from '@/components/landing/LandingSectionWatermark';
import { cn } from '@/lib/utils';

type LandingBandSectionProps = {
  band: LandingBand;
  ariaLabel: string;
  watermark?: { side: 'left' | 'right'; src: string };
  centered?: boolean;
  className?: string;
  children: ReactNode;
};

export function LandingBandSection({
  band,
  ariaLabel,
  watermark,
  centered = false,
  className,
  children,
}: LandingBandSectionProps) {
  return (
    <section
      className={cn(
        landingSectionShellClass,
        landingBandSurfaceClass(band),
        centered && 'items-center text-center',
        className,
      )}
      aria-label={ariaLabel}
    >
      <div className={landingBandAtmosphereClass(band)} aria-hidden />
      {watermark ? (
        <LandingSectionWatermark side={watermark.side} src={watermark.src} band={band} />
      ) : null}
      <div className={cn(landingSectionInnerClass, centered && 'items-center')}>{children}</div>
    </section>
  );
}
