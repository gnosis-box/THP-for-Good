'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useRowFlash } from '@/hooks/use-row-flash';
import { CalConnect } from '@/components/experts/CalConnect';
import { EXPERT_SHARE_OPTIONS, clampExpertShare } from '@/lib/crc-pay';
import { SkillTagPicker, mergeSkillTag } from '@/components/experts/SkillTagPicker';
import type { ExpertRow, TagRow } from '@/lib/db';

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
  calEventTypeId: number | null;
  expertShare: 0 | 10 | 20 | 30 | 50;
  priceCrc: number;
  selectedSkills: string[];
  submitting: boolean;
  error: string | null;
};

function defaultForm(name: string): PromoteFormState {
  return { name, bio: '', calEventTypeId: null, expertShare: 20, priceCrc: 100, selectedSkills: [], submitting: false, error: null };
}

type Props = {
  tags: TagRow[];
  experts: ExpertRow[];
  admins: string[];
  walletAddress: string;
  initialGroupAddress: string | null;
  members: MemberEntry[];
  membersError: string | null;
  membersLoading: boolean;
  onExpertAdded: () => void;
  onAdminAdded: () => void;
  onReloadMembers: () => void;
};

export function PromoteSection({
  tags,
  experts,
  admins,
  walletAddress,
  initialGroupAddress,
  members,
  membersError,
  membersLoading,
  onExpertAdded,
  onAdminAdded,
  onReloadMembers,
}: Props) {
  const { flashKey, triggerFlash } = useRowFlash();
  const [groupAddress, setGroupAddress] = useState(initialGroupAddress ?? '');
  const [loadingMembers, setLoadingMembers] = useState(false);
  const [manualMembers, setManualMembers] = useState<MemberEntry[] | null>(null);
  const [manualError, setManualError] = useState<string | null>(null);
  const displayMembers = initialGroupAddress ? members : (manualMembers ?? []);
  const loadError = initialGroupAddress ? membersError : manualError;
  const isLoading = initialGroupAddress ? membersLoading : loadingMembers;
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

  async function loadMembers(addressOverride?: string) {
    const addr = (addressOverride ?? groupAddress).trim();
    if (!addr || !walletAddress) return;
    setLoadingMembers(true);
    setManualError(null);
    setManualMembers(null);

    try {
      const res = await fetch(`/api/admin/members?group=${encodeURIComponent(addr)}`, {
        headers: { 'x-wallet-address': walletAddress },
      });
      const json = (await res.json()) as { members?: MemberEntry[]; error?: string };
      if (!res.ok) {
        throw new Error(json.error ?? 'Failed to load group members');
      }
      setManualMembers(json.members ?? []);
    } catch (err) {
      setManualError(err instanceof Error ? err.message : 'Failed to load group members.');
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

  function addNewSkill() {
    const label = newSkill.trim();
    if (!label) return;
    setLocalTags((prev) => mergeSkillTag(prev, label, 'pending'));
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
      const res = await fetch('/api/experts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-wallet-address': walletAddress },
        body: JSON.stringify({
          circles_address: promotingAddress,
          name: form.name.trim(),
          bio: form.bio.trim() || undefined,
          cal_event_type_id: form.calEventTypeId ?? undefined,
          expert_share_percent: form.expertShare,
          price_crc: form.priceCrc,
          skills: form.selectedSkills,
        }),
      });

      if (!res.ok) {
        const json = (await res.json()) as { error?: string };
        throw new Error(json.error ?? 'Failed to promote member');
      }

      const promotedAddress = promotingAddress;
      cancelPromote();
      triggerFlash(promotedAddress);
      onExpertAdded();
    } catch (err) {
      setForm((prev) =>
        prev
          ? { ...prev, submitting: false, error: err instanceof Error ? err.message : 'Something went wrong.' }
          : prev,
      );
    }
  }

  const expertAddresses = new Set(
    (Array.isArray(experts) ? experts : []).map((m) => m.circles_address.toLowerCase()),
  );
  const adminAddresses = new Set(admins.map((a) => a.toLowerCase()));

  async function makeAdmin(memberAddress: string) {
    await fetch('/api/admin/admins', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-wallet-address': walletAddress },
      body: JSON.stringify({ address: memberAddress }),
    });
    triggerFlash(memberAddress);
    onAdminAdded();
  }

  return (
    <section className="flex flex-col gap-4">
      <h2 className="text-base font-semibold">Promote Group Member to Expert</h2>

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
      {isLoading && (
        <p className="text-sm text-muted-foreground">Loading members…</p>
      )}

      {loadError && (
        <div className="flex flex-col gap-2">
          <p className="text-sm text-destructive">{loadError}</p>
          {initialGroupAddress && (
            <Button type="button" variant="outline" size="sm" className="w-fit" onClick={onReloadMembers}>
              Retry
            </Button>
          )}
        </div>
      )}

      {!isLoading && !loadError && displayMembers.length === 0 && initialGroupAddress && (
        <p className="text-sm text-muted-foreground">No members found in this group.</p>
      )}

      {!isLoading && displayMembers.length > 0 && (
        <div className="flex flex-col gap-3">
          {displayMembers.map((member) => {
            const isExpert = expertAddresses.has(member.address.toLowerCase());
            const isAdmin = adminAddresses.has(member.address.toLowerCase());
            const isPromoting = promotingAddress === member.address;

            return (
              <div
                key={member.address}
                className={cn(
                  'flex flex-col gap-3 rounded-xl border border-border p-4',
                  flashKey === member.address && 'motion-row-flash',
                )}
              >
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
                    {isExpert ? (
                      <span className="rounded-full bg-success/15 px-2.5 py-1 text-xs font-medium text-success">
                        Expert
                      </span>
                    ) : (
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => (isPromoting ? cancelPromote() : startPromote(member))}
                      >
                        {isPromoting ? 'Cancel' : 'Promote expert'}
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

                    <SkillTagPicker
                      tags={localTags}
                      selected={form.selectedSkills}
                      onSelectedChange={(skills) =>
                        setForm((prev) => prev && { ...prev, selectedSkills: skills })
                      }
                      size="sm"
                      helperText="Select at least one skill for this expert."
                      newSkill={newSkill}
                      onNewSkillChange={setNewSkill}
                      onAddNewSkill={addNewSkill}
                    />

                    {/* Cal.com */}
                    <div className="flex flex-col gap-1">
                      <span className="text-xs font-medium">Availability (Cal.com)</span>
                      <CalConnect
                        onConnect={(id) => setForm((prev) => prev && { ...prev, calEventTypeId: id })}
                      />
                      {form.calEventTypeId && (
                        <p className="text-xs text-muted-foreground">Event type ID: {form.calEventTypeId}</p>
                      )}
                    </div>

                    {/* Payment split */}
                    <div className="flex flex-col gap-1.5">
                      <span className="text-xs font-medium">Payment split</span>
                      <div className="flex flex-wrap gap-2">
                        {EXPERT_SHARE_OPTIONS.map((opt) => (
                          <button
                            key={opt}
                            type="button"
                            onClick={() => setForm((prev) => prev && { ...prev, expertShare: clampExpertShare(opt) })}
                            className={cn(
                              'rounded-full px-2.5 py-0.5 text-xs font-medium transition-colors border',
                              form.expertShare === opt
                                ? 'bg-primary text-primary-foreground border-primary'
                                : 'border-border bg-background hover:bg-muted',
                            )}
                          >
                            {opt}% me · {100 - opt}% THP
                          </button>
                        ))}
                      </div>
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
                      disabled={form.submitting || !form.name.trim()}
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
