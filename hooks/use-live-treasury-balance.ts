'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

import { useTreasuryPendingTxOptional } from '@/contexts/TreasuryPendingTxContext';
import { fetchTreasuryBalanceCrc } from '@/lib/analytics-rpc';
import { isDemoTreasuryTx } from '@/lib/treasury-coin-demo';
import { shouldAnimateInbound, type TreasuryInboundEvent } from '@/lib/treasury-events';
import { createTreasuryWsClient } from '@/lib/treasury-ws';

const POLL_INTERVAL_MS = 30_000;
const RECONCILE_DEBOUNCE_MS = 300;
const SEEN_TX_CAP = 200;

export type LiveTreasuryStatus = 'idle' | 'loading' | 'ready' | 'error';

type Options = {
  enabled?: boolean;
  subscribeWs?: boolean;
  initialBalance?: number | null;
  onInbound?: (event: TreasuryInboundEvent) => void;
};

export function useLiveTreasuryBalance({
  enabled = true,
  subscribeWs = true,
  initialBalance = null,
  onInbound,
}: Options = {}) {
  const pendingCtx = useTreasuryPendingTxOptional();
  const [balance, setBalance] = useState<number | null>(initialBalance);
  const [status, setStatus] = useState<LiveTreasuryStatus>(
    initialBalance != null ? 'ready' : 'idle',
  );
  const [lastInbound, setLastInbound] = useState<TreasuryInboundEvent | null>(null);
  const seenTxRef = useRef<string[]>([]);
  const wsConnectedRef = useRef(false);
  const reconcileTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const rememberTx = useCallback((txHash: string) => {
    const key = txHash.toLowerCase();
    if (seenTxRef.current.includes(key)) return;
    seenTxRef.current.push(key);
    if (seenTxRef.current.length > SEEN_TX_CAP) {
      seenTxRef.current = seenTxRef.current.slice(-SEEN_TX_CAP);
    }
  }, []);

  const reconcile = useCallback(async () => {
    try {
      const next = await fetchTreasuryBalanceCrc();
      if (next != null) {
        setBalance(next);
        setStatus('ready');
      }
    } catch {
      setStatus('error');
    }
  }, []);

  const scheduleReconcile = useCallback(() => {
    if (reconcileTimerRef.current) clearTimeout(reconcileTimerRef.current);
    reconcileTimerRef.current = setTimeout(() => {
      reconcileTimerRef.current = null;
      void reconcile();
    }, RECONCILE_DEBOUNCE_MS);
  }, [reconcile]);

  const handleInbound = useCallback(
    (event: TreasuryInboundEvent) => {
      if (pendingCtx?.isPending(event.txHash)) return;

      const seen = new Set(seenTxRef.current);
      if (!shouldAnimateInbound(event, seen)) return;

      rememberTx(event.txHash);
      setLastInbound(event);
      onInbound?.(event);
      if (!isDemoTreasuryTx(event.txHash)) {
        scheduleReconcile();
      }
    },
    [onInbound, pendingCtx, rememberTx, scheduleReconcile],
  );

  useEffect(() => {
    if (!enabled) return;

    let cancelled = false;

    void (async () => {
      if (initialBalance == null) {
        setStatus((s) => (s === 'ready' ? s : 'loading'));
        const next = await fetchTreasuryBalanceCrc();
        if (cancelled) return;
        if (next != null) {
          setBalance(next);
          setStatus('ready');
        } else {
          setStatus('error');
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [enabled, initialBalance]);

  useEffect(() => {
    if (!enabled || !subscribeWs || typeof WebSocket === 'undefined') return;

    let client: ReturnType<typeof createTreasuryWsClient> | null = null;
    try {
      client = createTreasuryWsClient({
        onInbound: handleInbound,
        onStatus: (s) => {
          wsConnectedRef.current = s === 'open';
        },
      });
    } catch {
      wsConnectedRef.current = false;
    }

    return () => {
      wsConnectedRef.current = false;
      client?.destroy();
    };
  }, [enabled, subscribeWs, handleInbound]);

  useEffect(() => {
    if (!enabled) return;

    function tick() {
      if (document.hidden) return;
      if (subscribeWs && wsConnectedRef.current) return;
      void reconcile();
    }

    const id = setInterval(tick, POLL_INTERVAL_MS);
    return () => clearInterval(id);
  }, [enabled, subscribeWs, reconcile]);

  useEffect(() => {
    if (!enabled) return;

    function onVisibility() {
      if (!document.hidden) void reconcile();
    }

    document.addEventListener('visibilitychange', onVisibility);
    return () => document.removeEventListener('visibilitychange', onVisibility);
  }, [enabled, reconcile]);

  useEffect(() => {
    return () => {
      if (reconcileTimerRef.current) clearTimeout(reconcileTimerRef.current);
    };
  }, []);

  return { balance, setBalance, status, lastInbound, reconcile, markTxSeen: rememberTx };
}
