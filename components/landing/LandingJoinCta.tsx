'use client';

import Link from 'next/link';
import { ArrowUpRight } from 'lucide-react';

import { THP_METRI_JOIN_URL } from '@/lib/onboarding-links';
import { UI_COPY } from '@/lib/ui-copy';
import { cn } from '@/lib/utils';

/** Landing CTA — solid pill, join THP on Circles (external Metri link). */
export function LandingJoinCta({ onOchreBand = false }: { onOchreBand?: boolean }) {
  return (
    <Link
      href={THP_METRI_JOIN_URL}
      target="_blank"
      rel="noopener noreferrer"
      className={cn(
        'group inline-flex min-h-11 items-center justify-center gap-1.5 rounded-full px-6',
        'text-sm font-semibold transition-colors duration-200',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50 focus-visible:ring-offset-2',
        onOchreBand
          ? 'bg-[#141f1c] text-[#e9ddc8] hover:bg-[#1e2d28] focus-visible:ring-offset-[#c49a62]'
          : 'bg-[#c49a62] text-[#141f1c] hover:bg-[#d2a974] focus-visible:ring-offset-[#0a1210]',
      )}
    >
      {UI_COPY.landing.ctaJoinChain}
      <ArrowUpRight
        className="size-3.5 opacity-70 transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
        aria-hidden
      />
      <span className="sr-only">(opens in a new tab)</span>
    </Link>
  );
}
