export const TREASURY_TX_QUERY_PARAM = 'treasury-tx';

const STORAGE_KEY = 'thp-treasury-celebrate';

export function storeTreasuryPayCelebration(txHash: string, nominalCrc: number) {
  if (typeof sessionStorage === 'undefined') return;
  sessionStorage.setItem(
    STORAGE_KEY,
    JSON.stringify({ txHash: txHash.toLowerCase(), nominalCrc }),
  );
}

export function readTreasuryPayCelebration(txHash: string): number | null {
  if (typeof sessionStorage === 'undefined') return null;
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as { txHash?: string; nominalCrc?: number };
    if (parsed.txHash?.toLowerCase() === txHash.toLowerCase()) {
      sessionStorage.removeItem(STORAGE_KEY);
      return typeof parsed.nominalCrc === 'number' ? parsed.nominalCrc : null;
    }
  } catch {
    // ignore malformed storage
  }
  return null;
}

export function aboutTreasuryPayPath(txHash: string) {
  return `/about?${TREASURY_TX_QUERY_PARAM}=${encodeURIComponent(txHash)}`;
}
