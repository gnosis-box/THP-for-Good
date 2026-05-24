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

  const legPromises = [
    builder.constructAdvancedTransfer(from, FOUNDATION_ADDRESS, foundationWei, { useWrappedBalances: true }),
    ...(expertWei > 0n ? [builder.constructAdvancedTransfer(from, expert, expertWei, { useWrappedBalances: true })] : []),
  ];

  const results = await Promise.all(legPromises);
  const txs = results.flat();

  return txs.map((tx) => ({
    to: tx.to,
    data: tx.data,
    value: tx.value.toString(),
  }));
}
