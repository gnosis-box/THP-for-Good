import type { ReactNode } from 'react';

import { Header } from '@/components/layout/Header';

export function AppShell({ children }: { children: ReactNode }) {
  return (
    <div className="grid min-h-screen grid-rows-[3.5rem_1fr]">
      <Header />
      <main className="overflow-auto p-4 sm:p-6">{children}</main>
    </div>
  );
}
