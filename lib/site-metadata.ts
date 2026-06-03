import type { Metadata } from 'next';

export const SITE_NAME = 'THP for Good';
export const DEFAULT_APP_ORIGIN = 'https://thp.gnosis.box';
/** Public brand image for Open Graph / Twitter cards */
export const DEFAULT_OG_IMAGE_PATH = '/thp-logo.png';

export const SITE_DESCRIPTION =
  'Book practical 1:1 support with THP experts, pay in CRC, and fund future learners.';

export function getAppOrigin(): string {
  const raw = process.env.NEXT_PUBLIC_APP_URL?.trim();
  if (!raw) return DEFAULT_APP_ORIGIN;

  const withProtocol = /^https?:\/\//i.test(raw) ? raw : `https://${raw}`;
  try {
    const url = new URL(withProtocol);
    url.pathname = '';
    url.search = '';
    url.hash = '';
    return url.toString().replace(/\/$/, '');
  } catch {
    return DEFAULT_APP_ORIGIN;
  }
}

export function getMetadataBase(): URL {
  return new URL(`${getAppOrigin()}/`);
}

export function buildDefaultOpenGraph(
  overrides: Partial<NonNullable<Metadata['openGraph']>> = {},
): NonNullable<Metadata['openGraph']> {
  return {
    type: 'website',
    siteName: SITE_NAME,
    images: [{ url: DEFAULT_OG_IMAGE_PATH, alt: SITE_NAME }],
    ...overrides,
  };
}

export function buildDefaultTwitter(
  overrides: Partial<NonNullable<Metadata['twitter']>> = {},
): NonNullable<Metadata['twitter']> {
  return {
    card: 'summary_large_image',
    images: [DEFAULT_OG_IMAGE_PATH],
    ...overrides,
  };
}

export const rootSiteMetadata: Metadata = {
  metadataBase: getMetadataBase(),
  title: {
    default: SITE_NAME,
    template: `%s · ${SITE_NAME}`,
  },
  description: SITE_DESCRIPTION,
  alternates: {
    canonical: '/',
  },
  openGraph: buildDefaultOpenGraph({
    url: '/',
    title: SITE_NAME,
    description: SITE_DESCRIPTION,
  }),
  twitter: buildDefaultTwitter({
    title: SITE_NAME,
    description: SITE_DESCRIPTION,
  }),
};

export function truncateForMeta(text: string, maxLen: number): string {
  const normalized = text.replace(/\s+/g, ' ').trim();
  if (normalized.length <= maxLen) return normalized;
  return `${normalized.slice(0, maxLen - 1).trimEnd()}…`;
}

export function buildExpertMetaDescription(bio: string | null, skills: string[]): string {
  const skillSnippet =
    skills.length > 0 ? `Skills: ${skills.slice(0, 5).join(', ')}.` : '';
  const bioPart = bio?.trim()
    ? truncateForMeta(bio, 140)
    : 'Book a 1:1 session with this THP expert and pay in CRC.';

  if (!skillSnippet) return bioPart;
  return truncateForMeta(`${bioPart} ${skillSnippet}`, 200);
}

/** Minimal metadata for missing expert routes (no expert-specific preview). */
export const expertNotFoundMetadata: Metadata = {
  title: 'Expert not found',
  description: SITE_DESCRIPTION,
  robots: { index: false, follow: false },
};
