'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { CalConnect } from '@/components/mentors/CalConnect';
import { MENTOR_SHARE_OPTIONS, clampMentorShare } from '@/lib/crc-pay';
import type { MentorRow, TagRow } from '@/lib/db';

type Props = {
  mentor: MentorRow;
  walletAddress: string;
  onSaved: () => void;
  onCancel: () => void;
};

export function MentorEditForm({ mentor, walletAddress, onSaved, onCancel }: Props) {
  const [tags, setTags] = useState<TagRow[]>([]);
  const [name, setName] = useState(mentor.name);
  const [bio, setBio] = useState(mentor.bio ?? '');
  const [selectedSkills, setSelectedSkills] = useState<string[]>(mentor.skills);
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

  function toggleSkill(label: string) {
    setSelectedSkills((prev) =>
      prev.includes(label) ? prev.filter((s) => s !== label) : [...prev, label],
    );
  }

  function addNewSkill() {
    const label = newSkill.trim();
    if (!label) return;
    if (!tags.some((t) => t.label.toLowerCase() === label.toLowerCase())) {
      setTags((prev) => [...prev, { id: -(prev.length + 1), label, status: 'approved' as const }]);
    }
    setSelectedSkills((prev) => (prev.includes(label) ? prev : [...prev, label]));
    setNewSkill('');
  }

  async function handleSave() {
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
      {/* Name */}
      <div className="flex flex-col gap-1">
        <label className="text-xs font-medium">Name</label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="h-8 rounded-lg border border-border bg-background px-3 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
        />
      </div>

      {/* Bio */}
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

      {/* Skills */}
      <div className="flex flex-col gap-1.5">
        <span className="text-xs font-medium">Skills</span>
        <div className="flex flex-wrap gap-1.5">
          {tags.map((tag) => {
            const active = selectedSkills.includes(tag.label);
            return (
              <button
                key={tag.id}
                type="button"
                onClick={() => toggleSkill(tag.label)}
                className={cn(
                  'rounded-full px-2.5 py-0.5 text-xs font-medium transition-colors',
                  active ? 'bg-primary text-primary-foreground' : 'border border-border bg-background hover:bg-muted',
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

      {/* Cal.com */}
      <div className="flex flex-col gap-1.5">
        <span className="text-xs font-medium">Cal.com event type</span>
        {calEventTypeId && (
          <p className="text-xs text-muted-foreground">Current ID: {calEventTypeId}</p>
        )}
        <CalConnect onConnect={setCalEventTypeId} />
      </div>

      {/* Payment split */}
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

      {/* Price */}
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
        <Button type="button" size="sm" onClick={handleSave} disabled={submitting || !name.trim()}>
          {submitting ? 'Saving…' : 'Save'}
        </Button>
        <Button type="button" size="sm" variant="outline" onClick={onCancel} disabled={submitting}>
          Cancel
        </Button>
      </div>
    </div>
  );
}
