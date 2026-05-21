import { FOUNDATION_ADDRESS, THP_GROUP_ADDRESS } from '@/lib/config';

const GNOSIS_RPC = 'https://rpc.gnosischain.com';
const BASE_TREASURY_SELECTOR = '0xdcdcbb3a';

let cachedSink: `0x${string}` | null = null;

function decodeAddressResult(hex: string): `0x${string}` {
  const normalized = hex.startsWith('0x') ? hex.slice(2) : hex;
  return `0x${normalized.slice(-40)}` as `0x${string}`;
}

async function readGroupTreasury(groupAddress: string): Promise<`0x${string}`> {
  const response = await fetch(GNOSIS_RPC, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      jsonrpc: '2.0',
      id: 1,
      method: 'eth_call',
      params: [{ to: groupAddress, data: BASE_TREASURY_SELECTOR }, 'latest'],
    }),
  });

  const payload = (await response.json()) as { result?: string; error?: { message?: string } };
  if (!payload.result || payload.result === '0x') {
    throw new Error(
      `Could not read BASE_TREASURY for THP group at ${groupAddress}: ${payload.error?.message ?? 'empty result'}`,
    );
  }

  return decodeAddressResult(payload.result);
}

/**
 * Circles pathfinding rejects group avatars as payment sinks ("Invalid sink address").
 * If the configured address is the THP group (or any group), resolve to its treasury org.
 */
export async function resolveFoundationSink(
  configured: `0x${string}` = FOUNDATION_ADDRESS,
): Promise<`0x${string}`> {
  if (cachedSink) return cachedSink;

  const normalized = configured.toLowerCase() as `0x${string}`;

  const { Sdk } = await import('@aboutcircles/sdk');
  const sdk = new Sdk();
  const tokenInfo = await sdk.rpc.token.getTokenInfo(normalized);
  const isGroupToken =
    tokenInfo?.tokenType === 'CrcV2_RegisterGroup' ||
    normalized.toLowerCase() === THP_GROUP_ADDRESS.toLowerCase();

  if (isGroupToken) {
    cachedSink = await readGroupTreasury(normalized);
    return cachedSink;
  }

  cachedSink = configured;
  return configured;
}

export function isLikelyGroupAddress(address: string): boolean {
  return address.toLowerCase() === THP_GROUP_ADDRESS.toLowerCase();
}
