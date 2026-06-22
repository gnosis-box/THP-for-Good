import type { CSSProperties } from 'react';

import { cn } from '@/lib/utils';

/** Landing band palette — aligned with solarpunk.tokens.css */
export const LANDING_BAND = {
  dark: '#0a1210',
  ochre: '#c49a62',
  ink: '#141f1c',
  accentLine: '#5a9f76',
} as const;

export type LandingBand = 'dark' | 'ochre';

/** Shared vertical rhythm for scroll sections (hero excluded). */
export const landingSectionShellClass =
  'relative isolate flex min-h-[min(64dvh,36rem)] flex-col justify-center overflow-hidden py-20 pb-[max(4rem,env(safe-area-inset-bottom,0px))] supports-[padding:max(0px)]:px-[max(1.25rem,env(safe-area-inset-left))] supports-[padding:max(0px)]:pr-[max(1.25rem,env(safe-area-inset-right))] sm:px-8 md:py-24 lg:py-28';

const landingGrainBgClass =
  '[background-image:url("data:image/svg+xml,%3Csvg%20viewBox%3D%220%200%20256%20256%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%3E%3Cfilter%20id%3D%22n%22%3E%3CfeTurbulence%20type%3D%22fractalNoise%22%20baseFrequency%3D%220.85%22%20numOctaves%3D%224%22%20stitchTiles%3D%22stitch%22%2F%3E%3C%2Ffilter%3E%3Crect%20width%3D%22100%25%22%20height%3D%22100%25%22%20filter%3D%22url(%23n)%22%2F%3E%3C%2Fsvg%3E")]';

/** Light grain across the section body. */
export const landingBandGrainAmbientClass = cn(
  'pointer-events-none absolute inset-0 z-0 opacity-[0.03] mix-blend-soft-light',
  landingGrainBgClass,
  '[background-size:200px_200px]',
);

/** Previous-band colour for top fade (alternating dark ↔ ochre). */
export function landingBandPreviousColor(band: LandingBand) {
  return band === 'ochre' ? LANDING_BAND.dark : LANDING_BAND.ochre;
}

/**
 * Section surface — gradient from previous band at the top into the current band.
 * Avoids a hard horizontal line between stacked sections (no negative overlap).
 */
export function landingBandSurfaceStyle(band: LandingBand): CSSProperties {
  const current = band === 'ochre' ? LANDING_BAND.ochre : LANDING_BAND.dark;
  const prev = landingBandPreviousColor(band);

  return {
    background: [
      'linear-gradient(to bottom,',
      `${prev} 0%,`,
      `color-mix(in srgb, ${prev} 82%, ${current}) 10%,`,
      `color-mix(in srgb, ${prev} 58%, ${current}) 18%,`,
      `color-mix(in srgb, ${prev} 36%, ${current}) 26%,`,
      `color-mix(in srgb, ${prev} 16%, ${current}) 34%,`,
      `${current} 42%,`,
      `${current} 100%)`,
    ].join(' '),
  };
}

/** Soft painterly wash — decorative only, contained in the top fade zone. */
export const landingBandTopWashZoneClass =
  'pointer-events-none absolute inset-x-0 top-0 z-0 h-[min(32vh,15rem)] overflow-hidden';

export function landingBandTopWashStyle(band: LandingBand): CSSProperties {
  const prev = landingBandPreviousColor(band);
  return {
    background: [
      `radial-gradient(ellipse 90% 70% at 18% 0%, color-mix(in srgb, ${prev} 55%, transparent) 0%, transparent 68%),`,
      `radial-gradient(ellipse 85% 65% at 82% 4%, color-mix(in srgb, ${prev} 45%, transparent) 0%, transparent 65%),`,
      `radial-gradient(ellipse 100% 75% at 50% -5%, color-mix(in srgb, ${prev} 35%, transparent) 0%, transparent 72%)`,
    ].join(' '),
  };
}

export const landingSectionInnerClass =
  'relative z-20 mx-auto flex w-full max-w-3xl flex-col gap-10 md:gap-12';

export const landingSectionHeaderClass = 'flex max-w-2xl flex-col gap-4';

export const landingTitleClass =
  'font-heading text-[clamp(1.65rem,4.8vw,2.65rem)] font-bold leading-[1.08] tracking-tight text-balance';

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

export function landingFeatureCardClass(band: LandingBand) {
  return cn(
    'group flex flex-col gap-3 rounded-2xl border px-5 py-5',
    'transition-[transform,background-color,border-color,box-shadow] duration-200',
    'hover:-translate-y-0.5 hover:shadow-sm motion-reduce:hover:translate-y-0',
    band === 'ochre'
      ? 'border-[#141f1c]/15 bg-[#141f1c]/[0.06] hover:border-[#141f1c]/28 hover:bg-[#141f1c]/[0.1]'
      : 'border-border/70 bg-[#141f1c]/35 backdrop-blur-[2px] hover:border-border hover:bg-[#141f1c]/50',
  );
}

export function landingFeatureIndexClass(band: LandingBand) {
  return cn(
    'font-mono text-xs font-medium tabular-nums',
    band === 'ochre' ? 'text-[#141f1c]/50' : 'text-muted-foreground/55',
  );
}

export function landingFeatureTitleClass(band: LandingBand) {
  return cn('text-sm font-semibold', band === 'ochre' ? 'text-[#141f1c]' : 'text-foreground');
}

export function landingFeatureBodyClass(band: LandingBand) {
  return cn(
    'text-sm leading-relaxed',
    band === 'ochre' ? 'text-[#141f1c]/80' : 'text-muted-foreground',
  );
}
