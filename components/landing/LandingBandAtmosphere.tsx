import {
  landingBandAtmosphereClass,
  landingBandGrainAmbientClass,
  landingBandTopWashStyle,
  landingBandTopWashZoneClass,
  type LandingBand,
} from '@/components/landing/landing-theme';

/** Decorative atmosphere — grain + soft top wash (background fade lives on the section). */
export function LandingBandAtmosphere({ band }: { band: LandingBand }) {
  return (
    <div className="pointer-events-none absolute inset-0 z-0 overflow-hidden" aria-hidden>
      <div className={landingBandAtmosphereClass(band)} />
      <div className={landingBandGrainAmbientClass} />
      <div className={landingBandTopWashZoneClass}>
        <div className="absolute inset-0 blur-2xl" style={landingBandTopWashStyle(band)} />
      </div>
    </div>
  );
}
