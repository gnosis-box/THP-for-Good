'use client';

import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { Coins } from 'lucide-react';
import { motion } from 'motion/react';

import type { CoinBurst } from '@/hooks/use-coin-burst-queue';
import type { SpawnRect } from '@/contexts/TreasuryPendingTxContext';
import { usePrefersReducedMotion } from '@/hooks/use-prefers-reduced-motion';
import { cn } from '@/lib/utils';

/** Coin flight duration (seconds). */
export const COIN_FLIGHT_DURATION_S = 1.05;

type Props = {
  bursts: CoinBurst[];
  targetRef: React.RefObject<HTMLElement | null>;
  onComplete: (id: string, nominalCrc: number) => void;
};

function formatNominal(n: number) {
  if (Number.isInteger(n)) return String(n);
  return n.toFixed(2);
}

function FlyingCoin({
  burst,
  targetRef,
  onComplete,
}: {
  burst: CoinBurst;
  targetRef: React.RefObject<HTMLElement | null>;
  onComplete: (id: string, nominalCrc: number) => void;
}) {
  const reducedMotion = usePrefersReducedMotion();
  const [target, setTarget] = useState<{ x: number; y: number } | null>(null);
  const completedRef = useRef(false);

  useLayoutEffect(() => {
    completedRef.current = false;
    const el = targetRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    setTarget({ x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 });
  }, [targetRef, burst.id]);

  useEffect(() => {
    if (reducedMotion && !completedRef.current) {
      completedRef.current = true;
      onComplete(burst.id, burst.nominalCrc);
    }
  }, [reducedMotion, burst.id, burst.nominalCrc, onComplete]);

  function handleAnimationComplete() {
    if (!target || completedRef.current) return;
    completedRef.current = true;
    onComplete(burst.id, burst.nominalCrc);
  }

  if (reducedMotion) return null;
  if (!target) return null;

  return (
    <motion.div
      className={cn(
        'pointer-events-none fixed z-[100] flex items-center gap-1 rounded-full',
        'border border-accent/40 bg-accent/15 px-2 py-1 text-accent shadow-md backdrop-blur-sm',
      )}
      style={{ left: 0, top: 0 }}
      initial={{
        x: burst.startX,
        y: burst.startY,
        translateX: '-50%',
        translateY: '-50%',
        scale: 0.4,
        opacity: 0,
      }}
      animate={{
        x: target.x,
        y: target.y,
        translateX: '-50%',
        translateY: '-50%',
        scale: 0.85,
        opacity: 1,
      }}
      exit={{ scale: 0.2, opacity: 0 }}
      transition={{ duration: COIN_FLIGHT_DURATION_S, ease: [0.22, 1, 0.36, 1] }}
      onAnimationComplete={handleAnimationComplete}
    >
      <Coins className="size-4 shrink-0" aria-hidden />
      <span className="text-xs font-semibold tabular-nums">+{formatNominal(burst.nominalCrc)} CRC</span>
    </motion.div>
  );
}

export function CrcCoinLayer({ bursts, targetRef, onComplete }: Props) {
  if (typeof document === 'undefined' || bursts.length === 0) return null;

  return createPortal(
    <>
      {bursts.map((burst) => (
        <FlyingCoin
          key={burst.id}
          burst={burst}
          targetRef={targetRef}
          onComplete={onComplete}
        />
      ))}
    </>,
    document.body,
  );
}

/** Default spawn point for external / WS-only inflows. */
export function externalCoinSpawn(): { startX: number; startY: number } {
  if (typeof window === 'undefined') return { startX: 0, startY: 0 };
  return { startX: window.innerWidth - 48, startY: 48 };
}

export function rectCenter(rect: DOMRect | SpawnRect): { startX: number; startY: number } {
  const left = 'left' in rect && typeof rect.left === 'number' ? rect.left : rect.x;
  const top = 'top' in rect && typeof rect.top === 'number' ? rect.top : rect.y;
  return { startX: left + rect.width / 2, startY: top + rect.height / 2 };
}
