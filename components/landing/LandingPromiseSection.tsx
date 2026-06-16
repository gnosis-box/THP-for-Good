import { LandingSectionWatermark } from '@/components/landing/LandingSectionWatermark';
import { UI_COPY } from '@/lib/ui-copy';

/** Ochre band — inverted palette vs hero; dark-green logo watermark on the right. */
export function LandingPromiseSection() {
  const { problemTitle, promise, features } = UI_COPY.landing.promiseSection;

  return (
    <section
      className="relative min-h-[min(50dvh,28rem)] overflow-hidden bg-[#c49a62] px-5 py-12 pb-[max(3rem,env(safe-area-inset-bottom,0px))] supports-[padding:max(0px)]:px-[max(1.25rem,env(safe-area-inset-left))] supports-[padding:max(0px)]:pr-[max(1.25rem,env(safe-area-inset-right))] sm:px-8 sm:py-16 md:py-20"
      aria-label="Why THP for Good"
    >
      <LandingSectionWatermark side="right" src="/thp-logo-beige-green.png" />

      <div className="relative z-10 mx-auto flex w-full max-w-lg flex-col gap-8 md:max-w-2xl">
        <header className="flex flex-col gap-3 text-center sm:max-w-xl sm:text-left">
          <h2 className="font-heading text-2xl font-bold leading-tight tracking-tight text-balance text-[#294C33] sm:text-3xl">
            {problemTitle}
          </h2>
          <p className="text-base leading-relaxed text-pretty text-[#294C33]/85 sm:text-lg">
            {promise}
          </p>
        </header>

        <ul className="grid gap-4 sm:grid-cols-3">
          {features.map((feature) => (
            <li
              key={feature.title}
              className="flex flex-col gap-2 rounded-xl border border-[#294C33]/15 bg-[#294C33]/[0.06] px-4 py-4"
            >
              <h3 className="text-sm font-semibold text-[#294C33]">{feature.title}</h3>
              <p className="text-sm leading-relaxed text-[#294C33]/80">{feature.body}</p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
