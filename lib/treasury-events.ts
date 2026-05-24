import { DEFAULT_GROUP_ADDRESS, TREASURY_ORG_ADDRESS } from '@/lib/analytics-explorer';

export type TreasuryInboundEvent = {
  txHash: string;
  from: string;
  nominalCrc: number;
  blockNumber?: number;
};

export type RawCirclesEvent = {
  event?: string;
  values?: Record<string, unknown>;
};

const TREASURY = TREASURY_ORG_ADDRESS.toLowerCase();
const GROUP = DEFAULT_GROUP_ADDRESS.toLowerCase();

export function parseAmountWei(amount: unknown): bigint | null {
  if (amount == null) return null;
  if (typeof amount === 'bigint') return amount;
  if (typeof amount === 'number' && Number.isFinite(amount)) return BigInt(Math.trunc(amount));
  if (typeof amount === 'string') {
    const trimmed = amount.trim();
    if (!trimmed) return null;
    try {
      return trimmed.startsWith('0x') ? BigInt(trimmed) : BigInt(trimmed);
    } catch {
      return null;
    }
  }
  return null;
}

export function nominalCrcFromAmountWei(amount: unknown): number {
  const wei = parseAmountWei(amount);
  if (wei == null) return 0;
  return Number(wei) / 1e18;
}

function normalizeAddress(value: unknown): string | null {
  if (typeof value !== 'string' || !value.startsWith('0x')) return null;
  return value.toLowerCase();
}

export function parseTransferSummary(raw: RawCirclesEvent): TreasuryInboundEvent | null {
  if (raw.event !== 'CrcV2_TransferSummary') return null;
  const values = raw.values;
  if (!values) return null;

  const to = normalizeAddress(values.to);
  const from = normalizeAddress(values.from);
  const txHash = typeof values.transactionHash === 'string' ? values.transactionHash : null;
  if (!to || !from || !txHash) return null;

  const amount = values.amount ?? values.value;
  const nominalCrc = nominalCrcFromAmountWei(amount);
  if (!Number.isFinite(nominalCrc) || nominalCrc <= 0) return null;

  let blockNumber: number | undefined;
  const blockRaw = values.blockNumber;
  if (typeof blockRaw === 'number') blockNumber = blockRaw;
  else if (typeof blockRaw === 'string') {
    blockNumber = blockRaw.startsWith('0x')
      ? Number.parseInt(blockRaw, 16)
      : Number.parseInt(blockRaw, 10);
  }

  return { txHash, from, nominalCrc, blockNumber };
}

export function shouldAnimateInbound(
  event: TreasuryInboundEvent,
  seenTx: ReadonlySet<string>,
): boolean {
  if (seenTx.has(event.txHash.toLowerCase())) return false;
  return true;
}

export function isTreasuryInboundSummary(raw: RawCirclesEvent): boolean {
  if (raw.event !== 'CrcV2_TransferSummary') return false;
  const values = raw.values;
  if (!values) return false;
  const to = normalizeAddress(values.to);
  const from = normalizeAddress(values.from);
  if (to !== TREASURY) return false;
  if (from === GROUP) return false;
  return true;
}

export function parseInboundFromMessage(data: unknown): TreasuryInboundEvent | null {
  if (!data || typeof data !== 'object') return null;
  const record = data as Record<string, unknown>;

  if (record.method === 'circles_subscription' && record.params) {
    const params = record.params as Record<string, unknown>;
    const event = params.event ?? params;
    if (event && typeof event === 'object') {
      return parseTransferSummary(event as RawCirclesEvent);
    }
  }

  if ('event' in record && typeof record.event === 'string') {
    return parseTransferSummary(record as RawCirclesEvent);
  }

  const result = record.result;
  if (result && typeof result === 'object' && 'event' in (result as object)) {
    return parseTransferSummary(result as RawCirclesEvent);
  }

  return null;
}
