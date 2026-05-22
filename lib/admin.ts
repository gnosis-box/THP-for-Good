export type GroupMemberDto = {
  address: `0x${string}`;
  name: string;
  imageUrl: string | undefined;
  trustsReceivedCount: number;
  score: number | null;
};

export { isAdminRequest } from '@/lib/api-auth';
