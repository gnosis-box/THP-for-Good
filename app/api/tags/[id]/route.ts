import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';
import { isAdminRequest } from '@/lib/api-auth';

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

  let body: unknown;
  try { body = await request.json(); } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const label = (body as Record<string, unknown>).label;
  if (typeof label !== 'string' || !label.trim()) {
    return NextResponse.json({ error: 'label is required' }, { status: 400 });
  }

  db.prepare('UPDATE skill_tags SET label = ? WHERE id = ?').run(label.trim(), id);
  return NextResponse.json({ ok: true });
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

  db.prepare('DELETE FROM skill_tags WHERE id = ?').run(id);
  return NextResponse.json({ ok: true });
}
