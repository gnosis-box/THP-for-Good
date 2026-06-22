import { LandingClosingSection } from '@/components/landing/LandingClosingSection';
import { LandingCrcSection } from '@/components/landing/LandingCrcSection';
import { LandingGnosisSection } from '@/components/landing/LandingGnosisSection';
import { LandingHeroSection } from '@/components/landing/LandingHeroSection';
import { LandingPromiseSection } from '@/components/landing/LandingPromiseSection';
import { LandingThpCrcSection } from '@/components/landing/LandingThpCrcSection';

export function LandingView() {
  return (
    <div className="flex flex-col">
      <LandingHeroSection />
      <LandingPromiseSection />
      <LandingGnosisSection />
      <LandingCrcSection />
      <LandingThpCrcSection />
      <LandingClosingSection />
    </div>
  );
}
