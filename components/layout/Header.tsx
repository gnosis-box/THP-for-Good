import Image from 'next/image';
import Link from 'next/link';

import { CurrentPage } from '@/components/layout/CurrentPage';
import { MobileNav } from '@/components/layout/MobileNav';
import { WalletStatus } from '@/components/wallet/WalletStatus';

export function Header() {
  return (
    <header className="col-span-full flex h-14 items-center justify-between border-b bg-background px-4">
      <div className="flex items-center gap-2">
        <MobileNav />
        <Link href="/" className="flex items-center gap-2 font-semibold tracking-tight">
          <Image src="/thp-logo.jpg" alt="THP" width={28} height={28} className="rounded-sm" />
          <span className="hidden sm:inline">THP for Good</span>
        </Link>
        <CurrentPage />
      </div>
      <WalletStatus />
    </header>
  );
}
