'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useWallet } from '@/components/wallet/WalletProvider';
import { Button } from '@/components/ui/button';
import { Field, FieldLabel } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { StatusAlert } from '@/components/ui-patterns/StatusAlert';
import { cn, shortenAddress } from '@/lib/utils';
import { useCrcBalance } from '@/hooks/use-crc-balance';
import { useCirclesProfile } from '@/hooks/use-circles-profile';
import type { TagRow } from '@/lib/db';
import { CalConnect } from '@/components/mentors/CalConnect';
import { MENTOR_SHARE_OPTIONS, clampMentorShare } from '@/lib/crc-pay';

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
  const [mentorShare, setMentorShare] = useState(clampMentorShare(20));
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

  function addNewSkill() {
    const label = newSkill.trim();
    if (!label) return;
    if (!tags.some((t) => t.label.toLowerCase() === label.toLowerCase())) {
      setTags((prev) => [...prev, { id: -(prev.length + 1), label, status: 'approved' as const }]);
    }
    setSelectedSkills((prev) => (prev.includes(label) ? prev : [...prev, label]));
    setNewSkill('');
  }

  function handleNewSkillKey(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter') {
      e.preventDefault();
      addNewSkill();
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
          mentor_share_percent: mentorShare,
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
          <p className="mt-1 text-sm text-warning">
            This address is not a registered Circles avatar. Open the app in the Circles playground to
            connect with your avatar.
          </p>
        )}
        {profile.status === 'not-registered' && (
          <p className="mt-1 text-sm text-warning">
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
        <Field>
          <FieldLabel htmlFor="name">
            Name <span className="text-destructive">*</span>
          </FieldLabel>
          <Input
            id="name"
            type="text"
            required
            readOnly={nameFromWallet}
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Your Circles profile name"
            className={cn(nameFromWallet && 'cursor-default bg-muted/60')}
          />
        </Field>
        {nameFromWallet && (
          <p className="text-xs text-muted-foreground">Taken from your connected Circles wallet.</p>
        )}
      </div>

      <Field>
        <FieldLabel htmlFor="bio">Bio</FieldLabel>
        <Textarea
          id="bio"
          value={bio}
          onChange={(e) => setBio(e.target.value)}
          placeholder="Tell mentees about yourself..."
          rows={4}
        />
      </Field>

      <div className="flex flex-col gap-1.5">
        <span className="text-sm font-medium">
          Skills <span className="text-destructive">*</span>
        </span>
        {tagsLoading ? (
          <p className="text-xs text-muted-foreground">Loading skills…</p>
        ) : (
          <ToggleGroup
            value={selectedSkills}
            onValueChange={setSelectedSkills}
            className="flex flex-wrap gap-2"
          >
            {tags.map((tag) => (
              <ToggleGroupItem
                key={tag.id}
                value={tag.label}
                className="min-h-11 shrink-0 rounded-full px-4 data-pressed:bg-primary data-pressed:text-primary-foreground"
              >
                {tag.label}
              </ToggleGroupItem>
            ))}
          </ToggleGroup>
        )}
        <div className="flex gap-2">
          <Input
            type="text"
            value={newSkill}
            onChange={(e) => setNewSkill(e.target.value)}
            onKeyDown={handleNewSkillKey}
            placeholder="Add a skill…"
            className="h-11 flex-1"
          />
          <button
            type="button"
            onClick={addNewSkill}
            disabled={!newSkill.trim()}
            className="h-8 rounded-lg border border-border bg-background px-3 text-sm font-medium transition-colors hover:bg-muted disabled:opacity-40"
          >
            Add
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

      <Field>
        <FieldLabel htmlFor="price">CRC price per session</FieldLabel>
        <Input
          id="price"
          type="number"
          min={1}
          value={priceCrc}
          onChange={(e) => setPriceCrc(parseInt(e.target.value, 10) || 1)}
          className="w-32"
        />
      </Field>

      <div className="flex flex-col gap-1.5">
        <span className="text-sm font-medium">Payment split</span>
        <p className="text-xs text-muted-foreground">Your share — at least 50% always goes to THP for Good.</p>
        <RadioGroup
          value={String(mentorShare)}
          onValueChange={(v) => setMentorShare(clampMentorShare(parseInt(v, 10)))}
          className="flex flex-col gap-2"
        >
          {MENTOR_SHARE_OPTIONS.map((opt) => (
            <div key={opt} className="flex min-h-11 items-center gap-2">
              <RadioGroupItem value={String(opt)} id={`share-${opt}`} />
              <Label htmlFor={`share-${opt}`} className="cursor-pointer font-normal">
                {opt}% me · {100 - opt}% THP for Good
              </Label>
            </div>
          ))}
        </RadioGroup>
      </div>

      {error && <StatusAlert variant="error" title="Registration failed" description={error} />}

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
