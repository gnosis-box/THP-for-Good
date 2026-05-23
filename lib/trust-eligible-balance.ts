import { FOUNDATION_ADDRESS as PAY_FOUNDATION, type MentorSharePercent } from '@/lib/crc-pay';

const ATTO_PER_CRC = 10n ** 18n;

export type TrustPathLimits = {
  /** Max unwrapped CRC routable via trust graph (pathfinder). */
  toExpertCrc: number;
  toFoundationCrc: number;
  /** Estimated max session price bookable given split legs (simulation). */
  bookableCrc: number;
};

function attoToCrcFloor(atto: bigint): number {
  if (atto <= 0n) return 0;
  return Number(atto / ATTO_PER_CRC);
}

async function maxFlowCrc(
  from: `0x${string}`,
  to: `0x${string}`,
  useWrappedBalances: boolean,
): Promise<number> {
  const { Sdk } = await import('@aboutcircles/sdk');
  const sdk = new Sdk();
  const atto = await sdk.rpc.pathfinder.findMaxFlow({
    from: from.toLowerCase() as `0x${string}`,
    to: to.toLowerCase() as `0x${string}`,
    useWrappedBalances,
  });
  return attoToCrcFloor(atto);
}

/**
 * Estimates how much of a session price can be paid when split across expert + foundation.
 * Returns the bottleneck in CRC (full session units, not per-leg amounts).
 */
export function simulateBookableSessionCrc(
  priceCrc: number,
  mentorSharePercent: MentorSharePercent,
  toExpertCrc: number,
  toFoundationCrc: number,
): number {
  if (priceCrc <= 0) return 0;

  const expertLeg = (priceCrc * mentorSharePercent) / 100;
  const foundationLeg = priceCrc - expertLeg;
  const caps: number[] = [];

  if (expertLeg > 0) {
    caps.push((toExpertCrc / expertLeg) * priceCrc);
  }
  if (foundationLeg > 0) {
    caps.push((toFoundationCrc / foundationLeg) * priceCrc);
  }

  if (caps.length === 0) return 0;
  return Math.floor(Math.min(...caps));
}

export async function queryTrustPathLimits(
  from: `0x${string}`,
  expert: `0x${string}`,
  priceCrc: number,
  mentorSharePercent: MentorSharePercent,
): Promise<TrustPathLimits> {
  const foundationSink = PAY_FOUNDATION as `0x${string}`;

  const [toExpertCrc, toFoundationCrc] = await Promise.all([
    maxFlowCrc(from, expert, false),
    maxFlowCrc(from, foundationSink, false),
  ]);

  return {
    toExpertCrc,
    toFoundationCrc,
    bookableCrc: simulateBookableSessionCrc(
      priceCrc,
      mentorSharePercent,
      toExpertCrc,
      toFoundationCrc,
    ),
  };
}

export function formatCrc(amount: number): string {
  return amount.toLocaleString(undefined, { maximumFractionDigits: 2 });
}
