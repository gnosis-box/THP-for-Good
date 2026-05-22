import { NextResponse } from 'next/server';
import { isAdminAddress, getDbAdmins, addDbAdmin } from '@/lib/db';

export function GET(request: Request) {
  const caller = request.headers.get('x-wallet-address') ?? '';
  if (!caller || !isAdminAddress(caller)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }
  return NextResponse.json(getDbAdmins());
}

export async function POST(request: Request) {
  const caller = request.headers.get('x-wallet-address') ?? '';
  if (!caller || !isAdminAddress(caller)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }
  const { address } = (await request.json()) as { address?: string };
  if (!address?.trim()) {
    return NextResponse.json({ error: 'address required' }, { status: 400 });
  }
  addDbAdmin(address.trim());
  return NextResponse.json({ ok: true });
}
