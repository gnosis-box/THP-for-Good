import type { ReactNode } from 'react';

import { Header } from '@/components/layout/Header';
import { OpenInCirclesHint } from '@/components/wallet/OpenInCirclesHint';

export function AppShell({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Header />
      <main className="flex-1 overflow-x-hidden overflow-y-auto px-4 py-6 md:px-6 md:py-8">
        <div className="mx-auto flex w-full max-w-xl flex-col gap-6 md:max-w-3xl">
          <OpenInCirclesHint />
          {children}
        </div>
      </main>
    </div>
  );
}
