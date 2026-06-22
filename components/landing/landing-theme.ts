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

/** Pull band up so the seam cluster straddles the previous section edge. */
export const landingSeamOverlapClass = '-mt-8 sm:-mt-10 md:-mt-12';

/** Seam cluster height — centred on the band boundary via -translate-y-1/2. */
export const landingSeamClusterHeightClass = 'h-12 sm:h-14 md:h-16';

const landingGrainBgClass =
  '[background-image:url("data:image/svg+xml,%3Csvg%20viewBox%3D%220%200%20256%20256%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%3E%3Cfilter%20id%3D%22n%22%3E%3CfeTurbulence%20type%3D%22fractalNoise%22%20baseFrequency%3D%220.85%22%20numOctaves%3D%224%22%20stitchTiles%3D%22stitch%22%2F%3E%3C%2Ffilter%3E%3Crect%20width%3D%22100%25%22%20height%3D%22100%25%22%20filter%3D%22url(%23n)%22%2F%3E%3C%2Fsvg%3E")]';

/** Light grain across the section — seam carries the heavy break-up. */
export const landingBandGrainAmbientClass = cn(
  'pointer-events-none absolute inset-0 opacity-[0.028] mix-blend-soft-light',
  landingGrainBgClass,
  '[background-size:200px_200px]',
);

/** Dense grain on the seam — breaks up the straight colour edge. */
export const landingBandGrainSeamClass = cn(
  'pointer-events-none absolute inset-0 opacity-[0.13] mix-blend-overlay',
  landingGrainBgClass,
  '[background-size:110px_110px]',
  '[mask-image:linear-gradient(to_bottom,transparent_0%,black_22%,black_78%,transparent_100%)]',
);

/** Previous-band colour bleed — tight gradient at the boundary. */
export function landingBandSeamBlendClass(band: LandingBand) {
  return band === 'ochre'
    ? 'pointer-events-none absolute inset-0 bg-gradient-to-b from-[#0a1210]/55 via-[#0a1210]/18 to-transparent [mask-image:linear-gradient(to_bottom,black_35%,transparent_92%)]'
    : 'pointer-events-none absolute inset-0 bg-gradient-to-b from-[#c49a62]/48 via-[#c49a62]/16 to-transparent [mask-image:linear-gradient(to_bottom,black_35%,transparent_92%)]';
}

/** Green-tinted mist concentrated on the seam. */
export function landingBandSeamMistClass(band: LandingBand) {
  return cn(
    'pointer-events-none absolute inset-0 mix-blend-soft-light',
    band === 'ochre'
      ? 'bg-gradient-to-b from-[#5a9f76]/30 via-[#5a9f76]/10 to-transparent'
      : 'bg-gradient-to-b from-[#5a9f76]/24 via-[#5a9f76]/8 to-transparent',
    '[mask-image:linear-gradient(to_bottom,transparent_0%,black_28%,black_72%,transparent_100%)]',
  );
}

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
