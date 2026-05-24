'use client';

import { useEffect, useRef, useState } from 'react';

import { CrcCoinLayer, rectCenter } from '@/components/motion/crc-coin-flight';
import type { SpawnRect } from '@/contexts/TreasuryPendingTxContext';
import { useTreasuryPendingTx } from '@/contexts/TreasuryPendingTxContext';
import { useCoinBurstQueue } from '@/hooks/use-coin-burst-queue';
import { THP_FOR_GOOD_LABEL } from '@/lib/crc-pay';
import { cn } from '@/lib/utils';

type Props = {
  className?: string;
};

export function PayTreasuryFeedback({ className }: Props) {
  const { getPending, consumePending } = useTreasuryPendingTx();
  const chipRef = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  const [label, setLabel] = useState('');
  const firedRef = useRef<Set<string>>(new Set());

  const { active, enqueue, complete } = useCoinBurstQueue({
    onImpact: (_id, nominalCrc) => {
      setLabel(`+${formatNominal(nominalCrc)} CRC to ${THP_FOR_GOOD_LABEL}`);
      setVisible(true);
    },
  });

  useEffect(() => {
    function onPayRegistered(e: Event) {
      const detail = (e as CustomEvent<{
        txHash: string;
        nominalCrc: number;
        spawnRect?: SpawnRect;
      }>).detail;
      if (!detail || firedRef.current.has(detail.txHash)) return;
      firedRef.current.add(detail.txHash);

      const pending = getPending(detail.txHash);
      const rect = detail.spawnRect ?? pending?.spawnRect;
      const spawn = rect ? rectCenter(rect) : { startX: window.innerWidth / 2, startY: window.innerHeight - 80 };

      enqueue({
        txHash: detail.txHash,
        nominalCrc: detail.nominalCrc,
        startX: spawn.startX,
        startY: spawn.startY,
      });
      consumePending(detail.txHash);
    }

    window.addEventListener('thp:treasury-pay', onPayRegistered);
    return () => window.removeEventListener('thp:treasury-pay', onPayRegistered);
  }, [consumePending, enqueue, getPending]);

  useEffect(() => {
    if (!visible) return;
    const t = setTimeout(() => setVisible(false), 3_000);
    return () => clearTimeout(t);
  }, [visible]);

  return (
    <>
      <div
        ref={chipRef}
        className={cn(
          'pointer-events-none fixed bottom-24 left-1/2 z-40 -translate-x-1/2',
          'rounded-full border border-accent/50 bg-accent/10 px-3 py-1.5 text-sm font-medium text-accent',
          'transition-opacity duration-300',
          visible ? 'opacity-100' : 'opacity-0',
          className,
        )}
        aria-live="polite"
      >
        {label}
      </div>
      <CrcCoinLayer bursts={active} targetRef={chipRef} onComplete={complete} />
    </>
  );
}

function formatNominal(n: number) {
  if (Number.isInteger(n)) return String(n);
  return n.toFixed(2);
}

export function dispatchPayTreasuryFeedback(
  txHash: string,
  nominalCrc: number,
  spawnRect?: SpawnRect,
) {
  if (typeof window === 'undefined') return;
  window.dispatchEvent(
    new CustomEvent('thp:treasury-pay', { detail: { txHash, nominalCrc, spawnRect } }),
  );
}
