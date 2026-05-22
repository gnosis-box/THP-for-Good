'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useWallet } from '@/components/wallet/WalletProvider';
import { Button } from '@/components/ui/button';
import { cn, shortenAddress } from '@/lib/utils';
import { useCrcBalance } from '@/hooks/use-crc-balance';
import { useCirclesProfile } from '@/hooks/use-circles-profile';
import type { TagRow } from '@/lib/db';
import { CalConnect } from '@/components/mentors/CalConnect';

export function RegisterForm() {
  const { address, isConnected } = useWallet();
  const router = useRouter();
  const profile = useCirclesProfile(address);
  const balance = useCrcBalance(address);

  const [tags, setTags] = useState<TagRow[]>([]);
  const [tagsLoading, setTagsLoading] = useState(true);
  const [checkingMentor, setCheckingMentor] = useState(false);
  const [newSkill, setNewSkill] = useState('');
  const [name, setName] = useState('');
  const [nameFromWallet, setNameFromWallet] = useState(false);
  const [bio, setBio] = useState('');
  const [calEventTypeId, setCalEventTypeId] = useState<number | null>(null);
  const [priceCrc, setPriceCrc] = useState(100);
  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/tags')
      .then((res) => res.json())
      .then((data: TagRow[]) => setTags(data))
      .catch(() => {})
      .finally(() => setTagsLoading(false));
  }, []);

  useEffect(() => {
    if (!address) {
      setName('');
      setNameFromWallet(false);
      setBio('');
      return;
    }

    let cancelled = false;
    setCheckingMentor(true);

    fetch(`/api/mentors?circles_address=${encodeURIComponent(address)}`)
      .then(async (res) => {
        if (res.ok) {
          const mentor = (await res.json()) as { id: number };
          router.replace(`/mentor/${mentor.id}`);
          return;
        }
        if (!cancelled) setCheckingMentor(false);
      })
      .catch(() => {
        if (!cancelled) setCheckingMentor(false);
      });

    return () => {
      cancelled = true;
    };
  }, [address, router]);

  useEffect(() => {
    if (profile.status !== 'found') return;
    setName(profile.name);
    setNameFromWallet(true);
    setBio((prev) => prev.trim() || profile.bio || '');
  }, [profile]);

  function toggleSkill(label: string) {
    setSelectedSkills((prev) =>
      prev.includes(label) ? prev.filter((s) => s !== label) : [...prev, label],
    );
  }

  async function addNewSkill() {
    const label = newSkill.trim();
    if (!label) return;
    const exists = tags.some((t) => t.label.toLowerCase() === label.toLowerCase());
    if (!exists) {
      try {
        const res = await fetch('/api/tags/proposals', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-wallet-address': address ?? '',
          },
          body: JSON.stringify({ label }),
        });
        if (res.ok) {
          setError('Skill submitted for admin approval. You can select it once approved.');
        }
      } catch {
        setError('Could not submit skill proposal.');
      }
    }
    if (exists) {
      setSelectedSkills((prev) => (prev.includes(label) ? prev : [...prev, label]));
    }
    setNewSkill('');
  }

  function handleNewSkillKey(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter') {
      e.preventDefault();
      void addNewSkill();
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!address) return;
    if (!name.trim()) {
      setError('Connect a Circles wallet with a registered profile name.');
      return;
    }
    if (selectedSkills.length === 0) {
      setError('Please select at least one skill.');
      return;
    }
    if (!calEventTypeId) {
      setError('Select a Cal.com event type for your availability.');
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
          cal_event_type_id: calEventTypeId ?? undefined,
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
        Connect your wallet in Circles to register as a mentor.
      </p>
    );
  }

  if (checkingMentor || profile.status === 'loading') {
    return <p className="text-sm text-muted-foreground">Loading your Circles profile…</p>;
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5">
      <div className="rounded-lg border border-border bg-muted/40 px-4 py-3 text-sm">
        <p className="font-medium">Connected wallet</p>
        <p className="mt-1 font-mono text-xs text-muted-foreground">{shortenAddress(address!, 8)}</p>
        {profile.status === 'found' && (
          <p className="mt-1 text-muted-foreground">
            Circles profile: <strong className="text-foreground">{profile.name}</strong>
          </p>
        )}
        {balance.status === 'ready' && (
          <p className="mt-1 text-muted-foreground">
            CRC balance: <strong className="text-foreground">{balance.formatted}</strong>
          </p>
        )}
        {balance.status === 'not-registered' && (
          <p className="mt-1 text-amber-700">
            This address is not a registered Circles avatar. Open the app in the Circles playground to
            connect with your avatar.
          </p>
        )}
        {profile.status === 'not-registered' && (
          <p className="mt-1 text-amber-700">
            No Circles profile name found for this wallet. Sign up at{' '}
            <a
              href="https://www.aboutcircles.com"
              target="_blank"
              rel="noopener noreferrer"
              className="underline"
            >
              aboutcircles.com
            </a>{' '}
            first.
          </p>
        )}
        {profile.status === 'error' && (
          <p className="mt-1 text-destructive">{profile.message}</p>
        )}
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="name" className="text-sm font-medium">
          Name <span className="text-destructive">*</span>
        </label>
        <input
          id="name"
          type="text"
          required
          readOnly={nameFromWallet}
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Your Circles profile name"
          className={cn(
            'h-9 rounded-lg border border-border bg-background px-3 text-sm outline-none ring-0 transition-colors focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50',
            nameFromWallet && 'cursor-default bg-muted/60',
          )}
        />
        {nameFromWallet && (
          <p className="text-xs text-muted-foreground">Taken from your connected Circles wallet.</p>
        )}
      </div>

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
          className="rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none ring-0 transition-colors focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 resize-none"
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <span className="text-sm font-medium">
          Skills <span className="text-destructive">*</span>
        </span>
        {tagsLoading ? (
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
                      : 'border border-border bg-background text-foreground hover:bg-muted',
                  )}
                >
                  {tag.label}
                </button>
              );
            })}
          </div>
        )}
        <div className="flex gap-2">
          <input
            type="text"
            value={newSkill}
            onChange={(e) => setNewSkill(e.target.value)}
            onKeyDown={handleNewSkillKey}
            placeholder="Propose a new skill…"
            className="h-8 flex-1 rounded-lg border border-border bg-background px-3 text-sm outline-none ring-0 transition-colors focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
          />
          <button
            type="button"
            onClick={() => void addNewSkill()}
            disabled={!newSkill.trim()}
            className="h-8 rounded-lg border border-border bg-background px-3 text-sm font-medium transition-colors hover:bg-muted disabled:opacity-40"
          >
            Propose
          </button>
        </div>
      </div>

      <div className="flex flex-col gap-1.5">
        <span className="text-sm font-medium">
          Availability (Cal.com) <span className="text-destructive">*</span>
        </span>
        <CalConnect onConnect={setCalEventTypeId} />
        {calEventTypeId && (
          <p className="text-xs text-muted-foreground">Event type ID: {calEventTypeId}</p>
        )}
      </div>

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
          className="h-9 w-32 rounded-lg border border-border bg-background px-3 text-sm outline-none ring-0 transition-colors focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
        />
      </div>

      {error && <p className="text-sm text-destructive">{error}</p>}

      <Button
        type="submit"
        disabled={
          submitting || profile.status !== 'found' || !name.trim() || !calEventTypeId
        }
        className="w-fit"
      >
        {submitting ? 'Registering…' : 'Register as Mentor'}
      </Button>
    </form>
  );
}
