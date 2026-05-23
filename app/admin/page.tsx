import { AdminPanel } from '@/components/admin/AdminPanel';

export default function AdminPage() {
  return (
    <main className="flex flex-col gap-6">
      <h1 className="text-xl font-semibold">Admin</h1>
      <AdminPanel />
    </main>
  );
}
