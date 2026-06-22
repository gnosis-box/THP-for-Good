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
  'relative flex min-h-[min(64dvh,36rem)] flex-col justify-center overflow-hidden py-20 pb-[max(4rem,env(safe-area-inset-bottom,0px))] supports-[padding:max(0px)]:px-[max(1.25rem,env(safe-area-inset-left))] supports-[padding:max(0px)]:pr-[max(1.25rem,env(safe-area-inset-right))] sm:px-8 md:py-24 lg:py-28';

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
    'pointer-events-none absolute inset-0 z-0',
    band === 'ochre'
      ? 'bg-gradient-to-b from-[#141f1c]/[0.04] via-transparent to-[#141f1c]/[0.02]'
      : 'bg-gradient-to-b from-primary/[0.03] via-transparent to-transparent',
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
