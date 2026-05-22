import { isAdminAddress } from '@/lib/db';

export type GroupMemberDto = {
  address: `0x${string}`;
  name: string;
  imageUrl: string | undefined;
  trustsReceivedCount: number;
  score: number | null;
};

/** True when x-wallet-address belongs to env ADMIN_ADDRESSES or DB admins table. */
export function isAdminRequest(req: Request): boolean {
  const caller = (req.headers.get('x-wallet-address') ?? '').toLowerCase();
  return caller ? isAdminAddress(caller) : false;
}
