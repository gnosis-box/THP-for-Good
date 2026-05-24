/** THP for Good foundation treasury — Circles organization (DIV-L1-02). */
export const FOUNDATION_ADDRESS =
  '0xc02D5aaCA64dE428D571dA42538232C431E0CDeD' as const;

/** CRC goal to fund one free THP formation. */
export const FORMATION_GOAL_CRC = 50_000;

/** User-facing label for the treasury leg (not "foundation"). */
export const THP_FOR_GOOD_LABEL = 'THP for Good';

export const EXPERT_SHARE_OPTIONS = [0, 10, 20, 30, 50] as const;
export type ExpertSharePercent = (typeof EXPERT_SHARE_OPTIONS)[number];

export function clampExpertShare(percent: number): ExpertSharePercent {
  const allowed = EXPERT_SHARE_OPTIONS as readonly number[];
  if (allowed.includes(percent)) return percent as ExpertSharePercent;
  return 20;
}

export function splitLegCrc(
  priceCrc: number,
  expertSharePercent: ExpertSharePercent,
): { expertLegCrc: number; treasuryLegCrc: number } {
  const expertLegCrc = (priceCrc * expertSharePercent) / 100;
  return { expertLegCrc, treasuryLegCrc: priceCrc - expertLegCrc };
}

export function splitAmounts(totalWei: bigint, expertPercent: ExpertSharePercent): {
  expertWei: bigint;
  foundationWei: bigint;
} {
  const expertWei = (totalWei * BigInt(expertPercent)) / 100n;
  const foundationWei = totalWei - expertWei;
  return { expertWei, foundationWei };
}

export type TransferTx = { to: string; data: string; value: string };

export async function buildDonationTransactions(
  from: `0x${string}`,
  amountCrc: number,
): Promise<TransferTx[]> {
  const [{ TransferBuilder }, { circlesConfig }] = await Promise.all([
    import('@aboutcircles/sdk-transfers'),
    import('@aboutcircles/sdk-utils'),
  ]);
  const builder = new TransferBuilder(circlesConfig[100]);
  const amountWei = BigInt(amountCrc) * 10n ** 18n;
  const txs = await builder.constructAdvancedTransfer(from, FOUNDATION_ADDRESS, amountWei, { useWrappedBalances: true });
  return txs.map((tx) => ({ to: tx.to, data: tx.data, value: tx.value.toString() }));
}

// `unwrap(uint256)` selector on LiftERC20 wrapped-token contracts.
const UNWRAP_SELECTOR = '0xde0e9a3e';

/**
 * Returns SimulatedBalance entries that zero-out every wrapped token the
 * foundation leg plans to unwrap.  Passing these into the expert-leg
 * pathfinder forces it to choose a different route, preventing the
 * double-unwrap that causes UserOperation simulation to revert.
 *
 * Root cause: constructAdvancedTransfer with useWrappedBalances unwraps the
 * *entire* inflationary ERC20 balance per leg.  Both legs run against the same
 * on-chain snapshot, so each plans to unwrap the same tokens.  When batched,
 * the second unwrap fails because the balance is already spent.
 */
function depletedWrappedBalances(
  from: `0x${string}`,
  txs: Array<{ to: string; data: `0x${string}`; value: bigint }>,
) {
  return txs
    .filter((tx) => tx.data.startsWith(UNWRAP_SELECTOR))
    .map((tx) => ({
      holder: from,
      token: tx.to as `0x${string}`,
      amount: 0n,
      isWrapped: true,
      isStatic: true,
    }));
}

export async function buildSplitPayTransactions(
  from: `0x${string}`,
  expert: `0x${string}`,
  totalCrc: number,
  expertPercent: ExpertSharePercent,
): Promise<TransferTx[]> {
  const [{ TransferBuilder }, { circlesConfig }] = await Promise.all([
    import('@aboutcircles/sdk-transfers'),
    import('@aboutcircles/sdk-utils'),
  ]);

  const builder = new TransferBuilder(circlesConfig[100]);
  const totalWei = BigInt(totalCrc) * 10n ** 18n;
  const { expertWei, foundationWei } = splitAmounts(totalWei, expertPercent);

  // Build the foundation leg first so we know which wrapped tokens it consumes.
  const foundationTxs = await builder.constructAdvancedTransfer(
    from, FOUNDATION_ADDRESS, foundationWei, { useWrappedBalances: true },
  );

  // Build the expert leg sequentially, telling the pathfinder that any wrapped
  // tokens already claimed by the foundation leg have zero remaining balance.
  const expertTxs = expertWei > 0n
    ? await builder.constructAdvancedTransfer(
        from, expert, expertWei, {
          useWrappedBalances: true,
          simulatedBalances: depletedWrappedBalances(from, foundationTxs),
        },
      )
    : [];

  return [...foundationTxs, ...expertTxs].map((tx) => ({
    to: tx.to,
    data: tx.data,
    value: tx.value.toString(),
  }));
}
