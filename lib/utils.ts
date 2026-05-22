import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function shortenAddress(address: string, chars = 4): string {
  if (!address) return "";
  const head = address.startsWith("0x") ? 2 + chars : chars;
  return `${address.slice(0, head)}…${address.slice(-chars)}`;
}

export function toHttpImageUrl(url: string | undefined | null): string | undefined {
  if (!url) return undefined;
  if (url.startsWith('data:') || url.startsWith('https://') || url.startsWith('http://')) return url;
  if (url.startsWith('ipfs://')) return `https://cloudflare-ipfs.com/ipfs/${url.slice(7)}`;
  return undefined;
}

const CIRCLES_SCORE_BASE = 'https://rpc.staging.aboutcircles.com/score-groups';
const CIRCLES_SCORE_GROUP = '0x7CadB2E92295F3E4fA65D3d4E7265E2e05d7a783';

export async function fetchCirclesScore(address: string): Promise<number | null> {
  try {
    const res = await fetch(`${CIRCLES_SCORE_BASE}/groups/${CIRCLES_SCORE_GROUP}/proof/${address}`);
    if (!res.ok) return null;
    const data = (await res.json()) as { scoreRaw?: string; error?: unknown };
    if (data.error) return null;
    const score = parseInt(data.scoreRaw ?? '0', 10);
    return score > 0 ? score : null;
  } catch {
    return null;
  }
}
