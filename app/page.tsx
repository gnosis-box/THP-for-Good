export const dynamic = 'force-dynamic';

import { getAllExperts, getAllTags } from '@/lib/db';
import { ExpertBrowser } from '@/components/experts/ExpertBrowser';

export default function HomePage() {
  const experts = getAllExperts();
  const tags = getAllTags();

  return <ExpertBrowser experts={experts} tags={tags} />;
}
