import { LandingClosingSection } from '@/components/landing/LandingClosingSection';
import { LandingHeroSection } from '@/components/landing/LandingHeroSection';
import { LandingPromiseSection } from '@/components/landing/LandingPromiseSection';

export function LandingView() {
  return (
    <div className="flex flex-col">
      <LandingHeroSection />
      <LandingPromiseSection />
      <LandingClosingSection />
    </div>
  );
}
