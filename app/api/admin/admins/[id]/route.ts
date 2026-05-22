import { NextResponse } from 'next/server';
import { isAdminAddress, removeDbAdmin } from '@/lib/db';

export function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const caller = request.headers.get('x-wallet-address') ?? '';
  if (!caller || !isAdminAddress(caller)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }
  return params.then(({ id }) => {
    removeDbAdmin(parseInt(id, 10));
    return NextResponse.json({ ok: true });
  });
}
