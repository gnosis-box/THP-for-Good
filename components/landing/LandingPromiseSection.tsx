import { LandingBandSection } from '@/components/landing/LandingBandSection';
import { LandingFeatureGrid } from '@/components/landing/LandingFeatureGrid';
import { LandingSectionHeader } from '@/components/landing/LandingSectionHeader';
import { UI_COPY } from '@/lib/ui-copy';

export function LandingPromiseSection() {
  const { kicker, problemTitle, promise, features } = UI_COPY.landing.promiseSection;

  return (
    <LandingBandSection
      band="ochre"
      ariaLabel="Why THP for Good"
      watermark={{ side: 'right', src: '/thp-logo-beige-green.png' }}
    >
      <LandingSectionHeader band="ochre" kicker={kicker} title={problemTitle} lead={promise} />
      <LandingFeatureGrid band="ochre" features={features} columns="three" />
    </LandingBandSection>
  );
}
