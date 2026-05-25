'use client';

import { Suspense, useEffect, useRef, type RefObject } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

import { useToast } from '@/components/ui/toast';
import { useTreasuryPendingTx } from '@/contexts/TreasuryPendingTxContext';
import { usePrefersReducedMotion } from '@/hooks/use-prefers-reduced-motion';
import { playBookingSuccessSound } from '@/lib/booking-success-sound';
import { dispatchLocalTreasuryCoin } from '@/lib/treasury-coin-events';
import {
  readTreasuryPayCelebration,
  TREASURY_TX_QUERY_PARAM,
} from '@/lib/treasury-pay-celebration';
import { UI_COPY } from '@/lib/ui-copy';

type Props = {
  impactTargetRef: RefObject<HTMLDivElement | null>;
};

function TreasuryPayCelebrationInner({ impactTargetRef }: Props) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { getPending } = useTreasuryPendingTx();
  const { showToast } = useToast();
  const reducedMotion = usePrefersReducedMotion();
  const handledRef = useRef<string | null>(null);

  useEffect(() => {
    const txHash = searchParams.get(TREASURY_TX_QUERY_PARAM);
    if (!txHash || handledRef.current === txHash.toLowerCase()) return;
    handledRef.current = txHash.toLowerCase();

    const pending = getPending(txHash);
    const nominalCrc =
      pending?.nominalCrc ?? readTreasuryPayCelebration(txHash) ?? 0;

    if (nominalCrc > 0) {
      requestAnimationFrame(() => {
        dispatchLocalTreasuryCoin({ txHash, nominalCrc });
      });
      impactTargetRef.current?.scrollIntoView({
        behavior: reducedMotion ? 'auto' : 'smooth',
        block: 'center',
      });
    }

    playBookingSuccessSound();
    showToast(UI_COPY.booking.successTreasuryRedirect(nominalCrc));

    const url = new URL(window.location.href);
    url.searchParams.delete(TREASURY_TX_QUERY_PARAM);
    const next = url.search ? `${url.pathname}${url.search}` : url.pathname;
    router.replace(next, { scroll: false });
  }, [searchParams, getPending, router, showToast, impactTargetRef, reducedMotion]);

  return null;
}

export function TreasuryPayCelebration(props: Props) {
  return (
    <Suspense fallback={null}>
      <TreasuryPayCelebrationInner {...props} />
    </Suspense>
  );
}
