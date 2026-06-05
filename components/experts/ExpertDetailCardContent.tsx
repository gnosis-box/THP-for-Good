'use client';

import type { ReactNode } from 'react';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { CrcAmount } from '@/components/ui-patterns/CrcAmount';
import { ExpertShareButton } from '@/components/experts/ExpertShareButton';
import { ExpertSkillTags, ExpertLanguageTags, ExpertSplitShare } from '@/components/ui-patterns/ExpertMeta';
import { ExpertTrustControl } from '@/components/ui-patterns/ExpertTrustControl';
import { TrustedByCount } from '@/components/ui-patterns/TrustedByCount';
import { UI_COPY } from '@/lib/ui-copy';
import { formatSessionLanguages, getDisplayCallLanguages, languageLabel } from '@/lib/languages';
import { motionClass } from '@/lib/motion';
import { cn } from '@/lib/utils';
import type { ExpertTrustStatsState } from '@/hooks/use-expert-trust-stats';
import type { ExpertRow } from '@/lib/db';

type Props = {
  expert: ExpertRow;
  trustStats: ExpertTrustStatsState;
  reducedMotion: boolean;
};

function expertHasAvailability(expert: ExpertRow): boolean {
  return Boolean(
    expert.cal_event_type_id ||
      expert.google_calendar_id?.trim() ||
      expert.calendar_link?.trim(),
  );
}

function ExpertDetailSection({
  title,
  children,
  className,
}: {
  title: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        'border-t border-border px-3 py-2.5 text-center sm:px-4 sm:py-3',
        className,
      )}
    >
      <h2 className="text-sm font-semibold">{title}</h2>
      <div className="mx-auto mt-1.5 max-w-prose text-sm leading-relaxed text-muted-foreground">
        {children}
      </div>
    </div>
  );
}

/** Expert detail page card — sections Skills / About; not used on home list. */
export function ExpertDetailCardContent({ expert, trustStats, reducedMotion }: Props) {
  const share = expert.expert_share_percent ?? 20;
  const treasuryPercent = 100 - share;
  const sessionLanguages = getDisplayCallLanguages(expert);
  const hasLanguages = sessionLanguages.length > 0;
  const languageListText = formatSessionLanguages(sessionLanguages, 'full');
  const imageUrl = trustStats.status === 'ready' ? trustStats.imageUrl : undefined;
  const showTrustedBy = trustStats.status !== 'error';
  const hasAvailability = expertHasAvailability(expert);
  const copy = UI_COPY.expertDetail;

  return (
    <>
      <div className="flex flex-1 items-start gap-3 px-3 py-3 sm:px-4 sm:py-4">
        <Avatar className="size-11 shrink-0 sm:size-12">
          {imageUrl ? (
            <AvatarImage
              src={imageUrl}
              alt={expert.name}
              className={motionClass('', 'motion-trust-fade-in', reducedMotion)}
            />
          ) : null}
          <AvatarFallback className="text-sm font-semibold">
            {expert.name.charAt(0).toUpperCase()}
          </AvatarFallback>
        </Avatar>
        <div className="min-w-0 flex-1 space-y-1">
          <div className="flex min-w-0 items-center justify-between gap-2">
            <div className="flex min-w-0 flex-1 items-center gap-1.5 overflow-hidden sm:gap-2">
              <h1 className="text-display min-w-0 shrink truncate text-sm font-semibold leading-tight sm:text-base">
                {expert.name}
              </h1>
              <ExpertTrustControl
                expertAddress={expert.circles_address}
                expertName={expert.name}
                compact
                className="shrink-0"
              />
            </div>
            <div className="flex shrink-0 items-center gap-0.5">
              <ExpertShareButton
                expertId={expert.id}
                publicSlug={expert.public_slug}
                expertName={expert.name}
                className="size-9 shrink-0"
              />
              <CrcAmount amount={expert.price_crc} variant="highlight" className="text-xs sm:text-sm" />
            </div>
          </div>
          {(hasLanguages || showTrustedBy) && (
            <div
              className={cn(
                'flex min-w-0 items-center gap-2',
                hasLanguages ? 'justify-between' : 'justify-end',
              )}
            >
              {hasLanguages ? (
                <ExpertLanguageTags
                  languages={sessionLanguages}
                  variant="card"
                  className="min-w-0 flex-1"
                />
              ) : null}
              {showTrustedBy ? <TrustedByCount trustStats={trustStats} /> : null}
            </div>
          )}
        </div>
      </div>

      <ExpertDetailSection title={copy.sessionPricing}>
        <p>
          Book a <strong>1:1 session</strong> with <strong>{expert.name}</strong>, a{' '}
          <strong>THP for Good expert</strong> on <strong>Circles</strong>. Each session costs{' '}
          <strong>{expert.price_crc} CRC</strong>. <strong>{treasuryPercent}%</strong> funds future
          THP learners and <strong>{share}%</strong> goes to the expert.
        </p>
      </ExpertDetailSection>

      {expert.skills.length > 0 ? (
        <ExpertDetailSection title={UI_COPY.booking.skills}>
          <ExpertSkillTags skills={expert.skills} asList className="mt-0 justify-center" />
        </ExpertDetailSection>
      ) : null}

      {hasLanguages ? (
        <ExpertDetailSection title={copy.languages}>
          <p>
            Sessions are available in <strong>{languageListText}</strong>.
          </p>
          <ul className="mt-2 list-inside list-disc text-left sm:text-center">
            {sessionLanguages.map((code) => (
              <li key={code}>{languageLabel(code)}</li>
            ))}
          </ul>
        </ExpertDetailSection>
      ) : null}

      {expert.bio ? (
        <ExpertDetailSection title={UI_COPY.booking.about}>
          <p className="whitespace-pre-line">{expert.bio}</p>
        </ExpertDetailSection>
      ) : null}

      <ExpertDetailSection title={copy.availability}>
        <p>
          {hasAvailability ? copy.availabilityReady : UI_COPY.booking.noCalVisitor}
        </p>
        <p className="mt-2">
          <strong>{copy.faqPayment}</strong> {copy.faqPaymentAnswer}
        </p>
      </ExpertDetailSection>

      <ExpertSplitShare expertPercent={share} variant="footer" />
    </>
  );
}
