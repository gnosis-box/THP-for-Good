import type { Metadata } from 'next';
import { notFound, permanentRedirect } from 'next/navigation';

import { ExpertDetail } from '@/components/experts/ExpertDetail';
import { JsonLd } from '@/components/seo/JsonLd';
import { getExpertById, getExpertByPublicSlug, type ExpertRow } from '@/lib/db';
import {
  expertPublicPath,
  isLegacyNumericExpertId,
  isValidPublicSlug,
} from '@/lib/expert-public-slug';
import {
  buildDefaultOpenGraph,
  buildDefaultTwitter,
  buildExpertMetaDescription,
  DEFAULT_OG_IMAGE_PATH,
  expertNotFoundMetadata,
} from '@/lib/site-metadata';
import { buildExpertJsonLd } from '@/lib/structured-data';

type ExpertPageProps = {
  params: Promise<{ id: string }>;
};

function resolveExpertFromSegment(segment: string): ExpertRow | null {
  if (isLegacyNumericExpertId(segment)) {
    return getExpertById(Number.parseInt(segment, 10)) ?? null;
  }
  if (!isValidPublicSlug(segment)) {
    return null;
  }
  return getExpertByPublicSlug(segment) ?? null;
}

export async function generateMetadata({ params }: ExpertPageProps): Promise<Metadata> {
  const { id } = await params;
  const expert = resolveExpertFromSegment(id);
  if (!expert) {
    return expertNotFoundMetadata;
  }

  const title = `${expert.name} — THP expert`;
  const description = buildExpertMetaDescription(expert.bio, expert.skills);
  const path = expertPublicPath(expert.public_slug);

  return {
    title,
    description,
    alternates: { canonical: path },
    openGraph: buildDefaultOpenGraph({
      url: path,
      title,
      description,
      images: [{ url: DEFAULT_OG_IMAGE_PATH, alt: `${expert.name} on THP for Good` }],
    }),
    twitter: buildDefaultTwitter({
      title,
      description,
    }),
  };
}

export default async function ExpertPage({ params }: ExpertPageProps) {
  const { id } = await params;
  const expert = resolveExpertFromSegment(id);

  if (!expert) {
    notFound();
  }

  if (isLegacyNumericExpertId(id) && id !== expert.public_slug) {
    permanentRedirect(expertPublicPath(expert.public_slug));
  }

  return (
    <>
      <JsonLd data={buildExpertJsonLd(expert)} />
      <ExpertDetail expert={expert} />
    </>
  );
}
