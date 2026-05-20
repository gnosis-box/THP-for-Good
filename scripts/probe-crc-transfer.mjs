/**
 * Spike C10 — probe CRC transfer encoding against live Circles RPC.
 * Run: node scripts/probe-crc-transfer.mjs <fromAddress> [amountCrc]
 */
import { Sdk } from '@aboutcircles/sdk';

const FOUNDATION = process.env.NEXT_PUBLIC_FOUNDATION_ADDRESS ??
  '0x2b5E4045936ef12250a8c01e4Cbf71E9bEE69e00';
const from = process.argv[2];
const amount = Number(process.argv[3] ?? '100');

if (!from || !from.startsWith('0x')) {
  console.error('Usage: node scripts/probe-crc-transfer.mjs <fromAddress> [amountCrc]');
  process.exit(1);
}

const captured = [];
const TX_CAPTURED = 'THP_TX_CAPTURED';

const runner = {
  address: from,
  sendTransaction: async (txs) => {
    captured.push(...txs);
    throw new Error(TX_CAPTURED);
  },
};

const sdk = new Sdk(undefined, runner);
const avatar = await sdk.getAvatar(from);

try {
  await avatar.transfer.advanced(FOUNDATION, amount, { useWrappedBalances: true });
} catch (error) {
  if (!(error instanceof Error && error.message === TX_CAPTURED)) {
    console.error('Probe failed:', error);
    process.exit(1);
  }
}

console.log(JSON.stringify({
  from,
  to: FOUNDATION,
  amountCrc: amount,
  transactionCount: captured.length,
  transactions: captured.map((tx) => ({
    to: tx.to,
    data: tx.data,
    value: tx.value?.toString() ?? '0',
  })),
}, null, 2));
