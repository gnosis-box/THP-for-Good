import { LandingBandSection } from '@/components/landing/LandingBandSection';
import { LandingFeatureGrid } from '@/components/landing/LandingFeatureGrid';
import { LandingSeamBadge } from '@/components/landing/LandingSeamBadge';
import { LandingSectionHeader } from '@/components/landing/LandingSectionHeader';
import { UI_COPY } from '@/lib/ui-copy';

export function LandingCrcSection() {
  const { kicker, title, features } = UI_COPY.landing.crcSection;

  return (
    <LandingBandSection
      band="ochre"
      ariaLabel="About CRC"
      watermark={{ side: 'right', src: '/circles-owl-logo-beige-green.png' }}
      seamBadge={<LandingSeamBadge label="03" />}
    >
      <LandingSectionHeader band="ochre" kicker={kicker} title={title} />
      <LandingFeatureGrid band="ochre" features={features} columns="three" />
    </LandingBandSection>
  );
}
