import { FOUNDATION_ADDRESS } from '@/lib/crc-pay';

export const TREASURY_ORG_ADDRESS = FOUNDATION_ADDRESS;

export const DEFAULT_GROUP_ADDRESS =
  '0x2b5E4045936ef12250a8c01e4Cbf71E9bEE69e00' as const;

export const DUNE_GNOSIS_OVERVIEW_URL =
  'https://dune.com/gnosischain_team/gnosis-app-overview' as const;

const EXPLORER_BASE = 'https://explorer.aboutcircles.com';

export function getAnalyticsStartBlock(): number | null {
  const raw = process.env.THP_ANALYTICS_START_BLOCK?.trim();
  if (!raw) return null;
  const n = Number.parseInt(raw, 10);
  return Number.isFinite(n) && n > 0 ? n : null;
}

export function getGroupAddress(): string {
  return process.env.GROUP_ADDRESS?.trim() || DEFAULT_GROUP_ADDRESS;
}

function normalizeAddress(address: string): string {
  return address.trim().toLowerCase();
}

export function buildExplorerEventsUrl(address: string): string {
  const base = `${EXPLORER_BASE}/avatar/${normalizeAddress(address)}/events`;
  const startBlock = getAnalyticsStartBlock();
  if (startBlock == null) return base;
  return `${base}?startBlock=${startBlock}`;
}

export function buildExplorerGraphUrl(address: string): string {
  return `${EXPLORER_BASE}/avatar/${normalizeAddress(address)}/graph`;
}

export function buildExplorerTxUrl(txHash: string): string {
  return `${EXPLORER_BASE}/tx/${txHash.trim()}`;
}

export type ExplorerAvatarLinks = {
  address: string;
  eventsUrl: string;
  graphUrl: string;
};

export function explorerLinksForAddress(address: string): ExplorerAvatarLinks {
  return {
    address: normalizeAddress(address),
    eventsUrl: buildExplorerEventsUrl(address),
    graphUrl: buildExplorerGraphUrl(address),
  };
}
