import { LandingJoinCta } from '@/components/landing/LandingJoinCta';
import { LandingSectionWatermark } from '@/components/landing/LandingSectionWatermark';
import { UI_COPY } from '@/lib/ui-copy';

/** Dark closing band — palette back to hero; ochre watermark on the left. */
export function LandingClosingSection() {
  return (
    <section
      className="relative min-h-[min(40dvh,20rem)] overflow-hidden bg-background px-5 py-14 pb-[max(3rem,env(safe-area-inset-bottom,0px))] supports-[padding:max(0px)]:px-[max(1.25rem,env(safe-area-inset-left))] supports-[padding:max(0px)]:pr-[max(1.25rem,env(safe-area-inset-right))] sm:px-8 sm:py-16 md:py-20"
      aria-label="Join the chain"
    >
      <LandingSectionWatermark side="left" src="/landing-watermark-logo.png" />

      <div className="relative z-10 mx-auto flex w-full max-w-lg flex-col items-center gap-4 text-center md:max-w-2xl">
        <p className="max-w-md text-base leading-relaxed text-pretty text-muted-foreground sm:text-lg">
          {UI_COPY.landing.closingSection.lead}
        </p>
        <LandingJoinCta />
      </div>
    </section>
  );
}
