import { NextResponse } from 'next/server';
import { isAdminAddress } from '@/lib/db';

export function GET(request: Request) {
  const caller = request.headers.get('x-wallet-address') ?? '';
  return NextResponse.json({
    isAdmin: caller ? isAdminAddress(caller) : false,
    groupAddress: process.env.GROUP_ADDRESS ?? null,
  });
}
