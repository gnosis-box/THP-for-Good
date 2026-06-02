import type { Metadata } from 'next';
import { notFound } from 'next/navigation';

import { ExpertDetail } from '@/components/experts/ExpertDetail';
import { getExpertById } from '@/lib/db';
import {
  buildDefaultOpenGraph,
  buildDefaultTwitter,
  buildExpertMetaDescription,
  DEFAULT_OG_IMAGE_PATH,
  expertNotFoundMetadata,
} from '@/lib/site-metadata';

type ExpertPageProps = {
  params: Promise<{ id: string }>;
};

function parseExpertId(id: string): number | null {
  const expertId = Number.parseInt(id, 10);
  if (!Number.isFinite(expertId) || expertId <= 0) return null;
  return expertId;
}

export async function generateMetadata({ params }: ExpertPageProps): Promise<Metadata> {
  const { id } = await params;
  const expertId = parseExpertId(id);
  if (expertId === null) {
    return expertNotFoundMetadata;
  }

  const expert = getExpertById(expertId);
  if (!expert) {
    return expertNotFoundMetadata;
  }

  const title = `${expert.name} — THP expert`;
  const description = buildExpertMetaDescription(expert.bio, expert.skills);
  const path = `/expert/${expert.id}`;

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
  const expertId = parseExpertId(id);

  if (expertId === null) {
    notFound();
  }

  const expert = getExpertById(expertId);

  if (!expert) {
    notFound();
  }

  return <ExpertDetail expert={expert} />;
}
