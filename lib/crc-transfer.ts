import { BOOKING_PRICE_CRC, FOUNDATION_ADDRESS } from '@/lib/config';
import { resolveFoundationSink } from '@/lib/foundation-sink';

import type { ContractRunner } from '@aboutcircles/sdk';

type RawTx = {
  to: `0x${string}`;
  data?: `0x${string}`;
  value?: bigint;
};

export type MiniappTransaction = {
  to: string;
  data?: string;
  value?: string;
};

const TX_CAPTURED = 'THP_TX_CAPTURED';
const ATTO_PER_CRC = BigInt(10 ** 18);

/** SDK transfer methods expect atto-CRC, not a human CRC count. */
function crcToAttoCircles(amountCrc: number): bigint {
  return BigInt(Math.trunc(amountCrc)) * ATTO_PER_CRC;
}

function toMiniappTransactions(txs: RawTx[]): MiniappTransaction[] {
  return txs.map((tx) => ({
    to: tx.to,
    data: tx.data,
    value: tx.value !== undefined ? tx.value.toString() : '0',
  }));
}

/**
 * Builds CRC payment transactions for sendTransactions via the Circles miniapp host.
 * Uses transfer.direct (hub safeTransferFrom) — one UserOp, no operateFlowMatrix batch.
 * Advanced/wrapped path fails Safe simulation for many avatars; direct uses unwrapped CRC.
 */
export async function buildCrcPaymentTransactions(
  fromAddress: `0x${string}`,
  toAddress: `0x${string}` = FOUNDATION_ADDRESS,
  amountCrc: number = BOOKING_PRICE_CRC,
): Promise<MiniappTransaction[]> {
  const captured: RawTx[] = [];

  const runner = {
    address: fromAddress,
    sendTransaction: async (txs: RawTx[]) => {
      captured.push(...txs);
      throw new Error(TX_CAPTURED);
    },
  } as unknown as ContractRunner;

  const sinkAddress = await resolveFoundationSink(toAddress);
  const amountAtto = crcToAttoCircles(amountCrc);

  const { Sdk } = await import('@aboutcircles/sdk');
  const sdk = new Sdk(undefined, runner);
  const avatar = await sdk.getAvatar(fromAddress);

  const maxDirect = await sdk.rpc.pathfinder.findMaxFlow({
    from: fromAddress.toLowerCase() as `0x${string}`,
    to: sinkAddress.toLowerCase() as `0x${string}`,
    useWrappedBalances: false,
  });

  if (maxDirect < amountAtto) {
    throw new Error(
      `Insufficient unwrapped CRC for payment (need ${amountCrc}, path allows ~${Math.floor(Number(maxDirect / ATTO_PER_CRC))}). Unwrap wrapped CRC in Circles, then retry.`,
    );
  }

  try {
    await avatar.transfer.direct(sinkAddress, amountAtto);
  } catch (error) {
    if (
      error instanceof Error &&
      error.message === TX_CAPTURED &&
      captured.length > 0
    ) {
      return toMiniappTransactions(captured);
    }
    throw error;
  }

  if (captured.length === 0) {
    throw new Error('No transactions were built for CRC payment.');
  }

  return toMiniappTransactions(captured);
}
