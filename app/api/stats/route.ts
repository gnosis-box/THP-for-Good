import { NextResponse } from 'next/server';

import {
  explorerLinksForAddress,
  getAnalyticsStartBlock,
  getGroupAddress,
  TREASURY_ORG_ADDRESS,
} from '@/lib/analytics-explorer';
import { getAllMentors, getStatsEnrichment, getStatsReconcile } from '@/lib/db';
import type { StatsApiResponse } from '@/lib/stats-api';

export const dynamic = 'force-dynamic';

async function fetchTreasuryBalanceCrc(): Promise<number | null> {
  try {
    const { Sdk } = await import('@aboutcircles/sdk');
    const sdk = new Sdk();
    const view = await sdk.rpc.profile.getProfileView(TREASURY_ORG_ADDRESS);
    if (!view?.v2Balance) return null;
    const n = parseFloat(view.v2Balance as string);
    return Number.isFinite(n) ? n : null;
  } catch {
    return null;
  }
}

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

  const balanceCrc = await fetchTreasuryBalanceCrc();

  const body: StatsApiResponse = {
    treasury: {
      address: treasuryLinks.address,
      balanceCrc,
      eventsUrl: treasuryLinks.eventsUrl,
      graphUrl: treasuryLinks.graphUrl,
    },
    group: {
      address: groupLinks.address,
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
