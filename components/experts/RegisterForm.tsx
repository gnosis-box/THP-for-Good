'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useWallet } from '@/components/wallet/WalletProvider';
import { Button } from '@/components/ui/button';
import { Field, FieldLabel } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { StatusAlert } from '@/components/ui-patterns/StatusAlert';
import { cn, shortenAddress } from '@/lib/utils';
import { useCrcBalance } from '@/hooks/use-crc-balance';
import { useCirclesProfile } from '@/hooks/use-circles-profile';
import type { ExpertRow, TagRow } from '@/lib/db';
import { CalConnect } from '@/components/experts/CalConnect';
import { EXPERT_SHARE_OPTIONS, clampExpertShare } from '@/lib/crc-pay';
import { SkillTagPicker, mergeSkillTag } from '@/components/experts/SkillTagPicker';
import { defaultCallLanguagesFromSpoken, filterCallLanguageCodes } from '@/lib/languages';
import { LanguagePicker } from '@/components/experts/LanguagePicker';
import { StopExpertButton } from '@/components/experts/StopExpertButton';
import { PageHeader } from '@/components/layout/PageHeader';
import { UI_COPY } from '@/lib/ui-copy';

export function RegisterForm() {
  const { address, isConnected } = useWallet();
  const router = useRouter();
  const profile = useCirclesProfile(address);
  const balance = useCrcBalance(address);

  const [tags, setTags] = useState<TagRow[]>([]);
  const [tagsLoading, setTagsLoading] = useState(true);
  const [loadingExpert, setLoadingExpert] = useState(false);
  const [existingExpert, setExistingExpert] = useState<ExpertRow | null>(null);
  const [newSkill, setNewSkill] = useState('');
  const [name, setName] = useState('');
  const [nameFromWallet, setNameFromWallet] = useState(false);
  const [bio, setBio] = useState('');
  const [calEventTypeId, setCalEventTypeId] = useState<number | null>(null);
  const [priceCrc, setPriceCrc] = useState(100);
  const [expertShare, setExpertShare] = useState(clampExpertShare(20));
  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);
  const [spokenLanguages, setSpokenLanguages] = useState<string[]>([]);
  const [callLanguages, setCallLanguages] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isEditMode = existingExpert !== null;

  useEffect(() => {
    fetch('/api/tags')
      .then((res) => res.json())
      .then((data: TagRow[]) => setTags(data))
      .catch(() => {})
      .finally(() => setTagsLoading(false));
  }, []);

  useEffect(() => {
    if (!address) {
      setExistingExpert(null);
      setName('');
      setNameFromWallet(false);
      setBio('');
      return;
    }

    let cancelled = false;
    setLoadingExpert(true);

    fetch(`/api/experts?circles_address=${encodeURIComponent(address)}`)
      .then(async (res) => {
        if (!res.ok) {
          if (!cancelled) setExistingExpert(null);
          return;
        }
        const expert = (await res.json()) as ExpertRow;
        if (cancelled) return;
        setExistingExpert(expert);
        setName(expert.name);
        setNameFromWallet(false);
        setBio(expert.bio ?? '');
        setCalEventTypeId(expert.cal_event_type_id);
        setPriceCrc(expert.price_crc);
        setExpertShare(clampExpertShare(expert.expert_share_percent ?? 20));
        setSelectedSkills(expert.skills);
        setSpokenLanguages(expert.spoken_languages);
        setCallLanguages(
          expert.call_languages.length > 0
            ? filterCallLanguageCodes(expert.call_languages)
            : defaultCallLanguagesFromSpoken(expert.spoken_languages),
        );
      })
      .catch(() => {
        if (!cancelled) setExistingExpert(null);
      })
      .finally(() => {
        if (!cancelled) setLoadingExpert(false);
      });

    return () => {
      cancelled = true;
    };
  }, [address]);

  useEffect(() => {
    if (isEditMode || profile.status !== 'found') return;
    setName(profile.name);
    setNameFromWallet(true);
    setBio((prev) => prev.trim() || profile.bio || '');
  }, [profile, isEditMode]);

  function addNewSkill() {
    const label = newSkill.trim();
    if (!label) return;
    setTags((prev) => mergeSkillTag(prev, label, 'approved'));
    setSelectedSkills((prev) => (prev.includes(label) ? prev : [...prev, label]));
    setNewSkill('');
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
      const payload = {
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
      };

      if (isEditMode && existingExpert) {
        const res = await fetch(`/api/experts/${existingExpert.id}`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            'x-wallet-address': address,
          },
          body: JSON.stringify({
            ...payload,
            active: 1,
          }),
        });
        if (!res.ok) {
          const json = (await res.json()) as { error?: string };
          throw new Error(json.error ?? 'Save failed');
        }
        const updated = (await res.json()) as ExpertRow;
        setExistingExpert(updated);
        router.push(`/expert/${updated.id}`);
        return;
      }

      const res = await fetch('/api/experts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          circles_address: address,
          ...payload,
          bio: bio.trim() || undefined,
        }),
      });

      if (!res.ok) {
        const json = (await res.json()) as { error?: string };
        throw new Error(json.error ?? 'Registration failed');
      }

      const { id } = (await res.json()) as { id: number };
      router.push(`/expert/${id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong.');
    } finally {
      setSubmitting(false);
    }
  }

  if (!isConnected) {
    return (
      <p className="text-sm text-muted-foreground">
        Connect your wallet in Circles to register as an expert.
      </p>
    );
  }

  if (loadingExpert || profile.status === 'loading') {
    return <p className="text-sm text-muted-foreground">Loading your Circles profile…</p>;
  }

  return (
    <div className="flex flex-col gap-5">
      <PageHeader
        title={isEditMode ? UI_COPY.register.editTitle : UI_COPY.register.title}
        subtitle={
          isEditMode
            ? UI_COPY.register.editSubtitle
            : 'Share your expertise with the THP community. Each booking generates CRC revenue for the THP for Good fund.'
        }
      >
        {isEditMode && existingExpert ? (
          <Link
            href={`/expert/${existingExpert.id}`}
            className="text-sm text-primary underline-offset-4 hover:underline"
          >
            {UI_COPY.register.viewPublicProfile}
          </Link>
        ) : null}
      </PageHeader>

      {isEditMode && existingExpert?.active === 0 ? (
        <StatusAlert
          variant="info"
          title="Profile hidden"
          description={UI_COPY.register.inactiveNotice}
        />
      ) : null}

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

        <SkillTagPicker
          tags={tags}
          selected={selectedSkills}
          onSelectedChange={setSelectedSkills}
          loading={tagsLoading}
          required
          newSkill={newSkill}
          onNewSkillChange={setNewSkill}
          onAddNewSkill={addNewSkill}
        />

        <LanguagePicker
          spoken={spokenLanguages}
          call={callLanguages}
          onSpokenChange={setSpokenLanguages}
          onCallChange={setCallLanguages}
        />

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
            value={String(expertShare)}
            onValueChange={(v) => setExpertShare(clampExpertShare(parseInt(v, 10)))}
            className="flex flex-col gap-2"
          >
            {EXPERT_SHARE_OPTIONS.map((opt) => (
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
            submitting ||
            profile.status !== 'found' ||
            !name.trim() ||
            !calEventTypeId ||
            selectedSkills.length === 0
          }
          className="w-fit"
        >
          {submitting
            ? isEditMode
              ? UI_COPY.register.saving
              : UI_COPY.register.registering
            : isEditMode
              ? existingExpert?.active === 0
                ? UI_COPY.register.publishProfile
                : UI_COPY.register.saveChanges
              : UI_COPY.register.registerCta}
        </Button>
      </form>

      {isEditMode && existingExpert?.active === 1 && address ? (
        <StopExpertButton expertId={existingExpert.id} walletAddress={address} />
      ) : null}
    </div>
  );
}
