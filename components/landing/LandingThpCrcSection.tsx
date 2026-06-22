import { LandingSectionWatermark } from '@/components/landing/LandingSectionWatermark';
import { ScrollReveal } from '@/components/motion/scroll-reveal';
import { UI_COPY } from '@/lib/ui-copy';

/** Dark band — alternates with ochre CRC section above. */
export function LandingThpCrcSection() {
  const { kicker, title, features, summary } = UI_COPY.landing.thpCrcSection;

  return (
    <section
      className="relative min-h-[min(55dvh,30rem)] overflow-hidden bg-background px-5 py-16 pb-[max(4rem,env(safe-area-inset-bottom,0px))] supports-[padding:max(0px)]:px-[max(1.25rem,env(safe-area-inset-left))] supports-[padding:max(0px)]:pr-[max(1.25rem,env(safe-area-inset-right))] sm:px-8 sm:py-20 md:py-28"
      aria-label="CRC at THP for Good"
    >
      <LandingSectionWatermark side="left" src="/circles-owl-logo-beige.png" band="dark" />

      <div className="relative z-10 mx-auto flex w-full max-w-lg flex-col gap-10 md:max-w-2xl md:gap-12">
        <header className="flex max-w-xl flex-col gap-4">
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
        </header>

        <ul className="grid gap-4 sm:grid-cols-2 sm:gap-5">
          {features.map((feature, index) => (
            <ScrollReveal
              as="li"
              key={feature.title}
              delay={0.05 * index}
              className="group flex flex-col gap-3 rounded-2xl border border-border bg-muted/20 px-5 py-5 transition-[transform,background-color,border-color] duration-200 hover:-translate-y-1 hover:border-border/80 hover:bg-muted/35"
            >
              <span className="font-mono text-xs font-medium tabular-nums text-muted-foreground/60">
                {String(index + 1).padStart(2, '0')}
              </span>
              <h3 className="text-sm font-semibold text-foreground">{feature.title}</h3>
              <p className="text-sm leading-relaxed text-muted-foreground">{feature.body}</p>
            </ScrollReveal>
          ))}
        </ul>

        <ScrollReveal delay={0.2}>
          <p className="max-w-prose text-base leading-relaxed text-pretty text-muted-foreground sm:text-lg">
            {summary}
          </p>
        </ScrollReveal>
      </div>
    </section>
  );
}
