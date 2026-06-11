import type { ReactNode } from 'react';

import { Header } from '@/components/layout/Header';
import { AppShellMain } from '@/components/layout/AppShellMain';
import { ReportIssueLink } from '@/components/layout/ReportIssueLink';

export function AppShell({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-dvh flex-col bg-background">
      <Header />
      <AppShellMain>{children}</AppShellMain>
      <ReportIssueLink />
    </div>
  );
}
