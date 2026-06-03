import Link from 'next/link';

import { PageHeader } from '@/components/layout/PageHeader';
import { buttonVariants } from '@/components/ui/button';
import { filterChipClass } from '@/components/ui-patterns/highlight-pill';
import { MetricsPanel, StatCell, StatFlexGrid } from '@/components/ui-patterns/metrics-panel';
import { UI_COPY } from '@/lib/ui-copy';
import { cn } from '@/lib/utils';

type HomeHeroProps = {
  paidSessions: number;
  treasuryBalanceCrc: number | null;
};

function formatCompactInteger(value: number): string {
  return new Intl.NumberFormat(undefined, { maximumFractionDigits: 0 }).format(value);
}

export function HomeHero({ paidSessions, treasuryBalanceCrc }: HomeHeroProps) {
  const homeHero = UI_COPY.home.hero;

  return (
    <MetricsPanel muted className="gap-5">
      <div className="motion-fade-up flex flex-col gap-5">
        <PageHeader title={homeHero.title} subtitle={homeHero.subtitle} />

        <div className="flex flex-col justify-center gap-2 sm:flex-row">
          <Link
            href="#experts"
            className={cn(buttonVariants({ size: 'lg' }), 'min-h-11 justify-center')}
          >
            {homeHero.ctaFindExpert}
          </Link>
          <Link
            href="/expert/register"
            className={cn(buttonVariants({ variant: 'outline', size: 'lg' }), 'min-h-11 justify-center')}
          >
            {homeHero.ctaOfferExpertise}
          </Link>
          <Link
            href="/about#donate"
            className={cn(buttonVariants({ variant: 'ghost', size: 'lg' }), 'min-h-11 justify-center')}
          >
            {homeHero.ctaAboutDonate}
          </Link>
        </div>

        <div className="flex flex-wrap justify-center gap-2">
          {homeHero.steps.map((step) => (
            <span key={step} className={filterChipClass(false)}>
              {step}
            </span>
          ))}
        </div>

        <StatFlexGrid className="pt-1">
          <StatCell
            compact
            label="CRC raised"
            value={treasuryBalanceCrc !== null ? formatCompactInteger(treasuryBalanceCrc) : '—'}
          />
          <StatCell compact label="Paid sessions" value={formatCompactInteger(paidSessions)} />
          <StatCell
            compact
            label="Transparency"
            value={
              <Link href="/stats" className="underline underline-offset-2">
                {homeHero.proofViewStats}
              </Link>
            }
          />
        </StatFlexGrid>

        {treasuryBalanceCrc === null ? (
          <p className="text-center text-xs text-muted-foreground">{homeHero.proofFallback}</p>
        ) : null}
      </div>
    </MetricsPanel>
  );
}
