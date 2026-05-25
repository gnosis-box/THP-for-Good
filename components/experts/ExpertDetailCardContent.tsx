'use client';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { CrcAmount } from '@/components/ui-patterns/CrcAmount';
import { ExpertSkillTags, ExpertLanguageTags, ExpertSplitShare } from '@/components/ui-patterns/ExpertMeta';
import { ExpertTrustControl } from '@/components/ui-patterns/ExpertTrustControl';
import { UI_COPY } from '@/lib/ui-copy';
import { getDisplayCallLanguages } from '@/lib/languages';
import { motionClass } from '@/lib/motion';
import { cn } from '@/lib/utils';
import type { ExpertRow } from '@/lib/db';

export type ExpertCirclesData = { imageUrl?: string; trustedByCount: number | null };

type Props = {
  expert: ExpertRow;
  circles: ExpertCirclesData | null;
  reducedMotion: boolean;
};

/** Expert detail page card — sections Skills / About; not used on home list. */
export function ExpertDetailCardContent({ expert, circles, reducedMotion }: Props) {
  const share = expert.expert_share_percent ?? 20;
  const sessionLanguages = getDisplayCallLanguages(expert);
  const hasLanguages = sessionLanguages.length > 0;
  const showTrustedBy = circles !== null && circles.trustedByCount !== null;

  return (
    <>
      <div className="flex flex-1 items-start gap-3 px-3 py-3 sm:px-4 sm:py-4">
        <Avatar className="size-11 shrink-0 sm:size-12">
          {circles?.imageUrl ? (
            <AvatarImage
              src={circles.imageUrl}
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
            <CrcAmount amount={expert.price_crc} variant="highlight" className="shrink-0 text-xs sm:text-sm" />
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
              {showTrustedBy && (
                <span className="shrink-0 whitespace-nowrap text-right text-[10px] text-subtle-foreground sm:text-xs">
                  Trusted by {circles.trustedByCount}
                </span>
              )}
            </div>
          )}
        </div>
      </div>
      {expert.skills.length > 0 ? (
        <div className="border-t border-border px-3 py-2 text-center sm:px-4 sm:py-2.5">
          <h2 className="text-sm font-semibold">{UI_COPY.booking.skills}</h2>
          <ExpertSkillTags skills={expert.skills} className="mt-1 justify-center" />
        </div>
      ) : null}
      {expert.bio ? (
        <div className="border-t border-border px-3 pb-3 pt-2.5 text-center sm:px-4 sm:pb-4 sm:pt-3">
          <h2 className="text-sm font-semibold">{UI_COPY.booking.about}</h2>
          <p className="mx-auto mt-1 max-w-prose whitespace-pre-line text-sm leading-relaxed text-muted-foreground">
            {expert.bio}
          </p>
        </div>
      ) : null}
      <ExpertSplitShare expertPercent={share} variant="footer" />
    </>
  );
}
