import { randomBytes } from 'crypto';

/** URL-safe lowercase slug alphabet (no 0/1/o/l to reduce confusion). */
const SLUG_ALPHABET = 'abcdefghjkmnpqrstuvwxyz23456789';
const SLUG_LENGTH = 8;

export function generatePublicSlug(): string {
  const bytes = randomBytes(SLUG_LENGTH);
  let slug = '';
  for (let i = 0; i < SLUG_LENGTH; i++) {
    slug += SLUG_ALPHABET[bytes[i]! % SLUG_ALPHABET.length];
  }
  return slug;
}

export function isValidPublicSlug(value: string): boolean {
  return new RegExp(`^[${SLUG_ALPHABET}]{${SLUG_LENGTH},12}$`).test(value);
}

/** Legacy `/expert/123` URLs — positive integer segment only. */
export function isLegacyNumericExpertId(segment: string): boolean {
  if (!/^\d+$/.test(segment)) return false;
  const id = Number.parseInt(segment, 10);
  return Number.isFinite(id) && id > 0;
}

export function expertPublicPath(publicSlug: string): `/expert/${string}` {
  return `/expert/${publicSlug}`;
}
