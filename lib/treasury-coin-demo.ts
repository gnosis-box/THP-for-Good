import type { SpawnRect } from '@/contexts/TreasuryPendingTxContext';

export type TreasuryDemoSpawn = 'external' | 'button' | 'pay';

export type TreasuryDemoFireOptions = {
  nominalCrc?: number;
  spawn?: TreasuryDemoSpawn;
  spawnRect?: SpawnRect;
};

export function demoTxHash(prefix = 'demo'): string {
  const suffix = Math.random().toString(16).slice(2, 10);
  return `0x${prefix}${Date.now().toString(16)}${suffix}`;
}

export function demoButtonSpawnRect(): SpawnRect {
  const el = document.querySelector<HTMLElement>('[data-treasury-donate-btn]');
  if (el) {
    const r = el.getBoundingClientRect();
    if (r.width > 0 && r.height > 0) {
      return { x: r.left, y: r.top, width: r.width, height: r.height };
    }
  }

  const width = 140;
  const height = 40;
  return {
    x: (window.innerWidth - width) / 2,
    y: window.innerHeight - 140,
    width,
    height,
  };
}

export function demoPayButtonSpawnRect(): SpawnRect {
  const el = document.querySelector<HTMLElement>('[data-treasury-pay-btn]');
  if (el) {
    const r = el.getBoundingClientRect();
    if (r.width > 0 && r.height > 0) {
      return { x: r.left, y: r.top, width: r.width, height: r.height };
    }
  }

  const width = 120;
  const height = 44;
  return {
    x: window.innerWidth - width - 24,
    y: window.innerHeight - 200,
    width,
    height,
  };
}

/** Demo / dev-panel tx hashes — skip on-chain reconcile so optimistic bump stays visible. */
export function isDemoTreasuryTx(txHash: string): boolean {
  const h = txHash.toLowerCase();
  return h.startsWith('0xdemo') || h.startsWith('0xlocal');
}

export function parseTreasuryDemoSearchParams(search: string): TreasuryDemoFireOptions | null {
  const params = new URLSearchParams(search);
  const raw = params.get('demo-coin') ?? params.get('demo-treasury');
  if (!raw) return null;

  const nominalCrc = Number.parseFloat(raw);
  if (!Number.isFinite(nominalCrc) || nominalCrc <= 0) return null;

  const spawnParam = params.get('demo-from') ?? params.get('demo-spawn') ?? 'external';
  const spawn =
    spawnParam === 'button' || spawnParam === 'donate'
      ? 'button'
      : spawnParam === 'pay'
        ? 'pay'
        : 'external';

  return { nominalCrc, spawn };
}
