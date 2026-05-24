import { ExternalLink } from 'lucide-react';
import { PageHeader } from '@/components/layout/PageHeader';
import { MetricsPanel } from '@/components/ui-patterns/metrics-panel';
import { DaoView } from '@/components/dao/DaoView';
import { PageNav } from '@/components/layout/PageNav';

const GROUP_ADDRESS = '0x2b5E4045936ef12250a8c01e4Cbf71E9bEE69e00';
const GNOSIS_SAFE_URL = `https://app.gnosis.io/${GROUP_ADDRESS}`;

export default function DaoPage() {
  return (
    <main className="mx-auto flex max-w-2xl flex-col gap-8 px-4 py-10">

      <MetricsPanel muted>
        <PageHeader title="The DAO" />
        <div className="mx-auto flex max-w-lg flex-col gap-4 text-center text-sm text-muted-foreground">
          <p className="leading-relaxed">
            Every participant in the THP for Good ecosystem is a member of the DAO — THP students,
            contributors, and experts who share their knowledge through this platform.
          </p>
          <p className="leading-relaxed">
            Each member holds <strong className="text-foreground">one vote</strong> when the
            community decides who receives the next free training. Governance happens on-chain through
            the{' '}
            <a
              href={GNOSIS_SAFE_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-foreground underline underline-offset-2"
            >
              THP for Good Safe
              <ExternalLink className="size-3 opacity-60" aria-hidden />
            </a>
            .
          </p>
        </div>
      </MetricsPanel>

      <DaoView />

      <PageNav />
    </main>
  );
}
