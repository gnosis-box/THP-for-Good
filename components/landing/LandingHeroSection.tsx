import { LandingJoinCta } from '@/components/landing/LandingJoinCta';
import { LandingScene } from '@/components/landing/LandingScene';
import { LandingScrollHint } from '@/components/landing/LandingScrollHint';
import { LandingSectionWatermark } from '@/components/landing/LandingSectionWatermark';
import { ScrollReveal } from '@/components/motion/scroll-reveal';
import { UI_COPY } from '@/lib/ui-copy';
import { SITE_NAME } from '@/lib/site-metadata';

export function LandingHeroSection() {
  return (
    <section
      className="relative flex min-h-[calc(100dvh-3.5rem)] min-h-[calc(100svh-3.5rem)] shrink-0 flex-col bg-background md:min-h-[calc(100dvh-4rem)] md:min-h-[calc(100svh-4rem)]"
      aria-label="Hero"
    >
      <LandingScene>
        <LandingSectionWatermark side="left" src="/landing-watermark-logo.png" band="dark" />
        <div className="relative z-10 flex w-full max-w-[17rem] flex-col items-center gap-4 text-center sm:max-w-md sm:gap-5">
          <ScrollReveal delay={0}>
            <span className="inline-block text-[0.7rem] font-medium uppercase tracking-[0.22em] text-muted-foreground/80">
              {UI_COPY.landing.eyebrow}
            </span>
          </ScrollReveal>
          <ScrollReveal delay={0.06}>
            <h1 className="font-heading text-[clamp(2rem,8.5vw,4.25rem)] font-bold leading-[1.04] tracking-tight text-balance text-foreground">
              {SITE_NAME}
            </h1>
          </ScrollReveal>
          <ScrollReveal delay={0.12}>
            <p className="mx-auto max-w-[15rem] text-base leading-relaxed text-pretty text-muted-foreground sm:max-w-md sm:text-lg">
              {UI_COPY.landing.subtitle}
            </p>
          </ScrollReveal>
          <ScrollReveal delay={0.18} className="flex flex-col items-center gap-3">
            <LandingJoinCta />
            <LandingScrollHint />
          </ScrollReveal>
        </div>
      </LandingScene>
    </section>
  );
}
