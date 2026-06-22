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
  'relative isolate flex min-h-[min(64dvh,36rem)] flex-col justify-center overflow-x-clip py-20 pb-[max(4rem,env(safe-area-inset-bottom,0px))] supports-[padding:max(0px)]:px-[max(1.25rem,env(safe-area-inset-left))] supports-[padding:max(0px)]:pr-[max(1.25rem,env(safe-area-inset-right))] sm:px-8 md:py-24 lg:py-28';

/** Pull band up so the colour wash straddles the previous section edge. */
export const landingBleedOverlapClass = '-mt-20 sm:-mt-28 md:-mt-32';

/** Tall zone centred on the band boundary — hosts blurred radial washes. */
export const landingColorBleedZoneClass =
  'pointer-events-none absolute inset-x-[-12%] top-0 z-[2] h-36 -translate-y-[42%] sm:h-44 sm:-translate-y-[45%] md:h-52 md:-translate-y-[48%]';

const landingGrainBgClass =
  '[background-image:url("data:image/svg+xml,%3Csvg%20viewBox%3D%220%200%20256%20256%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%3E%3Cfilter%20id%3D%22n%22%3E%3CfeTurbulence%20type%3D%22fractalNoise%22%20baseFrequency%3D%220.85%22%20numOctaves%3D%224%22%20stitchTiles%3D%22stitch%22%2F%3E%3C%2Ffilter%3E%3Crect%20width%3D%22100%25%22%20height%3D%22100%25%22%20filter%3D%22url(%23n)%22%2F%3E%3C%2Fsvg%3E")]';

/** Light grain across the section body. */
export const landingBandGrainAmbientClass = cn(
  'pointer-events-none absolute inset-0 opacity-[0.03] mix-blend-soft-light',
  landingGrainBgClass,
  '[background-size:200px_200px]',
);

/** Previous-band colour for watercolor bleed (alternating dark ↔ ochre). */
export function landingBandPreviousColor(band: LandingBand) {
  return band === 'ochre' ? LANDING_BAND.dark : LANDING_BAND.ochre;
}

/** Base vertical wash — previous band tint fading into the current surface. */
export function landingColorBleedWashStyle(band: LandingBand): CSSProperties {
  const prev = landingBandPreviousColor(band);
  return {
    background: `linear-gradient(to bottom, ${prev} 0%, ${prev}cc 12%, ${prev}66 28%, ${prev}22 48%, transparent 72%)`,
  };
}

type BleedBlobPosition = 'left' | 'center' | 'right';

/** Soft radial blob — offset horizontally for a non-linear, painterly edge. */
export function landingColorBleedBlobStyle(
  band: LandingBand,
  position: BleedBlobPosition,
): CSSProperties {
  const prev = landingBandPreviousColor(band);
  const x = position === 'left' ? '22%' : position === 'right' ? '78%' : '50%';
  const spread = position === 'center' ? '95% 75%' : '80% 65%';
  return {
    background: `radial-gradient(ellipse ${spread} at ${x} 18%, ${prev} 0%, ${prev}bb 22%, ${prev}55 40%, ${prev}18 58%, transparent 76%)`,
  };
}

export const landingColorBleedBlobLayoutClass: Record<
  BleedBlobPosition,
  { className: string; blur: string; opacity: string }
> = {
  center: {
    className: 'absolute inset-x-[8%] top-0 h-[130%]',
    blur: 'blur-3xl',
    opacity: 'opacity-90',
  },
  left: {
    className: 'absolute left-0 top-0 h-[115%] w-[62%]',
    blur: 'blur-3xl',
    opacity: 'opacity-70',
  },
  right: {
    className: 'absolute right-0 top-0 h-[115%] w-[62%]',
    blur: 'blur-3xl',
    opacity: 'opacity-65',
  },
};

export const landingSectionInnerClass =
  'relative z-10 mx-auto flex w-full max-w-3xl flex-col gap-10 md:gap-12';

export const landingSectionHeaderClass = 'flex max-w-2xl flex-col gap-4';

export const landingTitleClass =
  'font-heading text-[clamp(1.65rem,4.8vw,2.65rem)] font-bold leading-[1.08] tracking-tight text-balance';

export function landingBandSurfaceClass(band: LandingBand) {
  return band === 'ochre' ? 'bg-accent' : 'bg-background';
}

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
