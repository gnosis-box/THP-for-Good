import type { ExpertRow } from '@/lib/db';
import { expertPublicPath } from '@/lib/expert-public-slug';
import {
  buildExpertMetaDescription,
  DEFAULT_OG_IMAGE_PATH,
  getAppOrigin,
  SITE_DESCRIPTION,
  SITE_NAME,
} from '@/lib/site-metadata';
import { UI_COPY } from '@/lib/ui-copy';

export type JsonLdGraph = Record<string, unknown>;

const PUBLIC_DISALLOW_PATHS = ['/admin', '/api'] as const;

/** Shared disallow list for robots and llms.txt out-of-scope notes. */
export const CRAWLER_DISALLOW_PATHS: readonly string[] = PUBLIC_DISALLOW_PATHS;

const AI_TRAINING_USER_AGENTS = [
  'GPTBot',
  'ChatGPT-User',
  'ClaudeBot',
  'anthropic-ai',
  'Google-Extended',
  'Applebot-Extended',
  'PerplexityBot',
  'Bytespider',
  'CCBot',
] as const;

export function getAiTrainingUserAgents(): readonly string[] {
  return AI_TRAINING_USER_AGENTS;
}

export function buildHomeJsonLd(): JsonLdGraph[] {
  const origin = getAppOrigin();
  const hero = UI_COPY.home.hero;
  const siteUrl = `${origin}/`;

  return [
    {
      '@context': 'https://schema.org',
      '@type': 'WebSite',
      name: SITE_NAME,
      url: siteUrl,
      description: hero.subtitle,
      inLanguage: 'en',
      potentialAction: {
        '@type': 'SearchAction',
        target: {
          '@type': 'EntryPoint',
          urlTemplate: `${origin}/?q={search_term_string}`,
        },
        'query-input': 'required name=search_term_string',
      },
    },
    {
      '@context': 'https://schema.org',
      '@type': 'Organization',
      name: SITE_NAME,
      url: siteUrl,
      description: SITE_DESCRIPTION,
      logo: `${origin}${DEFAULT_OG_IMAGE_PATH}`,
    },
  ];
}

export function buildExpertJsonLd(expert: ExpertRow): JsonLdGraph[] {
  const origin = getAppOrigin();
  const url = `${origin}${expertPublicPath(expert.public_slug)}`;
  const description = buildExpertMetaDescription(expert.bio, expert.skills);

  return [
    {
      '@context': 'https://schema.org',
      '@type': 'ProfilePage',
      url,
      name: `${expert.name} — THP expert`,
      mainEntity: {
        '@type': 'Person',
        name: expert.name,
        description,
        url,
      },
    },
  ];
}
