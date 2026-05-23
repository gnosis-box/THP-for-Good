import db from '@/lib/db';
import { fetchDuneKpis } from '@/lib/dune-client';
import type { StatsDuneAggregate } from '@/lib/stats-api';

const CACHE_KEY = 'aggregate_kpis';
const DEFAULT_TTL_MS = 60 * 60 * 1000;

function getTtlMs(): number {
  const raw = process.env.DUNE_CACHE_TTL_SECONDS?.trim();
  if (!raw) return DEFAULT_TTL_MS;
  const sec = Number.parseInt(raw, 10);
  return Number.isFinite(sec) && sec > 0 ? sec * 1000 : DEFAULT_TTL_MS;
}

db.exec(`
  CREATE TABLE IF NOT EXISTS dune_cache (
    cache_key    TEXT PRIMARY KEY,
    payload_json TEXT NOT NULL,
    fetched_at   TEXT NOT NULL
  );
`);

function readCache(): StatsDuneAggregate | null {
  const row = db
    .prepare('SELECT payload_json, fetched_at FROM dune_cache WHERE cache_key = ?')
    .get(CACHE_KEY) as { payload_json: string; fetched_at: string } | undefined;
  if (!row) return null;
  try {
    const parsed = JSON.parse(row.payload_json) as StatsDuneAggregate;
    const ageMs = Date.now() - new Date(row.fetched_at).getTime();
    if (!Number.isFinite(ageMs) || ageMs > getTtlMs()) return null;
    return { ...parsed, cachedAt: row.fetched_at };
  } catch {
    return null;
  }
}

function writeCache(payload: StatsDuneAggregate): void {
  const fetchedAt = new Date().toISOString();
  db.prepare(
    `INSERT INTO dune_cache (cache_key, payload_json, fetched_at) VALUES (?, ?, ?)
     ON CONFLICT(cache_key) DO UPDATE SET payload_json = excluded.payload_json, fetched_at = excluded.fetched_at`,
  ).run(CACHE_KEY, JSON.stringify(payload), fetchedAt);
}

export async function getCachedDuneKpis(): Promise<StatsDuneAggregate | null> {
  const cached = readCache();
  if (cached) return cached;

  const fresh = await fetchDuneKpis();
  if (!fresh) return null;

  writeCache(fresh);
  return fresh;
}
