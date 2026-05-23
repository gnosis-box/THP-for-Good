import { NextResponse } from 'next/server';

import {
  explorerLinksForAddress,
  getAnalyticsStartBlock,
  TREASURY_ORG_ADDRESS,
} from '@/lib/analytics-explorer';
import {
  fetchAvatarBalanceCrc,
  fetchAvatarBalancesCrc,
  getStatsMaxExpertBalances,
} from '@/lib/analytics-rpc';
import { getAllMentors, getStatsEnrichment, getStatsReconcile } from '@/lib/db';
import type { StatsApiResponse } from '@/lib/stats-api';
import { fetchWebAnalytics } from '@/lib/umami-share-client';

export const dynamic = 'force-dynamic';

export async function GET() {
  const treasuryLinks = explorerLinksForAddress(TREASURY_ORG_ADDRESS);

  const mentorRows = getAllMentors(undefined, false);
  const maxBalances = getStatsMaxExpertBalances();
  const balanceCap = mentorRows.length > maxBalances;
  const mentorsForBalance = balanceCap ? mentorRows.slice(0, maxBalances) : mentorRows;

  const expertLinks = mentorRows.map((m) => {
    const links = explorerLinksForAddress(m.circles_address);
    return {
      id: m.id,
      name: m.name,
      address: links.address,
      eventsUrl: links.eventsUrl,
      graphUrl: links.graphUrl,
    };
  });

  const [treasuryBalanceCrc, expertBalanceMap, webAnalytics] = await Promise.all([
    fetchAvatarBalanceCrc(TREASURY_ORG_ADDRESS),
    fetchAvatarBalancesCrc(mentorsForBalance.map((m) => m.circles_address)),
    fetchWebAnalytics(),
  ]);

  const experts = expertLinks.map((expert) => ({
    ...expert,
    balanceCrc: expertBalanceMap.get(expert.address) ?? null,
  }));

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
      expertBalancesTruncated: balanceCap,
    },
  };

  return NextResponse.json(body, {
    headers: {
      'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=60',
    },
  });
}
