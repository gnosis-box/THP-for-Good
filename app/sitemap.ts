import type { MetadataRoute } from 'next';

import { getAllExperts } from '@/lib/db';
import { expertPublicPath } from '@/lib/expert-public-slug';
import { getAppOrigin } from '@/lib/site-metadata';

export const dynamic = 'force-dynamic';

const STATIC_PUBLIC_ROUTES = [
  '/',
  '/about',
  '/stats',
  '/dao',
  '/calls',
  '/expert/register',
] as const;

export default function sitemap(): MetadataRoute.Sitemap {
  const origin = getAppOrigin();
  const lastModified = new Date();

  const staticEntries: MetadataRoute.Sitemap = STATIC_PUBLIC_ROUTES.map((path) => ({
    url: path === '/' ? `${origin}/` : `${origin}${path}`,
    lastModified,
    changeFrequency: path === '/' ? 'daily' : 'weekly',
    priority: path === '/' ? 1 : 0.8,
  }));

  const expertEntries: MetadataRoute.Sitemap = getAllExperts({ includeInactive: false }).map(
    (expert) => ({
      url: `${origin}${expertPublicPath(expert.public_slug)}`,
      lastModified,
      changeFrequency: 'weekly',
      priority: 0.7,
    }),
  );

  return [...staticEntries, ...expertEntries];
}
