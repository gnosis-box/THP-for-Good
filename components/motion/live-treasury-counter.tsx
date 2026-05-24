'use client';

import { useCallback, useEffect, useRef, type ReactNode, type RefObject } from 'react';

import { CrcCoinLayer, externalCoinSpawn, rectCenter } from '@/components/motion/crc-coin-flight';
import { CountUp } from '@/components/motion/count-up';
import { useTreasuryPendingTxOptional } from '@/contexts/TreasuryPendingTxContext';
import { useCoinBurstQueue } from '@/hooks/use-coin-burst-queue';
import { useLiveTreasuryBalance } from '@/hooks/use-live-treasury-balance';
import { FORMATION_GOAL_CRC } from '@/lib/crc-pay';
import type { TreasuryInboundEvent } from '@/lib/treasury-events';
import {
  TREASURY_LOCAL_COIN_EVENT,
  type LocalTreasuryCoinDetail,
} from '@/lib/treasury-coin-events';

type TreasuryCounterContext = {
  balance: number | null;
  raised: number;
  pct: number;
  counterRef: RefObject<HTMLElement | null>;
  impactTargetRef: RefObject<HTMLElement | null>;
};

type BaseProps = {
  enabled?: boolean;
  subscribeWs?: boolean;
  initialBalance?: number | null;
  counterRef?: RefObject<HTMLElement | null>;
  impactTargetRef?: RefObject<HTMLElement | null>;
  onCoinImpact?: (nominalCrc: number) => void;
  children?: (ctx: TreasuryCounterContext) => ReactNode;
};

type BalanceProps = BaseProps & {
  mode: 'balance';
  format?: (n: number) => string;
};

type GoalProps = BaseProps & {
  mode: 'goal';
};

export type LiveTreasuryCounterProps = BalanceProps | GoalProps;

export function formatGoalCrc(n: number) {
  return new Intl.NumberFormat(undefined, { maximumFractionDigits: 0 }).format(n);
}

export function LiveTreasuryCounter(props: LiveTreasuryCounterProps) {
  const {
    enabled = true,
    subscribeWs = true,
    initialBalance = null,
    counterRef: counterRefProp,
    impactTargetRef: impactTargetRefProp,
    onCoinImpact,
  } = props;
  const internalRef = useRef<HTMLElement>(null);
  const internalImpactRef = useRef<HTMLElement>(null);
  const counterRef = counterRefProp ?? internalRef;
  const impactTargetRef = impactTargetRefProp ?? internalImpactRef;
  const pendingCtx = useTreasuryPendingTxOptional();
  const onCoinImpactRef = useRef(onCoinImpact);
  const setBalanceRef = useRef<(value: number | ((prev: number | null) => number | null)) => void>(
    () => {},
  );

  useEffect(() => {
    onCoinImpactRef.current = onCoinImpact;
  }, [onCoinImpact]);

  const { active, enqueue, complete } = useCoinBurstQueue({
    onImpact: (_id, nominalCrc) => {
      setBalanceRef.current((prev) => (prev != null ? prev + nominalCrc : nominalCrc));
      onCoinImpactRef.current?.(nominalCrc);
    },
  });

  const enqueueInbound = useCallback(
    (event: TreasuryInboundEvent, spawnOverride?: { startX: number; startY: number }) => {
      const pending = pendingCtx?.getPending(event.txHash);
      let startX: number;
      let startY: number;

      if (spawnOverride) {
        startX = spawnOverride.startX;
        startY = spawnOverride.startY;
      } else if (pending?.spawnRect) {
        const c = rectCenter(pending.spawnRect);
        startX = c.startX;
        startY = c.startY;
        pendingCtx?.consumePending(event.txHash);
      } else {
        const ext = externalCoinSpawn();
        startX = ext.startX;
        startY = ext.startY;
      }

      enqueue({
        txHash: event.txHash,
        nominalCrc: event.nominalCrc,
        startX,
        startY,
      });
    },
    [enqueue, pendingCtx],
  );

  const onWsInbound = useCallback(
    (event: TreasuryInboundEvent) => enqueueInbound(event),
    [enqueueInbound],
  );

  const { balance, setBalance, status, markTxSeen } = useLiveTreasuryBalance({
    enabled,
    subscribeWs,
    initialBalance,
    onInbound: onWsInbound,
  });

  useEffect(() => {
    function onLocal(e: Event) {
      const detail = (e as CustomEvent<LocalTreasuryCoinDetail>).detail;
      if (!detail?.txHash) return;
      pendingCtx?.consumePending(detail.txHash);
      markTxSeen(detail.txHash);
      const spawn = detail.spawnRect ? rectCenter(detail.spawnRect) : externalCoinSpawn();
      enqueueInbound(
        { txHash: detail.txHash, from: '', nominalCrc: detail.nominalCrc },
        spawn,
      );
    }
    window.addEventListener(TREASURY_LOCAL_COIN_EVENT, onLocal);
    return () => window.removeEventListener(TREASURY_LOCAL_COIN_EVENT, onLocal);
  }, [enqueueInbound, markTxSeen, pendingCtx]);

  useEffect(() => {
    setBalanceRef.current = setBalance;
  }, [setBalance]);

  const raised = balance ?? 0;
  const pct = Math.min(100, Math.round((raised / FORMATION_GOAL_CRC) * 100));

  const coinTargetRef = props.mode === 'goal' ? impactTargetRef : counterRef;
  const ctx: TreasuryCounterContext = { balance, raised, pct, counterRef, impactTargetRef };

  const coinLayer = (
    <CrcCoinLayer bursts={active} targetRef={coinTargetRef} onComplete={complete} />
  );

  if (props.mode === 'balance') {
    const format =
      props.format ??
      ((n: number) => new Intl.NumberFormat(undefined, { maximumFractionDigits: 2 }).format(n));

    if (props.children) {
      return (
        <>
          {props.children(ctx)}
          {coinLayer}
        </>
      );
    }

    return (
      <>
        <span ref={counterRef as RefObject<HTMLSpanElement>} className="tabular-nums">
          {status === 'loading' && balance == null ? (
            '—'
          ) : (
            <>
              <CountUp value={balance ?? 0} format={format} /> CRC
            </>
          )}
        </span>
        {coinLayer}
      </>
    );
  }

  if (props.children) {
    return (
      <>
        {props.children(ctx)}
        {coinLayer}
      </>
    );
  }

  return (
    <>
      <div ref={impactTargetRef as RefObject<HTMLDivElement>}>
        <span
          ref={counterRef as RefObject<HTMLSpanElement>}
          className="text-5xl font-extrabold leading-none tracking-tight"
        >
          {balance === null ? '—' : <CountUp key={Math.round(pct)} value={pct} suffix="%" />}
        </span>
      </div>
      {coinLayer}
    </>
  );
}
