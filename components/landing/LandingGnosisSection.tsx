import { LandingBandSection } from '@/components/landing/LandingBandSection';
import { landingLeadClass } from '@/components/landing/landing-theme';
import { LandingSeamBadge } from '@/components/landing/LandingSeamBadge';
import { LandingSectionHeader } from '@/components/landing/LandingSectionHeader';
import { ScrollReveal } from '@/components/motion/scroll-reveal';
import { UI_COPY } from '@/lib/ui-copy';

export function LandingGnosisSection() {
  const { kicker, title, body } = UI_COPY.landing.gnosisSection;

  return (
    <LandingBandSection
      band="dark"
      ariaLabel="About Gnosis and CRC"
      watermark={{ side: 'left', src: '/circles-owl-logo-beige.png' }}
      seamBadge={<LandingSeamBadge label="02" />}
    >
      <LandingSectionHeader band="dark" kicker={kicker} title={title} />
      <ScrollReveal once delay={0.14}>
        <p className={landingLeadClass('dark')}>{body}</p>
      </ScrollReveal>
    </LandingBandSection>
  );
}
