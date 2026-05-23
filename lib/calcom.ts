const CAL_API = 'https://api.cal.com/v2';
const CAL_VERSION = '2024-08-13';
const CAL_BOOKING_VERSION = '2024-06-14';

function authHeaders(version = CAL_VERSION) {
  const key = process.env.CAL_API_KEY;
  return {
    'cal-api-version': version,
    'Content-Type': 'application/json',
    ...(key ? { Authorization: `Bearer ${key}` } : {}),
  };
}

export async function getAvailableSlots(eventTypeId: number, daysAhead = 14): Promise<string[]> {
  const now = new Date();
  const end = new Date(now.getTime() + daysAhead * 24 * 60 * 60 * 1000);

  const params = new URLSearchParams({
    eventTypeId: String(eventTypeId),
    startTime: now.toISOString(),
    endTime: end.toISOString(),
    timeZone: 'Europe/Paris',
  });

  const res = await fetch(`${CAL_API}/slots/available?${params}`, {
    headers: authHeaders(),
  });

  if (!res.ok) return [];

  const data = (await res.json()) as {
    status: string;
    data?: { slots?: Record<string, { time: string }[]> };
  };

  if (data.status !== 'success' || !data.data?.slots) return [];

  return Object.values(data.data.slots)
    .flat()
    .map((s) => s.time)
    .sort();
}

export async function createCalBooking(params: {
  eventTypeId: number;
  slotTime: string;
  attendeeName: string;
  attendeeEmail: string;
  mentorName: string;
  txHash?: string;
}): Promise<{ uid: string; meetingUrl?: string } | null> {
  const title = `[THP For Good] ${params.attendeeName} => ${params.mentorName}`;
  const notes = [
    params.txHash
      ? `CRC payment tx: https://explorer.aboutcircles.com/tx/${params.txHash}/social-graph`
      : 'CRC payment tx: pending',
    'Need to reschedule or cancel? ( No refunds )',
  ].join('\n');

  const res = await fetch(`${CAL_API}/bookings`, {
    method: 'POST',
    headers: authHeaders(CAL_BOOKING_VERSION),
    body: JSON.stringify({
      eventTypeId: params.eventTypeId,
      start: params.slotTime,
      timeZone: 'Europe/Paris',
      language: 'en',
      title,
      responses: {
        name: params.attendeeName,
        email: params.attendeeEmail,
        notes,
      },
      metadata: {},
    }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => null);
    console.error('[calcom] booking failed', res.status, err);
    return null;
  }

  const data = (await res.json()) as {
    status: string;
    data?: {
      uid: string;
      meetingUrl?: string;
      references?: { meetingUrl?: string }[];
    };
  };
  if (data.status !== 'success' || !data.data?.uid) return null;

  const meetingUrl =
    data.data.meetingUrl ??
    data.data.references?.find((r) => r.meetingUrl)?.meetingUrl;

  return { uid: data.data.uid, meetingUrl };
}
