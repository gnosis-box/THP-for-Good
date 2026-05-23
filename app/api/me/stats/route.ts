import { NextRequest, NextResponse } from 'next/server';

import { explorerLinksForAddress } from '@/lib/analytics-explorer';
import { fetchAvatarBalanceCrc } from '@/lib/analytics-rpc';
import {
  getMentorBookingIntentCount,
  getMentorByCirclesAddress,
  getMentorPaidBookingCount,
  getMentorTrustAttestationCount,
} from '@/lib/db';
import type { MeStatsResponse } from '@/lib/me-stats-api';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  const address = request.headers.get('x-wallet-address')?.trim();
  if (!address) {
    return NextResponse.json({ error: 'Wallet address required' }, { status: 401 });
  }

  const mentor = getMentorByCirclesAddress(address);
  if (!mentor || mentor.active !== 1) {
    return NextResponse.json({ error: 'Not an active expert' }, { status: 404 });
  }

  const links = explorerLinksForAddress(mentor.circles_address);
  const balanceCrc = await fetchAvatarBalanceCrc(mentor.circles_address);

  const body: MeStatsResponse = {
    mentorId: mentor.id,
    mentorName: mentor.name,
    address: links.address,
    balanceCrc,
    eventsUrl: links.eventsUrl,
    graphUrl: links.graphUrl,
    paidBookingCount: getMentorPaidBookingCount(mentor.id),
    bookingIntentCount: getMentorBookingIntentCount(mentor.id),
    trustAttestationCount: getMentorTrustAttestationCount(mentor.id),
  };

  return NextResponse.json(body);
}
