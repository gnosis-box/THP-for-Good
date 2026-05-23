import { isAdminAddress } from '@/lib/db';

export function walletFromRequest(req: Request): string | null {
  const raw = req.headers.get('x-wallet-address');
  return raw?.trim() ? raw.trim() : null;
}

export function isAdminRequest(req: Request): boolean {
  const caller = walletFromRequest(req);
  return caller ? isAdminAddress(caller) : false;
}
