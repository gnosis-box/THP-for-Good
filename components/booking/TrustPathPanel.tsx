'use client';

import { useEffect, useState } from 'react';

import { AlertTriangle, Check } from 'lucide-react';

import { StatusAlert } from '@/components/ui-patterns/StatusAlert';
import { Spinner } from '@/components/ui/spinner';
import { usePrefersReducedMotion } from '@/hooks/use-prefers-reduced-motion';
import { PAY_COPY } from '@/lib/pay-copy';
import { cn } from '@/lib/utils';
import type { TrustEligibleBalanceState } from '@/hooks/use-trust-eligible-balance';

function TrustProgressBar({ pct, label }: { pct: number; label: string }) {
  const reducedMotion = usePrefersReducedMotion();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
  }, []);

  const scale = mounted ? pct / 100 : 0;

  return (
    <div
      className="h-2 w-full overflow-hidden rounded-full bg-secondary"
      role="progressbar"
      aria-valuenow={Math.round(pct)}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-label={label}
    >
      <div
        className={cn(
          'motion-progress-fill h-full rounded-full bg-primary',
          !reducedMotion && 'transition-transform duration-[var(--motion-normal)] ease-out',
        )}
        style={{ transform: `scaleX(${scale})` }}
      />
    </div>
  );
}

type LegRowProps = {
  label: string;
  maxFormatted: string;
  legCrc: number;
};

function LegRow({ label, maxFormatted, legCrc }: LegRowProps) {
  const maxNum = parseFloat(maxFormatted) || 0;
  const pct = legCrc > 0 ? Math.min(100, (maxNum / legCrc) * 100) : 0;
  const ok = maxNum >= legCrc;

  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-center justify-between gap-2 text-xs">
        <span className="font-medium text-foreground">{label}</span>
        <span className="tabular-nums text-muted-foreground">
          ~{maxFormatted} / {legCrc} CRC
          {ok ? (
            <span className="ml-1 inline-flex items-center gap-0.5 text-success">
              <Check className="size-3.5" aria-hidden />
              <span>OK</span>
            </span>
          ) : (
            <span className="ml-1 inline-flex items-center gap-0.5 text-warning">
              <AlertTriangle className="size-3.5" aria-hidden />
              <span>Low</span>
            </span>
          )}
        </span>
      </div>
      <TrustProgressBar pct={pct} label={`${label}: ${maxFormatted} of ${legCrc} CRC`} />
    </div>
  );
}

type Props = {
  trustEligible: TrustEligibleBalanceState;
  expertLegCrc: number;
  treasuryLegCrc: number;
  expertName: string;
  priceCrc: number;
};

export function TrustPathPanel({
  trustEligible,
  expertLegCrc,
  treasuryLegCrc,
  expertName,
  priceCrc,
}: Props) {
  if (trustEligible.status === 'loading') {
    return (
      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        <Spinner className="size-4" />
        {PAY_COPY.trustEstimateLoading}
      </div>
    );
  }

  if (trustEligible.status === 'error') {
    return (
      <p className="text-xs text-muted-foreground">{PAY_COPY.trustEstimateUnavailable}</p>
    );
  }

  if (trustEligible.status !== 'ready') return null;

  const shortfall = trustEligible.limits.bookableCrc < priceCrc;

  return (
    <section className="flex flex-col gap-3" aria-labelledby="trust-estimate-title">
      <h3 id="trust-estimate-title" className="text-sm font-medium">
        {PAY_COPY.trustEstimateTitle}
      </h3>
      {expertLegCrc > 0 && (
        <LegRow
          label={expertName}
          maxFormatted={trustEligible.formatted.expert}
          legCrc={expertLegCrc}
        />
      )}
      {treasuryLegCrc > 0 && (
        <LegRow
          label={PAY_COPY.thpForGood}
          maxFormatted={trustEligible.formatted.foundation}
          legCrc={treasuryLegCrc}
        />
      )}
      <p className="text-xs text-muted-foreground">
        {PAY_COPY.bookableLine(trustEligible.formatted.bookable, priceCrc)}
      </p>
      {shortfall && (
        <StatusAlert
          variant="warning"
          title="Trust path shortfall"
          description={PAY_COPY.trustEstimateShortfall}
          className="motion-alert-in"
        />
      )}
    </section>
  );
}
