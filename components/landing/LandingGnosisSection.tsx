import { LandingSectionWatermark } from '@/components/landing/LandingSectionWatermark';
import { ScrollReveal } from '@/components/motion/scroll-reveal';
import { UI_COPY } from '@/lib/ui-copy';

/** Dark band — alternates with ochre promise section above. */
export function LandingGnosisSection() {
  const { kicker, title, body } = UI_COPY.landing.gnosisSection;

  return (
    <section
      className="relative min-h-[min(50dvh,28rem)] overflow-hidden bg-background px-5 py-16 pb-[max(4rem,env(safe-area-inset-bottom,0px))] supports-[padding:max(0px)]:px-[max(1.25rem,env(safe-area-inset-left))] supports-[padding:max(0px)]:pr-[max(1.25rem,env(safe-area-inset-right))] sm:px-8 sm:py-20 md:py-28"
      aria-label="About Gnosis and CRC"
    >
      {/* Dark band — left edge watermark (alternates promise section’s right-side THP logo). */}
      <LandingSectionWatermark
        side="left"
        src="/circles-owl-logo-beige.png"
        band="dark"
      />

      <div className="relative z-10 mx-auto flex w-full max-w-lg flex-col gap-5 md:max-w-2xl md:gap-6">
        <ScrollReveal delay={0}>
          <span className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground/80">
            <span className="h-px w-6 bg-muted-foreground/30" aria-hidden />
            {kicker}
          </span>
        </ScrollReveal>
        <ScrollReveal delay={0.08}>
          <h2 className="font-heading text-[clamp(1.6rem,5vw,2.5rem)] font-bold leading-[1.1] tracking-tight text-balance text-foreground">
            {title}
          </h2>
        </ScrollReveal>
        <ScrollReveal delay={0.14}>
          <p className="max-w-prose text-base leading-relaxed text-pretty text-muted-foreground sm:text-lg">
            {body}
          </p>
        </ScrollReveal>
      </div>
    </section>
  );
}
