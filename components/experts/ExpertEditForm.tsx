'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { CalConnect } from '@/components/experts/CalConnect';
import { EXPERT_SHARE_OPTIONS, clampExpertShare } from '@/lib/crc-pay';
import { SkillTagPicker, mergeSkillTag } from '@/components/experts/SkillTagPicker';
import { defaultCallLanguagesFromSpoken, filterCallLanguageCodes } from '@/lib/languages';
import { LanguagePicker } from '@/components/experts/LanguagePicker';
import { StopExpertButton } from '@/components/experts/StopExpertButton';
import { CollapsibleSection } from '@/components/motion/collapsible-section';
import type { ExpertRow, TagRow } from '@/lib/db';

type Props = {
  expert: ExpertRow;
  walletAddress: string;
  onSaved: () => void;
  onCancel: () => void;
  onDeactivated?: () => void;
  /** Admin inline edit — all accordion sections open by default */
  expandAll?: boolean;
};

export function ExpertEditForm({
  expert,
  walletAddress,
  onSaved,
  onCancel,
  onDeactivated,
  expandAll = false,
}: Props) {
  const [tags, setTags] = useState<TagRow[]>([]);
  const [name, setName] = useState(expert.name);
  const [bio, setBio] = useState(expert.bio ?? '');
  const [selectedSkills, setSelectedSkills] = useState<string[]>(expert.skills);
  const [spokenLanguages, setSpokenLanguages] = useState<string[]>(expert.spoken_languages);
  const [callLanguages, setCallLanguages] = useState<string[]>(
    expert.call_languages.length > 0
      ? filterCallLanguageCodes(expert.call_languages)
      : defaultCallLanguagesFromSpoken(expert.spoken_languages),
  );
  const [calEventTypeId, setCalEventTypeId] = useState<number | null>(expert.cal_event_type_id);
  const [priceCrc, setPriceCrc] = useState(expert.price_crc);
  const [expertShare, setExpertShare] = useState(clampExpertShare(expert.expert_share_percent ?? 20));
  const [newSkill, setNewSkill] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/tags')
      .then((r) => r.json())
      .then((data: TagRow[]) => setTags(data))
      .catch(() => {});
  }, []);

  function addNewSkill() {
    const label = newSkill.trim();
    if (!label) return;
    setTags((prev) => mergeSkillTag(prev, label, 'approved'));
    setSelectedSkills((prev) => (prev.includes(label) ? prev : [...prev, label]));
    setNewSkill('');
  }

  async function handleSave() {
    if (selectedSkills.length === 0) {
      setError('Please select at least one skill.');
      return;
    }

    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch(`/api/experts/${expert.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', 'x-wallet-address': walletAddress },
        body: JSON.stringify({
          name: name.trim(),
          bio: bio.trim() || null,
          cal_event_type_id: calEventTypeId,
          price_crc: priceCrc,
          expert_share_percent: expertShare,
          skills: selectedSkills,
          spoken_languages: spokenLanguages,
          call_languages:
            callLanguages.length > 0
              ? filterCallLanguageCodes(callLanguages)
              : defaultCallLanguagesFromSpoken(spokenLanguages),
          active: 1,
        }),
      });
      if (!res.ok) {
        const json = (await res.json()) as { error?: string };
        throw new Error(json.error ?? 'Save failed');
      }
      onSaved();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <CollapsibleSection title="Profile" defaultOpen>
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-1">
            <label className="text-xs font-medium">Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="h-8 rounded-lg border border-border bg-background px-3 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-xs font-medium">Bio</label>
            <textarea
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              rows={3}
              placeholder="Short description…"
              className="rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none resize-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
            />
          </div>
        </div>
      </CollapsibleSection>

      <CollapsibleSection title="Skills & languages" defaultOpen={expandAll}>
        <div className="flex flex-col gap-4">
          <SkillTagPicker
            tags={tags}
            selected={selectedSkills}
            onSelectedChange={setSelectedSkills}
            size="sm"
            newSkill={newSkill}
            onNewSkillChange={setNewSkill}
            onAddNewSkill={addNewSkill}
          />

          <LanguagePicker
            spoken={spokenLanguages}
            call={callLanguages}
            onSpokenChange={setSpokenLanguages}
            onCallChange={setCallLanguages}
            size="sm"
          />
        </div>
      </CollapsibleSection>

      <CollapsibleSection title="Cal.com" defaultOpen={expandAll}>
        <div className="flex flex-col gap-1.5">
          <span className="text-xs font-medium">Cal.com event type</span>
          {calEventTypeId && (
            <p className="text-xs text-muted-foreground">Current ID: {calEventTypeId}</p>
          )}
          <CalConnect onConnect={setCalEventTypeId} />
        </div>
      </CollapsibleSection>

      <CollapsibleSection title="Pricing & split" defaultOpen={expandAll}>
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <span className="text-xs font-medium">Payment split</span>
            <div className="flex flex-wrap gap-2">
              {EXPERT_SHARE_OPTIONS.map((opt) => (
                <button
                  key={opt}
                  type="button"
                  onClick={() => setExpertShare(clampExpertShare(opt))}
                  className={cn(
                    'rounded-full px-3 py-1 text-xs font-medium transition-colors border',
                    expertShare === opt
                      ? 'bg-primary text-primary-foreground border-primary'
                      : 'border-border bg-background hover:bg-muted',
                  )}
                >
                  {opt}% me · {100 - opt}% THP for Good
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-3">
            <label className="text-xs font-medium">CRC per session</label>
            <input
              type="number"
              min={1}
              value={priceCrc}
              onChange={(e) => setPriceCrc(parseInt(e.target.value, 10) || 1)}
              className="h-8 w-24 rounded-lg border border-border bg-background px-3 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
            />
          </div>
        </div>
      </CollapsibleSection>

      {error && <p className="text-xs text-destructive">{error}</p>}

      <div className="flex gap-2">
        <Button
          type="button"
          size="sm"
          onClick={handleSave}
          disabled={submitting || !name.trim() || selectedSkills.length === 0}
        >
          {submitting ? 'Saving…' : 'Save'}
        </Button>
        <Button type="button" size="sm" variant="outline" onClick={onCancel} disabled={submitting}>
          Cancel
        </Button>
      </div>

      {expert.active === 1 ? (
        <StopExpertButton
          expertId={expert.id}
          walletAddress={walletAddress}
          onDeactivated={onDeactivated}
        />
      ) : null}
    </div>
  );
}
