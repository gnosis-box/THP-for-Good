import { NextRequest, NextResponse } from 'next/server';

import { insertTrustAttestation } from '@/lib/db';

/**
 * POST /api/trust
 * Body: { booking_id: number; trust_tx_hash?: string }
 *
 * Records that the booker trusted the expert on-chain.
 * Best-effort — the on-chain trust is the source of truth.
 */
export async function POST(request: NextRequest) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  if (
    typeof body !== 'object' ||
    body === null ||
    typeof (body as Record<string, unknown>).booking_id !== 'number'
  ) {
    return NextResponse.json({ error: 'booking_id is required' }, { status: 400 });
  }

  const { booking_id, trust_tx_hash } = body as {
    booking_id: number;
    trust_tx_hash?: string;
  };

  if (
    trust_tx_hash != null &&
    (typeof trust_tx_hash !== 'string' || !/^0x[a-fA-F0-9]{64}$/.test(trust_tx_hash.trim()))
  ) {
    return NextResponse.json({ error: 'Invalid trust_tx_hash' }, { status: 400 });
  }

  try {
    insertTrustAttestation(booking_id, trust_tx_hash?.trim() || null);
    console.info(`[api/trust] booking ${booking_id} trusted`);
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error('[api/trust]', { booking_id, err });
    return NextResponse.json({ error: 'Failed to record trust attestation' }, { status: 500 });
  }
}
