import { NextRequest, NextResponse } from 'next/server';
import db, { insertBooking, getMentorById, getBookingsByProviderAddress } from '@/lib/db';
import { isAdminRequest } from '@/lib/api-auth';

export function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const address = searchParams.get('address');
  const providerAddress = searchParams.get('provider_address');

  if (providerAddress) {
    const bookings = getBookingsByProviderAddress(providerAddress);
    return NextResponse.json(bookings);
  }

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
    slot_time?: string;
    attendee_name?: string;
    attendee_email?: string;
  };

  let calBookingUid: string | undefined;

  if (data.slot_time && data.attendee_email) {
    const mentor = getMentorById(data.mentor_id);
    if (mentor?.cal_event_type_id) {
      try {
        const { createCalBooking } = await import('@/lib/calcom');
        const result = await createCalBooking({
          eventTypeId: mentor.cal_event_type_id,
          slotTime: data.slot_time,
          attendeeName: data.attendee_name ?? data.booker_address,
          attendeeEmail: data.attendee_email,
          notes: `CRC payment tx: ${data.tx_hash ?? 'pending'}`,
        });
        calBookingUid = result?.uid;
      } catch (err) {
        console.error('[api/bookings] Cal.com booking failed:', err);
      }
    }
  }

  try {
    const id = insertBooking({
      mentor_id: data.mentor_id,
      booker_address: data.booker_address,
      tx_hash: data.tx_hash,
      slot_time: data.slot_time,
      cal_booking_uid: calBookingUid,
    });
    return NextResponse.json({ id, cal_booking_uid: calBookingUid ?? null }, { status: 201 });
  } catch (err) {
    console.error('[api/bookings POST]', err);
    return NextResponse.json({ error: 'Failed to create booking' }, { status: 500 });
  }
}
