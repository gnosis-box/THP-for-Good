import type { ReactNode } from 'react';

import { LandingBandAtmosphere } from '@/components/landing/LandingBandAtmosphere';
import {
  landingBandContentSectionShellClass,
  landingBandCtaSectionShellClass,
  landingBandSheetClass,
  landingSectionInnerClass,
  landingSheetOverlapClass,
  type LandingBand,
} from '@/components/landing/landing-theme';
import { LandingSectionWatermark } from '@/components/landing/LandingSectionWatermark';
import { cn } from '@/lib/utils';

type LandingBandSectionProps = {
  band: LandingBand;
  ariaLabel: string;
  watermark?: { side: 'left' | 'right'; src: string };
  /** Medallion straddling the seam with the previous band (e.g. `<LandingSeamBadge />`). */
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
    <div className={landingSheetOverlapClass}>
      {seamBadge}
      <section
        className={cn(
          tone === 'cta' ? landingBandCtaSectionShellClass : landingBandContentSectionShellClass,
          landingBandSheetClass(band),
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
