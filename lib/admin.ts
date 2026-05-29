export type GroupMemberDto = {
  address: `0x${string}`;
  name: string;
  imageUrl: string | undefined;
  trustedByCount: number;
  score: number | null;
};

export { isAdminRequest } from '@/lib/api-auth';
