import type { ReactNode } from 'react';

import { Header } from '@/components/layout/Header';
import { OpenInCirclesHint } from '@/components/wallet/OpenInCirclesHint';

export function AppShell({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1 overflow-auto p-4 md:p-6">
        <div className="mx-auto flex max-w-4xl flex-col gap-4">
          <OpenInCirclesHint />
          {children}
        </div>
      </main>
    </div>
  );
}
