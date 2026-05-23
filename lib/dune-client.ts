import type { StatsDuneAggregate } from '@/lib/stats-api';

const DUNE_API_BASE = 'https://api.dune.com/api/v1';

export type DuneQueryRow = Record<string, unknown>;

function parseNumeric(value: unknown): number | null {
  if (typeof value === 'number' && Number.isFinite(value)) return value;
  if (typeof value === 'string') {
    const n = parseFloat(value);
    return Number.isFinite(n) ? n : null;
  }
  return null;
}

async function fetchQueryScalar(queryId: string, apiKey: string): Promise<number | null> {
  const res = await fetch(`${DUNE_API_BASE}/query/${queryId}/results?limit=1`, {
    headers: { 'X-Dune-API-Key': apiKey },
    next: { revalidate: 0 },
  });
  if (!res.ok) return null;
  const json = (await res.json()) as {
    result?: { rows?: DuneQueryRow[] };
  };
  const row = json.result?.rows?.[0];
  if (!row) return null;
  const firstKey = Object.keys(row)[0];
  if (!firstKey) return null;
  return parseNumeric(row[firstKey]);
}

/** Fetch aggregate KPIs from configured Dune query IDs (server-only). */
export async function fetchDuneKpis(): Promise<StatsDuneAggregate | null> {
  const apiKey = process.env.DUNE_API_KEY?.trim();
  if (!apiKey) return null;

  const treasuryQueryId = process.env.DUNE_QUERY_TREASURY_CRC?.trim();
  const expertsQueryId = process.env.DUNE_QUERY_EXPERTS_CRC?.trim();
  const paidTxQueryId = process.env.DUNE_QUERY_PAID_TX_COUNT?.trim();

  if (!treasuryQueryId && !expertsQueryId && !paidTxQueryId) return null;

  const [crcToTreasury, crcToExperts, paidTxCount] = await Promise.all([
    treasuryQueryId ? fetchQueryScalar(treasuryQueryId, apiKey) : Promise.resolve(null),
    expertsQueryId ? fetchQueryScalar(expertsQueryId, apiKey) : Promise.resolve(null),
    paidTxQueryId ? fetchQueryScalar(paidTxQueryId, apiKey) : Promise.resolve(null),
  ]);

  if (crcToTreasury == null && crcToExperts == null && paidTxCount == null) return null;

  return {
    crcToTreasury,
    crcToExperts,
    paidTxCount,
    cachedAt: new Date().toISOString(),
    source: 'dune',
  };
}

export function getDuneGnosisEmbedUrl(): string | null {
  const url = process.env.NEXT_PUBLIC_DUNE_GNOSIS_EMBED_URL?.trim();
  return url || null;
}

export function getDuneThpEmbedUrl(): string | null {
  const url = process.env.NEXT_PUBLIC_DUNE_THP_EMBED_URL?.trim();
  return url || null;
}
