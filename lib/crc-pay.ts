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

const UNWRAP_SEL = '0xde0e9a3e'; // unwrap(uint256) on LiftERC20
const REWRAP_SEL = '0xaabd6954'; // wrap(address,uint256,uint8) on Hub V2

type RawTx = { to: `0x${string}`; data: `0x${string}`; value: bigint };

/**
 * When two payment legs share the same wrapped token route, TransferBuilder
 * emits two identical unwrap calls for the same LiftERC20 contract. The second
 * unwrap reverts because the balance was already consumed. This function merges
 * the two batches so each LiftERC20 is unwrapped exactly once and the rewrap
 * at the end accounts for both transfers:
 *
 *   rewrap_merged = rewrap_leg1 + rewrap_leg2 - unwrap_amount
 *                = (X - A) + (X - B) - X = X - A - B  ✓
 */
function deduplicateWrappedOps(txs: RawTx[]): RawTx[] {
  // Track unwrap amount per LiftERC20 contract (first occurrence wins)
  const unwrapAmounts = new Map<string, bigint>();
  for (const tx of txs) {
    if (tx.data.toLowerCase().startsWith(UNWRAP_SEL)) {
      const key = tx.to.toLowerCase();
      if (!unwrapAmounts.has(key)) {
        unwrapAmounts.set(key, BigInt('0x' + tx.data.slice(10, 74)));
      }
    }
  }

  // Group rewrap calls by (hub address + avatar address)
  const rewrapGroups = new Map<string, { tx: RawTx; amounts: bigint[] }>();
  for (const tx of txs) {
    if (tx.data.toLowerCase().startsWith(REWRAP_SEL)) {
      const avatar = tx.data.slice(34, 74).toLowerCase();
      const key = tx.to.toLowerCase() + avatar;
      const amount = BigInt('0x' + tx.data.slice(74, 138));
      const group = rewrapGroups.get(key);
      if (group) {
        group.amounts.push(amount);
      } else {
        rewrapGroups.set(key, { tx, amounts: [amount] });
      }
    }
  }

  const seenUnwraps = new Set<string>();
  const seenRewraps = new Set<string>();
  const mainTxs: RawTx[] = [];
  const mergedRewraps: RawTx[] = [];

  for (const tx of txs) {
    const sel = tx.data.slice(0, 10).toLowerCase();

    if (sel === UNWRAP_SEL) {
      const key = tx.to.toLowerCase();
      if (!seenUnwraps.has(key)) {
        seenUnwraps.add(key);
        mainTxs.push(tx);
      }
      // duplicate unwrap — skip
    } else if (sel === REWRAP_SEL) {
      const avatar = tx.data.slice(34, 74).toLowerCase();
      const groupKey = tx.to.toLowerCase() + avatar;
      if (seenRewraps.has(groupKey)) continue;
      seenRewraps.add(groupKey);

      const group = rewrapGroups.get(groupKey)!;
      if (group.amounts.length === 1) {
        mergedRewraps.push(tx);
      } else {
        // merged = sum(rewraps) - (n-1) * unwrap_amount
        // = (X-A) + (X-B) - X = X - A - B
        const unwrapAmt = unwrapAmounts.size === 1
          ? [...unwrapAmounts.values()][0]
          : 0n;
        const totalRewrap = group.amounts.reduce((a, b) => a + b, 0n);
        const corrected = totalRewrap - BigInt(group.amounts.length - 1) * unwrapAmt;
        const safe = corrected > 0n ? corrected : 0n;
        const amountHex = safe.toString(16).padStart(64, '0');
        // data layout: selector(10) + padded_addr(64) + amount(64) + type(64)
        const newData = (tx.data.slice(0, 74) + amountHex + tx.data.slice(138)) as `0x${string}`;
        mergedRewraps.push({ ...tx, data: newData });
      }
    } else {
      mainTxs.push(tx);
    }
  }

  return [...mainTxs, ...mergedRewraps];
}

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

  const [foundationTxs, expertTxs] = await Promise.all([
    builder.constructAdvancedTransfer(from, FOUNDATION_ADDRESS, foundationWei, { useWrappedBalances: true }),
    expertWei > 0n
      ? builder.constructAdvancedTransfer(from, expert, expertWei, { useWrappedBalances: true })
      : Promise.resolve([]),
  ]);

  const merged = deduplicateWrappedOps([...foundationTxs, ...expertTxs]);
  return merged.map((tx) => ({ to: tx.to, data: tx.data, value: tx.value.toString() }));
}
