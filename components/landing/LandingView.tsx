import { LandingClosingSection } from '@/components/landing/LandingClosingSection';
import { LandingCrcSection } from '@/components/landing/LandingCrcSection';
import { LandingGnosisSection } from '@/components/landing/LandingGnosisSection';
import { LandingHeroSection } from '@/components/landing/LandingHeroSection';
import { LandingPromiseSection } from '@/components/landing/LandingPromiseSection';
import { LandingSectionDivider } from '@/components/landing/LandingSectionDivider';
import { LandingThpCrcSection } from '@/components/landing/LandingThpCrcSection';

export function LandingView() {
  return (
    <div className="flex flex-col">
      <LandingHeroSection />
      <LandingSectionDivider to="ochre" />
      <LandingPromiseSection />
      <LandingSectionDivider to="dark" />
      <LandingGnosisSection />
      <LandingSectionDivider to="ochre" />
      <LandingCrcSection />
      <LandingSectionDivider to="dark" />
      <LandingThpCrcSection />
      <LandingSectionDivider to="ochre" />
      <LandingClosingSection />
    </div>
  );
}
