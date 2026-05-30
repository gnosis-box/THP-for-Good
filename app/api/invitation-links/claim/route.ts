import { NextResponse } from 'next/server';
import { claimNextInvitationLink } from '@/lib/db';
import { getDefaultOnboardingFallbackUrl } from '@/lib/invitation-links';

type ClaimBody = {
  wallet_address?: string;
};

export async function POST(request: Request) {
  let body: ClaimBody = {};
  try {
    body = (await request.json()) as ClaimBody;
  } catch {
    // Accept empty body.
  }

  const consumer =
    typeof body.wallet_address === 'string' && body.wallet_address.trim()
      ? body.wallet_address.trim().toLowerCase()
      : 'anonymous';

  const claimed = claimNextInvitationLink(consumer);
  if (claimed) {
    return NextResponse.json({
      ok: true,
      source: 'pool',
      invitation_url: claimed.url,
      link_id: claimed.id,
    });
  }

  return NextResponse.json({
    ok: true,
    source: 'fallback',
    invitation_url: getDefaultOnboardingFallbackUrl(),
    reason: 'empty_pool',
  });
}
