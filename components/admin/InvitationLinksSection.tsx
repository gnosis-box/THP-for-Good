'use client';

import { useCallback, useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import type { InvitationLinkRow, InvitationLinkStatus } from '@/lib/invitation-links';
import { UI_COPY } from '@/lib/ui-copy';
import { cn, shortenAddress } from '@/lib/utils';

type FilterStatus = InvitationLinkStatus | 'all';

type ApiResponse = {
  links: InvitationLinkRow[];
  counts: Record<InvitationLinkStatus, number>;
};

function formatAdminDate(iso: string): string {
  return new Intl.DateTimeFormat(undefined, {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(iso));
}

function statusLabel(status: InvitationLinkStatus): string {
  const copy = UI_COPY.onboarding;
  if (status === 'available') return copy.adminStatusAvailable;
  if (status === 'used') return copy.adminStatusUsed;
  return copy.adminStatusInvalid;
}

function statusClass(status: InvitationLinkStatus): string {
  if (status === 'available') return 'bg-success/15 text-success';
  if (status === 'used') return 'bg-muted text-muted-foreground';
  return 'bg-destructive/10 text-destructive';
}

type Props = {
  walletAddress: string;
};

export function InvitationLinksSection({ walletAddress }: Props) {
  const copy = UI_COPY.onboarding;
  const headers = useCallback(
    () => ({ 'Content-Type': 'application/json', 'x-wallet-address': walletAddress }),
    [walletAddress],
  );

  const [filter, setFilter] = useState<FilterStatus>('available');
  const [links, setLinks] = useState<InvitationLinkRow[]>([]);
  const [counts, setCounts] = useState<Record<InvitationLinkStatus, number>>({
    available: 0,
    used: 0,
    invalid: 0,
  });
  const [newUrl, setNewUrl] = useState('');
  const [urlError, setUrlError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);
  const [displayNames, setDisplayNames] = useState<Record<string, string>>({});

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const query = filter === 'all' ? '' : `?status=${filter}`;
      const res = await fetch(`/api/admin/invitation-links${query}`, { headers: headers() });
      if (!res.ok) return;
      const data = (await res.json()) as ApiResponse;
      setLinks(data.links);
      setCounts(data.counts);
    } finally {
      setLoading(false);
    }
  }, [filter, headers]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void load();
  }, [load]);

  useEffect(() => {
    const addresses = [
      ...new Set(
        links.flatMap((l) =>
          [l.added_by, l.consumed_by].filter((a): a is string => typeof a === 'string' && a.length > 0),
        ),
      ),
    ];
    if (addresses.length === 0) return;

    (async () => {
      const { Sdk } = await import('@aboutcircles/sdk');
      const sdk = new Sdk();
      const entries = await Promise.all(
        addresses.map(async (addr) => {
          try {
            const view = await sdk.rpc.profile.getProfileView(addr as `0x${string}`);
            const name = (view.profile as { name?: string } | undefined)?.name;
            return [addr, name ?? shortenAddress(addr)] as const;
          } catch {
            return [addr, shortenAddress(addr)] as const;
          }
        }),
      );
      setDisplayNames(Object.fromEntries(entries));
    })();
  }, [links]);

  async function handleAdd() {
    const trimmed = newUrl.trim();
    if (!trimmed) return;
    setUrlError(null);
    setAdding(true);
    try {
      const res = await fetch('/api/admin/invitation-links', {
        method: 'POST',
        headers: headers(),
        body: JSON.stringify({ url: trimmed }),
      });
      if (!res.ok) {
        const body = (await res.json().catch(() => null)) as { error?: string } | null;
        setUrlError(body?.error ?? copy.adminInvalidUrl);
        return;
      }
      setNewUrl('');
      await load();
    } finally {
      setAdding(false);
    }
  }

  const totalCount = counts.available + counts.used + counts.invalid;

  const filters: { id: FilterStatus; label: string; count: number }[] = [
    { id: 'available', label: copy.adminFilterAvailable, count: counts.available },
    { id: 'used', label: copy.adminFilterUsed, count: counts.used },
    { id: 'invalid', label: copy.adminFilterInvalid, count: counts.invalid },
    { id: 'all', label: copy.adminFilterAll, count: totalCount },
  ];

  return (
    <section className="flex flex-col gap-4" aria-labelledby="invitation-links-heading">
      <div className="flex flex-col gap-1">
        <h2 id="invitation-links-heading" className="text-base font-semibold">
          {copy.adminSectionTitle}
        </h2>
        <p className="text-sm text-muted-foreground">{copy.adminSectionSubtitle}</p>
      </div>

      <div className="flex flex-wrap gap-2" role="tablist" aria-label="Filter invitation links">
        {filters.map((tab) => (
          <button
            key={tab.id}
            type="button"
            role="tab"
            aria-selected={filter === tab.id}
            onClick={() => setFilter(tab.id)}
            className={cn(
              'rounded-full border px-3 py-1 text-sm transition-colors',
              filter === tab.id
                ? 'border-ring bg-muted font-medium text-foreground'
                : 'border-border text-muted-foreground hover:text-foreground',
            )}
          >
            {tab.label} {tab.count}
          </button>
        ))}
      </div>

      {loading ? (
        <p className="text-sm text-muted-foreground">Loading…</p>
      ) : links.length === 0 ? (
        <p className="text-sm text-muted-foreground">{copy.adminEmptyList}</p>
      ) : (
        <div className="flex flex-col gap-3">
          {links.map((link) => (
            <div
              key={link.id}
              className="flex flex-col gap-1 rounded-xl border border-border p-4"
            >
              <div className="flex flex-wrap items-center gap-2">
                <span
                  className={cn(
                    'rounded-full px-2 py-0.5 text-xs font-medium',
                    statusClass(link.status),
                  )}
                >
                  {statusLabel(link.status)}
                </span>
              </div>
              <p className="truncate font-mono text-sm" title={link.url}>
                {link.url}
              </p>
              <p className="text-xs text-muted-foreground">
                {copy.adminAddedBy(displayNames[link.added_by] ?? shortenAddress(link.added_by))}
                {' · '}
                {formatAdminDate(link.created_at)}
              </p>
              {link.status === 'used' && link.consumed_by ? (
                <p className="text-xs text-muted-foreground">
                  {copy.adminUsedBy(
                    displayNames[link.consumed_by] ?? shortenAddress(link.consumed_by),
                    link.consumed_at ? formatAdminDate(link.consumed_at) : '—',
                  )}
                </p>
              ) : null}
            </div>
          ))}
        </div>
      )}

      <div className="flex flex-col gap-2">
        <label htmlFor="invite-link-url" className="text-sm font-medium">
          {copy.adminAddLabel}
        </label>
        <div className="flex flex-col gap-2 sm:flex-row">
          <input
            id="invite-link-url"
            type="url"
            inputMode="url"
            value={newUrl}
            onChange={(e) => {
              setNewUrl(e.target.value);
              setUrlError(null);
            }}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                void handleAdd();
              }
            }}
            placeholder={copy.adminAddPlaceholder}
            className="h-9 flex-1 rounded-lg border border-border bg-background px-3 text-sm outline-none ring-0 transition-colors focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
          />
          <Button type="button" variant="outline" size="sm" disabled={adding || !newUrl.trim()} onClick={() => void handleAdd()}>
            {copy.adminAddButton}
          </Button>
        </div>
        <p className="text-xs text-muted-foreground">{copy.adminAddHelper}</p>
        {urlError ? <p className="text-xs text-destructive">{urlError}</p> : null}
      </div>
    </section>
  );
}
