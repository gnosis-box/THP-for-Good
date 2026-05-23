import { NextRequest, NextResponse } from 'next/server';
import { getAllMentors, getMentorByCirclesAddress, insertMentor } from '@/lib/db';
import { isAdminRequest } from '@/lib/api-auth';
import { clampMentorShare } from '@/lib/crc-pay';
import { normalizeMentorLanguages } from '@/lib/languages';

export function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const circlesAddress = searchParams.get('circles_address');
  if (circlesAddress) {
    const mentor = getMentorByCirclesAddress(circlesAddress);
    if (!mentor) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }
    return NextResponse.json(mentor);
  }

  const skill = searchParams.get('skill') ?? undefined;
  const callLanguage = searchParams.get('call_language') ?? undefined;
  const q = searchParams.get('q')?.toLowerCase();
  const all = searchParams.get('all') === '1' && isAdminRequest(request);

  let mentors = getAllMentors(skill, all, callLanguage ?? undefined);

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
    spoken_languages?: string[];
    call_languages?: string[];
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

  const languages = normalizeMentorLanguages(
    data.spoken_languages ?? [],
    data.call_languages,
  );
  if ('error' in languages) {
    return NextResponse.json({ error: languages.error }, { status: 400 });
  }

  try {
    const id = insertMentor({
      circles_address: data.circles_address.trim().toLowerCase(),
      name: data.name.trim(),
      bio: data.bio?.trim(),
      calendar_link: data.calendar_link?.trim() ?? '',
      google_calendar_id: data.google_calendar_id?.trim() || undefined,
      cal_event_type_id: data.cal_event_type_id,
      price_crc: data.price_crc,
      mentor_share_percent: clampMentorShare(data.mentor_share_percent ?? 20),
      skills: data.skills,
      spoken_languages: languages.spoken_languages,
      call_languages: languages.call_languages,
    });
    return NextResponse.json({ id }, { status: 201 });
  } catch (err) {
    console.error('[api/mentors POST]', err);
    return NextResponse.json({ error: 'Failed to register mentor' }, { status: 500 });
  }
}
