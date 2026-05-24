'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

import { Button } from '@/components/ui/button';
import { StatusAlert } from '@/components/ui-patterns/StatusAlert';
import { UI_COPY } from '@/lib/ui-copy';

type Props = {
  expertId: number;
  walletAddress: string;
  onDeactivated?: () => void;
};

export function StopExpertButton({ expertId, walletAddress, onDeactivated }: Props) {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleDeactivate() {
    const confirmed = window.confirm(UI_COPY.register.stopExpertConfirm);
    if (!confirmed) return;

    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch(`/api/experts/${expertId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'x-wallet-address': walletAddress,
        },
        body: JSON.stringify({ active: 0 }),
      });
      if (!res.ok) {
        const json = (await res.json()) as { error?: string };
        throw new Error(json.error ?? 'Could not update profile');
      }
      onDeactivated?.();
      router.push('/');
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="flex flex-col gap-2 border-t border-border pt-5">
      <p className="text-xs text-muted-foreground">{UI_COPY.register.stopExpertHint}</p>
      {error ? <StatusAlert variant="error" title="Update failed" description={error} /> : null}
      <Button
        type="button"
        variant="outline"
        className="w-fit border-destructive/40 text-destructive hover:bg-destructive/10 hover:text-destructive"
        disabled={submitting}
        onClick={handleDeactivate}
      >
        {submitting ? UI_COPY.register.stopExpertLoading : UI_COPY.register.stopExpertCta}
      </Button>
    </div>
  );
}
