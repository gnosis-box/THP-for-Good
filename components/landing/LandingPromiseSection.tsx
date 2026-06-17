import { LandingSectionWatermark } from '@/components/landing/LandingSectionWatermark';
import { ScrollReveal } from '@/components/motion/scroll-reveal';
import { UI_COPY } from '@/lib/ui-copy';

/** Ochre band — inverted palette vs hero; dark-green logo watermark on the right. */
export function LandingPromiseSection() {
  const { kicker, problemTitle, promise, features } = UI_COPY.landing.promiseSection;

  return (
    <section
      className="relative min-h-[min(60dvh,32rem)] overflow-hidden bg-[#c49a62] px-5 py-16 pb-[max(4rem,env(safe-area-inset-bottom,0px))] supports-[padding:max(0px)]:px-[max(1.25rem,env(safe-area-inset-left))] supports-[padding:max(0px)]:pr-[max(1.25rem,env(safe-area-inset-right))] sm:px-8 sm:py-20 md:py-28"
      aria-label="Why THP for Good"
    >
      <LandingSectionWatermark side="right" src="/thp-logo-beige-green.png" />

      <div className="relative z-10 mx-auto flex w-full max-w-lg flex-col gap-10 md:max-w-2xl md:gap-12">
        <header className="flex max-w-xl flex-col gap-4">
          <ScrollReveal delay={0}>
            <span className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-[#294C33]/70">
              <span className="h-px w-6 bg-[#294C33]/40" aria-hidden />
              {kicker}
            </span>
          </ScrollReveal>
          <ScrollReveal delay={0.08}>
            <h2 className="font-heading text-[clamp(1.6rem,5vw,2.5rem)] font-bold leading-[1.1] tracking-tight text-balance text-[#294C33]">
              {problemTitle}
            </h2>
          </ScrollReveal>
          <ScrollReveal delay={0.14}>
            <p className="max-w-prose text-base leading-relaxed text-pretty text-[#294C33]/85 sm:text-lg">
              {promise}
            </p>
          </ScrollReveal>
        </header>

        <ul className="grid gap-4 sm:grid-cols-3 sm:gap-5">
          {features.map((feature, index) => (
            <ScrollReveal
              as="li"
              key={feature.title}
              delay={0.05 * index}
              className="group flex flex-col gap-3 rounded-2xl border border-[#294C33]/15 bg-[#294C33]/[0.06] px-5 py-5 transition-[transform,background-color,border-color] duration-200 hover:-translate-y-1 hover:border-[#294C33]/30 hover:bg-[#294C33]/[0.1]"
            >
              <span className="font-mono text-xs font-medium tabular-nums text-[#294C33]/50">
                {String(index + 1).padStart(2, '0')}
              </span>
              <h3 className="text-sm font-semibold text-[#294C33]">{feature.title}</h3>
              <p className="text-sm leading-relaxed text-[#294C33]/80">{feature.body}</p>
            </ScrollReveal>
          ))}
        </ul>
      </div>
    </section>
  );
}
