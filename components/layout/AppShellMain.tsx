'use client';

import type { ReactNode } from 'react';
import { usePathname } from 'next/navigation';

import { OpenInCirclesHint } from '@/components/wallet/OpenInCirclesHint';

export const LANDING_PATH = '/landing';

export function AppShellMain({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const isLanding = pathname === LANDING_PATH;

  if (isLanding) {
    return (
      <main className="relative flex min-h-0 flex-1 flex-col overflow-x-hidden">{children}</main>
    );
  }

  return (
    <main className="flex-1 overflow-x-hidden p-4 md:p-6">
      <div className="mx-auto flex w-full max-w-lg flex-col gap-4 md:max-w-2xl">
        <OpenInCirclesHint />
        {children}
      </div>
    </main>
  );
}
