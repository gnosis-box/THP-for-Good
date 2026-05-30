import { NextRequest, NextResponse } from 'next/server';
import {
  countInvitationLinksByStatus,
  getAllInvitationLinks,
  insertInvitationLink,
  isValidInviteUrl,
  type InvitationLinkStatus,
} from '@/lib/invitation-links';
import { isAdminRequest, walletFromRequest } from '@/lib/api-auth';

function parseStatusFilter(raw: string | null): InvitationLinkStatus | 'all' {
  if (raw === 'available' || raw === 'used' || raw === 'invalid') return raw;
  return 'all';
}

export function GET(request: NextRequest) {
  if (!isAdminRequest(request)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const status = parseStatusFilter(request.nextUrl.searchParams.get('status'));
  const links = getAllInvitationLinks(status);
  const counts = countInvitationLinksByStatus();

  return NextResponse.json({ links, counts });
}

export async function POST(request: NextRequest) {
  if (!isAdminRequest(request)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const addedBy = walletFromRequest(request);
  if (!addedBy) {
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
    typeof (body as Record<string, unknown>).url !== 'string' ||
    !(body as Record<string, unknown>).url
  ) {
    return NextResponse.json({ error: 'url is required' }, { status: 400 });
  }

  const { url } = body as { url: string };
  if (!isValidInviteUrl(url)) {
    return NextResponse.json({ error: 'Enter a valid https URL' }, { status: 400 });
  }

  try {
    const link = insertInvitationLink(url, addedBy);
    return NextResponse.json(link, { status: 201 });
  } catch (err) {
    console.error('[api/admin/invitation-links POST]', err);
    return NextResponse.json({ error: 'Failed to add invitation link' }, { status: 500 });
  }
}
