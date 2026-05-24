'use client';

import { useState } from 'react';

import { useTreasuryCoinDevFire } from '@/hooks/use-treasury-coin-dev-fire';
import { cn } from '@/lib/utils';

const IS_DEV = process.env.NODE_ENV === 'development';

/** Floating panel — off by default (see TreasuryProviders). URL/console work via TreasuryCoinDevController. */
export const TREASURY_COIN_DEV_PANEL_ENABLED = false;

export function TreasuryCoinDevPanel() {
  const [open, setOpen] = useState(false);
  const [amount, setAmount] = useState('10');
  const [lastTx, setLastTx] = useState<string | null>(null);

  const parsedAmount = Number.parseFloat(amount);
  const nominalCrc = Number.isFinite(parsedAmount) && parsedAmount > 0 ? parsedAmount : 10;

  const { fireInbound, fireDonate, firePay } = useTreasuryCoinDevFire({
    nominalCrc,
    onFired: (txHash) => setLastTx(txHash.slice(0, 18)),
  });

  if (!IS_DEV || !TREASURY_COIN_DEV_PANEL_ENABLED) return null;

  return (
    <div
      className={cn(
        'fixed bottom-4 left-4 z-[60] max-w-xs rounded-lg border border-dashed border-amber-500/50',
        'bg-background/95 p-2 text-xs shadow-lg backdrop-blur-sm',
      )}
    >
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-between gap-2 font-mono text-amber-400"
      >
        <span>Treasury coin demo</span>
        <span>{open ? '▾' : '▸'}</span>
      </button>

      {open && (
        <div className="mt-2 flex flex-col gap-2">
          <label className="flex items-center gap-2 text-muted-foreground">
            CRC
            <input
              type="number"
              min={1}
              step={1}
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-20 rounded border border-border bg-background px-2 py-1 tabular-nums text-foreground"
            />
          </label>

          <div className="flex flex-wrap gap-1">
            <DemoButton label="External +CRC" onClick={() => fireInbound({ spawn: 'external' })} />
            <DemoButton label="Donate btn" onClick={() => fireDonate()} />
            <DemoButton label="Pay leg" onClick={() => firePay()} />
          </div>

          {lastTx && (
            <p className="truncate font-mono text-[10px] text-muted-foreground">last {lastTx}…</p>
          )}

          <p className="text-[10px] leading-snug text-muted-foreground">
            URL:{' '}
            <code className="text-foreground">?demo-coin=10&amp;demo-from=external|button|pay</code>
            <br />
            Console:{' '}
            <code className="text-foreground">__THP_TREASURY_DEMO__.fireDonate(25)</code>
          </p>
        </div>
      )}
    </div>
  );
}

function DemoButton({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="rounded border border-amber-500/40 px-2 py-1 text-[11px] text-amber-200 hover:bg-amber-500/10"
    >
      {label}
    </button>
  );
}
