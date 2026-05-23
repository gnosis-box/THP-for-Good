import Image from 'next/image';
import Link from 'next/link';

import { CurrentPage } from '@/components/layout/CurrentPage';
import { MobileNav } from '@/components/layout/MobileNav';
import { WalletStatus } from '@/components/wallet/WalletStatus';

export function Header() {
  return (
    <header className="sticky top-0 z-30 col-span-full flex h-14 items-center justify-between border-b border-border/60 bg-background/90 px-4 backdrop-blur-md">
      <div className="flex min-w-0 items-center gap-2">
        <MobileNav />
        <Link href="/" className="flex shrink-0 items-center gap-2">
          <Image
            src="/thp-logo.png"
            alt="THP"
            width={28}
            height={28}
            className="rounded-lg ring-1 ring-border"
            style={{ height: 'auto', width: 'auto', maxHeight: 28, maxWidth: 28 }}
          />
          <span className="hidden truncate font-display text-base font-bold tracking-tight sm:inline">
            THP for Good
          </span>
        </Link>
        <CurrentPage />
      </div>
      <WalletStatus />
    </header>
  );
}
