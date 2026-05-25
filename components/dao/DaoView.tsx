'use client';

import { useEffect, useRef, useState } from 'react';
import { Users, Star } from 'lucide-react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import { shortenAddress } from '@/lib/utils';
import { ExpertTrustControl } from '@/components/ui-patterns/ExpertTrustControl';
import type { DaoMemberDto } from '@/app/api/dao/members/route';
import type { DaoSupporterDto } from '@/app/api/dao/supporters/route';

const GNOSIS_APP_BASE = 'https://app.gnosis.io';

function MemberCard({ address, name, imageUrl, trustsReceivedCount }: DaoMemberDto) {
  return (
    <a
      href={`${GNOSIS_APP_BASE}/${address}`}
      target="_blank"
      rel="noopener noreferrer"
      className="flex items-center gap-3 rounded-xl border border-border bg-card px-4 py-3 transition-colors hover:border-border/80 hover:bg-white/[0.03]"
    >
      <Avatar size="lg" className="shrink-0">
        {imageUrl && <AvatarImage src={imageUrl} alt={name} />}
        <AvatarFallback>{name.charAt(0).toUpperCase()}</AvatarFallback>
      </Avatar>
      <div className="flex min-w-0 flex-1 flex-col gap-0.5">
        <span className="truncate text-sm font-medium">{name}</span>
        <span className="truncate font-mono text-xs text-muted-foreground">
          {shortenAddress(address)}
        </span>
        {trustsReceivedCount > 0 && (
          <span className="text-xs text-muted-foreground">Trusted by {trustsReceivedCount}</span>
        )}
      </div>
      <ExpertTrustControl expertAddress={address} expertName={name} compact className="shrink-0" />
    </a>
  );
}

function SupporterCard({ address, name, imageUrl, isNew }: DaoSupporterDto & { isNew?: boolean }) {
  return (
    <a
      href={`${GNOSIS_APP_BASE}/${address}`}
      target="_blank"
      rel="noopener noreferrer"
      className={[
        'flex items-center gap-3 rounded-xl border bg-card px-4 py-3 transition-all hover:bg-white/[0.03]',
        isNew
          ? 'border-yellow-500/40 shadow-[0_0_12px_0_theme(colors.yellow.500/15%)] animate-card-in'
          : 'border-border hover:border-border/80',
      ].join(' ')}
    >
      <Avatar size="lg" className="shrink-0">
        {imageUrl && <AvatarImage src={imageUrl} alt={name} />}
        <AvatarFallback>{name.charAt(0).toUpperCase()}</AvatarFallback>
      </Avatar>
      <div className="flex min-w-0 flex-1 flex-col gap-0.5">
        <span className="truncate text-sm font-medium">{name}</span>
        <span className="truncate font-mono text-xs text-muted-foreground">
          {shortenAddress(address)}
        </span>
      </div>
      <ExpertTrustControl expertAddress={address} expertName={name} compact className="shrink-0" />
    </a>
  );
}

function CardGrid({ children }: { children: React.ReactNode }) {
  return <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">{children}</div>;
}

function SkeletonGrid({ count = 6 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="flex items-center gap-3 rounded-xl border border-border px-4 py-3">
          <Skeleton className="size-10 shrink-0 rounded-full" />
          <div className="flex flex-1 flex-col gap-1.5">
            <Skeleton className="h-3.5 w-28 rounded" />
            <Skeleton className="h-3 w-20 rounded" />
          </div>
        </div>
      ))}
    </div>
  );
}

interface Props {
  refreshKey?: number;
  onSupportersLoaded?: (supporters: DaoSupporterDto[]) => void;
}

export function DaoView({ refreshKey = 0, onSupportersLoaded }: Props) {
  const [members, setMembers] = useState<DaoMemberDto[]>([]);
  const [supporters, setSupporters] = useState<DaoSupporterDto[]>([]);
  const [membersLoading, setMembersLoading] = useState(true);
  const [supportersLoading, setSupportersLoading] = useState(false);
  const [membersError, setMembersError] = useState<string | null>(null);
  const [supportersError, setSupportersError] = useState<string | null>(null);
  // Addresses present before the last refresh — used to flag newcomers
  const knownAddresses = useRef<Set<string>>(new Set());
  const [newAddresses, setNewAddresses] = useState<Set<string>>(new Set());
  // Badge pop: bump this key when count increases so the span remounts + animates
  const [badgeKey, setBadgeKey] = useState(0);
  const prevCount = useRef(0);

  // Initial members fetch (once)
  useEffect(() => {
    fetch('/api/dao/members')
      .then((r) => r.json())
      .then((data: { members?: DaoMemberDto[]; error?: string }) => {
        if (data.error) setMembersError(data.error);
        else setMembers(data.members ?? []);
      })
      .catch(() => setMembersError('Failed to load members.'))
      .finally(() => setMembersLoading(false));
  }, []);

  // Supporters fetch — re-runs when refreshKey changes
  useEffect(() => {
    setSupportersLoading(true);
    fetch('/api/dao/supporters')
      .then((r) => r.json())
      .then((data: { supporters?: DaoSupporterDto[]; error?: string }) => {
        if (data.error) {
          setSupportersError(data.error);
          return;
        }
        const list = data.supporters ?? [];
        onSupportersLoaded?.(list);
        // Find addresses that weren't there before
        const fresh = new Set(
          list.map((s) => s.address).filter((a) => !knownAddresses.current.has(a)),
        );
        if (fresh.size > 0) setNewAddresses(fresh);
        // Update the known set
        knownAddresses.current = new Set(list.map((s) => s.address));
        // Badge pop when count grew
        if (list.length > prevCount.current) setBadgeKey((k) => k + 1);
        prevCount.current = list.length;
        setSupporters(list);
      })
      .catch(() => setSupportersError('Failed to load supporters.'))
      .finally(() => setSupportersLoading(false));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [refreshKey]);

  return (
    <>
      <style>{`
        @keyframes badge-pop {
          0%   { transform: scale(1); color: inherit; }
          35%  { transform: scale(1.5); color: #facc15; }
          65%  { transform: scale(0.9); }
          100% { transform: scale(1); color: inherit; }
        }
        .badge-pop { animation: badge-pop 0.45s ease-out forwards; display: inline-block; }
        @keyframes card-in {
          0%   { opacity: 0; transform: translateY(10px); }
          100% { opacity: 1; transform: translateY(0); }
        }
        .animate-card-in { animation: card-in 0.4s ease-out forwards; }
      `}</style>

      <Tabs defaultValue="members" className="flex flex-col gap-4">
        <TabsList className="w-fit">
          <TabsTrigger value="members">
            <Users className="size-3.5" />
            Members
            {!membersLoading && members.length > 0 && (
              <span className="ml-1 text-xs text-muted-foreground">({members.length})</span>
            )}
          </TabsTrigger>
          <TabsTrigger value="supporters">
            <Star className="size-3.5" />
            Supporters
            {!supportersLoading && supporters.length > 0 && (
              <span key={badgeKey} className={`ml-1 text-xs text-muted-foreground${badgeKey > 0 ? ' badge-pop' : ''}`}>
                ({supporters.length})
              </span>
            )}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="members">
          {membersLoading ? (
            <SkeletonGrid />
          ) : membersError ? (
            <p className="text-sm text-destructive">{membersError}</p>
          ) : members.length === 0 ? (
            <p className="text-sm text-muted-foreground">No members found.</p>
          ) : (
            <CardGrid>
              {members.map((m) => (
                <MemberCard key={m.address} {...m} />
              ))}
            </CardGrid>
          )}
        </TabsContent>

        <TabsContent value="supporters">
          {supportersLoading ? (
            <SkeletonGrid />
          ) : supportersError ? (
            <p className="text-sm text-destructive">{supportersError}</p>
          ) : supporters.length === 0 ? (
            <p className="text-sm text-muted-foreground">No supporters found.</p>
          ) : (
            <CardGrid>
              {supporters.map((s) => (
                <SupporterCard key={s.address} {...s} isNew={newAddresses.has(s.address)} />
              ))}
            </CardGrid>
          )}
        </TabsContent>
      </Tabs>
    </>
  );
}
