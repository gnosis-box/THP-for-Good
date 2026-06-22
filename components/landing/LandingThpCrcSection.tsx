import { LandingBandSection } from '@/components/landing/LandingBandSection';
import { LandingFeatureGrid } from '@/components/landing/LandingFeatureGrid';
import { landingLeadClass } from '@/components/landing/landing-theme';
import { LandingSectionHeader } from '@/components/landing/LandingSectionHeader';
import { ScrollReveal } from '@/components/motion/scroll-reveal';
import { UI_COPY } from '@/lib/ui-copy';

export function LandingThpCrcSection() {
  const { kicker, title, features, summary } = UI_COPY.landing.thpCrcSection;

  return (
    <LandingBandSection
      band="dark"
      ariaLabel="CRC at THP for Good"
      showTopWave
      watermark={{ side: 'left', src: '/circles-owl-logo-beige.png' }}
    >
      <LandingSectionHeader band="dark" kicker={kicker} title={title} />
      <LandingFeatureGrid
        band="dark"
        features={features}
        columns="two"
        footer={
          <ScrollReveal delay={0.2}>
            <p className={landingLeadClass('dark')}>{summary}</p>
          </ScrollReveal>
        }
      />
    </LandingBandSection>
  );
}
