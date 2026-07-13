import {
  landingBandAtmosphereClass,
  landingBandGrainAmbientClass,
  type LandingBand,
} from '@/components/landing/landing-theme';

/** Decorative atmosphere — subtle vertical tint + grain. */
export function LandingBandAtmosphere({ band }: { band: LandingBand }) {
  return (
    <div className="pointer-events-none absolute inset-0 z-0 overflow-hidden" aria-hidden>
      <div className={landingBandAtmosphereClass(band)} />
      <div className={landingBandGrainAmbientClass} />
    </div>
  );
}
