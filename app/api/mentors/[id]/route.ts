import { NextRequest, NextResponse } from 'next/server';
import db, { getMentorById } from '@/lib/db';
import { isAdminRequest } from '@/lib/api-auth';
import { clampMentorShare } from '@/lib/crc-pay';
import {
  normalizeMentorLanguages,
  serializeCallLanguageCodes,
  serializeLanguageCodes,
} from '@/lib/languages';

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
  const { id: rawId } = await params;
  const id = parseInt(rawId, 10);
  if (isNaN(id)) {
    return NextResponse.json({ error: 'Invalid id' }, { status: 400 });
  }

  const existing = getMentorById(id);
  if (!existing) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }

  const caller = (request.headers.get('x-wallet-address') ?? '').toLowerCase();
  const isSelf = !!caller && caller === existing.circles_address.toLowerCase();
  if (!isAdminRequest(request) && !isSelf) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
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

  const allowed = [
    'name',
    'bio',
    'calendar_link',
    'cal_event_type_id',
    'price_crc',
    'active',
    'mentor_share_percent',
    'spoken_languages',
    'call_languages',
  ] as const;
  for (const key of allowed) {
    if (key in patch) {
      if (key === 'spoken_languages' || key === 'call_languages') {
        continue;
      }
      fields.push(`${key} = ?`);
      values.push(
        key === 'mentor_share_percent'
          ? clampMentorShare(Number(patch[key]))
          : patch[key],
      );
    }
  }

  if ('spoken_languages' in patch || 'call_languages' in patch) {
    const spokenRaw = patch.spoken_languages ?? existing.spoken_languages;
    const callRaw = patch.call_languages ?? existing.call_languages;
    const languages = normalizeMentorLanguages(spokenRaw, callRaw);
    if ('error' in languages) {
      return NextResponse.json({ error: languages.error }, { status: 400 });
    }
    fields.push('spoken_languages = ?', 'call_languages = ?');
    values.push(
      serializeLanguageCodes(languages.spoken_languages),
      serializeCallLanguageCodes(languages.call_languages),
    );
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
