'use client';

import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useWallet } from '@/components/wallet/WalletProvider';
import { Button } from '@/components/ui/button';
import { Field, FieldLabel } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { StatusAlert } from '@/components/ui-patterns/StatusAlert';
import { cn } from '@/lib/utils';
import { useCrcBalance } from '@/hooks/use-crc-balance';
import { useCirclesProfile } from '@/hooks/use-circles-profile';
import type { ExpertRow } from '@/lib/db';
import { CalConnect } from '@/components/experts/CalConnect';
import { clampExpertShare } from '@/lib/crc-pay';
import { ExpertProfileFields } from '@/components/experts/ExpertProfileFields';
import { ExpertShareSlider } from '@/components/experts/ExpertShareSlider';
import { buildExpertLanguagePayload } from '@/lib/expert-profile';
import { StopExpertButton } from '@/components/experts/StopExpertButton';
import { RegisterProfilePreview } from '@/components/experts/RegisterProfilePreview';
import { RegisterStickyPreview } from '@/components/experts/RegisterStickyPreview';
import { PageHeader } from '@/components/layout/PageHeader';
import { CollapsibleSection } from '@/components/motion/collapsible-section';
import { UI_COPY } from '@/lib/ui-copy';
import { useSkillTags } from '@/hooks/use-skill-tags';

function parseSessionPriceInput(raw: string): number | null {
  if (raw.trim() === '') return null;
  const value = Number.parseInt(raw, 10);
  if (!Number.isFinite(value)) return null;
  return value;
}

type ValidationIssue = {
  sectionRef: React.RefObject<HTMLDetailsElement | null>;
  fieldId?: string;
  message: string;
};

function openSectionAndFocus(
  sectionRef: React.RefObject<HTMLDetailsElement | null>,
  fieldId?: string,
) {
  const section = sectionRef.current;
  if (!section) return;

  section.open = true;
  section.scrollIntoView({ behavior: 'smooth', block: 'start' });

  if (fieldId) {
    window.setTimeout(() => {
      document.getElementById(fieldId)?.focus({ preventScroll: true });
    }, 150);
  }
}

export function RegisterForm() {
  const { address, isConnected } = useWallet();
  const router = useRouter();
  const profile = useCirclesProfile(address);
  const balance = useCrcBalance(address);

  const { tags, loading: tagsLoading, setTags } = useSkillTags();
  const [loadingExpert, setLoadingExpert] = useState(false);
  const [existingExpert, setExistingExpert] = useState<ExpertRow | null>(null);
  const [name, setName] = useState('');
  const [nameFromWallet, setNameFromWallet] = useState(false);
  const [bio, setBio] = useState('');
  const [calEventTypeId, setCalEventTypeId] = useState<number | null>(null);
  const [priceInput, setPriceInput] = useState('100');
  const [expertShare, setExpertShare] = useState(clampExpertShare(20));
  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);
  const [spokenLanguages, setSpokenLanguages] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [validationAttempted, setValidationAttempted] = useState(false);

  const profileSectionRef = useRef<HTMLDetailsElement>(null);
  const skillsSectionRef = useRef<HTMLDetailsElement>(null);
  const availabilitySectionRef = useRef<HTMLDetailsElement>(null);
  const pricingSectionRef = useRef<HTMLDetailsElement>(null);

  const sessionPriceCrc = parseSessionPriceInput(priceInput);
  const hasValidSessionPrice = sessionPriceCrc !== null && sessionPriceCrc >= 1;
  const previewPriceCrc = hasValidSessionPrice ? sessionPriceCrc : 0;

  const isEditMode = existingExpert !== null;

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
        setPriceInput(String(expert.price_crc));
        setExpertShare(clampExpertShare(expert.expert_share_percent ?? 20));
        setSelectedSkills(expert.skills);
        setSpokenLanguages(expert.spoken_languages);
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

  function getFirstValidationIssue(): ValidationIssue | null {
    if (profile.status !== 'found') {
      return {
        sectionRef: profileSectionRef,
        message: UI_COPY.register.circlesProfileRequired,
      };
    }
    if (!name.trim()) {
      return {
        sectionRef: profileSectionRef,
        fieldId: 'name',
        message: UI_COPY.register.nameRequired,
      };
    }
    if (selectedSkills.length === 0) {
      return {
        sectionRef: skillsSectionRef,
        message: UI_COPY.register.skillsRequired,
      };
    }
    if (!calEventTypeId) {
      return {
        sectionRef: availabilitySectionRef,
        message: UI_COPY.register.calRequired,
      };
    }
    if (!hasValidSessionPrice) {
      return {
        sectionRef: pricingSectionRef,
        fieldId: 'price',
        message: UI_COPY.register.sessionPriceInvalid,
      };
    }
    return null;
  }

  function revealFirstValidationIssue(): boolean {
    setValidationAttempted(true);
    const issue = getFirstValidationIssue();
    if (!issue) return true;

    setError(issue.message);
    openSectionAndFocus(issue.sectionRef, issue.fieldId);
    return false;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!address) return;
    if (!revealFirstValidationIssue()) return;

    setSubmitting(true);
    try {
      const payload = {
        name: name.trim(),
        bio: bio.trim() || null,
        cal_event_type_id: calEventTypeId,
        price_crc: sessionPriceCrc,
        expert_share_percent: expertShare,
        skills: selectedSkills,
        ...buildExpertLanguagePayload(spokenLanguages),
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
            className="text-sm text-foreground underline-offset-4 hover:underline"
          >
            {UI_COPY.register.viewPublicProfile}
          </Link>
        ) : null}
      </PageHeader>

      <RegisterStickyPreview>
        <RegisterProfilePreview
          name={name}
          bio={bio}
          priceCrc={previewPriceCrc}
          expertShare={expertShare}
          skills={selectedSkills}
          spokenLanguages={spokenLanguages}
          imageUrl={profile.status === 'found' ? profile.imageUrl : null}
          walletAddress={address!}
          balanceLabel={balance.status === 'ready' ? balance.formatted : undefined}
        />
      </RegisterStickyPreview>

      {isEditMode && existingExpert?.active === 0 ? (
        <StatusAlert
          variant="info"
          title="Profile hidden"
          description={UI_COPY.register.inactiveNotice}
        />
      ) : null}

      {profile.status === 'not-registered' ? (
        <StatusAlert
          variant="warning"
          title="Circles profile required"
          description={
            <>
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
            </>
          }
        />
      ) : null}

      {profile.status === 'error' ? (
        <StatusAlert variant="error" title="Profile lookup failed" description={profile.message} />
      ) : null}

      {balance.status === 'not-registered' ? (
        <StatusAlert
          variant="warning"
          title="Wallet not registered"
          description="This address is not a registered Circles avatar. Open the app in the Circles playground to connect with your avatar."
        />
      ) : null}

      <form onSubmit={handleSubmit} className="flex flex-col gap-5">
        <CollapsibleSection ref={profileSectionRef} title="Profile" defaultOpen>
          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <Field>
                <FieldLabel htmlFor="name">
                  Name <span className="text-destructive">*</span>
                </FieldLabel>
                <Input
                  id="name"
                  type="text"
                  readOnly={nameFromWallet}
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Your Circles profile name"
                  className={cn(nameFromWallet && 'cursor-default bg-muted/60')}
                  aria-invalid={validationAttempted && !name.trim()}
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
          </div>
        </CollapsibleSection>

        <CollapsibleSection
          ref={skillsSectionRef}
          title="Skills & languages"
          defaultOpen={isEditMode}
        >
          <ExpertProfileFields
            tags={tags}
            setTags={setTags}
            tagsLoading={tagsLoading}
            selectedSkills={selectedSkills}
            onSelectedSkillsChange={setSelectedSkills}
            spokenLanguages={spokenLanguages}
            onSpokenLanguagesChange={setSpokenLanguages}
            skillsRequired
          />
        </CollapsibleSection>

        <CollapsibleSection
          ref={availabilitySectionRef}
          title="Availability (Cal.com)"
          defaultOpen={isEditMode}
        >
          <div className="flex flex-col gap-1.5">
            <CalConnect onConnect={setCalEventTypeId} />
            {calEventTypeId && (
              <p className="text-xs text-muted-foreground">Event type ID: {calEventTypeId}</p>
            )}
          </div>
        </CollapsibleSection>

        <CollapsibleSection
          ref={pricingSectionRef}
          title="Pricing & payment split"
          defaultOpen={isEditMode}
        >
          <div className="flex flex-col gap-4">
            <Field
              orientation="horizontal"
              className="w-fit items-center gap-3"
              data-invalid={!hasValidSessionPrice || undefined}
            >
              <FieldLabel htmlFor="price" className="shrink-0 font-medium">
                {UI_COPY.register.sessionPriceLabel}
              </FieldLabel>
              <Input
                id="price"
                type="text"
                inputMode="numeric"
                autoComplete="off"
                value={priceInput}
                onChange={(e) => {
                  const next = e.target.value;
                  if (next === '' || /^\d+$/.test(next)) {
                    setPriceInput(next);
                  }
                }}
                className="w-24 tabular-nums"
                aria-invalid={!hasValidSessionPrice}
              />
            </Field>

            <div className="flex flex-col gap-1.5">
              <span className="text-sm font-medium">Payment split</span>
              <p className="text-xs text-muted-foreground">
                Your share — at least 50% always goes to THP for Good.
              </p>
              <ExpertShareSlider
                value={expertShare}
                onChange={setExpertShare}
              />
            </div>
          </div>
        </CollapsibleSection>

        {error && <StatusAlert variant="error" title="Registration failed" description={error} />}

        <Button type="submit" disabled={submitting} className="w-fit">
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
