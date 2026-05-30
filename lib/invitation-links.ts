import type { InvitationLinkStatus } from '@/lib/db';

export const INVITATION_LINK_STATUSES: InvitationLinkStatus[] = ['available', 'used', 'invalid'];

export const DEFAULT_GNOSIS_ONBOARDING_URL =
  'https://app.metri.xyz/0x2b5E4045936ef12250a8c01e4Cbf71E9bEE69e00';

export function normalizeInvitationUrls(raw: string): string[] {
  const lines = raw
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);
  return [...new Set(lines)];
}

export function isValidInvitationUrl(value: string): boolean {
  try {
    const url = new URL(value);
    return url.protocol === 'https:' || url.protocol === 'http:';
  } catch {
    return false;
  }
}

export function isValidInvitationStatus(value: string): value is InvitationLinkStatus {
  return INVITATION_LINK_STATUSES.includes(value as InvitationLinkStatus);
}

export function getDefaultOnboardingFallbackUrl(): string {
  const fromEnv = process.env.NEXT_PUBLIC_GNOSIS_ONBOARDING_URL?.trim();
  if (fromEnv && isValidInvitationUrl(fromEnv)) {
    return fromEnv;
  }
  return DEFAULT_GNOSIS_ONBOARDING_URL;
}
