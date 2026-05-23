'use client';

import { useMemo } from 'react';
import { usePathname } from 'next/navigation';
import { useWallet } from '@/components/wallet/WalletProvider';
import { UI_COPY } from '@/lib/ui-copy';

const DEFAULT_ISSUES_URL =
  'https://github.com/gnosis-box/THP-for-Good/issues/new?template=user_feedback.yml';

function buildReportIssueUrl(pathname: string, isMiniappHost: boolean): string {
  const base = process.env.NEXT_PUBLIC_GITHUB_ISSUES_URL?.trim() || DEFAULT_ISSUES_URL;
  const url = new URL(base);

  const lines = [
    'Submitted via THP for Good.',
    '',
    `- Page: ${pathname || '/'}`,
    `- Circles miniapp host: ${isMiniappHost ? 'yes' : 'no'}`,
  ];

  const version = process.env.NEXT_PUBLIC_APP_VERSION?.trim();
  if (version) {
    lines.push(`- App version: ${version}`);
  }

  url.searchParams.set('body', lines.join('\n'));
  return url.toString();
}

export function ReportIssueLink() {
  const pathname = usePathname();
  const { isMiniappHost } = useWallet();
  const href = useMemo(
    () => buildReportIssueUrl(pathname, isMiniappHost),
    [pathname, isMiniappHost],
  );

  return (
    <footer className="border-t border-border px-4 py-3 md:px-6">
      <div className="mx-auto flex w-full max-w-lg justify-center md:max-w-2xl">
        <a
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex min-h-11 items-center px-3 text-xs text-muted-foreground underline-offset-4 hover:text-foreground hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          aria-label={UI_COPY.support.reportIssueAria}
        >
          {UI_COPY.support.reportIssue}
        </a>
      </div>
    </footer>
  );
}
