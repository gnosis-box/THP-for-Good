import { PageHeader } from '@/components/layout/PageHeader';
import { PageNav } from '@/components/layout/PageNav';
import { ExpertStatsPanel } from '@/components/profile/ExpertStatsPanel';
import { ProfileLookup } from '@/components/profile/ProfileLookup';

export default function ProfilePage() {
  return (
    <div className="mx-auto flex max-w-4xl flex-col gap-6">
      <PageHeader
        title="Profile"
        subtitle="Look up the connected user&apos;s Circles avatar metadata."
      />

      <ProfileLookup />

      <ExpertStatsPanel />

      <PageNav />
    </div>
  );
}
