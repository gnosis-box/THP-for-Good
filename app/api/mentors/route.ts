import { NextRequest, NextResponse } from 'next/server';
import { getAllMentors, insertMentor } from '@/lib/db';
import { isAdminRequest } from '@/lib/api-auth';
import { clampMentorShare } from '@/lib/crc-pay';

export function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const skill = searchParams.get('skill') ?? undefined;
  const q = searchParams.get('q')?.toLowerCase();
  const all = searchParams.get('all') === '1' && isAdminRequest(request);

  let mentors = getAllMentors(skill, all);

  if (q) {
    mentors = mentors.filter(
      (m) =>
        m.name.toLowerCase().includes(q) ||
        (m.bio ?? '').toLowerCase().includes(q) ||
        m.skills.some((s) => s.toLowerCase().includes(q)),
    );
  }

  return NextResponse.json(mentors);
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
    typeof (body as Record<string, unknown>).circles_address !== 'string' ||
    typeof (body as Record<string, unknown>).name !== 'string' ||
    !Array.isArray((body as Record<string, unknown>).skills)
  ) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
  }

  const data = body as {
    circles_address: string;
    name: string;
    bio?: string;
    calendar_link?: string;
    google_calendar_id?: string;
    cal_event_type_id?: number;
    price_crc?: number;
    mentor_share_percent?: number;
    skills: string[];
  };

  if (!data.circles_address.trim()) {
    return NextResponse.json({ error: 'circles_address is required' }, { status: 400 });
  }
  if (!data.name.trim()) {
    return NextResponse.json({ error: 'Name is required' }, { status: 400 });
  }
  if (!data.skills.every((s) => typeof s === 'string')) {
    return NextResponse.json({ error: 'skills must be an array of strings' }, { status: 400 });
  }

  try {
    const id = insertMentor({
      circles_address: data.circles_address,
      name: data.name.trim(),
      bio: data.bio?.trim(),
      calendar_link: data.calendar_link?.trim() ?? '',
      google_calendar_id: data.google_calendar_id?.trim() || undefined,
      cal_event_type_id: data.cal_event_type_id,
      price_crc: data.price_crc,
      mentor_share_percent: clampMentorShare(data.mentor_share_percent ?? 20),
      skills: data.skills,
    });
    return NextResponse.json({ id }, { status: 201 });
  } catch (err) {
    console.error('[api/mentors POST]', err);
    return NextResponse.json({ error: 'Failed to register mentor' }, { status: 500 });
  }
}
