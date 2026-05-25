'use client';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { CrcAmount } from '@/components/ui-patterns/CrcAmount';
import { ExpertSkillTags, ExpertLanguageTags, ExpertSplitShare } from '@/components/ui-patterns/ExpertMeta';
import { UI_COPY } from '@/lib/ui-copy';
import { cn, shortenAddress } from '@/lib/utils';

type Props = {
  name: string;
  bio: string;
  priceCrc: number;
  expertShare: number;
  skills: string[];
  callLanguages: string[];
  imageUrl: string | null;
  walletAddress: string;
  balanceLabel?: string;
  className?: string;
};

export function RegisterProfilePreview({
  name,
  bio,
  priceCrc,
  expertShare,
  skills,
  callLanguages,
  imageUrl,
  walletAddress,
  balanceLabel,
  className,
}: Props) {
  const displayName = name.trim() || 'Your name';
  const hasLanguages = callLanguages.length > 0;
  const bioText = bio.trim();

  return (
    <div
      className={cn(
        'overflow-hidden rounded-xl border border-border bg-card',
        className,
      )}
      aria-label="Public profile preview"
    >
      <div className="flex items-start gap-3 px-3 py-3 sm:px-4 sm:py-4">
        <Avatar className="size-11 shrink-0 sm:size-12">
          {imageUrl ? <AvatarImage src={imageUrl} alt={displayName} /> : null}
          <AvatarFallback className="text-sm font-semibold">
            {displayName.charAt(0).toUpperCase()}
          </AvatarFallback>
        </Avatar>
        <div className="min-w-0 flex-1 space-y-1">
          <div className="flex min-w-0 items-center justify-between gap-2">
            <p className="text-display min-w-0 truncate text-sm font-semibold leading-tight sm:text-base">
              {displayName}
            </p>
            <CrcAmount amount={priceCrc} variant="highlight" className="shrink-0 text-xs sm:text-sm" />
          </div>
          {hasLanguages ? (
            <ExpertLanguageTags languages={callLanguages} variant="card" className="min-w-0" />
          ) : (
            <p className="text-xs text-muted-foreground sm:text-sm">Add session languages below</p>
          )}
        </div>
      </div>

      {skills.length > 0 ? (
        <div className="border-t border-border px-3 py-2 text-center sm:px-4 sm:py-2.5">
          <h2 className="text-sm font-semibold">{UI_COPY.booking.skills}</h2>
          <ExpertSkillTags skills={skills} className="mt-1 justify-center" />
        </div>
      ) : null}

      {bioText ? (
        <div className="border-t border-border px-3 pb-3 pt-2.5 text-center sm:px-4 sm:pb-4 sm:pt-3">
          <h2 className="text-sm font-semibold">{UI_COPY.booking.about}</h2>
          <p className="mx-auto mt-1 max-w-prose whitespace-pre-line text-sm leading-relaxed text-muted-foreground">
            {bioText}
          </p>
        </div>
      ) : null}

      <div className="border-t border-border/60 bg-muted/30 px-3 py-2 text-center text-[11px] text-muted-foreground sm:px-4 sm:text-xs">
        <span className="font-mono">{shortenAddress(walletAddress, 6)}</span>
        {balanceLabel ? <span>{` · ${balanceLabel} CRC`}</span> : null}
      </div>

      <ExpertSplitShare expertPercent={expertShare} variant="footer" />
    </div>
  );
}
