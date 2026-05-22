import { NextRequest, NextResponse } from 'next/server';
import db, { getAllTags } from '@/lib/db';

function isAdmin(req: Request): boolean {
  const admins = (process.env.ADMIN_ADDRESSES ?? '').toLowerCase().split(',').filter(Boolean);
  const caller = (req.headers.get('x-wallet-address') ?? '').toLowerCase();
  return admins.includes(caller);
}

export function GET() {
  return NextResponse.json(getAllTags());
}

export async function POST(request: NextRequest) {
  if (!isAdmin(request)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  if (
    typeof body !== 'object' ||
    body === null ||
    typeof (body as Record<string, unknown>).label !== 'string' ||
    !(body as Record<string, unknown>).label
  ) {
    return NextResponse.json({ error: 'label is required' }, { status: 400 });
  }

  const { label } = body as { label: string };

  try {
    const result = db.prepare('INSERT INTO skill_tags (label) VALUES (?)').run(label.trim());
    return NextResponse.json({ id: result.lastInsertRowid, label: label.trim() }, { status: 201 });
  } catch (err) {
    console.error('[api/tags POST]', err);
    return NextResponse.json({ error: 'Failed to insert tag' }, { status: 500 });
  }
}
