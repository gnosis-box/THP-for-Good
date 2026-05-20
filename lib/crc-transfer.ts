import { BOOKING_PRICE_CRC, FOUNDATION_ADDRESS } from '@/lib/config';

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

function toMiniappTransactions(txs: RawTx[]): MiniappTransaction[] {
  return txs.map((tx) => ({
    to: tx.to,
    data: tx.data,
    value: tx.value !== undefined ? tx.value.toString() : '0',
  }));
}

/**
 * Builds CRC payment transactions for sendTransactions via the Circles miniapp host.
 * Uses a capture runner so the SDK pathfinder encodes calldata without executing on-chain.
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

  const { Sdk } = await import('@aboutcircles/sdk');
  const sdk = new Sdk(undefined, runner);
  const avatar = await sdk.getAvatar(fromAddress);

  try {
    await avatar.transfer.advanced(toAddress, amountCrc, {
      useWrappedBalances: true,
    });
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
