import { NextRequest, NextResponse } from 'next/server';
import db, { getMentorById } from '@/lib/db';
import { isAdminRequest } from '@/lib/admin';

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id: rawId } = await params;
  const id = parseInt(rawId, 10);
  if (isNaN(id)) {
    return NextResponse.json({ error: 'Invalid id' }, { status: 400 });
  }
  const mentor = getMentorById(id);
  if (!mentor) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }
  return NextResponse.json(mentor);
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  if (!isAdminRequest(request)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const { id: rawId } = await params;
  const id = parseInt(rawId, 10);
  if (isNaN(id)) {
    return NextResponse.json({ error: 'Invalid id' }, { status: 400 });
  }

  const existing = getMentorById(id);
  if (!existing) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  if (typeof body !== 'object' || body === null) {
    return NextResponse.json({ error: 'Body must be an object' }, { status: 400 });
  }

  const patch = body as Record<string, unknown>;

  const fields: string[] = [];
  const values: unknown[] = [];

  const allowed = ['name', 'bio', 'calendar_link', 'price_crc', 'active'] as const;
  for (const key of allowed) {
    if (key in patch) {
      fields.push(`${key} = ?`);
      values.push(patch[key]);
    }
  }

  if (fields.length > 0) {
    values.push(id);
    db.prepare(`UPDATE mentors SET ${fields.join(', ')} WHERE id = ?`).run(...values);
  }

  if ('skills' in patch) {
    const skills = patch.skills;
    if (!Array.isArray(skills) || !skills.every((s) => typeof s === 'string')) {
      return NextResponse.json({ error: 'skills must be an array of strings' }, { status: 400 });
    }
    db.prepare('DELETE FROM mentor_skills WHERE mentor_id = ?').run(id);
    const insertSkill = db.prepare(
      'INSERT OR IGNORE INTO mentor_skills (mentor_id, tag_id) SELECT ?, id FROM skill_tags WHERE label = ?',
    );
    for (const skill of skills as string[]) {
      insertSkill.run(id, skill);
    }
  }

  const updated = getMentorById(id);
  return NextResponse.json(updated);
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  if (!isAdminRequest(request)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const { id: rawId } = await params;
  const id = parseInt(rawId, 10);
  if (isNaN(id)) {
    return NextResponse.json({ error: 'Invalid id' }, { status: 400 });
  }

  db.prepare('UPDATE mentors SET active = 0 WHERE id = ?').run(id);
  return NextResponse.json({ ok: true });
}
