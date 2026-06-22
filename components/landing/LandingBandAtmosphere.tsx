import {
  landingBandAtmosphereClass,
  landingBandGrainClass,
  landingBandTopMistClass,
  type LandingBand,
} from '@/components/landing/landing-theme';

/** Layered mist + grain — replaces hard wave seams between scroll bands. */
export function LandingBandAtmosphere({ band }: { band: LandingBand }) {
  return (
    <div className="pointer-events-none absolute inset-0 z-0 overflow-hidden" aria-hidden>
      <div className={landingBandAtmosphereClass(band)} />
      <div className={landingBandTopMistClass(band)} />
      <div className={landingBandGrainClass} />
    </div>
  );
}
