import { PageHeader } from '@/components/layout/PageHeader';
import { PageNav } from '@/components/layout/PageNav';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function ActionsPage() {
  return (
    <div className="mx-auto flex max-w-4xl flex-col gap-6">
      <PageHeader title="Actions" subtitle="Placeholder route." />

      <Card>
        <CardHeader>
          <CardTitle>Send transactions through the host</CardTitle>
          <CardDescription>
            Import <code className="rounded bg-muted px-1.5 py-0.5 font-mono text-xs">sendTransactions</code>{' '}
            from <code className="rounded bg-muted px-1.5 py-0.5 font-mono text-xs">@aboutcircles/miniapp-sdk</code> inside a client
            component and pass an array of <code className="rounded bg-muted px-1.5 py-0.5 font-mono text-xs">{'{ to, data?, value? }'}</code>.
          </CardDescription>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground">
          <pre className="overflow-x-auto rounded-md border bg-muted p-3 font-mono text-xs leading-relaxed">{`'use client';
import { sendTransactions } from '@aboutcircles/miniapp-sdk';

const hashes = await sendTransactions([
  { to: '0x…', data: '0x…', value: '0' },
]);`}</pre>
        </CardContent>
      </Card>

      <PageNav />
    </div>
  );
}
