import type { MetadataRoute } from 'next';

import { getAppOrigin } from '@/lib/site-metadata';
import { CRAWLER_DISALLOW_PATHS, getAiTrainingUserAgents } from '@/lib/structured-data';

const PUBLIC_CRAWLER_RULE = {
  allow: '/',
  disallow: [...CRAWLER_DISALLOW_PATHS],
};

export default function robots(): MetadataRoute.Robots {
  const origin = getAppOrigin();

  return {
    rules: [
      {
        userAgent: '*',
        ...PUBLIC_CRAWLER_RULE,
      },
      ...getAiTrainingUserAgents().map((userAgent) => ({
        userAgent,
        ...PUBLIC_CRAWLER_RULE,
      })),
    ],
    sitemap: `${origin}/sitemap.xml`,
  };
}
