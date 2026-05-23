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

/** Share ID segment from public share URL (server + client). */
export function getUmamiShareId(): string | null {
  try {
    const pathname = new URL(getUmamiShareUrl()).pathname;
    const id = pathname.split('/').filter(Boolean).pop();
    return id?.trim() || null;
  } catch {
    return null;
  }
}

/** Umami instance origin for server-side share API calls. */
export function getUmamiApiOrigin(): string | null {
  const scriptUrl = process.env.NEXT_PUBLIC_UMAMI_SCRIPT_URL?.trim();
  if (scriptUrl) {
    try {
      return new URL(scriptUrl).origin;
    } catch {
      // fall through
    }
  }
  const dashboardUrl = process.env.NEXT_PUBLIC_UMAMI_DASHBOARD_URL?.trim();
  if (dashboardUrl) {
    try {
      return new URL(dashboardUrl).origin;
    } catch {
      return null;
    }
  }
  try {
    return new URL(DEFAULT_UMAMI_SHARE_URL).origin;
  } catch {
    return null;
  }
}

/** THP custom Umami events shown on public /stats funnel panel. */
export const THP_UMAMI_FUNNEL_EVENTS = [
  'expert_view',
  'pay_drawer_open',
  'pay_success',
  'trust_click',
] as const;

export function trackUmamiEvent(name: string, data?: UmamiEventPayload): void {
  if (typeof window === 'undefined') return;
  const payload = sanitizePayload(data);
  try {
    window.umami?.track(name, payload);
  } catch {
    // analytics must never break UX
  }
}
