/** Live Circles RPC reads for public stats — no wallet or booking data. */

import { TREASURY_ORG_ADDRESS } from '@/lib/analytics-explorer';

const DEFAULT_RPC_TIMEOUT_MS = 8_000;

/** Client or server: THP for Good DAO treasury CRC balance. */
export async function fetchTreasuryBalanceCrc(): Promise<number | null> {
  return fetchAvatarBalanceCrc(TREASURY_ORG_ADDRESS);
}

export function getStatsMaxExpertBalances(): number {
  const raw = process.env.THP_STATS_MAX_EXPERT_BALANCES?.trim();
  if (!raw) return 15;
  const n = Number.parseInt(raw, 10);
  return Number.isFinite(n) && n > 0 ? n : 15;
}

export async function fetchAvatarBalanceCrc(address: string): Promise<number | null> {
  try {
    const { Sdk } = await import('@aboutcircles/sdk');
    const sdk = new Sdk();
    const view = await sdk.rpc.profile.getProfileView(address as `0x${string}`);
    if (!view?.v2Balance) return null;
    const n = parseFloat(view.v2Balance as string);
    return Number.isFinite(n) ? n : null;
  } catch {
    return null;
  }
}

function withTimeout<T>(promise: Promise<T>, timeoutMs: number): Promise<T> {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) => {
      setTimeout(() => reject(new Error('rpc timeout')), timeoutMs);
    }),
  ]);
}

/** Batch balance reads with bounded concurrency (public stats only). */
export async function fetchAvatarBalancesCrc(
  addresses: string[],
  options?: { concurrency?: number; timeoutMs?: number },
): Promise<Map<string, number | null>> {
  const concurrency = options?.concurrency ?? 5;
  const timeoutMs = options?.timeoutMs ?? DEFAULT_RPC_TIMEOUT_MS;
  const results = new Map<string, number | null>();

  for (let i = 0; i < addresses.length; i += concurrency) {
    const batch = addresses.slice(i, i + concurrency);
    await Promise.all(
      batch.map(async (addr) => {
        const key = addr.trim().toLowerCase();
        try {
          const balance = await withTimeout(fetchAvatarBalanceCrc(addr), timeoutMs);
          results.set(key, balance);
        } catch {
          results.set(key, null);
        }
      }),
    );
  }

  return results;
}
