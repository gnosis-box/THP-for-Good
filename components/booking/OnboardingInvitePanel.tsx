'use client';

import { useState } from 'react';
import { ExternalLink } from 'lucide-react';

import { Button, buttonVariants } from '@/components/ui/button';
import { StatusAlert } from '@/components/ui-patterns/StatusAlert';
import { useToast } from '@/components/ui/toast';
import { useWallet } from '@/components/wallet/WalletProvider';
import { usePrefersReducedMotion } from '@/hooks/use-prefers-reduced-motion';
import {
  CIRCLES_SIGNUP_URL,
  THP_METRI_JOIN_URL,
} from '@/lib/onboarding-links';
import { motionClass } from '@/lib/motion';
import { UI_COPY } from '@/lib/ui-copy';
import { cn } from '@/lib/utils';

type PanelPhase = 'idle' | 'loading' | 'opened' | 'empty' | 'copy';

type Props = {
  walletAddress: string;
  className?: string;
};

function openExternal(url: string): Window | null {
  return window.open(url, '_blank', 'noopener,noreferrer');
}

export function OnboardingInvitePanel({ walletAddress, className }: Props) {
  const copy = UI_COPY.onboarding;
  const { isMiniappHost } = useWallet();
  const { showToast } = useToast();
  const reducedMotion = usePrefersReducedMotion();
  const [phase, setPhase] = useState<PanelPhase>('idle');
  const [pendingUrl, setPendingUrl] = useState<string | null>(null);

  async function requestLink() {
    setPhase('loading');
    try {
      const res = await fetch('/api/onboarding/invite-link', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-wallet-address': walletAddress,
        },
      });

      if (!res.ok) {
        throw new Error('request_failed');
      }

      const body = (await res.json()) as { url?: string; fallback?: boolean };

      if (body.fallback) {
        setPhase('empty');
        return;
      }

      if (!body.url) {
        throw new Error('missing_url');
      }

      const opened = openExternal(body.url);
      if (!opened) {
        setPendingUrl(body.url);
        setPhase('copy');
        return;
      }

      setPendingUrl(body.url);
      setPhase('opened');
    } catch {
      showToast(copy.errorGeneric, 'error');
      setPhase('idle');
    }
  }

  async function copyPendingUrl() {
    if (!pendingUrl) return;
    try {
      await navigator.clipboard.writeText(pendingUrl);
      showToast(copy.copiedLink);
    } catch {
      showToast(copy.errorGeneric, 'error');
    }
  }

  if (phase === 'empty') {
    return (
      <div
        className={cn('pay-drawer-section flex flex-col gap-3', className)}
        role="region"
        aria-labelledby="onboarding-empty-title"
      >
        <StatusAlert
          variant="warning"
          title={copy.emptyTitle}
          description={
            <div className="flex flex-col gap-3">
              <p>{copy.emptyBody}</p>
              <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap">
                <a
                  href={CIRCLES_SIGNUP_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={cn(
                    buttonVariants({ size: 'sm' }),
                    'min-h-11 inline-flex items-center justify-center gap-2',
                  )}
                >
                  {copy.fallbackCreateAccount}
                  <ExternalLink className="size-4 shrink-0" aria-hidden />
                </a>
                <a
                  href={THP_METRI_JOIN_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={cn(
                    buttonVariants({ variant: 'outline', size: 'sm' }),
                    'min-h-11 inline-flex items-center justify-center gap-2',
                  )}
                >
                  {copy.fallbackJoinThp}
                  <ExternalLink className="size-4 shrink-0" aria-hidden />
                </a>
              </div>
              <p className="text-xs text-muted-foreground">{copy.helperReturn}</p>
            </div>
          }
          className={motionClass('', 'motion-alert-in', reducedMotion)}
        />
      </div>
    );
  }

  if (phase === 'opened') {
    return (
      <div
        className={cn('pay-drawer-section flex flex-col gap-3', className)}
        role="region"
        aria-labelledby="onboarding-success-title"
        aria-live="polite"
      >
        <StatusAlert
          variant="success"
          title={copy.successTitle}
          description={
            <div className="flex flex-col gap-3">
              <p>{copy.successBody}</p>
              <Button type="button" variant="outline" size="sm" className="min-h-11 w-fit" onClick={() => void requestLink()}>
                {copy.retryCta}
              </Button>
            </div>
          }
          className={motionClass('', 'motion-alert-in', reducedMotion)}
        />
      </div>
    );
  }

  if (phase === 'copy' && pendingUrl) {
    return (
      <div
        className={cn('pay-drawer-section flex flex-col gap-3', className)}
        role="region"
        aria-labelledby="onboarding-copy-title"
      >
        <StatusAlert
          variant="info"
          title={copy.successTitle}
          description={
            <div className="flex flex-col gap-3">
              <p>{copy.successBody}</p>
              <p className="break-all font-mono text-xs">{pendingUrl}</p>
              <Button type="button" variant="outline" size="sm" className="min-h-11 w-fit" onClick={() => void copyPendingUrl()}>
                {copy.copyLink}
              </Button>
            </div>
          }
          className={motionClass('', 'motion-alert-in', reducedMotion)}
        />
      </div>
    );
  }

  return (
    <div
      className={cn('pay-drawer-section', className)}
      role="region"
      aria-labelledby="onboarding-title"
    >
      <StatusAlert
        variant="warning"
        title={copy.title}
        description={
          <div className="flex flex-col gap-3">
            <p>{copy.body}</p>
            {!isMiniappHost ? (
              <p className="text-xs text-muted-foreground">{copy.playgroundHelper}</p>
            ) : null}
            <Button
              type="button"
              className="min-h-11 w-full sm:w-fit"
              disabled={phase === 'loading'}
              aria-busy={phase === 'loading'}
              onClick={() => void requestLink()}
            >
              {phase === 'loading' ? copy.ctaGettingLink : copy.ctaGetLink}
            </Button>
            <p className="text-xs text-muted-foreground">{copy.helperReturn}</p>
          </div>
        }
        className={motionClass('', 'motion-alert-in', reducedMotion)}
      />
    </div>
  );
}
