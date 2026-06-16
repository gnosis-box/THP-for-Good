import Link from 'next/link';
import { ArrowUpRight } from 'lucide-react';

import { THP_METRI_JOIN_URL } from '@/lib/onboarding-links';
import { UI_COPY } from '@/lib/ui-copy';
import { cn } from '@/lib/utils';

/** Minimal landing CTA — join THP on Circles (external Metri link). */
export function LandingJoinCta() {
  return (
    <Link
      href={THP_METRI_JOIN_URL}
      target="_blank"
      rel="noopener noreferrer"
      className={cn(
        'inline-flex min-h-11 items-center justify-center gap-1.5 rounded-lg border border-primary/25 px-5',
        'text-sm font-medium text-foreground/90 transition-colors duration-200',
        'hover:border-primary/40 hover:bg-primary/10 hover:text-primary',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50',
      )}
    >
      {UI_COPY.landing.ctaJoinChain}
      <ArrowUpRight className="size-3.5 opacity-70" aria-hidden />
      <span className="sr-only">(opens in a new tab)</span>
    </Link>
  );
}
