import { NextResponse } from 'next/server';
import { getExpertById } from '@/lib/db';
import { getAvailableSlots } from '@/lib/calcom';

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const expert = getExpertById(parseInt(id, 10));

  if (!expert) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  if (!expert.cal_event_type_id) return NextResponse.json([]);

  try {
    const slots = await getAvailableSlots(expert.cal_event_type_id);
    return NextResponse.json(slots);
  } catch (err) {
    console.error('[availability]', err);
    return NextResponse.json({ error: 'Calendar unavailable' }, { status: 500 });
  }
}
