'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { useWallet } from '@/components/wallet/WalletProvider';
import { useToast } from '@/components/ui/toast';
import { CountUp } from '@/components/motion/count-up';
import {
  MetricsPanel,
  MetricsPanelMono,
  MetricsPanelTitle,
} from '@/components/ui-patterns/metrics-panel';
import { usePrefersReducedMotion } from '@/hooks/use-prefers-reduced-motion';
import { FOUNDATION_ADDRESS, FORMATION_GOAL_CRC, buildDonationTransactions } from '@/lib/crc-pay';

const PRESET_AMOUNTS = [10, 25, 50, 100];

function fmt(n: number) {
  return new Intl.NumberFormat(undefined, { maximumFractionDigits: 0 }).format(n);
}

export function DonationSection() {
  const { address, isConnected } = useWallet();
  const { showToast } = useToast();
  const reducedMotion = usePrefersReducedMotion();
  const [balance, setBalance] = useState<number | null>(null);
  const [selected, setSelected] = useState<number>(25);
  const [custom, setCustom] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const { Sdk } = await import('@aboutcircles/sdk');
        const sdk = new Sdk();
        const view = await sdk.rpc.profile.getProfileView(FOUNDATION_ADDRESS);
        if (view?.v2Balance) setBalance(parseFloat(view.v2Balance as string));
      } catch {
        /* silent */
      }
    })();
  }, []);

  const raised = balance ?? 0;
  const pct = Math.min(100, Math.round((raised / FORMATION_GOAL_CRC) * 100));
  const donationAmount = custom ? parseInt(custom, 10) : selected;

  async function handleDonate() {
    if (!address || !donationAmount || donationAmount <= 0) return;
    setLoading(true);
    try {
      const { sendTransactions } = await import('@aboutcircles/miniapp-sdk');
      const txs = await buildDonationTransactions(address as `0x${string}`, donationAmount);
      await sendTransactions(txs);
      showToast(`Thank you! ${donationAmount} CRC donated.`);
      setBalance((b) => (b ?? 0) + donationAmount);
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Donation failed', 'error');
    } finally {
      setLoading(false);
    }
  }

  return (
    <MetricsPanel muted className="gap-6 px-5 py-6">
      <div className="flex flex-col gap-1">
        <MetricsPanelTitle>THP For Good DAO Treasury</MetricsPanelTitle>
        <MetricsPanelMono>
          {FOUNDATION_ADDRESS.slice(0, 10)}…{FOUNDATION_ADDRESS.slice(-8)}
        </MetricsPanelMono>
      </div>

      <div className="flex flex-col items-center gap-2 text-center">
        <span className="text-5xl font-extrabold leading-none tracking-tight">
          {balance === null ? '—' : <CountUp key={raised} value={pct} suffix="%" />}
        </span>
        <span className="text-sm text-muted-foreground">goal: {fmt(FORMATION_GOAL_CRC)} CRC</span>
        <div className="h-3 w-full max-w-md rounded-full bg-muted overflow-hidden">
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
          {balance === null
            ? 'Loading balance…'
            : `${fmt(raised)} CRC raised — funds one free THP formation at ${pct >= 100 ? '🎉 goal reached!' : `${pct}%`}`}
        </p>
      </div>

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
