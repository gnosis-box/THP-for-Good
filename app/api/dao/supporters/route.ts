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

// Minimum balance to show (0.01 CRC in atto-CRC) — filters out mint dust
const MIN_BALANCE = BigInt('10000000000000000');

export async function GET() {
  try {
    const { Sdk } = await import('@aboutcircles/sdk');
    const sdk = new Sdk();

    // sdk.tokens.getHolders uses circles_getTokenHolders (works);
    // sdk.groups.getHolders uses V_Crc_TokenBalances table (not available on this RPC)
    const result = await sdk.tokens.getHolders(GROUP_ADDRESS, 200);

    const holders = result.results.filter(
      (r) => BigInt(r.balance) >= MIN_BALANCE,
    );

    const settled = await Promise.allSettled<DaoSupporterDto>(
      holders.map(async (row) => {
        const view = await sdk.rpc.profile.getProfileView(row.account);
        const raw = view.profile as typeof view.profile & { picture?: string };
        const balanceCrc = (Number(BigInt(row.balance)) / 1e18).toFixed(2);
        return {
          address: row.account as `0x${string}`,
          name: raw?.name ?? `${row.account.slice(0, 8)}…`,
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
