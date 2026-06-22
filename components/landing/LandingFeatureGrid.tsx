import type { ReactNode } from 'react';

import {
  landingFeatureBodyClass,
  landingFeatureCardClass,
  landingFeatureIndexClass,
  landingFeatureTitleClass,
  type LandingBand,
} from '@/components/landing/landing-theme';
import { ScrollReveal } from '@/components/motion/scroll-reveal';
import { cn } from '@/lib/utils';

type LandingFeature = {
  title: string;
  body: string;
};

type LandingFeatureGridProps = {
  band: LandingBand;
  features: readonly LandingFeature[];
  columns?: 'two' | 'three';
  footer?: ReactNode;
};

export function LandingFeatureGrid({
  band,
  features,
  columns = 'three',
  footer,
}: LandingFeatureGridProps) {
  return (
    <>
      <ul
        className={cn(
          'grid gap-4 sm:gap-5',
          columns === 'three' ? 'sm:grid-cols-2 lg:grid-cols-3' : 'sm:grid-cols-2',
        )}
      >
        {features.map((feature, index) => (
          <ScrollReveal
            as="li"
            key={feature.title}
            delay={0.05 * index}
            className={landingFeatureCardClass(band)}
          >
            <span className={landingFeatureIndexClass(band)}>
              {String(index + 1).padStart(2, '0')}
            </span>
            <h3 className={landingFeatureTitleClass(band)}>{feature.title}</h3>
            <p className={landingFeatureBodyClass(band)}>{feature.body}</p>
          </ScrollReveal>
        ))}
      </ul>
      {footer}
    </>
  );
}
