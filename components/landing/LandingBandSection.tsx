import type { ReactNode } from 'react';

import { LandingBandAtmosphere } from '@/components/landing/LandingBandAtmosphere';
import {
  landingBandContentSectionShellClass,
  landingBandCtaSectionShellClass,
  landingBandSurfaceClass,
  landingSeamWrapperClass,
  landingSectionInnerClass,
  type LandingBand,
} from '@/components/landing/landing-theme';
import { LandingSectionWatermark } from '@/components/landing/LandingSectionWatermark';
import { cn } from '@/lib/utils';

type LandingBandSectionProps = {
  band: LandingBand;
  ariaLabel: string;
  watermark?: { side: 'left' | 'right'; src: string };
  /** Marker straddling the seam rule with the previous band (e.g. `<LandingSeamBadge />`). */
  seamBadge?: ReactNode;
  centered?: boolean;
  /** `content` = explanatory band; `cta` = closing section (last sheet). */
  tone?: 'content' | 'cta';
  className?: string;
  children: ReactNode;
};

export function LandingBandSection({
  band,
  ariaLabel,
  watermark,
  seamBadge,
  centered = false,
  tone = 'content',
  className,
  children,
}: LandingBandSectionProps) {
  return (
    <div className={landingSeamWrapperClass}>
      {seamBadge}
      <section
        className={cn(
          tone === 'cta' ? landingBandCtaSectionShellClass : landingBandContentSectionShellClass,
          landingBandSurfaceClass(band),
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
    </div>
  );
}
