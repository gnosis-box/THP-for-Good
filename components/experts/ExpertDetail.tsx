'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button, buttonVariants } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { BookingStepper } from '@/components/booking/BookingStepper';
import { ExpertProfileHero } from '@/components/booking/ExpertProfileHero';
import { PayDrawer } from '@/components/booking/PayDrawer';
import { StickyPayBar } from '@/components/booking/StickyPayBar';
import { PaymentSummary } from '@/components/booking/PaymentSummary';
import { SlotPicker } from '@/components/experts/SlotPicker';
import { PayButton } from '@/components/experts/PayButton';
import { ExpertEditForm } from '@/components/experts/ExpertEditForm';
import { ExpertLanguageTags } from '@/components/ui-patterns/ExpertMeta';
import { useWallet } from '@/components/wallet/WalletProvider';
import { useCrcBalance } from '@/hooks/use-crc-balance';
import { UI_COPY } from '@/lib/ui-copy';
import { trackUmamiEvent } from '@/lib/analytics-umami';
import { cn } from '@/lib/utils';
import type { ExpertRow } from '@/lib/db';

export function ExpertDetail({ expert: initialExpert }: { expert: ExpertRow }) {
  const router = useRouter();
  const { address } = useWallet();
  const balance = useCrcBalance(address);
  const [expert, setExpert] = useState(initialExpert);
  const [editing, setEditing] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);
  const [email, setEmail] = useState('');
  const [drawerOpen, setDrawerOpen] = useState(false);
  const expertViewTracked = useRef(false);

  useEffect(() => {
    if (expertViewTracked.current) return;
    expertViewTracked.current = true;
    trackUmamiEvent('expert_view', { expert_id: expert.id });
  }, [expert.id]);

  function handleDrawerOpenChange(open: boolean) {
    setDrawerOpen(open);
    if (open) {
      trackUmamiEvent('pay_drawer_open', { expert_id: expert.id });
    }
  }

  const isSelf = !!address && address.toLowerCase() === expert.circles_address.toLowerCase();
  const hasSlot = !!selectedSlot;
  const hasEmail = !!email.trim();

  async function reloadExpert() {
    const res = await fetch(`/api/experts/${expert.id}`);
    if (res.ok) {
      const updated = (await res.json()) as ExpertRow;
      setExpert(updated);
    }
    setEditing(false);
  }

  return (
    <>
      <div className="mx-auto flex max-w-lg flex-col gap-6 pb-28 md:max-w-2xl md:pb-8">
        <div className="flex items-center justify-between">
          <Button variant="ghost" size="sm" onClick={() => router.back()} className="-ml-2 min-h-11">
            {UI_COPY.booking.back}
          </Button>
          {isSelf && !editing && (
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={() => setEditing(true)} className="min-h-11">
                {UI_COPY.booking.editProfile}
              </Button>
              <Link
                href="/expert/register"
                className={cn(buttonVariants({ variant: 'ghost', size: 'sm' }), 'min-h-11')}
              >
                {UI_COPY.register.editTitle}
              </Link>
            </div>
          )}
        </div>

        {editing ? (
          <ExpertEditForm
            expert={expert}
            walletAddress={address!}
            onSaved={reloadExpert}
            onCancel={() => setEditing(false)}
            onDeactivated={() => router.push('/')}
          />
        ) : (
          <>
            <BookingStepper hasSlot={hasSlot} hasEmail={hasEmail} />
            <ExpertProfileHero expert={expert} />

            {expert.bio && (
              <section className="flex flex-col items-center gap-2 text-center">
                <h2 className="text-center text-sm font-semibold">{UI_COPY.booking.about}</h2>
                <p className="max-w-lg whitespace-pre-line text-sm leading-relaxed text-muted-foreground">
                  {expert.bio}
                </p>
                {(expert.call_languages.length > 0 || expert.spoken_languages.length > 0) && (
                  <ExpertLanguageTags
                    languages={
                      expert.call_languages.length > 0
                        ? expert.call_languages
                        : expert.spoken_languages
                    }
                    prefix="Sessions"
                  />
                )}
              </section>
            )}

            <Separator />

            <section className="flex flex-col items-center gap-3">
              <h2 className="text-center text-sm font-semibold">{UI_COPY.booking.availability}</h2>
              {expert.cal_event_type_id ? (
                <SlotPicker expertId={expert.id} selected={selectedSlot} onSelect={setSelectedSlot} />
              ) : (
                <p className="text-center text-sm text-muted-foreground">
                  {isSelf ? UI_COPY.booking.noCalSelf : UI_COPY.booking.noCalVisitor}
                </p>
              )}
            </section>

            {hasSlot && (
              <section className="hidden flex-col gap-3 md:flex">
                <h2 className="text-title text-sm font-semibold">{UI_COPY.booking.bookSession}</h2>
                <PayButton
                  expert={expert}
                  selectedSlot={selectedSlot}
                  email={email}
                  onEmailChange={setEmail}
                  onSuccess={() => setDrawerOpen(false)}
                />
              </section>
            )}

            {hasSlot && (
              <section className="flex flex-col gap-3 md:hidden">
                <h2 className="text-title text-sm font-semibold">{UI_COPY.booking.stepDetails}</h2>
                <PaymentSummary
                  balance={balance}
                  sharePercent={expert.expert_share_percent ?? 20}
                  email={email}
                  onEmailChange={setEmail}
                />
              </section>
            )}
          </>
        )}
      </div>

      {!editing && hasSlot && (
        <>
          <StickyPayBar
            priceCrc={expert.price_crc}
            hasSlot={hasSlot}
            onReview={() => handleDrawerOpenChange(true)}
          />
          <div className="md:hidden">
            <PayDrawer open={drawerOpen} onOpenChange={handleDrawerOpenChange}>
            <PayButton
              expert={expert}
              selectedSlot={selectedSlot}
              email={email}
              onEmailChange={setEmail}
              onSuccess={() => setDrawerOpen(false)}
              showEmail
            />
            </PayDrawer>
          </div>
        </>
      )}
    </>
  );
}
