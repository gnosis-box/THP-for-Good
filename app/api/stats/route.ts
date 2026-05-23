import { NextResponse } from 'next/server';

import {
  explorerLinksForAddress,
  getAnalyticsStartBlock,
  TREASURY_ORG_ADDRESS,
} from '@/lib/analytics-explorer';
import { fetchAvatarBalanceCrc } from '@/lib/analytics-rpc';
import { getAllMentors, getExpertPaidSessionCounts, getStatsEnrichment, getStatsReconcile } from '@/lib/db';
import type { StatsApiResponse } from '@/lib/stats-api';
import { fetchWebAnalytics } from '@/lib/umami-share-client';

export const dynamic = 'force-dynamic';

export async function GET() {
  const treasuryLinks = explorerLinksForAddress(TREASURY_ORG_ADDRESS);

  const mentorRows = getAllMentors(undefined, false);
  const paidSessionCounts = getExpertPaidSessionCounts();

  const experts = mentorRows.map((m) => {
    const links = explorerLinksForAddress(m.circles_address);
    return {
      id: m.id,
      name: m.name,
      address: links.address,
      paidSessionCount: paidSessionCounts.get(m.id) ?? 0,
      eventsUrl: links.eventsUrl,
      graphUrl: links.graphUrl,
    };
  });

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
