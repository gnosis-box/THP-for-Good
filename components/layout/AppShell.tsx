import type { ReactNode } from 'react';

import { Header } from '@/components/layout/Header';
import { ReportIssueLink } from '@/components/layout/ReportIssueLink';
import { OpenInCirclesHint } from '@/components/wallet/OpenInCirclesHint';

export function AppShell({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Header />
      <main className="flex-1 overflow-x-hidden overflow-y-auto p-4 md:p-6">
        <div className="mx-auto flex w-full max-w-lg flex-col gap-4 md:max-w-2xl">
          <OpenInCirclesHint />
          {children}
        </div>
      </main>
      <ReportIssueLink />
    </div>
  );
}
