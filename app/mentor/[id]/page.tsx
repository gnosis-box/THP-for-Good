import { notFound } from 'next/navigation';
import { getMentorById } from '@/lib/db';
import { MentorDetail } from '@/components/mentors/MentorDetail';

export default async function MentorPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const mentorId = parseInt(id, 10);

  if (isNaN(mentorId)) {
    notFound();
  }

  const mentor = getMentorById(mentorId);

  if (!mentor) {
    notFound();
  }

  return <MentorDetail mentor={mentor} />;
}
