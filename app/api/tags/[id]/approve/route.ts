import { NextRequest, NextResponse } from 'next/server';
import { approveSkillTag } from '@/lib/db';
import { isAdminRequest } from '@/lib/api-auth';

export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  if (!isAdminRequest(_request)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const { id: rawId } = await params;
  const id = parseInt(rawId, 10);
  if (isNaN(id)) {
    return NextResponse.json({ error: 'Invalid id' }, { status: 400 });
  }

  approveSkillTag(id);
  return NextResponse.json({ ok: true });
}
