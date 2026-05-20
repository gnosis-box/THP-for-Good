import { notFound } from 'next/navigation';

import { MentorDetail } from '@/components/mentors/MentorDetail';
import { PageNav } from '@/components/layout/PageNav';
import { getMentorById } from '@/lib/mentors';

type MentorPageProps = {
  params: Promise<{ id: string }>;
};

export default async function MentorPage({ params }: MentorPageProps) {
  const { id } = await params;
  const mentor = getMentorById(id);

  if (!mentor) notFound();

  return (
    <div className="flex flex-col gap-6">
      <MentorDetail mentor={mentor} />
      <PageNav />
    </div>
  );
}
