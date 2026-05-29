'use client';

import Link from 'next/link';
import { useEffect, useState, useCallback } from 'react';
import { useWallet } from '@/components/wallet/WalletProvider';
import { Button } from '@/components/ui/button';
import { getProfileImageUrl, getTrustedByCount } from '@/lib/expert-trust-stats';
import { fetchCirclesScore, cn } from '@/lib/utils';
import { useRowFlash } from '@/hooks/use-row-flash';
import { PromoteSection } from './PromoteSection';
import { PlatformHealthSection } from './PlatformHealthSection';
import { ExpertEditForm } from '@/components/experts/ExpertEditForm';
import { ExpertLanguageTags, ExpertSkillTags } from '@/components/ui-patterns/ExpertMeta';
import { getDisplayCallLanguages } from '@/lib/languages';
import type { GroupMemberDto } from '@/lib/admin';
import type { AdminHealthStats, ExpertRow, TagRow, AdminRow } from '@/lib/db';

export function AdminPanel() {
  const { address, isConnected } = useWallet();
  const { flashKey, triggerFlash } = useRowFlash();

  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [groupAddress, setGroupAddress] = useState<string | null>(null);
  const [experts, setExperts] = useState<ExpertRow[]>([]);
  const [tags, setTags] = useState<TagRow[]>([]);
  const [dbAdmins, setDbAdmins] = useState<AdminRow[]>([]);
  const [health, setHealth] = useState<AdminHealthStats | null>(null);
  const [groupMembers, setGroupMembers] = useState<GroupMemberDto[]>([]);
  const [membersError, setMembersError] = useState<string | null>(null);
  type AdminProfile = { name: string; imageUrl?: string; trustedByCount: number; score: number | null };
  const [adminProfiles, setAdminProfiles] = useState<Record<string, AdminProfile>>({});
  const [editingExpertId, setEditingExpertId] = useState<number | null>(null);
  const [editingTagId, setEditingTagId] = useState<number | null>(null);
  const [editingTagLabel, setEditingTagLabel] = useState('');
  const [newTag, setNewTag] = useState('');
  const [exitingTagIds, setExitingTagIds] = useState<Set<number>>(() => new Set());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const headers = useCallback(
    () => ({ 'Content-Type': 'application/json', 'x-wallet-address': address ?? '' }),
    [address],
  );

  const load = useCallback(async () => {
    if (!address) {
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    setMembersError(null);
    try {
      const hdrs = headers();
      const checkRes = await fetch('/api/admin/check', { headers: hdrs });
      const { isAdmin: admin, groupAddress: ga } = (await checkRes.json()) as {
        isAdmin: boolean;
        groupAddress: string | null;
      };
      setIsAdmin(admin);
      setGroupAddress(ga);

      if (!admin) return;

      const [mRes, tRes, aRes, hRes, memRes] = await Promise.all([
        fetch('/api/experts?all=1', { headers: hdrs }),
        fetch('/api/tags', { headers: hdrs }),
        fetch('/api/admin/admins', { headers: hdrs }),
        fetch('/api/admin/health', { headers: hdrs }),
        ga
          ? fetch(`/api/admin/members?group=${encodeURIComponent(ga)}`, { headers: hdrs })
          : Promise.resolve(null),
      ]);

      const expertsJson = await mRes.json();
      setExperts(Array.isArray(expertsJson) ? expertsJson : []);
      setTags(await tRes.json());
      setDbAdmins(await aRes.json());
      if (hRes.ok) {
        setHealth((await hRes.json()) as AdminHealthStats);
      } else {
        setHealth(null);
      }

      if (memRes) {
        const memJson = (await memRes.json()) as { members?: GroupMemberDto[]; error?: string };
        if (!memRes.ok) {
          setGroupMembers([]);
          setMembersError(memJson.error ?? 'Failed to load group members');
        } else {
          setGroupMembers(memJson.members ?? []);
        }
      } else {
        setGroupMembers([]);
      }
    } catch {
      setError('Failed to load data.');
    } finally {
      setLoading(false);
    }
  }, [address, headers]);

  useEffect(() => { load(); }, [load]);

  useEffect(() => {
    if (dbAdmins.length === 0) return;
    (async () => {
      const { Sdk } = await import('@aboutcircles/sdk');
      const sdk = new Sdk();
      const entries = await Promise.all(
        dbAdmins.map(async (a) => {
          const [view, score] = await Promise.all([
            sdk.rpc.profile.getProfileView(a.circles_address as `0x${string}`),
            fetchCirclesScore(a.circles_address),
          ]);
          const raw = view.profile as (typeof view.profile & { name?: string }) | undefined;
          return [a.circles_address, {
            name: raw?.name ?? '',
            imageUrl: getProfileImageUrl(view),
            trustedByCount: getTrustedByCount(view),
            score,
          }] as const;
        }),
      );
      setAdminProfiles(Object.fromEntries(entries));
    })();
  }, [dbAdmins]);

  async function toggleActive(expert: ExpertRow) {
    await fetch(`/api/experts/${expert.id}`, {
      method: 'PATCH',
      headers: headers(),
      body: JSON.stringify({ active: expert.active ? 0 : 1 }),
    });
    load();
  }

  async function deleteExpert(id: number) {
    await fetch(`/api/experts/${id}`, { method: 'DELETE', headers: headers() });
    load();
  }

  async function deleteTag(id: number) {
    setExitingTagIds((prev) => new Set(prev).add(id));
    await new Promise((resolve) => setTimeout(resolve, 200));
    await fetch(`/api/tags/${id}`, { method: 'DELETE', headers: headers() });
    setExitingTagIds((prev) => {
      const next = new Set(prev);
      next.delete(id);
      return next;
    });
    load();
  }

  async function renameTag(id: number, label: string) {
    if (!label.trim()) return;
    await fetch(`/api/tags/${id}`, {
      method: 'PATCH',
      headers: headers(),
      body: JSON.stringify({ label: label.trim() }),
    });
    setEditingTagId(null);
    load();
  }

  async function removeAdmin(id: number) {
    await fetch(`/api/admin/admins/${id}`, { method: 'DELETE', headers: headers() });
    load();
  }

  async function addTag() {
    const label = newTag.trim();
    if (!label) return;
    await fetch('/api/tags', {
      method: 'POST',
      headers: headers(),
      body: JSON.stringify({ label }),
    });
    setNewTag('');
    load();
  }

  if (!isConnected) {
    return <p className="text-sm text-muted-foreground">Connect your wallet to access the admin panel.</p>;
  }

  if (loading) {
    return <p className="text-sm text-muted-foreground">Loading…</p>;
  }

  if (error) {
    return <p className="text-sm text-destructive">{error}</p>;
  }

  if (!isAdmin) {
    return <p className="text-sm text-destructive">Access denied — your wallet is not an admin address.</p>;
  }

  return (
    <div className="flex flex-col gap-10">
      {health ? <PlatformHealthSection stats={health} /> : null}

      <p className="text-sm">
        <Link href="/stats" className="text-foreground underline underline-offset-2">
          Public stats →
        </Link>
      </p>
      {/* Tags */}
      <section className="flex flex-col gap-4">
        <h2 className="text-base font-semibold">Skill Tags</h2>
        <div className="flex flex-wrap gap-2">
          {tags.map((tag) =>
            editingTagId === tag.id ? (
              <span key={tag.id} className="flex items-center gap-1 rounded-full border border-ring bg-background px-2 py-0.5">
                <input
                  autoFocus
                  type="text"
                  value={editingTagLabel}
                  onChange={(e) => setEditingTagLabel(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') { e.preventDefault(); void renameTag(tag.id, editingTagLabel); }
                    if (e.key === 'Escape') setEditingTagId(null);
                  }}
                  className="w-28 bg-transparent text-sm outline-none"
                />
                <button type="button" onClick={() => void renameTag(tag.id, editingTagLabel)} className="text-xs font-medium text-foreground underline-offset-2 hover:underline">Save</button>
                <button type="button" onClick={() => setEditingTagId(null)} className="text-muted-foreground hover:text-destructive leading-none">×</button>
              </span>
            ) : (
              <span
                key={tag.id}
                className={cn(
                  'flex items-center gap-1.5 rounded-full border border-border bg-muted px-3 py-1 text-sm',
                  flashKey === `tag-${tag.id}` && 'motion-row-flash',
                  exitingTagIds.has(tag.id) && 'motion-tag-exit',
                )}
              >
                {tag.label}
                {tag.status === 'pending' && (
                  <button
                    type="button"
                    onClick={async () => {
                      await fetch(`/api/tags/${tag.id}/approve`, { method: 'POST', headers: headers() });
                      triggerFlash(`tag-${tag.id}`);
                      load();
                    }}
                    className="text-xs font-medium text-foreground underline-offset-2 hover:underline"
                  >
                    Approve
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => { setEditingTagId(tag.id); setEditingTagLabel(tag.label); }}
                  className="text-muted-foreground hover:text-foreground transition-colors leading-none text-xs"
                  aria-label={`Rename ${tag.label}`}
                >
                  ✎
                </button>
                <button
                  type="button"
                  onClick={() => void deleteTag(tag.id)}
                  className="text-muted-foreground hover:text-destructive transition-colors leading-none"
                  aria-label={`Delete ${tag.label}`}
                >
                  ×
                </button>
              </span>
            )
          )}
        </div>
        <div className="flex gap-2">
          <input
            type="text"
            value={newTag}
            onChange={(e) => setNewTag(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && addTag()}
            placeholder="New skill…"
            className="h-9 flex-1 max-w-xs rounded-lg border border-border bg-background px-3 text-sm outline-none ring-0 transition-colors focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
          />
          <Button type="button" variant="outline" size="sm" onClick={addTag} disabled={!newTag.trim()}>
            Add
          </Button>
        </div>
      </section>

      {/* Admins */}
      <section className="flex flex-col gap-4">
        <h2 className="text-base font-semibold">Admins</h2>
        <div className="flex flex-col gap-3">
          {dbAdmins.length === 0 && (
            <p className="text-sm text-muted-foreground">No DB admins yet. Add via env var ADMIN_ADDRESSES or promote a member below.</p>
          )}
          {dbAdmins.map((admin) => {
            const p = adminProfiles[admin.circles_address];
            return (
            <div key={admin.id} className="flex items-center justify-between gap-4 rounded-xl border border-border p-4">
              <div className="flex items-center gap-3 min-w-0">
                {p?.imageUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={p.imageUrl} alt={p.name} className="size-10 shrink-0 rounded-full object-cover" />
                ) : (
                  <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-muted text-sm font-semibold text-muted-foreground select-none">
                    {(p?.name ?? admin.circles_address).charAt(0).toUpperCase()}
                  </div>
                )}
                <div className="flex flex-col gap-0.5 min-w-0">
                  <span className="font-medium truncate">{p?.name ?? '…'}</span>
                  <p className="text-xs text-muted-foreground font-mono truncate">{admin.circles_address}</p>
                  {p && (
                    <span className="text-xs text-muted-foreground">
                      {p.score !== null ? `Score: ${p.score}/100` : `${p.trustedByCount} trusted by`}
                    </span>
                  )}
                </div>
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="text-destructive hover:bg-destructive/10"
                onClick={() => removeAdmin(admin.id)}
              >
                Remove
              </Button>
            </div>
          );
          })}

        </div>
      </section>

      {/* Experts */}
      <section className="flex flex-col gap-4">
        <h2 className="text-base font-semibold">Experts ({experts.length})</h2>
        <div className="flex flex-col gap-3">
          {experts.length === 0 && (
            <p className="text-sm text-muted-foreground">No experts yet.</p>
          )}
          {experts.map((expert) => (
            <div key={expert.id} className="flex flex-col gap-3 rounded-xl border border-border p-4">
              <div className="flex items-start justify-between gap-4">
                <div className="flex flex-col gap-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-medium truncate">{expert.name}</span>
                    <span
                      className={`shrink-0 rounded-full px-2 py-0.5 text-xs font-medium ${
                        expert.active ? 'bg-success/15 text-success' : 'bg-muted text-muted-foreground'
                      }`}
                    >
                      {expert.active ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground font-mono truncate">{expert.circles_address}</p>
                  <ExpertLanguageTags
                    languages={getDisplayCallLanguages(expert)}
                    variant="card"
                  />
                  <ExpertSkillTags skills={expert.skills} />
                  <p className="text-xs text-muted-foreground">
                    {expert.price_crc} CRC · {expert.expert_share_percent ?? 20}% expert / {100 - (expert.expert_share_percent ?? 20)}% foundation
                  </p>
                  {expert.cal_event_type_id && (
                    <p className="text-xs text-muted-foreground">Cal.com event type: {expert.cal_event_type_id}</p>
                  )}
                </div>
                <div className="flex shrink-0 gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setEditingExpertId(editingExpertId === expert.id ? null : expert.id)}
                  >
                    {editingExpertId === expert.id ? 'Cancel' : 'Edit'}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => toggleActive(expert)}
                  >
                    {expert.active ? 'Deactivate' : 'Activate'}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="text-destructive hover:bg-destructive/10"
                    onClick={() => deleteExpert(expert.id)}
                  >
                    Delete
                  </Button>
                </div>
              </div>
              {editingExpertId === expert.id && (
                <ExpertEditForm
                  expert={expert}
                  walletAddress={address ?? ''}
                  expandAll
                  onSaved={() => { setEditingExpertId(null); load(); }}
                  onCancel={() => setEditingExpertId(null)}
                />
              )}
            </div>
          ))}
        </div>
      </section>

      {/* Group members → promote */}
      <PromoteSection
        experts={experts}
        admins={dbAdmins.map((a) => a.circles_address)}
        walletAddress={address ?? ''}
        initialGroupAddress={groupAddress}
        members={groupMembers}
        membersError={membersError}
        membersLoading={loading}
        onExpertAdded={load}
        onAdminAdded={load}
        onReloadMembers={load}
      />
    </div>
  );
}
