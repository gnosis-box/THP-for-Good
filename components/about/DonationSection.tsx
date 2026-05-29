'use client';

import { useCallback, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { useWallet } from '@/components/wallet/WalletProvider';
import { useToast } from '@/components/ui/toast';
import { CountUp } from '@/components/motion/count-up';
import {
  formatGoalCrc,
  LiveTreasuryCounter,
} from '@/components/motion/live-treasury-counter';
import {
  MetricsPanel,
  MetricsPanelMono,
  MetricsPanelTitle,
} from '@/components/ui-patterns/metrics-panel';
import { useTreasuryPendingTx } from '@/contexts/TreasuryPendingTxContext';
import { usePrefersReducedMotion } from '@/hooks/use-prefers-reduced-motion';
import { FOUNDATION_ADDRESS, FORMATION_GOAL_CRC, buildDonationTransactions } from '@/lib/crc-pay';
import { dispatchLocalTreasuryCoin } from '@/lib/treasury-coin-events';
import { TreasuryPayCelebration } from '@/components/about/TreasuryPayCelebration';
import { cn } from '@/lib/utils';

const PRESET_AMOUNTS = [10, 25, 50, 100];

export function DonationSection() {
  const { address, isConnected } = useWallet();
  const { showToast } = useToast();
  const { registerPending } = useTreasuryPendingTx();
  const reducedMotion = usePrefersReducedMotion();
  const donateButtonRef = useRef<HTMLButtonElement>(null);
  const impactTargetRef = useRef<HTMLDivElement>(null);
  const [selected, setSelected] = useState<number>(25);
  const [custom, setCustom] = useState('');
  const [loading, setLoading] = useState(false);
  const [pulseKey, setPulseKey] = useState(0);

  const donationAmount = custom ? parseInt(custom, 10) : selected;

  const handleCoinImpact = useCallback(() => {
    setPulseKey((k) => k + 1);
  }, []);

  async function handleDonate() {
    if (!address || !donationAmount || donationAmount <= 0) return;
    setLoading(true);
    try {
      const { sendTransactions } = await import('@aboutcircles/miniapp-sdk');
      const txs = await buildDonationTransactions(address as `0x${string}`, donationAmount);
      const hashes = await sendTransactions(txs);
      const txHash = hashes[0];
      const rect = donateButtonRef.current?.getBoundingClientRect();
      registerPending({
        txHash,
        nominalCrc: donationAmount,
        source: 'donation',
        spawnRect: rect
          ? { x: rect.left, y: rect.top, width: rect.width, height: rect.height }
          : undefined,
      });
      impactTargetRef.current?.scrollIntoView({
        behavior: reducedMotion ? 'auto' : 'smooth',
        block: 'center',
      });
      dispatchLocalTreasuryCoin({
        txHash,
        nominalCrc: donationAmount,
        spawnRect: rect
          ? { x: rect.left, y: rect.top, width: rect.width, height: rect.height }
          : undefined,
      });
      showToast(`Thank you! ${donationAmount} CRC donated.`);
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Donation failed', 'error');
    } finally {
      setLoading(false);
    }
  }

  return (
    <MetricsPanel muted className="gap-6 px-5 py-6">
      <TreasuryPayCelebration impactTargetRef={impactTargetRef} />
      <div className="flex flex-col gap-1">
        <MetricsPanelTitle>THP For Good DAO Treasury</MetricsPanelTitle>
        <MetricsPanelMono>
          {FOUNDATION_ADDRESS.slice(0, 10)}…{FOUNDATION_ADDRESS.slice(-8)}
        </MetricsPanelMono>
      </div>

      {/* Polling-only — iOS Safari can freeze when WSS opens in the Circles iframe (#109). */}
      <LiveTreasuryCounter
        mode="goal"
        subscribeWs={false}
        impactTargetRef={impactTargetRef}
        onCoinImpact={handleCoinImpact}
      >
        {({ balance, raised, pct, counterRef }) => (
          <div
            ref={impactTargetRef}
            className="flex flex-col items-center gap-2 text-center"
          >
            <span
              ref={counterRef as React.RefObject<HTMLSpanElement>}
              className="text-5xl font-extrabold leading-none tracking-tight"
            >
              {balance === null ? '—' : <CountUp key={Math.round(pct)} value={pct} suffix="%" />}
            </span>
            <span className="text-sm text-muted-foreground">
              goal: {formatGoalCrc(FORMATION_GOAL_CRC)} CRC
            </span>
            <div
              key={pulseKey}
              className={cn(
                'h-3 w-full max-w-md overflow-hidden rounded-full bg-muted',
                pulseKey > 0 && 'motion-treasury-bar-pulse',
              )}
            >
              <div
                className="motion-progress-fill h-full w-full rounded-full bg-accent"
                style={{
                  transform: `scaleX(${pct / 100})`,
                  transformOrigin: 'left center',
                  transition: reducedMotion ? undefined : 'transform var(--motion-slow) ease-out',
                }}
              />
            </div>
            <p className="text-sm text-muted-foreground">
              {balance === null ? (
                'Loading balance…'
              ) : (
                <>
                  <CountUp value={raised} format={formatGoalCrc} /> CRC raised — funds one free
                  THP formation at {pct >= 100 ? '🎉 goal reached!' : `${pct}%`}
                </>
              )}
            </p>
          </div>
        )}
      </LiveTreasuryCounter>

      <div className="flex flex-col items-center gap-3">
        <p className="text-sm font-medium">Donate CRC to fund a learner</p>
        <div className="flex flex-wrap justify-center gap-2">
          {PRESET_AMOUNTS.map((amt) => (
            <button
              key={amt}
              type="button"
              onClick={() => {
                setSelected(amt);
                setCustom('');
              }}
              className={`rounded-full border px-4 py-1.5 text-sm font-medium transition-colors ${
                !custom && selected === amt
                  ? 'border-accent bg-accent text-accent-foreground'
                  : 'border-border text-foreground hover:border-accent/60'
              }`}
            >
              {amt} CRC
            </button>
          ))}
          <input
            type="number"
            min="1"
            value={custom}
            onChange={(e) => setCustom(e.target.value)}
            placeholder="Custom"
            className="w-24 rounded-full border border-border bg-background px-3 py-1.5 text-sm outline-none focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/50"
          />
        </div>
        <Button
          ref={donateButtonRef}
          data-treasury-donate-btn
          onClick={handleDonate}
          disabled={loading || !isConnected || !donationAmount || donationAmount <= 0}
          className="w-full max-w-xs"
        >
          {loading ? 'Processing…' : `Donate ${donationAmount || '?'} CRC`}
        </Button>
        {!isConnected && (
          <p className="text-xs text-muted-foreground">Open in the Circles playground to donate.</p>
        )}
      </div>
    </MetricsPanel>
  );
}
