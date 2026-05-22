import { NextRequest, NextResponse } from 'next/server';
import { proposeSkillTag } from '@/lib/db';
import { walletFromRequest } from '@/lib/api-auth';

export async function POST(request: NextRequest) {
  const wallet = walletFromRequest(request);
  if (!wallet) {
    return NextResponse.json({ error: 'Wallet address required' }, { status: 401 });
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
  const trimmed = label.trim();
  if (!trimmed) {
    return NextResponse.json({ error: 'label is required' }, { status: 400 });
  }

  try {
    const id = proposeSkillTag(trimmed);
    return NextResponse.json({ id, label: trimmed, status: 'pending' }, { status: 201 });
  } catch (err) {
    console.error('[api/tags/proposals POST]', err);
    return NextResponse.json({ error: 'Failed to propose tag' }, { status: 500 });
  }
}
