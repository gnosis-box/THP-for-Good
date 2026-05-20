import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';

function isAdmin(req: Request): boolean {
  const admins = (process.env.ADMIN_ADDRESSES ?? '').toLowerCase().split(',').filter(Boolean);
  const caller = (req.headers.get('x-wallet-address') ?? '').toLowerCase();
  return admins.includes(caller);
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  if (!isAdmin(request)) {
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
