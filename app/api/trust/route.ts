import { NextRequest, NextResponse } from 'next/server';

/**
 * POST /api/trust
 * Body: { booking_id: number; trust_tx_hash?: string }
 *
 * Records that the booker trusted the mentor on-chain.
 * Best-effort — the on-chain trust is the source of truth.
 * Returns 200 OK. Failure is intentionally non-blocking for the client.
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

  // TODO: persist trust record to DB when the schema has a trust_events table.
  // For now, just acknowledge the call.
  const { booking_id } = body as { booking_id: number; trust_tx_hash?: string };
  console.log(`[api/trust] booking ${booking_id} trusted`);

  return NextResponse.json({ ok: true });
}
