import { NextResponse } from 'next/server';
import {
  addInvitationLinks,
  listInvitationLinks,
  updateInvitationLinkStatus,
} from '@/lib/db';
import { isAdminRequest, walletFromRequest } from '@/lib/api-auth';
import {
  isValidInvitationStatus,
  isValidInvitationUrl,
  normalizeInvitationUrls,
} from '@/lib/invitation-links';

type AddLinksBody = {
  links?: string[];
  links_text?: string;
};

type UpdateLinkBody = {
  id?: number;
  status?: string;
};

export function GET(request: Request) {
  if (!isAdminRequest(request)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }
  return NextResponse.json({ links: listInvitationLinks() });
}

export async function POST(request: Request) {
  if (!isAdminRequest(request)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const caller = walletFromRequest(request)?.toLowerCase();
  if (!caller) {
    return NextResponse.json({ error: 'Missing admin wallet address' }, { status: 400 });
  }

  let body: AddLinksBody;
  try {
    body = (await request.json()) as AddLinksBody;
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  const fromArray = Array.isArray(body.links) ? body.links : [];
  const fromText = typeof body.links_text === 'string' ? normalizeInvitationUrls(body.links_text) : [];
  const urls = [...new Set([...fromArray, ...fromText].map((value) => value.trim()).filter(Boolean))];

  if (urls.length === 0) {
    return NextResponse.json({ error: 'At least one invitation URL is required' }, { status: 400 });
  }
  if (!urls.every(isValidInvitationUrl)) {
    return NextResponse.json({ error: 'All invitation URLs must be valid http(s) links' }, { status: 400 });
  }

  const result = addInvitationLinks(urls, caller);
  return NextResponse.json(
    {
      ok: true,
      ...result,
      total: urls.length,
    },
    { status: 201 },
  );
}

export async function PATCH(request: Request) {
  if (!isAdminRequest(request)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  let body: UpdateLinkBody;
  try {
    body = (await request.json()) as UpdateLinkBody;
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  if (typeof body.id !== 'number' || !Number.isInteger(body.id) || body.id <= 0) {
    return NextResponse.json({ error: 'id must be a positive integer' }, { status: 400 });
  }
  if (typeof body.status !== 'string' || !isValidInvitationStatus(body.status)) {
    return NextResponse.json({ error: 'status must be available, used, or invalid' }, { status: 400 });
  }

  const link = updateInvitationLinkStatus(body.id, body.status);
  if (!link) {
    return NextResponse.json({ error: 'Invitation link not found' }, { status: 404 });
  }
  return NextResponse.json({ ok: true, link });
}
