import { google } from 'googleapis';

const SESSION_MINUTES = 60;
const SLOT_HOURS = [9, 10, 11, 12, 13, 14, 15, 16]; // 9am–5pm start slots (Europe/Paris ~ UTC+1/+2)
const TZ = 'Europe/Paris';

function getAuth() {
  const raw = process.env.GOOGLE_SERVICE_ACCOUNT_KEY;
  if (!raw) throw new Error('GOOGLE_SERVICE_ACCOUNT_KEY not configured');
  const creds = JSON.parse(raw) as { client_email: string; private_key: string };
  return new google.auth.JWT({
    email: creds.client_email,
    key: creds.private_key,
    scopes: ['https://www.googleapis.com/auth/calendar'],
  });
}

function slotsForDay(date: Date): Date[] {
  return SLOT_HOURS.map((h) => {
    const d = new Date(date);
    d.setHours(h, 0, 0, 0);
    return d;
  });
}

export async function getAvailableSlots(calendarId: string, daysAhead = 14): Promise<string[]> {
  const auth = getAuth();
  const calendar = google.calendar({ version: 'v3', auth });

  const now = new Date();
  const timeMax = new Date(now.getTime() + daysAhead * 24 * 60 * 60 * 1000);

  const { data } = await calendar.freebusy.query({
    requestBody: {
      timeMin: now.toISOString(),
      timeMax: timeMax.toISOString(),
      timeZone: TZ,
      items: [{ id: calendarId }],
    },
  });

  const busy = (data.calendars?.[calendarId]?.busy ?? []).map((b) => ({
    start: new Date(b.start!),
    end: new Date(b.end!),
  }));

  const slots: string[] = [];
  const cursor = new Date(now);
  cursor.setDate(cursor.getDate() + 1);
  cursor.setHours(0, 0, 0, 0);

  while (cursor <= timeMax) {
    const dow = cursor.getDay();
    if (dow >= 1 && dow <= 5) {
      for (const slotStart of slotsForDay(cursor)) {
        if (slotStart <= now) continue;
        const slotEnd = new Date(slotStart.getTime() + SESSION_MINUTES * 60_000);
        const overlaps = busy.some((b) => b.start < slotEnd && b.end > slotStart);
        if (!overlaps) slots.push(slotStart.toISOString());
      }
    }
    cursor.setDate(cursor.getDate() + 1);
  }

  return slots;
}

export async function createBookingEvent(
  calendarId: string,
  slotTime: string,
  bookerAddress: string,
  mentorName: string,
): Promise<string | null> {
  const auth = getAuth();
  const calendar = google.calendar({ version: 'v3', auth });

  const start = new Date(slotTime);
  const end = new Date(start.getTime() + SESSION_MINUTES * 60_000);

  const { data } = await calendar.events.insert({
    calendarId,
    requestBody: {
      summary: `THP for Good — Mentoring with ${mentorName}`,
      description: `Booked via THP for Good\nMentee Circles address: ${bookerAddress}`,
      start: { dateTime: start.toISOString(), timeZone: TZ },
      end: { dateTime: end.toISOString(), timeZone: TZ },
    },
  });

  return data.htmlLink ?? null;
}
