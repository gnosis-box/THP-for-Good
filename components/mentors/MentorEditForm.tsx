'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { CalConnect } from '@/components/mentors/CalConnect';
import { MENTOR_SHARE_OPTIONS, clampMentorShare } from '@/lib/crc-pay';
import { SkillTagPicker, mergeSkillTag } from '@/components/mentors/SkillTagPicker';
import { LanguagePicker } from '@/components/mentors/LanguagePicker';
import { StopExpertButton } from '@/components/mentors/StopExpertButton';
import type { MentorRow, TagRow } from '@/lib/db';

type Props = {
  mentor: MentorRow;
  walletAddress: string;
  onSaved: () => void;
  onCancel: () => void;
  onDeactivated?: () => void;
};

export function MentorEditForm({ mentor, walletAddress, onSaved, onCancel, onDeactivated }: Props) {
  const [tags, setTags] = useState<TagRow[]>([]);
  const [name, setName] = useState(mentor.name);
  const [bio, setBio] = useState(mentor.bio ?? '');
  const [selectedSkills, setSelectedSkills] = useState<string[]>(mentor.skills);
  const [spokenLanguages, setSpokenLanguages] = useState<string[]>(mentor.spoken_languages);
  const [callLanguages, setCallLanguages] = useState<string[]>(
    mentor.call_languages.length > 0 ? mentor.call_languages : mentor.spoken_languages,
  );
  const [calEventTypeId, setCalEventTypeId] = useState<number | null>(mentor.cal_event_type_id);
  const [priceCrc, setPriceCrc] = useState(mentor.price_crc);
  const [mentorShare, setMentorShare] = useState(clampMentorShare(mentor.mentor_share_percent ?? 20));
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
      const res = await fetch(`/api/mentors/${mentor.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', 'x-wallet-address': walletAddress },
        body: JSON.stringify({
          name: name.trim(),
          bio: bio.trim() || null,
          cal_event_type_id: calEventTypeId,
          price_crc: priceCrc,
          mentor_share_percent: mentorShare,
          skills: selectedSkills,
          spoken_languages: spokenLanguages,
          call_languages: callLanguages.length > 0 ? callLanguages : spokenLanguages,
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
    <div className="flex flex-col gap-4 rounded-xl border border-border p-4">
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

      <div className="flex flex-col gap-1.5">
        <span className="text-xs font-medium">Cal.com event type</span>
        {calEventTypeId && (
          <p className="text-xs text-muted-foreground">Current ID: {calEventTypeId}</p>
        )}
        <CalConnect onConnect={setCalEventTypeId} />
      </div>

      <div className="flex flex-col gap-1.5">
        <span className="text-xs font-medium">Payment split</span>
        <div className="flex flex-wrap gap-2">
          {MENTOR_SHARE_OPTIONS.map((opt) => (
            <button
              key={opt}
              type="button"
              onClick={() => setMentorShare(clampMentorShare(opt))}
              className={cn(
                'rounded-full px-3 py-1 text-xs font-medium transition-colors border',
                mentorShare === opt
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

      {mentor.active === 1 ? (
        <StopExpertButton
          mentorId={mentor.id}
          walletAddress={walletAddress}
          onDeactivated={onDeactivated}
        />
      ) : null}
    </div>
  );
}
