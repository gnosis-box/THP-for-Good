import { NextRequest, NextResponse } from 'next/server';
import { getAllMentors, insertMentor } from '@/lib/db';

function isAdmin(req: Request): boolean {
  const admins = (process.env.ADMIN_ADDRESSES ?? '').toLowerCase().split(',').filter(Boolean);
  const caller = (req.headers.get('x-wallet-address') ?? '').toLowerCase();
  return admins.includes(caller);
}

export function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const skill = searchParams.get('skill') ?? undefined;
  const q = searchParams.get('q')?.toLowerCase();
  const all = searchParams.get('all') === '1' && isAdmin(request);

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
    typeof (body as Record<string, unknown>).calendar_link !== 'string' ||
    !Array.isArray((body as Record<string, unknown>).skills)
  ) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
  }

  const data = body as {
    circles_address: string;
    name: string;
    bio?: string;
    calendar_link: string;
    price_crc?: number;
    skills: string[];
  };

  if (!data.circles_address.trim()) {
    return NextResponse.json({ error: 'circles_address is required' }, { status: 400 });
  }
  if (!data.name.trim()) {
    return NextResponse.json({ error: 'Name is required' }, { status: 400 });
  }
  if (!data.calendar_link.trim()) {
    return NextResponse.json({ error: 'Calendar link is required' }, { status: 400 });
  }
  if (!data.skills.every((s) => typeof s === 'string')) {
    return NextResponse.json({ error: 'skills must be an array of strings' }, { status: 400 });
  }

  try {
    const id = insertMentor({
      circles_address: data.circles_address,
      name: data.name.trim(),
      bio: data.bio?.trim(),
      calendar_link: data.calendar_link.trim(),
      price_crc: data.price_crc,
      skills: data.skills,
    });
    return NextResponse.json({ id }, { status: 201 });
  } catch (err) {
    console.error('[api/mentors POST]', err);
    return NextResponse.json({ error: 'Failed to register mentor' }, { status: 500 });
  }
}
