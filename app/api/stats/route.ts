import { NextResponse } from 'next/server';

import {
  explorerLinksForAddress,
  getAnalyticsStartBlock,
  getGroupAddress,
  TREASURY_ORG_ADDRESS,
} from '@/lib/analytics-explorer';
import { fetchAvatarBalanceCrc } from '@/lib/analytics-rpc';
import { getAllMentors, getStatsEnrichment, getStatsReconcile } from '@/lib/db';
import type { StatsApiResponse } from '@/lib/stats-api';

export const dynamic = 'force-dynamic';

export async function GET() {
  const treasuryLinks = explorerLinksForAddress(TREASURY_ORG_ADDRESS);
  const groupAddress = getGroupAddress();
  const groupLinks = explorerLinksForAddress(groupAddress);

  const experts = getAllMentors(undefined, false).map((m) => {
    const links = explorerLinksForAddress(m.circles_address);
    return {
      id: m.id,
      name: m.name,
      address: links.address,
      eventsUrl: links.eventsUrl,
      graphUrl: links.graphUrl,
    };
  });

  const [treasuryBalanceCrc, groupBalanceCrc] = await Promise.all([
    fetchAvatarBalanceCrc(TREASURY_ORG_ADDRESS),
    fetchAvatarBalanceCrc(groupAddress),
  ]);

  const body: StatsApiResponse = {
    treasury: {
      address: treasuryLinks.address,
      balanceCrc: treasuryBalanceCrc,
      eventsUrl: treasuryLinks.eventsUrl,
      graphUrl: treasuryLinks.graphUrl,
    },
    group: {
      address: groupLinks.address,
      balanceCrc: groupBalanceCrc,
      eventsUrl: groupLinks.eventsUrl,
      graphUrl: groupLinks.graphUrl,
    },
    experts,
    enrichment: getStatsEnrichment(),
    reconcile: getStatsReconcile(),
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
