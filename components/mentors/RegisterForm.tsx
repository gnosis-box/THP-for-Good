'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useWallet } from '@/components/wallet/WalletProvider';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import type { TagRow } from '@/lib/db';

export function RegisterForm() {
  const { address, isConnected } = useWallet();
  const router = useRouter();

  const [tags, setTags] = useState<TagRow[]>([]);
  const [name, setName] = useState('');
  const [bio, setBio] = useState('');
  const [calendarLink, setCalendarLink] = useState('');
  const [priceCrc, setPriceCrc] = useState(100);
  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/tags')
      .then((res) => res.json())
      .then((data: TagRow[]) => setTags(data))
      .catch(() => {
        // Non-blocking — skills selector will be empty
      });
  }, []);

  function toggleSkill(label: string) {
    setSelectedSkills((prev) =>
      prev.includes(label) ? prev.filter((s) => s !== label) : [...prev, label]
    );
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!address) return;
    if (selectedSkills.length === 0) {
      setError('Please select at least one skill.');
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch('/api/mentors', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          circles_address: address,
          name: name.trim(),
          bio: bio.trim() || undefined,
          calendar_link: calendarLink.trim(),
          price_crc: priceCrc,
          skills: selectedSkills,
        }),
      });

      if (!res.ok) {
        const json = (await res.json()) as { error?: string };
        throw new Error(json.error ?? 'Registration failed');
      }

      const { id } = (await res.json()) as { id: number };
      router.push(`/mentor/${id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong.');
    } finally {
      setSubmitting(false);
    }
  }

  if (!isConnected) {
    return (
      <p className="text-sm text-muted-foreground">
        Connect your wallet to register as a mentor.
      </p>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5">
      {/* Name */}
      <div className="flex flex-col gap-1.5">
        <label htmlFor="name" className="text-sm font-medium">
          Name <span className="text-destructive">*</span>
        </label>
        <input
          id="name"
          type="text"
          required
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Your name"
          className="h-9 rounded-lg border border-border bg-background px-3 text-sm outline-none ring-0 transition-colors focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:opacity-50"
        />
      </div>

      {/* Bio */}
      <div className="flex flex-col gap-1.5">
        <label htmlFor="bio" className="text-sm font-medium">
          Bio
        </label>
        <textarea
          id="bio"
          value={bio}
          onChange={(e) => setBio(e.target.value)}
          placeholder="Tell mentees about yourself..."
          rows={4}
          className="rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none ring-0 transition-colors focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:opacity-50 resize-none"
        />
      </div>

      {/* Skills */}
      <div className="flex flex-col gap-1.5">
        <span className="text-sm font-medium">
          Skills <span className="text-destructive">*</span>
        </span>
        {tags.length === 0 ? (
          <p className="text-xs text-muted-foreground">Loading skills…</p>
        ) : (
          <div className="flex flex-wrap gap-2">
            {tags.map((tag) => {
              const active = selectedSkills.includes(tag.label);
              return (
                <button
                  key={tag.id}
                  type="button"
                  onClick={() => toggleSkill(tag.label)}
                  className={cn(
                    'shrink-0 rounded-full px-3 py-1 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
                    active
                      ? 'bg-primary text-primary-foreground'
                      : 'border border-border bg-background text-foreground hover:bg-muted'
                  )}
                >
                  {tag.label}
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Calendar link */}
      <div className="flex flex-col gap-1.5">
        <label htmlFor="calendar" className="text-sm font-medium">
          Google Calendar link <span className="text-destructive">*</span>
        </label>
        <input
          id="calendar"
          type="url"
          required
          value={calendarLink}
          onChange={(e) => setCalendarLink(e.target.value)}
          placeholder="https://calendar.google.com/…"
          className="h-9 rounded-lg border border-border bg-background px-3 text-sm outline-none ring-0 transition-colors focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:opacity-50"
        />
      </div>

      {/* Price */}
      <div className="flex flex-col gap-1.5">
        <label htmlFor="price" className="text-sm font-medium">
          CRC price per session
        </label>
        <input
          id="price"
          type="number"
          min={1}
          value={priceCrc}
          onChange={(e) => setPriceCrc(parseInt(e.target.value, 10) || 1)}
          className="h-9 w-32 rounded-lg border border-border bg-background px-3 text-sm outline-none ring-0 transition-colors focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:opacity-50"
        />
      </div>

      {/* Error */}
      {error && <p className="text-sm text-destructive">{error}</p>}

      <Button type="submit" disabled={submitting} className="w-fit">
        {submitting ? 'Registering…' : 'Register as Mentor'}
      </Button>
    </form>
  );
}
