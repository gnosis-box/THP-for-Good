import { RegisterForm } from '@/components/mentors/RegisterForm';

export default function RegisterPage() {
  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-6">
      <div className="flex flex-col gap-2">
        <h1 className="font-display text-3xl font-bold tracking-tight">Offer your expertise</h1>
        <p className="text-base text-muted-foreground">
          Share your knowledge with the THP community. Each booking generates CRC revenue for the THP for Good fund.
        </p>
      </div>
      <RegisterForm />
    </div>
  );
}
