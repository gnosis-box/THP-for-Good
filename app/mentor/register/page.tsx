import { RegisterForm } from '@/components/mentors/RegisterForm';

export default function RegisterPage() {
  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-6">
      <h1 className="text-2xl font-semibold tracking-tight">Become a Mentor</h1>
      <p className="text-sm text-muted-foreground">
        Share your expertise with the THP community. Each booking generates CRC revenue for the THP
        for Good fund.
      </p>
      <RegisterForm />
    </div>
  );
}
