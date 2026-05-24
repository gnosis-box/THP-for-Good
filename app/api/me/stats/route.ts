import { NextRequest, NextResponse } from 'next/server';

import { explorerLinksForAddress } from '@/lib/analytics-explorer';
import { fetchAvatarBalanceCrc } from '@/lib/analytics-rpc';
import {
  getExpertBookingIntentCount,
  getExpertByCirclesAddress,
  getExpertPaidBookingCount,
  getExpertTrustAttestationCount,
} from '@/lib/db';
import type { MeStatsResponse } from '@/lib/me-stats-api';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  const address = request.headers.get('x-wallet-address')?.trim();
  if (!address) {
    return NextResponse.json({ error: 'Wallet address required' }, { status: 401 });
  }

  const expert = getExpertByCirclesAddress(address);
  if (!expert || expert.active !== 1) {
    return NextResponse.json({ error: 'Not an active expert' }, { status: 404 });
  }

  const links = explorerLinksForAddress(expert.circles_address);
  const balanceCrc = await fetchAvatarBalanceCrc(expert.circles_address);

  const body: MeStatsResponse = {
    expertId: expert.id,
    expertName: expert.name,
    address: links.address,
    balanceCrc,
    eventsUrl: links.eventsUrl,
    graphUrl: links.graphUrl,
    paidBookingCount: getExpertPaidBookingCount(expert.id),
    bookingIntentCount: getExpertBookingIntentCount(expert.id),
    trustAttestationCount: getExpertTrustAttestationCount(expert.id),
  };

  return NextResponse.json(body);
}
