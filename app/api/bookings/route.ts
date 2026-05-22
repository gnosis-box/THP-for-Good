import { NextRequest, NextResponse } from 'next/server';
import db, { insertBooking } from '@/lib/db';
import { isAdminRequest } from '@/lib/admin';

export function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const address = searchParams.get('address');

  if (address) {
    const bookings = db
      .prepare(
        `SELECT b.*, m.name AS mentor_name
         FROM bookings b
         JOIN mentors m ON m.id = b.mentor_id
         WHERE b.booker_address = ?
         ORDER BY b.created_at DESC`,
      )
      .all(address);
    return NextResponse.json(bookings);
  }

  if (!isAdminRequest(request)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const bookings = db
    .prepare(
      `SELECT b.*, m.name AS mentor_name
       FROM bookings b
       JOIN mentors m ON m.id = b.mentor_id
       ORDER BY b.created_at DESC`,
    )
    .all();
  return NextResponse.json(bookings);
}

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
    typeof (body as Record<string, unknown>).mentor_id !== 'number' ||
    typeof (body as Record<string, unknown>).booker_address !== 'string'
  ) {
    return NextResponse.json({ error: 'mentor_id and booker_address are required' }, { status: 400 });
  }

  const data = body as {
    mentor_id: number;
    booker_address: string;
    tx_hash?: string;
  };

  try {
    const id = insertBooking({
      mentor_id: data.mentor_id,
      booker_address: data.booker_address,
      tx_hash: data.tx_hash,
    });
    return NextResponse.json({ id }, { status: 201 });
  } catch (err) {
    console.error('[api/bookings POST]', err);
    return NextResponse.json({ error: 'Failed to create booking' }, { status: 500 });
  }
}
