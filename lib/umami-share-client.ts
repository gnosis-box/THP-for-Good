import { getUmamiApiOrigin, getUmamiShareId, getUmamiShareUrl } from '@/lib/analytics-umami';
import type { WebAnalyticsPayload } from '@/lib/stats-api';

const SHARE_TOKEN_TTL_MS = 4 * 60 * 1000;

type ShareSession = {
  websiteId: string;
  token: string;
  expiresAt: number;
};

type UmamiStatsResponse = {
  pageviews: number;
  visitors: number;
  visits: number;
  bounces: number;
  totaltime: number;
};

let cachedSession: ShareSession | null = null;

function unavailablePayload(periodDays: number): WebAnalyticsPayload {
  return {
    available: false,
    periodDays,
    dashboardUrl: getUmamiShareUrl(),
  };
}

function periodBounds(periodDays: number): { startAt: number; endAt: number } {
  const endAt = Date.now();
  const startAt = endAt - periodDays * 24 * 60 * 60 * 1000;
  return { startAt, endAt };
}

async function fetchJson<T>(url: string, init?: RequestInit): Promise<T | null> {
  try {
    const res = await fetch(url, {
      ...init,
      headers: {
        Accept: 'application/json',
        ...init?.headers,
      },
      next: { revalidate: 300 },
    });
    if (!res.ok) return null;
    return (await res.json()) as T;
  } catch {
    return null;
  }
}

async function getShareSession(origin: string, shareId: string): Promise<ShareSession | null> {
  const now = Date.now();
  if (cachedSession && cachedSession.expiresAt > now) {
    return cachedSession;
  }

  const data = await fetchJson<{ websiteId: string; token: string }>(
    `${origin}/api/share/${shareId}`,
  );
  if (!data?.websiteId || !data?.token) return null;

  cachedSession = {
    websiteId: data.websiteId,
    token: data.token,
    expiresAt: now + SHARE_TOKEN_TTL_MS,
  };
  return cachedSession;
}

export async function fetchWebAnalytics(periodDays = 30): Promise<WebAnalyticsPayload> {
  const dashboardUrl = getUmamiShareUrl();
  const origin = getUmamiApiOrigin();
  const shareId = getUmamiShareId();
  if (!origin || !shareId) {
    return unavailablePayload(periodDays);
  }

  const session = await getShareSession(origin, shareId);
  if (!session) {
    return unavailablePayload(periodDays);
  }

  const { startAt, endAt } = periodBounds(periodDays);
  const range = `startAt=${startAt}&endAt=${endAt}`;
  const base = `${origin}/api/websites/${session.websiteId}`;
  const headers = { 'x-umami-share-token': session.token };

  const stats = await fetchJson<UmamiStatsResponse>(`${base}/stats?${range}`, { headers });

  if (!stats) {
    return unavailablePayload(periodDays);
  }

  const visits = stats.visits;
  const bounceRate = visits > 0 ? stats.bounces / visits : null;
  const avgVisitSeconds = visits > 0 ? Math.round(stats.totaltime / visits) : null;

  return {
    available: true,
    periodDays,
    dashboardUrl,
    visitors: stats.visitors,
    visits: stats.visits,
    pageviews: stats.pageviews,
    bounceRate,
    avgVisitSeconds,
  };
}
