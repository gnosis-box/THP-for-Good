import type { ReactNode } from 'react';

import { cn } from '@/lib/utils';
import { ScrollReveal } from '@/components/motion/scroll-reveal';

import {
  landingHeadingClass,
  landingKickerClass,
  landingKickerRuleClass,
  landingLeadClass,
  landingSectionHeaderClass,
  type LandingBand,
} from '@/components/landing/landing-theme';

type LandingSectionHeaderProps = {
  band: LandingBand;
  kicker?: string;
  title: string;
  lead?: string;
  align?: 'left' | 'center';
  trailing?: ReactNode;
};

export function LandingSectionHeader({
  band,
  kicker,
  title,
  lead,
  align = 'left',
  trailing,
}: LandingSectionHeaderProps) {
  const centered = align === 'center';

  return (
    <header className={cn(landingSectionHeaderClass, centered && 'mx-auto items-center text-center')}>
      {kicker ? (
        <ScrollReveal once delay={0}>
          <span className={landingKickerClass(band)}>
            <span className={landingKickerRuleClass(band)} aria-hidden />
            {kicker}
          </span>
        </ScrollReveal>
      ) : null}
      <ScrollReveal once delay={kicker ? 0.08 : 0}>
        <h2 className={landingHeadingClass(band)}>{title}</h2>
      </ScrollReveal>
      {lead ? (
        <ScrollReveal once delay={kicker ? 0.14 : 0.08}>
          <p className={cn(landingLeadClass(band), centered && 'mx-auto')}>{lead}</p>
        </ScrollReveal>
      ) : null}
      {trailing}
    </header>
  );
}
