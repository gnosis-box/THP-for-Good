import { NextResponse } from 'next/server';

import {
  explorerLinksForAddress,
  getAnalyticsStartBlock,
  TREASURY_ORG_ADDRESS,
} from '@/lib/analytics-explorer';
import { fetchAvatarBalanceCrc } from '@/lib/analytics-rpc';
import { getAllExperts, getExpertPaidSessionCounts, getStatsEnrichment, getStatsReconcile } from '@/lib/db';
import type { StatsApiResponse } from '@/lib/stats-api';
import { fetchWebAnalytics } from '@/lib/umami-share-client';

export const dynamic = 'force-dynamic';

export async function GET() {
  const treasuryLinks = explorerLinksForAddress(TREASURY_ORG_ADDRESS);

  const expertRows = getAllExperts(undefined, false);
  const paidSessionCounts = getExpertPaidSessionCounts();

  const experts = expertRows.map((row) => ({
    expert: row,
    paidSessionCount: paidSessionCounts.get(row.id) ?? 0,
  }));

  const [treasuryBalanceCrc, webAnalytics] = await Promise.all([
    fetchAvatarBalanceCrc(TREASURY_ORG_ADDRESS),
    fetchWebAnalytics(),
  ]);

  const body: StatsApiResponse = {
    treasury: {
      address: treasuryLinks.address,
      balanceCrc: treasuryBalanceCrc,
      eventsUrl: treasuryLinks.eventsUrl,
      graphUrl: treasuryLinks.graphUrl,
    },
    experts,
    enrichment: getStatsEnrichment(),
    reconcile: getStatsReconcile(),
    webAnalytics,
    meta: {
      startBlock: getAnalyticsStartBlock(),
      generatedAt: new Date().toISOString(),
    },
  };

  return NextResponse.json(body, {
    headers: {
      'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=60',
    },
  });
}
