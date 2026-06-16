import { LandingCornerOrnaments } from '@/components/landing/LandingCornerOrnaments';
import { LandingJoinCta } from '@/components/landing/LandingJoinCta';
import { LandingScene } from '@/components/landing/LandingScene';
import { LandingScrollHint } from '@/components/landing/LandingScrollHint';
import { LandingSectionWatermark } from '@/components/landing/LandingSectionWatermark';
import { UI_COPY } from '@/lib/ui-copy';
import { SITE_NAME } from '@/lib/site-metadata';

export function LandingHeroSection() {
  return (
    <section
      className="relative flex min-h-[calc(100dvh-3.5rem)] min-h-[calc(100svh-3.5rem)] shrink-0 flex-col md:min-h-[calc(100dvh-4rem)] md:min-h-[calc(100svh-4rem)]"
      aria-label="Hero"
    >
      <LandingScene>
        <LandingSectionWatermark side="left" src="/landing-watermark-logo.png" />
        <div className="motion-fade-up relative z-10 flex w-full max-w-[16.5rem] flex-col items-center gap-3 text-center sm:max-w-md sm:gap-4">
          <h1 className="font-heading text-[clamp(1.75rem,7.5vw,3.75rem)] font-bold leading-[1.08] tracking-tight text-balance text-foreground">
            {SITE_NAME}
          </h1>
          <p className="max-w-[14rem] text-base leading-relaxed text-pretty text-muted-foreground sm:max-w-md sm:text-lg">
            {UI_COPY.landing.subtitle}
          </p>
          <LandingJoinCta />
          <LandingScrollHint />
        </div>
      </LandingScene>
      <LandingCornerOrnaments />
    </section>
  );
}
