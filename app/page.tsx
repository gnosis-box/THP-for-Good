import { MentorGrid } from '@/components/mentors/MentorGrid';
import { getAllMentors } from '@/lib/mentors';

export default function HomePage() {
  const mentors = getAllMentors();

  return <MentorGrid mentors={mentors} />;
}
