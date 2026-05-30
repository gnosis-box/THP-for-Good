'use client';

import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';

import { AlertTriangle, Check } from 'lucide-react';

import { DonateFundLearnerLink } from '@/components/booking/DonateFundLearnerLink';
import { Skeleton } from '@/components/ui/skeleton';
import { StatusAlert } from '@/components/ui-patterns/StatusAlert';
import { usePrefersReducedMotion } from '@/hooks/use-prefers-reduced-motion';
import { PAY_COPY } from '@/lib/pay-copy';
import { cn } from '@/lib/utils';
import type { TrustEligibleBalanceState } from '@/hooks/use-trust-eligible-balance';

function TrustProgressBar({
  pct,
  label,
  fillClass = 'bg-primary',
}: {
  pct: number;
  label: string;
  fillClass?: string;
}) {
  const reducedMotion = usePrefersReducedMotion();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
  }, []);

  const scale = mounted ? pct / 100 : 0;

  return (
    <div
      className="h-2 w-full overflow-hidden rounded-full bg-muted"
      role="progressbar"
      aria-valuenow={Math.round(pct)}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-label={label}
    >
      <div
        className={cn(
          'motion-progress-fill h-full rounded-full',
          fillClass,
          !reducedMotion && 'transition-transform duration-[var(--motion-normal)] ease-out',
        )}
        style={{ transform: `scaleX(${scale})` }}
      />
    </div>
  );
}

function TrustPathSkeleton() {
  return (
    <section
      className="flex flex-col gap-3"
      aria-busy="true"
      aria-label={PAY_COPY.trustEstimateLoading}
    >
      <Skeleton className="h-4 w-40" />
      {[0, 1].map((row) => (
        <div key={row} className="flex flex-col gap-1.5">
          <div className="flex items-center justify-between gap-2">
            <Skeleton className="h-3 w-24" />
            <Skeleton className="h-3 w-28" />
          </div>
          <Skeleton className="motion-trust-skeleton h-2 w-full rounded-full" />
        </div>
      ))}
      <Skeleton className="h-3 w-full max-w-sm" />
    </section>
  );
}

type LegRowProps = {
  label: string;
  maxFormatted: string;
  legCrc: number;
  fillClass?: string;
};

function LegRow({ label, maxFormatted, legCrc, fillClass = 'bg-primary' }: LegRowProps) {
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
      <TrustProgressBar pct={pct} label={`${label}: ${maxFormatted} of ${legCrc} CRC`} fillClass={fillClass} />
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

function TrustPathContent({
  trustEligible,
  expertLegCrc,
  treasuryLegCrc,
  expertName,
  priceCrc,
}: Props) {
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
          fillClass="bg-accent"
        />
      )}
      <p className="text-xs text-muted-foreground">
        {PAY_COPY.bookableLine(trustEligible.formatted.bookable, priceCrc)}
      </p>
      {shortfall && (
        <StatusAlert
          variant="warning"
          title="Trust path shortfall"
          description={
            <div className="flex flex-col gap-3">
              <p>{PAY_COPY.trustEstimateShortfall}</p>
              <p className="text-xs text-muted-foreground">{PAY_COPY.donateHint}</p>
              <DonateFundLearnerLink />
            </div>
          }
          className="motion-alert-in"
        />
      )}
    </section>
  );
}

export function TrustPathPanel(props: Props) {
  const { trustEligible } = props;
  const reducedMotion = usePrefersReducedMotion();

  if (trustEligible.status === 'error') {
    return (
      <p className="text-xs text-muted-foreground">{PAY_COPY.trustEstimateUnavailable}</p>
    );
  }

  if (reducedMotion) {
    if (trustEligible.status === 'loading') return <TrustPathSkeleton />;
    return <TrustPathContent {...props} />;
  }

  return (
    <AnimatePresence mode="wait">
      {trustEligible.status === 'loading' ? (
        <motion.div
          key="loading"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
        >
          <TrustPathSkeleton />
        </motion.div>
      ) : (
        <motion.div
          key="ready"
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25, ease: 'easeOut' }}
        >
          <TrustPathContent {...props} />
        </motion.div>
      )}
    </AnimatePresence>
  );
}
