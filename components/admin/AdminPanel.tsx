'use client';

import { useEffect, useState, useCallback } from 'react';
import { useWallet } from '@/components/wallet/WalletProvider';
import { Button } from '@/components/ui/button';
import { toHttpImageUrl, fetchCirclesScore } from '@/lib/utils';
import { PromoteSection } from './PromoteSection';
import { MentorEditForm } from '@/components/mentors/MentorEditForm';
import type { GroupMemberDto } from '@/lib/admin';
import type { MentorRow, TagRow, AdminRow } from '@/lib/db';

export function AdminPanel() {
  const { address, isConnected } = useWallet();

  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [groupAddress, setGroupAddress] = useState<string | null>(null);
  const [mentors, setMentors] = useState<MentorRow[]>([]);
  const [tags, setTags] = useState<TagRow[]>([]);
  const [dbAdmins, setDbAdmins] = useState<AdminRow[]>([]);
  const [groupMembers, setGroupMembers] = useState<GroupMemberDto[]>([]);
  const [membersError, setMembersError] = useState<string | null>(null);
  type AdminProfile = { name: string; imageUrl?: string; trustsReceivedCount: number; score: number | null };
  const [adminProfiles, setAdminProfiles] = useState<Record<string, AdminProfile>>({});
  const [editingMentorId, setEditingMentorId] = useState<number | null>(null);
  const [newTag, setNewTag] = useState('');
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

      const [mRes, tRes, aRes, memRes] = await Promise.all([
        fetch('/api/mentors?all=1', { headers: hdrs }),
        fetch('/api/tags', { headers: hdrs }),
        fetch('/api/admin/admins', { headers: hdrs }),
        ga
          ? fetch(`/api/admin/members?group=${encodeURIComponent(ga)}`, { headers: hdrs })
          : Promise.resolve(null),
      ]);

      const mentorsJson = await mRes.json();
      setMentors(Array.isArray(mentorsJson) ? mentorsJson : []);
      setTags(await tRes.json());
      setDbAdmins(await aRes.json());

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
          const raw = view.profile as (typeof view.profile & { trustsReceivedCount?: number; picture?: string });
          return [a.circles_address, {
            name: raw?.name ?? '',
            imageUrl: toHttpImageUrl(raw?.picture ?? raw?.previewImageUrl ?? raw?.imageUrl),
            trustsReceivedCount: raw?.trustsReceivedCount ?? 0,
            score,
          }] as const;
        }),
      );
      setAdminProfiles(Object.fromEntries(entries));
    })();
  }, [dbAdmins]);

  async function toggleActive(mentor: MentorRow) {
    await fetch(`/api/mentors/${mentor.id}`, {
      method: 'PATCH',
      headers: headers(),
      body: JSON.stringify({ active: mentor.active ? 0 : 1 }),
    });
    load();
  }

  async function deleteMentor(id: number) {
    await fetch(`/api/mentors/${id}`, { method: 'DELETE', headers: headers() });
    load();
  }

  async function deleteTag(id: number) {
    await fetch(`/api/tags/${id}`, { method: 'DELETE', headers: headers() });
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
      {/* Tags */}
      <section className="flex flex-col gap-4">
        <h2 className="text-base font-semibold">Skill Tags</h2>
        <div className="flex flex-wrap gap-2">
          {tags.map((tag) => (
            <span
              key={tag.id}
              className="flex items-center gap-1.5 rounded-full border border-border bg-muted px-3 py-1 text-sm"
            >
              {tag.label}
              {tag.status === 'pending' && (
                <button
                  type="button"
                  onClick={async () => {
                    await fetch(`/api/tags/${tag.id}/approve`, {
                      method: 'POST',
                      headers: headers(),
                    });
                    load();
                  }}
                  className="text-xs font-medium text-primary hover:underline"
                >
                  Approve
                </button>
              )}
              <button
                type="button"
                onClick={() => deleteTag(tag.id)}
                className="text-muted-foreground hover:text-destructive transition-colors leading-none"
                aria-label={`Delete ${tag.label}`}
              >
                ×
              </button>
            </span>
          ))}
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
                      {p.score !== null ? `Score: ${p.score}/100` : `${p.trustsReceivedCount} trusted by`}
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

      {/* Mentors */}
      <section className="flex flex-col gap-4">
        <h2 className="text-base font-semibold">Mentors ({mentors.length})</h2>
        <div className="flex flex-col gap-3">
          {mentors.length === 0 && (
            <p className="text-sm text-muted-foreground">No mentors yet.</p>
          )}
          {mentors.map((mentor) => (
            <div key={mentor.id} className="flex flex-col gap-3 rounded-xl border border-border p-4">
              <div className="flex items-start justify-between gap-4">
                <div className="flex flex-col gap-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-medium truncate">{mentor.name}</span>
                    <span
                      className={`shrink-0 rounded-full px-2 py-0.5 text-xs font-medium ${
                        mentor.active ? 'bg-green-100 text-green-800' : 'bg-muted text-muted-foreground'
                      }`}
                    >
                      {mentor.active ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground font-mono truncate">{mentor.circles_address}</p>
                  {mentor.skills.length > 0 && (
                    <p className="text-xs text-muted-foreground">{mentor.skills.join(', ')}</p>
                  )}
                  <p className="text-xs text-muted-foreground">
                    {mentor.price_crc} CRC · {mentor.mentor_share_percent ?? 20}% mentor / {100 - (mentor.mentor_share_percent ?? 20)}% foundation
                  </p>
                  {mentor.cal_event_type_id && (
                    <p className="text-xs text-muted-foreground">Cal.com event type: {mentor.cal_event_type_id}</p>
                  )}
                </div>
                <div className="flex shrink-0 gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setEditingMentorId(editingMentorId === mentor.id ? null : mentor.id)}
                  >
                    {editingMentorId === mentor.id ? 'Cancel' : 'Edit'}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => toggleActive(mentor)}
                  >
                    {mentor.active ? 'Deactivate' : 'Activate'}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="text-destructive hover:bg-destructive/10"
                    onClick={() => deleteMentor(mentor.id)}
                  >
                    Delete
                  </Button>
                </div>
              </div>
              {editingMentorId === mentor.id && (
                <MentorEditForm
                  mentor={mentor}
                  walletAddress={address ?? ''}
                  onSaved={() => { setEditingMentorId(null); load(); }}
                  onCancel={() => setEditingMentorId(null)}
                />
              )}
            </div>
          ))}
        </div>
      </section>

      {/* Group members → promote */}
      <PromoteSection
        tags={tags}
        mentors={mentors}
        admins={dbAdmins.map((a) => a.circles_address)}
        walletAddress={address ?? ''}
        initialGroupAddress={groupAddress}
        members={groupMembers}
        membersError={membersError}
        membersLoading={loading}
        onMentorAdded={load}
        onAdminAdded={load}
        onReloadMembers={load}
      />
    </div>
  );
}
