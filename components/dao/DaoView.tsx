'use client';

import { useEffect, useState } from 'react';
import { Users, Star } from 'lucide-react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import { shortenAddress } from '@/lib/utils';
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
      <div className="flex min-w-0 flex-col gap-0.5">
        <span className="truncate text-sm font-medium">{name}</span>
        <span className="truncate font-mono text-xs text-muted-foreground">
          {shortenAddress(address)}
        </span>
        {trustsReceivedCount > 0 && (
          <span className="text-xs text-muted-foreground">Trusted by {trustsReceivedCount}</span>
        )}
      </div>
    </a>
  );
}

function SupporterCard({ address, name, imageUrl }: DaoSupporterDto) {
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
      <div className="flex min-w-0 flex-col gap-0.5">
        <span className="truncate text-sm font-medium">{name}</span>
        <span className="truncate font-mono text-xs text-muted-foreground">
          {shortenAddress(address)}
        </span>
      </div>
    </a>
  );
}

function CardGrid({ children }: { children: React.ReactNode }) {
  return (
    <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
      {children}
    </div>
  );
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

export function DaoView() {
  const [members, setMembers] = useState<DaoMemberDto[]>([]);
  const [supporters, setSupporters] = useState<DaoSupporterDto[]>([]);
  const [membersLoading, setMembersLoading] = useState(true);
  const [supportersLoading, setSupportersLoading] = useState(true);
  const [membersError, setMembersError] = useState<string | null>(null);
  const [supportersError, setSupportersError] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/dao/members')
      .then((r) => r.json())
      .then((data: { members?: DaoMemberDto[]; error?: string }) => {
        if (data.error) setMembersError(data.error);
        else setMembers(data.members ?? []);
      })
      .catch(() => setMembersError('Failed to load members.'))
      .finally(() => setMembersLoading(false));

    fetch('/api/dao/supporters')
      .then((r) => r.json())
      .then((data: { supporters?: DaoSupporterDto[]; error?: string }) => {
        if (data.error) setSupportersError(data.error);
        else setSupporters(data.supporters ?? []);
      })
      .catch(() => setSupportersError('Failed to load supporters.'))
      .finally(() => setSupportersLoading(false));
  }, []);

  return (
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
            <span className="ml-1 text-xs text-muted-foreground">({supporters.length})</span>
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
              <SupporterCard key={s.address} {...s} />
            ))}
          </CardGrid>
        )}
      </TabsContent>
    </Tabs>
  );
}
