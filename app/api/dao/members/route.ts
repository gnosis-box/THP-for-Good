import { NextResponse } from 'next/server';
import { getProfileImageUrl, getTrustedByCount } from '@/lib/expert-trust-stats';

export type DaoMemberDto = {
  address: `0x${string}`;
  name: string;
  imageUrl?: string;
  trustsReceivedCount: number;
};

const GROUP_ADDRESS = (
  process.env.GROUP_ADDRESS ?? '0x2b5E4045936ef12250a8c01e4Cbf71E9bEE69e00'
) as `0x${string}`;

export async function GET() {
  try {
    const { Sdk } = await import('@aboutcircles/sdk');
    const sdk = new Sdk();
    const result = await sdk.groups.getMembers(GROUP_ADDRESS);

    const settled = await Promise.allSettled<DaoMemberDto>(
      result.results.map(async (row) => {
        const view = await sdk.rpc.profile.getProfileView(row.member);
        const raw = view.profile as (typeof view.profile & { name?: string }) | undefined;
        return {
          address: row.member as `0x${string}`,
          name: raw?.name ?? `${row.member.slice(0, 8)}…`,
          imageUrl: getProfileImageUrl(view),
          trustsReceivedCount: getTrustedByCount(view),
        };
      }),
    );

    const members = settled
      .filter((r): r is PromiseFulfilledResult<DaoMemberDto> => r.status === 'fulfilled')
      .map((r) => r.value);

    return NextResponse.json({ members, total: members.length });
  } catch (err) {
    console.error('[api/dao/members GET]', err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Failed to load DAO members' },
      { status: 500 },
    );
  }
}
