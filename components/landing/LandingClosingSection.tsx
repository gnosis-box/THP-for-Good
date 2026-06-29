import { LandingBandSection } from '@/components/landing/LandingBandSection';
import { LandingJoinCta } from '@/components/landing/LandingJoinCta';
import { LandingSectionHeader } from '@/components/landing/LandingSectionHeader';
import { ScrollReveal } from '@/components/motion/scroll-reveal';
import { UI_COPY } from '@/lib/ui-copy';

export function LandingClosingSection() {
  const { title, lead } = UI_COPY.landing.closingSection;

  return (
    <LandingBandSection band="ochre" ariaLabel="Join the chain" centered tone="cta">
      <LandingSectionHeader band="ochre" title={title} lead={lead} align="center" />
      <ScrollReveal delay={0.16} className="pt-1">
        <LandingJoinCta onOchreBand />
      </ScrollReveal>
    </LandingBandSection>
  );
}
