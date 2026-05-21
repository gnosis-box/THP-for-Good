'use client';

import { useEffect, useState, useCallback } from 'react';
import { useWallet } from '@/components/wallet/WalletProvider';
import { Button } from '@/components/ui/button';
import { PromoteSection } from './PromoteSection';
import type { MentorRow, TagRow } from '@/lib/db';

export function AdminPanel() {
  const { address, isConnected } = useWallet();

  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [mentors, setMentors] = useState<MentorRow[]>([]);
  const [tags, setTags] = useState<TagRow[]>([]);
  const [newTag, setNewTag] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const headers = useCallback(
    () => ({ 'Content-Type': 'application/json', 'x-wallet-address': address ?? '' }),
    [address],
  );

  const load = useCallback(async () => {
    if (!address) return;
    setLoading(true);
    try {
      const [checkRes, mRes, tRes] = await Promise.all([
        fetch('/api/admin/check', { headers: headers() }),
        fetch('/api/mentors?all=1', { headers: headers() }),
        fetch('/api/tags', { headers: headers() }),
      ]);
      const { isAdmin: admin } = (await checkRes.json()) as { isAdmin: boolean };
      setIsAdmin(admin);
      if (admin) {
        setMentors(await mRes.json());
        setTags(await tRes.json());
      }
    } catch {
      setError('Failed to load data.');
    } finally {
      setLoading(false);
    }
  }, [address, headers]);

  useEffect(() => { load(); }, [load]);

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

      {/* Group members → promote */}
      <PromoteSection
        tags={tags}
        mentors={mentors}
        walletAddress={address ?? ''}
        onMentorAdded={load}
      />

      {/* Mentors */}
      <section className="flex flex-col gap-4">
        <h2 className="text-base font-semibold">Mentors ({mentors.length})</h2>
        <div className="flex flex-col gap-3">
          {mentors.length === 0 && (
            <p className="text-sm text-muted-foreground">No mentors yet.</p>
          )}
          {mentors.map((mentor) => (
            <div
              key={mentor.id}
              className="flex items-start justify-between gap-4 rounded-xl border border-border p-4"
            >
              <div className="flex flex-col gap-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-medium truncate">{mentor.name}</span>
                  <span
                    className={`shrink-0 rounded-full px-2 py-0.5 text-xs font-medium ${
                      mentor.active
                        ? 'bg-green-100 text-green-800'
                        : 'bg-muted text-muted-foreground'
                    }`}
                  >
                    {mentor.active ? 'Active' : 'Inactive'}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground font-mono truncate">{mentor.circles_address}</p>
                {mentor.skills.length > 0 && (
                  <p className="text-xs text-muted-foreground">{mentor.skills.join(', ')}</p>
                )}
              </div>
              <div className="flex shrink-0 gap-2">
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
          ))}
        </div>
      </section>
    </div>
  );
}
