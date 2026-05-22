import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';
import { isAdminRequest } from '@/lib/admin';

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
