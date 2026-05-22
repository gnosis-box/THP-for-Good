'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import type { MentorRow, TagRow } from '@/lib/db';

type MemberEntry = {
  address: `0x${string}`;
  name: string;
  imageUrl: string | undefined;
  trustsReceivedCount: number;
  score: number | null;
};

type PromoteFormState = {
  name: string;
  bio: string;
  calendarLink: string;
  priceCrc: number;
  selectedSkills: string[];
  submitting: boolean;
  error: string | null;
};

function defaultForm(name: string): PromoteFormState {
  return { name, bio: '', calendarLink: '', priceCrc: 100, selectedSkills: [], submitting: false, error: null };
}

type Props = {
  tags: TagRow[];
  mentors: MentorRow[];
  admins: string[];
  walletAddress: string;
  initialGroupAddress: string | null;
  onMentorAdded: () => void;
  onAdminAdded: () => void;
};

export function PromoteSection({ tags, mentors, admins, walletAddress, initialGroupAddress, onMentorAdded, onAdminAdded }: Props) {
  const [groupAddress, setGroupAddress] = useState(initialGroupAddress ?? '');
  const [loadingMembers, setLoadingMembers] = useState(false);
  const [members, setMembers] = useState<MemberEntry[] | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [promotingAddress, setPromotingAddress] = useState<string | null>(null);
  const [form, setForm] = useState<PromoteFormState | null>(null);
  const [newSkill, setNewSkill] = useState('');
  const [localTags, setLocalTags] = useState<TagRow[]>(tags);

  useEffect(() => {
    setLocalTags(tags);
  }, [tags]);

  useEffect(() => {
    if (initialGroupAddress) setGroupAddress(initialGroupAddress);
  }, [initialGroupAddress]);

  useEffect(() => {
    if (!initialGroupAddress || !walletAddress) return;
    let cancelled = false;

    (async () => {
      setLoadingMembers(true);
      setLoadError(null);
      setMembers(null);
      try {
        const res = await fetch(
          `/api/admin/members?group=${encodeURIComponent(initialGroupAddress)}`,
          { headers: { 'x-wallet-address': walletAddress } },
        );
        const json = (await res.json()) as { members?: MemberEntry[]; error?: string };
        if (!res.ok) throw new Error(json.error ?? 'Failed to load group members');
        if (!cancelled) setMembers(json.members ?? []);
      } catch (err) {
        if (!cancelled) {
          setLoadError(err instanceof Error ? err.message : 'Failed to load group members.');
        }
      } finally {
        if (!cancelled) setLoadingMembers(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [initialGroupAddress, walletAddress]);

  async function loadMembers(addressOverride?: string) {
    const addr = (addressOverride ?? initialGroupAddress ?? groupAddress).trim();
    if (!addr) return;
    setLoadingMembers(true);
    setLoadError(null);
    setMembers(null);

    try {
      const res = await fetch(`/api/admin/members?group=${encodeURIComponent(addr)}`, {
        headers: { 'x-wallet-address': walletAddress },
      });
      const json = (await res.json()) as { members?: MemberEntry[]; error?: string };
      if (!res.ok) {
        throw new Error(json.error ?? 'Failed to load group members');
      }
      setMembers(json.members ?? []);
    } catch (err) {
      setLoadError(err instanceof Error ? err.message : 'Failed to load group members.');
    } finally {
      setLoadingMembers(false);
    }
  }

  function startPromote(member: MemberEntry) {
    setPromotingAddress(member.address);
    setForm(defaultForm(member.name));
    setNewSkill('');
  }

  function cancelPromote() {
    setPromotingAddress(null);
    setForm(null);
  }

  function toggleSkill(label: string) {
    setForm((prev) =>
      prev
        ? {
            ...prev,
            selectedSkills: prev.selectedSkills.includes(label)
              ? prev.selectedSkills.filter((s) => s !== label)
              : [...prev.selectedSkills, label],
          }
        : prev,
    );
  }

  function addNewSkill() {
    const label = newSkill.trim();
    if (!label) return;
    if (!localTags.some((t) => t.label.toLowerCase() === label.toLowerCase())) {
      setLocalTags((prev) => [...prev, { id: -(prev.length + 1), label }]);
    }
    setForm((prev) =>
      prev && !prev.selectedSkills.includes(label)
        ? { ...prev, selectedSkills: [...prev.selectedSkills, label] }
        : prev,
    );
    setNewSkill('');
  }

  async function submitPromote() {
    if (!form || !promotingAddress) return;
    if (form.selectedSkills.length === 0) {
      setForm((prev) => prev && { ...prev, error: 'Select at least one skill.' });
      return;
    }
    setForm((prev) => prev && { ...prev, submitting: true, error: null });

    try {
      const res = await fetch('/api/mentors', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-wallet-address': walletAddress },
        body: JSON.stringify({
          circles_address: promotingAddress,
          name: form.name.trim(),
          bio: form.bio.trim() || undefined,
          calendar_link: form.calendarLink.trim(),
          price_crc: form.priceCrc,
          skills: form.selectedSkills,
        }),
      });

      if (!res.ok) {
        const json = (await res.json()) as { error?: string };
        throw new Error(json.error ?? 'Failed to promote member');
      }

      cancelPromote();
      onMentorAdded();
    } catch (err) {
      setForm((prev) =>
        prev
          ? { ...prev, submitting: false, error: err instanceof Error ? err.message : 'Something went wrong.' }
          : prev,
      );
    }
  }

  const mentorAddresses = new Set(mentors.map((m) => m.circles_address.toLowerCase()));
  const adminAddresses = new Set(admins.map((a) => a.toLowerCase()));

  async function makeAdmin(address: string) {
    await fetch('/api/admin/admins', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-wallet-address': walletAddress },
      body: JSON.stringify({ address }),
    });
    onAdminAdded();
  }

  return (
    <section className="flex flex-col gap-4">
      <h2 className="text-base font-semibold">Promote Group Member to Mentor</h2>

      {!initialGroupAddress && (
        <div className="flex gap-2">
          <input
            type="text"
            value={groupAddress}
            onChange={(e) => setGroupAddress(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && loadMembers()}
            placeholder="Circles group address (0x…)"
            className="h-9 flex-1 rounded-lg border border-border bg-background px-3 text-sm outline-none ring-0 transition-colors focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
          />
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => loadMembers()}
            disabled={loadingMembers || !groupAddress.trim()}
          >
            {loadingMembers ? 'Loading…' : 'Load'}
          </Button>
        </div>
      )}
      {initialGroupAddress && loadingMembers && (
        <p className="text-sm text-muted-foreground">Loading members…</p>
      )}

      {loadError && <p className="text-sm text-destructive">{loadError}</p>}

      {members !== null && members.length === 0 && (
        <p className="text-sm text-muted-foreground">No members found in this group.</p>
      )}

      {members !== null && members.length > 0 && (
        <div className="flex flex-col gap-3">
          {members.map((member) => {
            const isMentor = mentorAddresses.has(member.address.toLowerCase());
            const isAdmin = adminAddresses.has(member.address.toLowerCase());
            const isPromoting = promotingAddress === member.address;

            return (
              <div key={member.address} className="flex flex-col gap-3 rounded-xl border border-border p-4">
                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3 min-w-0">
                    {member.imageUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={member.imageUrl} alt={member.name} className="size-10 shrink-0 rounded-full object-cover" />
                    ) : (
                      <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-muted text-sm font-semibold text-muted-foreground select-none">
                        {member.name.charAt(0).toUpperCase()}
                      </div>
                    )}
                    <div className="flex flex-col gap-0.5 min-w-0">
                      <span className="font-medium truncate">{member.name}</span>
                      <span className="text-xs text-muted-foreground font-mono truncate">{member.address}</span>
                      <span className="text-xs text-muted-foreground">
                        {member.score !== null ? `Score: ${member.score}/100` : `${member.trustsReceivedCount} trusted by`}
                      </span>
                    </div>
                  </div>
                  <div className="flex shrink-0 items-center gap-2">
                    {isMentor ? (
                      <span className="rounded-full bg-green-100 px-2.5 py-1 text-xs font-medium text-green-800">
                        Mentor
                      </span>
                    ) : (
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => (isPromoting ? cancelPromote() : startPromote(member))}
                      >
                        {isPromoting ? 'Cancel' : 'Promote mentor'}
                      </Button>
                    )}
                    {isAdmin ? (
                      <span className="rounded-full bg-blue-100 px-2.5 py-1 text-xs font-medium text-blue-800">
                        Admin
                      </span>
                    ) : (
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => makeAdmin(member.address)}
                      >
                        Make admin
                      </Button>
                    )}
                  </div>
                </div>

                {isPromoting && form && (
                  <div className="flex flex-col gap-3 border-t border-border pt-3">
                    {/* Name */}
                    <div className="flex flex-col gap-1">
                      <label className="text-xs font-medium">Name</label>
                      <input
                        type="text"
                        value={form.name}
                        onChange={(e) => setForm((prev) => prev && { ...prev, name: e.target.value })}
                        className="h-8 rounded-lg border border-border bg-background px-3 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
                      />
                    </div>

                    {/* Bio */}
                    <div className="flex flex-col gap-1">
                      <label className="text-xs font-medium">Bio</label>
                      <textarea
                        value={form.bio}
                        onChange={(e) => setForm((prev) => prev && { ...prev, bio: e.target.value })}
                        rows={2}
                        placeholder="Short description…"
                        className="rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none resize-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
                      />
                    </div>

                    {/* Skills */}
                    <div className="flex flex-col gap-1.5">
                      <span className="text-xs font-medium">Skills</span>
                      <div className="flex flex-wrap gap-1.5">
                        {localTags.map((tag) => {
                          const active = form.selectedSkills.includes(tag.label);
                          return (
                            <button
                              key={tag.id}
                              type="button"
                              onClick={() => toggleSkill(tag.label)}
                              className={cn(
                                'shrink-0 rounded-full px-2.5 py-0.5 text-xs font-medium transition-colors',
                                active
                                  ? 'bg-primary text-primary-foreground'
                                  : 'border border-border bg-background hover:bg-muted',
                              )}
                            >
                              {tag.label}
                            </button>
                          );
                        })}
                      </div>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={newSkill}
                          onChange={(e) => setNewSkill(e.target.value)}
                          onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addNewSkill())}
                          placeholder="Add a skill…"
                          className="h-7 flex-1 rounded-lg border border-border bg-background px-2.5 text-xs outline-none focus-visible:border-ring"
                        />
                        <button
                          type="button"
                          onClick={addNewSkill}
                          disabled={!newSkill.trim()}
                          className="h-7 rounded-lg border border-border px-2.5 text-xs hover:bg-muted disabled:opacity-40"
                        >
                          Add
                        </button>
                      </div>
                    </div>

                    {/* Calendar link */}
                    <div className="flex flex-col gap-1">
                      <label className="text-xs font-medium">Google Calendar embed URL (iframe src) *</label>
                      <input
                        type="url"
                        value={form.calendarLink}
                        onChange={(e) => setForm((prev) => prev && { ...prev, calendarLink: e.target.value })}
                        placeholder="https://calendar.google.com/calendar/appointments/schedules/…?gv=true"
                        className="h-8 rounded-lg border border-border bg-background px-3 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
                      />
                    </div>

                    {/* Price */}
                    <div className="flex items-center gap-3">
                      <label className="text-xs font-medium">CRC per session</label>
                      <input
                        type="number"
                        min={1}
                        value={form.priceCrc}
                        onChange={(e) =>
                          setForm((prev) => prev && { ...prev, priceCrc: parseInt(e.target.value, 10) || 1 })
                        }
                        className="h-8 w-24 rounded-lg border border-border bg-background px-3 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
                      />
                    </div>

                    {form.error && <p className="text-xs text-destructive">{form.error}</p>}

                    <Button
                      type="button"
                      size="sm"
                      onClick={submitPromote}
                      disabled={form.submitting || !form.calendarLink.trim() || !form.name.trim()}
                      className="w-fit"
                    >
                      {form.submitting ? 'Saving…' : 'Confirm & promote'}
                    </Button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}
