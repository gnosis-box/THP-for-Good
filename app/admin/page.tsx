import { AdminPanel } from '@/components/admin/AdminPanel';
import { PageHeader } from '@/components/layout/PageHeader';

export default function AdminPage() {
  return (
    <main className="flex flex-col gap-6">
      <PageHeader title="Admin" />
      <AdminPanel />
    </main>
  );
}
