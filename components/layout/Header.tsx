import Image from 'next/image';
import Link from 'next/link';

import { DesktopNav, MobileNav } from '@/components/layout/MobileNav';
import { WalletStatus } from '@/components/wallet/WalletStatus';

export function Header() {
  return (
    <header className="sticky top-0 z-30 w-full border-b border-border bg-background/95 backdrop-blur-sm supports-[padding:max(0px)]:pt-[max(0px,env(safe-area-inset-top))]">
      <div className="mx-auto flex h-14 w-full max-w-lg items-center gap-2 px-4 md:max-w-2xl md:gap-3">
        <div className="flex min-w-0 shrink-0 items-center gap-1 sm:gap-2">
          <MobileNav />
          <Link
            href="/"
            className="flex min-h-11 min-w-11 items-center gap-2 rounded-lg font-semibold tracking-tight focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring sm:min-w-0 sm:px-1"
          >
            <Image
              src="/thp-logo.png"
              alt=""
              width={28}
              height={28}
              className="size-7 shrink-0 rounded-sm ring-1 ring-border"
              style={{ height: 'auto', width: 'auto', maxHeight: 28, maxWidth: 28 }}
            />
            <span className="hidden truncate sm:inline sm:text-sm lg:text-base">
              THP for Good
            </span>
          </Link>
        </div>

        <DesktopNav />

        <div className="ml-auto flex shrink-0 items-center">
          <WalletStatus />
        </div>
      </div>
    </header>
  );
}
