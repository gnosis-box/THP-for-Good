import { NextResponse } from 'next/server';

export function GET(request: Request) {
  const admins = (process.env.ADMIN_ADDRESSES ?? '').toLowerCase().split(',').filter(Boolean);
  const caller = (request.headers.get('x-wallet-address') ?? '').toLowerCase();
  return NextResponse.json({ isAdmin: admins.includes(caller) });
}
