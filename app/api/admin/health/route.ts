import { NextResponse } from 'next/server';
import { getAdminHealthStats } from '@/lib/db';
import { isAdminRequest } from '@/lib/api-auth';

export function GET(request: Request) {
  if (!isAdminRequest(request)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  return NextResponse.json(getAdminHealthStats());
}
