import { NextRequest, NextResponse } from 'next/server';
import db, {
  insertBooking,
  getExpertById,
  getBookingsByProviderAddress,
  getBookingByTxHash,
} from '@/lib/db';
import { isAdminRequest } from '@/lib/api-auth';

function bookingResponse(row: {
  id: number;
  cal_booking_uid?: string | null;
  calendar_event_url?: string | null;
}) {
  return NextResponse.json(
    {
      id: row.id,
      cal_booking_uid: row.cal_booking_uid ?? null,
      calendar_event_url: row.calendar_event_url ?? null,
    },
    { status: 200 },
  );
}

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
        `SELECT b.*, m.name AS expert_name
         FROM bookings b
         JOIN experts m ON m.id = b.expert_id
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
      `SELECT b.*, m.name AS expert_name
       FROM bookings b
       JOIN experts m ON m.id = b.expert_id
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
    typeof (body as Record<string, unknown>).expert_id !== 'number' ||
    typeof (body as Record<string, unknown>).booker_address !== 'string'
  ) {
    return NextResponse.json({ error: 'expert_id and booker_address are required' }, { status: 400 });
  }

  const data = body as {
    expert_id: number;
    booker_address: string;
    tx_hash?: string;
    slot_time?: string;
    attendee_name?: string;
    attendee_email?: string;
  };

  if (data.tx_hash?.trim()) {
    const existing = getBookingByTxHash(data.tx_hash);
    if (existing) {
      return bookingResponse({
        id: existing.id,
        cal_booking_uid: existing.cal_booking_uid,
        calendar_event_url: existing.calendar_event_url,
      });
    }
  }

  const expert = getExpertById(data.expert_id);
  if (!expert) {
    console.error('[api/bookings POST] unknown expert_id', data.expert_id);
    return NextResponse.json({ error: 'Expert not found' }, { status: 404 });
  }

  let calBookingUid: string | undefined;
  let calendarEventUrl: string | undefined;

  if (data.slot_time && data.attendee_email) {
    if (expert.cal_event_type_id) {
      try {
        const { createCalBooking, getAvailableSlots } = await import('@/lib/calcom');
        const openSlots = await getAvailableSlots(expert.cal_event_type_id);
        if (!openSlots.includes(data.slot_time)) {
          console.warn('[api/bookings] slot no longer available in Cal.com', data.slot_time);
        } else {
          const result = await createCalBooking({
            eventTypeId: expert.cal_event_type_id,
            slotTime: data.slot_time,
            attendeeName: data.attendee_name ?? data.booker_address,
            attendeeEmail: data.attendee_email,
            txHash: data.tx_hash,
          });
          calBookingUid = result?.uid;
          calendarEventUrl = result?.meetingUrl;
        }
      } catch (err) {
        console.error('[api/bookings] Cal.com booking failed:', err);
      }
    }
  }

  try {
    const id = insertBooking({
      expert_id: data.expert_id,
      booker_address: data.booker_address,
      tx_hash: data.tx_hash,
      slot_time: data.slot_time,
      calendar_event_url: calendarEventUrl,
      cal_booking_uid: calBookingUid,
    });
    return NextResponse.json(
      {
        id,
        cal_booking_uid: calBookingUid ?? null,
        calendar_event_url: calendarEventUrl ?? null,
      },
      { status: 201 },
    );
  } catch (err) {
    const code =
      err instanceof Error && 'code' in err ? String((err as { code: string }).code) : '';
    console.error('[api/bookings POST]', { expert_id: data.expert_id, code, err });
    if (code === 'SQLITE_CONSTRAINT_FOREIGNKEY') {
      return NextResponse.json(
        {
          error:
            'Database migration incomplete for this expert. Payment is on-chain — retry shortly or contact support.',
          code: 'DB_MIGRATION_FK',
          tx_hash: data.tx_hash ?? null,
        },
        { status: 503 },
      );
    }
    if (code === 'SQLITE_CONSTRAINT_UNIQUE') {
      const existing = data.tx_hash ? getBookingByTxHash(data.tx_hash) : undefined;
      if (existing) {
        return bookingResponse({
          id: existing.id,
          cal_booking_uid: existing.cal_booking_uid,
          calendar_event_url: existing.calendar_event_url,
        });
      }
    }
    return NextResponse.json({ error: 'Failed to create booking' }, { status: 500 });
  }
}
