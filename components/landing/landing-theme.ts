import { cn } from '@/lib/utils';

/** Landing band palette — aligned with solarpunk.tokens.css */
export const LANDING_BAND = {
  dark: '#0a1210',
  ochre: '#c49a62',
  ink: '#141f1c',
  accentLine: '#5a9f76',
} as const;

export type LandingBand = 'dark' | 'ochre';

/**
 * Editorial seam hand-off: bands butt flush against each other and the join is
 * a single crisp accent rule — no overlap, no rounded corners, no cast shadow.
 *
 * The wrapper stays so a seam marker can straddle the band's top edge without
 * being cut by the section's `overflow-hidden`.
 */
export const landingSeamWrapperClass = 'relative';

export function landingBandSurfaceClass(band: LandingBand) {
  return cn('border-t border-[#5a9f76]', band === 'ochre' ? 'bg-[#c49a62]' : 'bg-[#0a1210]');
}

/** Shared vertical rhythm — padding-driven, no fixed heights, symmetric top/bottom. */
export const landingBandContentSectionShellClass =
  'relative isolate flex flex-col overflow-hidden px-5 py-16 supports-[padding:max(0px)]:px-[max(1.25rem,env(safe-area-inset-left))] supports-[padding:max(0px)]:pr-[max(1.25rem,env(safe-area-inset-right))] sm:px-8 sm:py-20 md:py-24';

/** Closing CTA — last band, slightly tighter rhythm. */
export const landingBandCtaSectionShellClass =
  'relative isolate flex flex-col overflow-hidden px-5 py-16 supports-[padding:max(0px)]:px-[max(1.25rem,env(safe-area-inset-left))] supports-[padding:max(0px)]:pr-[max(1.25rem,env(safe-area-inset-right))] sm:px-8 sm:py-20';

const landingGrainBgClass =
  '[background-image:url("data:image/svg+xml,%3Csvg%20viewBox%3D%220%200%20256%20256%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%3E%3Cfilter%20id%3D%22n%22%3E%3CfeTurbulence%20type%3D%22fractalNoise%22%20baseFrequency%3D%220.85%22%20numOctaves%3D%224%22%20stitchTiles%3D%22stitch%22%2F%3E%3C%2Ffilter%3E%3Crect%20width%3D%22100%25%22%20height%3D%22100%25%22%20filter%3D%22url(%23n)%22%2F%3E%3C%2Fsvg%3E")]';

/** Light grain across the section body. */
export const landingBandGrainAmbientClass = cn(
  'pointer-events-none absolute inset-0 z-0 opacity-[0.03] mix-blend-soft-light',
  landingGrainBgClass,
  '[background-size:200px_200px]',
);

export const landingSectionInnerClass =
  'relative z-20 mx-auto flex w-full max-w-3xl flex-col gap-10 md:gap-12';

export const landingSectionHeaderClass = 'flex max-w-2xl flex-col gap-4';

export const landingTitleClass =
  'font-heading text-[clamp(1.75rem,5vw,2.85rem)] font-bold leading-[1.08] tracking-tight text-balance';

export function landingBandAtmosphereClass(band: LandingBand) {
  return cn(
    'pointer-events-none absolute inset-0',
    band === 'ochre'
      ? 'bg-gradient-to-b from-[#141f1c]/[0.06] via-transparent to-[#141f1c]/[0.04]'
      : 'bg-gradient-to-b from-primary/[0.05] via-transparent to-primary/[0.02]',
  );
}

export function landingKickerClass(band: LandingBand) {
  return cn(
    'inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em]',
    band === 'ochre' ? 'text-[#141f1c]/70' : 'text-muted-foreground/80',
  );
}

export function landingKickerRuleClass(band: LandingBand) {
  return cn('h-px w-6', band === 'ochre' ? 'bg-[#141f1c]/40' : 'bg-muted-foreground/30');
}

export function landingHeadingClass(band: LandingBand) {
  return cn(landingTitleClass, band === 'ochre' ? 'text-[#141f1c]' : 'text-foreground');
}

export function landingLeadClass(band: LandingBand) {
  return cn(
    'max-w-prose text-base leading-relaxed text-pretty sm:text-lg',
    band === 'ochre' ? 'text-[#141f1c]/85' : 'text-muted-foreground',
  );
}

/** Editorial feature row — hairline top rule, no box, no hover chrome. */
export function landingFeatureCardClass(band: LandingBand) {
  return cn(
    'flex flex-col gap-2.5 border-t pt-5',
    band === 'ochre' ? 'border-[#141f1c]/25' : 'border-white/10',
  );
}

export function landingFeatureIndexClass(band: LandingBand) {
  return cn(
    'font-mono text-xs font-medium tabular-nums',
    band === 'ochre' ? 'text-[#141f1c]/50' : 'text-[#5a9f76]',
  );
}

export function landingFeatureTitleClass(band: LandingBand) {
  return cn('text-base font-semibold', band === 'ochre' ? 'text-[#141f1c]' : 'text-foreground');
}

export function landingFeatureBodyClass(band: LandingBand) {
  return cn(
    'text-sm leading-relaxed',
    band === 'ochre' ? 'text-[#141f1c]/80' : 'text-muted-foreground',
  );
}
