import { LandingBackgroundLogo } from '@/components/landing/LandingBackgroundLogo';
import { LandingCornerOrnaments } from '@/components/landing/LandingCornerOrnaments';
import { UI_COPY } from '@/lib/ui-copy';
import { SITE_NAME } from '@/lib/site-metadata';

export function LandingView() {
  return (
    <div className="relative flex min-h-[calc(100dvh-3.5rem)] flex-col items-center justify-center px-5 pb-[calc(7rem+env(safe-area-inset-bottom,0px))] pt-[max(1.5rem,env(safe-area-inset-top,0px))] supports-[padding:max(0px)]:px-[max(1.25rem,env(safe-area-inset-left))] supports-[padding:max(0px)]:pr-[max(1.25rem,env(safe-area-inset-right))] sm:px-8 sm:pb-32 md:min-h-[calc(100dvh-4rem)]">
      <LandingBackgroundLogo />
      <LandingCornerOrnaments />

      <div className="motion-fade-up relative z-10 flex w-full max-w-[16.5rem] flex-col items-center gap-3 text-center sm:max-w-md sm:gap-4">
        <h1 className="font-heading text-[clamp(1.75rem,7.5vw,3.75rem)] font-bold leading-[1.08] tracking-tight text-balance text-foreground">
          {SITE_NAME}
        </h1>
        <p className="max-w-[14rem] text-base leading-relaxed text-pretty text-muted-foreground sm:max-w-md sm:text-lg">
          {UI_COPY.landing.subtitle}
        </p>
      </div>
    </div>
  );
}
