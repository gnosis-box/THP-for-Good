import {
  landingBandAtmosphereClass,
  landingBandGrainAmbientClass,
  landingBandGrainSeamClass,
  landingBandSeamBlendClass,
  landingBandSeamMistClass,
  landingSeamClusterHeightClass,
  type LandingBand,
} from '@/components/landing/landing-theme';
import { cn } from '@/lib/utils';

/** Layered atmosphere — dense mist + grain straddle each band boundary. */
export function LandingBandAtmosphere({ band }: { band: LandingBand }) {
  return (
    <div className="pointer-events-none absolute inset-0 z-0 overflow-hidden" aria-hidden>
      <div className={landingBandAtmosphereClass(band)} />
      <div className={landingBandGrainAmbientClass} />
      <div
        className={cn(
          'pointer-events-none absolute inset-x-0 top-0 z-[2] -translate-y-1/2',
          landingSeamClusterHeightClass,
        )}
      >
        <div className={landingBandSeamBlendClass(band)} />
        <div className={landingBandSeamMistClass(band)} />
        <div className={landingBandGrainSeamClass} />
      </div>
    </div>
  );
}
