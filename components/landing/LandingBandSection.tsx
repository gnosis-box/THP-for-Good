import type { ReactNode } from 'react';

import { LandingBandAtmosphere } from '@/components/landing/LandingBandAtmosphere';
import {
  landingBandContentSectionShellClass,
  landingBandCtaSectionShellClass,
  landingSectionInnerClass,
  landingBandSurfaceStyle,
  type LandingBand,
} from '@/components/landing/landing-theme';
import { LandingSectionWatermark } from '@/components/landing/LandingSectionWatermark';
import { cn } from '@/lib/utils';

type LandingBandSectionProps = {
  band: LandingBand;
  ariaLabel: string;
  watermark?: { side: 'left' | 'right'; src: string };
  centered?: boolean;
  /** `content` = uniform explanatory band height; `cta` = closing section. */
  tone?: 'content' | 'cta';
  className?: string;
  children: ReactNode;
};

export function LandingBandSection({
  band,
  ariaLabel,
  watermark,
  centered = false,
  tone = 'content',
  className,
  children,
}: LandingBandSectionProps) {
  return (
    <section
      style={landingBandSurfaceStyle(band)}
      className={cn(
        tone === 'cta' ? landingBandCtaSectionShellClass : landingBandContentSectionShellClass,
        centered && 'items-center text-center',
        className,
      )}
      aria-label={ariaLabel}
    >
      <LandingBandAtmosphere band={band} />
      {watermark ? (
        <LandingSectionWatermark
          layout="band"
          side={watermark.side}
          src={watermark.src}
          band={band}
        />
      ) : null}
      <div className={cn(landingSectionInnerClass, centered && 'items-center')}>{children}</div>
    </section>
  );
}
