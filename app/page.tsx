import { getAllMentors, getAllTags } from '@/lib/db';
import { MentorBrowser } from '@/components/mentors/MentorBrowser';

export default function HomePage() {
  const mentors = getAllMentors();
  const tags = getAllTags();

  return <MentorBrowser mentors={mentors} tags={tags} />;
}
