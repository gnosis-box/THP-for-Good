/** UX analytics only — no wallets, emails, CRC amounts, or tx hashes (see spec/analytics-strategy.md §6). */

export type UmamiEventPayload = {
  mentor_id?: number;
};

const ALLOWED_KEYS = new Set(['mentor_id']);

function sanitizePayload(data?: UmamiEventPayload): Record<string, number> | undefined {
  if (!data) return undefined;
  const out: Record<string, number> = {};
  for (const [key, value] of Object.entries(data)) {
    if (!ALLOWED_KEYS.has(key)) continue;
    if (typeof value === 'number' && Number.isFinite(value)) {
      out[key] = value;
    }
  }
  return Object.keys(out).length > 0 ? out : undefined;
}

export function isUmamiEnabled(): boolean {
  return Boolean(
    typeof process !== 'undefined' &&
      process.env.NEXT_PUBLIC_UMAMI_WEBSITE_ID?.trim(),
  );
}

export function getUmamiDashboardUrl(): string | null {
  const url = process.env.NEXT_PUBLIC_UMAMI_DASHBOARD_URL?.trim();
  return url || null;
}

/** Public Umami share dashboard — read-only, no login. */
export const DEFAULT_UMAMI_SHARE_URL =
  'https://stats.thp.gnosis.box/share/JAi7kUoC7s6BvPah' as const;

export function getUmamiShareUrl(): string {
  const url = process.env.NEXT_PUBLIC_UMAMI_SHARE_URL?.trim();
  return url || DEFAULT_UMAMI_SHARE_URL;
}

export function trackUmamiEvent(name: string, data?: UmamiEventPayload): void {
  if (typeof window === 'undefined') return;
  const payload = sanitizePayload(data);
  try {
    window.umami?.track(name, payload);
  } catch {
    // analytics must never break UX
  }
}
