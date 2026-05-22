/** THP for Good foundation treasury (DIV-L1-02). */
export const FOUNDATION_ADDRESS =
  '0x2b5E4045936ef12250a8c01e4Cbf71E9bEE69e00' as const;

export const MENTOR_SHARE_OPTIONS = [0, 10, 20, 30, 50] as const;
export type MentorSharePercent = (typeof MENTOR_SHARE_OPTIONS)[number];

export function clampMentorShare(percent: number): MentorSharePercent {
  const allowed = MENTOR_SHARE_OPTIONS as readonly number[];
  if (allowed.includes(percent)) return percent as MentorSharePercent;
  return 20;
}

export function splitAmounts(totalWei: bigint, mentorPercent: MentorSharePercent): {
  mentorWei: bigint;
  foundationWei: bigint;
} {
  const mentorWei = (totalWei * BigInt(mentorPercent)) / 100n;
  const foundationWei = totalWei - mentorWei;
  return { mentorWei, foundationWei };
}

export type TransferTx = { to: string; data: string; value: string };

export async function buildSplitPayTransactions(
  from: `0x${string}`,
  mentor: `0x${string}`,
  totalCrc: number,
  mentorPercent: MentorSharePercent,
): Promise<TransferTx[]> {
  const [{ TransferBuilder }, { circlesConfig }] = await Promise.all([
    import('@aboutcircles/sdk-transfers'),
    import('@aboutcircles/sdk-utils'),
  ]);

  const builder = new TransferBuilder(circlesConfig[100]);
  const totalWei = BigInt(totalCrc) * 10n ** 18n;
  const { mentorWei, foundationWei } = splitAmounts(totalWei, mentorPercent);

  const legPromises = [
    builder.constructAdvancedTransfer(from, FOUNDATION_ADDRESS, foundationWei),
    ...(mentorWei > 0n ? [builder.constructAdvancedTransfer(from, mentor, mentorWei)] : []),
  ];

  const results = await Promise.all(legPromises);
  const txs = results.flat();

  return txs.map((tx) => ({
    to: tx.to,
    data: tx.data,
    value: tx.value.toString(),
  }));
}
