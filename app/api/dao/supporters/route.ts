import { NextResponse } from 'next/server';
import { toHttpImageUrl } from '@/lib/utils';

export type DaoSupporterDto = {
  address: `0x${string}`;
  name: string;
  imageUrl?: string;
};

const GROUP_ADDRESS = (
  process.env.GROUP_ADDRESS ?? '0x2b5E4045936ef12250a8c01e4Cbf71E9bEE69e00'
).toLowerCase();

const RPC = 'https://rpc.aboutcircles.com/';

type AffiliateRow = [string, string, string, number]; // [human, oldGroup, newGroup, blockNumber]

async function rpcQuery(table: string, filter: object[]): Promise<AffiliateRow[]> {
  const res = await fetch(RPC, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      jsonrpc: '2.0',
      id: 1,
      method: 'circles_query',
      params: [
        {
          Namespace: 'CrcV2',
          Table: table,
          Columns: ['human', 'oldGroup', 'newGroup', 'blockNumber'],
          Filter: filter,
          Order: [{ Column: 'blockNumber', SortOrder: 'DESC' }],
          Limit: 500,
        },
      ],
    }),
  });
  const json = (await res.json()) as { result?: { rows: AffiliateRow[] }; error?: unknown };
  if (!res.ok || json.error) throw new Error(`RPC error: ${JSON.stringify(json.error)}`);
  return json.result?.rows ?? [];
}

export async function GET() {
  try {
    const [joinRows, departRows] = await Promise.all([
      // Humans who set this group as their affiliate
      rpcQuery('AffiliateGroupChanged', [
        { Type: 'FilterPredicate', FilterType: 'Equals', Column: 'newGroup', Value: GROUP_ADDRESS },
      ]),
      // Humans who left this group as their affiliate
      rpcQuery('AffiliateGroupChanged', [
        { Type: 'FilterPredicate', FilterType: 'Equals', Column: 'oldGroup', Value: GROUP_ADDRESS },
      ]),
    ]);

    // Latest join blockNumber per human
    const latestJoin = new Map<string, number>();
    for (const [human, , , block] of joinRows) {
      const prev = latestJoin.get(human) ?? -1;
      if (block > prev) latestJoin.set(human, block);
    }

    // Latest departure blockNumber per human
    const latestDepart = new Map<string, number>();
    for (const [human, , , block] of departRows) {
      const prev = latestDepart.get(human) ?? -1;
      if (block > prev) latestDepart.set(human, block);
    }

    // Current affiliates: joined more recently than they departed (or never departed)
    const currentAffiliates = [...latestJoin.entries()]
      .filter(([human, joinBlock]) => (latestDepart.get(human) ?? -1) < joinBlock)
      .map(([human]) => human as `0x${string}`);

    const { Sdk } = await import('@aboutcircles/sdk');
    const sdk = new Sdk();

    const settled = await Promise.allSettled<DaoSupporterDto>(
      currentAffiliates.map(async (address) => {
        const view = await sdk.rpc.profile.getProfileView(address);
        const raw = view.profile as typeof view.profile & { picture?: string };
        return {
          address,
          name: raw?.name ?? `${address.slice(0, 8)}…`,
          imageUrl: toHttpImageUrl(raw?.picture ?? raw?.previewImageUrl ?? raw?.imageUrl),
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
