'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button, buttonVariants } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { BookingStepper } from '@/components/booking/BookingStepper';
import { MentorProfileHero } from '@/components/booking/MentorProfileHero';
import { PayDrawer } from '@/components/booking/PayDrawer';
import { StickyPayBar } from '@/components/booking/StickyPayBar';
import { PaymentSummary } from '@/components/booking/PaymentSummary';
import { SlotPicker } from '@/components/mentors/SlotPicker';
import { PayButton } from '@/components/mentors/PayButton';
import { MentorEditForm } from '@/components/mentors/MentorEditForm';
import { useWallet } from '@/components/wallet/WalletProvider';
import { useCrcBalance } from '@/hooks/use-crc-balance';
import { UI_COPY } from '@/lib/ui-copy';
import { cn } from '@/lib/utils';
import type { MentorRow } from '@/lib/db';

export function MentorDetail({ mentor: initialMentor }: { mentor: MentorRow }) {
  const router = useRouter();
  const { address } = useWallet();
  const balance = useCrcBalance(address);
  const [mentor, setMentor] = useState(initialMentor);
  const [editing, setEditing] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);
  const [email, setEmail] = useState('');
  const [drawerOpen, setDrawerOpen] = useState(false);

  const isSelf = !!address && address.toLowerCase() === mentor.circles_address.toLowerCase();
  const hasSlot = !!selectedSlot;
  const hasEmail = !!email.trim();

  async function reloadMentor() {
    const res = await fetch(`/api/mentors/${mentor.id}`);
    if (res.ok) {
      const updated = (await res.json()) as MentorRow;
      setMentor(updated);
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
                href="/mentor/register"
                className={cn(buttonVariants({ variant: 'ghost', size: 'sm' }), 'min-h-11')}
              >
                {UI_COPY.register.editTitle}
              </Link>
            </div>
          )}
        </div>

        {editing ? (
          <MentorEditForm
            mentor={mentor}
            walletAddress={address!}
            onSaved={reloadMentor}
            onCancel={() => setEditing(false)}
            onDeactivated={() => router.push('/')}
          />
        ) : (
          <>
            <BookingStepper hasSlot={hasSlot} hasEmail={hasEmail} />
            <MentorProfileHero mentor={mentor} />

            {mentor.bio && (
              <section className="flex flex-col gap-2">
                <h2 className="text-title text-sm font-semibold">{UI_COPY.booking.about}</h2>
                <p className="text-sm leading-relaxed text-muted-foreground">{mentor.bio}</p>
              </section>
            )}

            <Separator />

            <section className="flex flex-col gap-3">
              <h2 className="text-title text-sm font-semibold">{UI_COPY.booking.availability}</h2>
              {mentor.cal_event_type_id ? (
                <SlotPicker mentorId={mentor.id} selected={selectedSlot} onSelect={setSelectedSlot} />
              ) : (
                <p className="text-sm text-muted-foreground">
                  {isSelf ? UI_COPY.booking.noCalSelf : UI_COPY.booking.noCalVisitor}
                </p>
              )}
            </section>

            {hasSlot && (
              <section className="hidden flex-col gap-3 md:flex">
                <h2 className="text-title text-sm font-semibold">{UI_COPY.booking.bookSession}</h2>
                <PayButton
                  mentor={mentor}
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
                  sharePercent={mentor.mentor_share_percent ?? 20}
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
            priceCrc={mentor.price_crc}
            hasSlot={hasSlot}
            onReview={() => setDrawerOpen(true)}
          />
          <div className="md:hidden">
            <PayDrawer open={drawerOpen} onOpenChange={setDrawerOpen}>
            <PayButton
              mentor={mentor}
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
