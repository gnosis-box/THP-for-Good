import { NextResponse } from 'next/server';
import { toHttpImageUrl } from '@/lib/utils';

export type DaoSupporterDto = {
  address: `0x${string}`;
  name: string;
  imageUrl?: string;
  balanceCrc: string;
};

const GROUP_ADDRESS = (
  process.env.GROUP_ADDRESS ?? '0x2b5E4045936ef12250a8c01e4Cbf71E9bEE69e00'
) as `0x${string}`;

export async function GET() {
  try {
    const { Sdk } = await import('@aboutcircles/sdk');
    const sdk = new Sdk();
    const query = sdk.groups.getHolders(GROUP_ADDRESS, 100);

    const allHolders: { holder: `0x${string}`; demurragedTotalBalance: bigint }[] = [];
    while (await query.queryNextPage()) {
      const page = query.currentPage!;
      allHolders.push(
        ...page.results.map((r) => ({
          holder: r.holder as `0x${string}`,
          demurragedTotalBalance: r.demurragedTotalBalance,
        })),
      );
      if (!page.hasMore) break;
    }

    const settled = await Promise.allSettled<DaoSupporterDto>(
      allHolders.map(async (row) => {
        const view = await sdk.rpc.profile.getProfileView(row.holder);
        const raw = view.profile as typeof view.profile & { picture?: string };
        const balanceCrc = (Number(row.demurragedTotalBalance) / 1e18).toFixed(2);
        return {
          address: row.holder,
          name: raw?.name ?? `${row.holder.slice(0, 8)}…`,
          imageUrl: toHttpImageUrl(raw?.picture ?? raw?.previewImageUrl ?? raw?.imageUrl),
          balanceCrc,
        };
      }),
    );

    const supporters = settled
      .filter((r): r is PromiseFulfilledResult<DaoSupporterDto> => r.status === 'fulfilled')
      .map((r) => r.value);

    return NextResponse.json({ supporters, total: supporters.length });
  } catch (err) {
    console.error('[api/dao/supporters GET]', err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Failed to load DAO supporters' },
      { status: 500 },
    );
  }
}
