'use client';

import { Share2 } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { useToast } from '@/components/ui/toast';
import { trackUmamiEvent } from '@/lib/analytics-umami';
import { UI_COPY } from '@/lib/ui-copy';

type Props = {
  expertId: number;
  expertName: string;
  className?: string;
};

function buildExpertProfileUrl(expertId: number): string {
  const path = `/expert/${expertId}`;
  if (typeof window === 'undefined') return path;
  return `${window.location.origin}${path}`;
}

export function ExpertShareButton({ expertId, expertName, className }: Props) {
  const { showToast } = useToast();
  const copy = UI_COPY.expertShare;

  async function copyLink(url: string) {
    await navigator.clipboard.writeText(url);
    showToast(copy.copiedLink);
    trackUmamiEvent('expert_share', { expert_id: expertId });
  }

  async function handleShare() {
    const url = buildExpertProfileUrl(expertId);
    const payload = {
      title: copy.shareTitle(expertName),
      text: copy.shareText(expertName),
      url,
    };

    if (typeof navigator.share === 'function') {
      try {
        await navigator.share(payload);
        trackUmamiEvent('expert_share', { expert_id: expertId });
        return;
      } catch (err) {
        if (err instanceof DOMException && err.name === 'AbortError') return;
      }
    }

    try {
      await copyLink(url);
    } catch {
      showToast(copy.shareFailed, 'error');
    }
  }

  return (
    <Tooltip>
      <TooltipTrigger
        delay={0}
        closeOnClick={false}
        render={
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className={className}
            onClick={() => void handleShare()}
            aria-label={copy.label}
          />
        }
      >
        <Share2 className="size-4" aria-hidden />
      </TooltipTrigger>
      <TooltipContent side="bottom" sideOffset={6}>
        {copy.tooltip}
      </TooltipContent>
    </Tooltip>
  );
}
