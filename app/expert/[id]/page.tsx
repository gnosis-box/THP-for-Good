import { notFound } from 'next/navigation';
import { getExpertById } from '@/lib/db';
import { ExpertDetail } from '@/components/experts/ExpertDetail';

export default async function ExpertPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const expertId = parseInt(id, 10);

  if (isNaN(expertId)) {
    notFound();
  }

  const expert = getExpertById(expertId);

  if (!expert) {
    notFound();
  }

  return <ExpertDetail expert={expert} />;
}
