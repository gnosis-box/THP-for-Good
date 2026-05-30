import { NextRequest, NextResponse } from 'next/server';
import { allocateInviteLink } from '@/lib/invitation-links';
import { walletFromRequest } from '@/lib/api-auth';

export async function POST(request: NextRequest) {
  const wallet = walletFromRequest(request);
  if (!wallet) {
    return NextResponse.json({ error: 'Wallet address required' }, { status: 401 });
  }

  try {
    const result = allocateInviteLink(wallet);
    if (result.kind === 'fallback') {
      return NextResponse.json({ fallback: true });
    }
    return NextResponse.json({ url: result.url });
  } catch (err) {
    console.error('[api/onboarding/invite-link POST]', err);
    return NextResponse.json({ error: 'Failed to allocate invite link' }, { status: 500 });
  }
}
