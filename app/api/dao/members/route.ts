import { NextResponse } from 'next/server';
import { getProfileImageUrl, getProfileName, getTrustedByCount } from '@/lib/circles-profile';

export type DaoMemberDto = {
  address: `0x${string}`;
  name: string;
  imageUrl?: string;
  trustedByCount: number;
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
        const raw = view.profile as (typeof view.profile & { picture?: string }) | undefined;
        return {
          address: row.member as `0x${string}`,
          name: getProfileName(raw, row.member),
          imageUrl: getProfileImageUrl(raw),
          trustedByCount: getTrustedByCount(view.trustStats) ?? 0,
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
