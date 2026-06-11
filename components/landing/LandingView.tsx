import { LandingCornerOrnaments } from '@/components/landing/LandingCornerOrnaments';
import { UI_COPY } from '@/lib/ui-copy';
import { SITE_NAME } from '@/lib/site-metadata';

export function LandingView() {
  return (
    <div className="relative -mx-4 flex min-h-[calc(100dvh-7.5rem)] flex-col items-center justify-center px-4 md:-mx-6">
      <LandingCornerOrnaments />

      <div className="motion-fade-up relative z-10 flex max-w-xl flex-col items-center gap-4 text-center">
        <h1 className="font-heading text-4xl font-bold tracking-tight text-foreground sm:text-5xl md:text-6xl">
          {SITE_NAME}
        </h1>
        <p className="max-w-md text-base leading-relaxed text-muted-foreground sm:text-lg">
          {UI_COPY.landing.subtitle}
        </p>
      </div>
    </div>
  );
}
