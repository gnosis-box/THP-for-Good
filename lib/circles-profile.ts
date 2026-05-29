import { toHttpImageUrl } from '@/lib/utils';

type TrustStatsLike = {
  trustedByCount?: number;
} | null | undefined;

type ProfileLike = {
  picture?: string | null;
  previewImageUrl?: string | null;
  imageUrl?: string | null;
  name?: string | null;
} | null | undefined;

export function getTrustedByCount(trustStats: TrustStatsLike): number | null {
  const value = trustStats?.trustedByCount;
  return typeof value === 'number' ? value : null;
}

export function getProfileImageUrl(profile: ProfileLike): string | undefined {
  return toHttpImageUrl(profile?.picture ?? profile?.previewImageUrl ?? profile?.imageUrl);
}

export function getProfileName(profile: ProfileLike, fallbackAddress: string): string {
  const trimmed = profile?.name?.trim();
  return trimmed && trimmed.length > 0 ? trimmed : `${fallbackAddress.slice(0, 8)}…`;
}
