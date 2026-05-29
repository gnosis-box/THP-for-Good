import { toHttpImageUrl } from '@/lib/utils';

/** Minimal profile view shape for trust + avatar extraction (client RPC or server). */
export type ProfileViewTrustSource = {
  trustStats?: { trustedByCount?: number; trustsCount?: number } | null;
  profile?: {
    trustsReceivedCount?: number;
    picture?: string;
    previewImageUrl?: string;
    imageUrl?: string;
  } | null;
};

/**
 * Inbound trust count for display ("Trusted by N").
 *
 * Probe (2026-05): on mainnet, `profile.trustsReceivedCount` matches Trust Score
 * Explorer; `trustStats.trustedByCount` is often 0 even when profile has a count.
 * Prefer profile, then trustStats, then 0.
 */
export function getTrustedByCount(view: ProfileViewTrustSource): number {
  const fromProfile = view.profile?.trustsReceivedCount;
  if (typeof fromProfile === 'number' && Number.isFinite(fromProfile)) {
    return fromProfile;
  }
  const fromStats = view.trustStats?.trustedByCount;
  if (typeof fromStats === 'number' && Number.isFinite(fromStats)) {
    return fromStats;
  }
  return 0;
}

export function getProfileImageUrl(view: ProfileViewTrustSource): string | undefined {
  const raw = view.profile as (typeof view.profile & { picture?: string }) | undefined;
  return toHttpImageUrl(raw?.picture ?? view.profile?.previewImageUrl ?? view.profile?.imageUrl);
}
