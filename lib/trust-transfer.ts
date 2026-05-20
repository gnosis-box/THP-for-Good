import type { MiniappTransaction } from '@/lib/crc-transfer';

import type { ContractRunner } from '@aboutcircles/sdk';

type RawTx = {
  to: `0x${string}`;
  data?: `0x${string}`;
  value?: bigint;
};

const TX_CAPTURED = 'THP_TX_CAPTURED';

function toMiniappTransactions(txs: RawTx[]): MiniappTransaction[] {
  return txs.map((tx) => ({
    to: tx.to,
    data: tx.data,
    value: tx.value !== undefined ? tx.value.toString() : '0',
  }));
}

export async function buildTrustAddTransactions(
  fromAddress: `0x${string}`,
  mentorAddress: `0x${string}`,
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
    await avatar.trust.add(mentorAddress);
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
    throw new Error('No transactions were built for trust.add.');
  }

  return toMiniappTransactions(captured);
}
