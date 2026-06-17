import { LandingJoinCta } from '@/components/landing/LandingJoinCta';
import { ScrollReveal } from '@/components/motion/scroll-reveal';
import { UI_COPY } from '@/lib/ui-copy';

/** Dark closing band — palette back to hero; visual accent TBD. */
export function LandingClosingSection() {
  const { title, lead } = UI_COPY.landing.closingSection;

  return (
    <section
      className="relative flex min-h-[min(55dvh,30rem)] items-center bg-background px-5 py-20 pb-[max(5rem,env(safe-area-inset-bottom,0px))] supports-[padding:max(0px)]:px-[max(1.25rem,env(safe-area-inset-left))] supports-[padding:max(0px)]:pr-[max(1.25rem,env(safe-area-inset-right))] sm:px-8 sm:py-24 md:py-32"
      aria-label="Join the chain"
    >
      <div className="mx-auto flex w-full max-w-lg flex-col items-center gap-5 text-center md:max-w-2xl">
        <ScrollReveal delay={0}>
          <h2 className="font-heading text-[clamp(1.75rem,5.5vw,2.75rem)] font-bold leading-[1.08] tracking-tight text-balance text-foreground">
            {title}
          </h2>
        </ScrollReveal>
        <ScrollReveal delay={0.08}>
          <p className="mx-auto max-w-md text-base leading-relaxed text-pretty text-muted-foreground sm:text-lg">
            {lead}
          </p>
        </ScrollReveal>
        <ScrollReveal delay={0.16} className="pt-1">
          <LandingJoinCta />
        </ScrollReveal>
      </div>
    </section>
  );
}
