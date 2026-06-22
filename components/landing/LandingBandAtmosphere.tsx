import {
  landingBandAtmosphereClass,
  landingBandGrainAmbientClass,
  landingColorBleedBlobLayoutClass,
  landingColorBleedBlobStyle,
  landingColorBleedWashStyle,
  landingColorBleedZoneClass,
  type LandingBand,
} from '@/components/landing/landing-theme';
import { cn } from '@/lib/utils';

const BLEED_BLOB_POSITIONS = ['left', 'center', 'right'] as const;

/** Watercolor bleed — blurred radial washes from the section above. */
export function LandingBandAtmosphere({ band }: { band: LandingBand }) {
  return (
    <div className="pointer-events-none absolute inset-0 z-0 overflow-visible" aria-hidden>
      <div className={landingBandAtmosphereClass(band)} />
      <div className={landingBandGrainAmbientClass} />
      <div className={landingColorBleedZoneClass}>
        <div
          className="pointer-events-none absolute inset-0 blur-2xl mix-blend-normal"
          style={landingColorBleedWashStyle(band)}
        />
        {BLEED_BLOB_POSITIONS.map((position) => {
          const layout = landingColorBleedBlobLayoutClass[position];
          return (
            <div
              key={position}
              className={cn(
                'pointer-events-none mix-blend-normal',
                layout.className,
                layout.blur,
                layout.opacity,
              )}
              style={landingColorBleedBlobStyle(band, position)}
            />
          );
        })}
      </div>
    </div>
  );
}
