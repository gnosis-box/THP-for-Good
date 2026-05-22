import { NextRequest, NextResponse } from 'next/server';
import { isAdminRequest, type GroupMemberDto } from '@/lib/admin';
import { fetchCirclesScore, toHttpImageUrl } from '@/lib/utils';

export async function GET(request: NextRequest) {
  if (!isAdminRequest(request)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const group =
    request.nextUrl.searchParams.get('group')?.trim() ||
    process.env.GROUP_ADDRESS?.trim() ||
    '';

  if (!group) {
    return NextResponse.json({ error: 'GROUP_ADDRESS not configured' }, { status: 400 });
  }

  try {
    const { Sdk } = await import('@aboutcircles/sdk');
    const sdk = new Sdk();
    const result = await sdk.groups.getMembers(group as `0x${string}`);

    const profiles = await Promise.allSettled(
      result.results.map(async (row) => {
        const [view, score] = await Promise.all([
          sdk.rpc.profile.getProfileView(row.member),
          fetchCirclesScore(row.member),
        ]);
        const raw = view.profile as (typeof view.profile & {
          trustsReceivedCount?: number;
          picture?: string;
        });
        return {
          address: row.member as `0x${string}`,
          name: raw?.name ?? `${row.member.slice(0, 8)}…`,
          imageUrl: toHttpImageUrl(raw?.picture ?? raw?.previewImageUrl ?? raw?.imageUrl),
          trustsReceivedCount: raw?.trustsReceivedCount ?? 0,
          score,
        } satisfies GroupMemberDto;
      }),
    );

    const members = profiles
      .filter((r): r is PromiseFulfilledResult<GroupMemberDto> => r.status === 'fulfilled')
      .map((r) => r.value);

    return NextResponse.json({ members, group });
  } catch (err) {
    console.error('[api/admin/members GET]', err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Failed to load group members' },
      { status: 500 },
    );
  }
}
