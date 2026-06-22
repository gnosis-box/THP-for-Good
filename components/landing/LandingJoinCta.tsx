'use client';

import Link from 'next/link';
import { ArrowUpRight } from 'lucide-react';

import { useWallet } from '@/components/wallet/WalletProvider';
import { THP_METRI_JOIN_URL } from '@/lib/onboarding-links';
import { UI_COPY } from '@/lib/ui-copy';
import { cn } from '@/lib/utils';

/** Minimal landing CTA — join THP on Circles (external Metri link). */
export function LandingJoinCta({ onOchreBand = false }: { onOchreBand?: boolean }) {
  const { isMiniappHost } = useWallet();

  return (
    <Link
      href={THP_METRI_JOIN_URL}
      target="_blank"
      rel="noopener noreferrer"
      className={cn(
        'group inline-flex min-h-11 items-center justify-center gap-1.5 rounded-lg border px-5',
        'text-sm font-medium transition-colors duration-200',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50',
        onOchreBand
          ? 'border-[#141f1c]/35 bg-[#141f1c]/[0.08] text-[#141f1c] hover:border-[#141f1c]/50 hover:bg-[#141f1c]/[0.14]'
          : isMiniappHost
            ? 'border-primary/45 bg-primary/12 text-foreground hover:border-primary/55 hover:bg-primary/18 hover:text-primary'
            : 'border-primary/25 text-foreground/90 hover:border-primary/40 hover:bg-primary/10 hover:text-primary',
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
