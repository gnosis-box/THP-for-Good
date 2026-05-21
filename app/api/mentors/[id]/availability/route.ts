import { NextResponse } from 'next/server';
import { getMentorById } from '@/lib/db';
import { getAvailableSlots } from '@/lib/googleCalendar';

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const mentor = getMentorById(parseInt(id, 10));

  if (!mentor) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  if (!mentor.google_calendar_id) return NextResponse.json([]);

  try {
    const slots = await getAvailableSlots(mentor.google_calendar_id);
    return NextResponse.json(slots);
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Calendar unavailable';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
