'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button, buttonVariants } from '@/components/ui/button';
import { PayDrawer } from '@/components/booking/PayDrawer';
import { StickyPayBar } from '@/components/booking/StickyPayBar';
import { PayButton } from '@/components/experts/PayButton';
import { ExpertDetailBody } from '@/components/experts/ExpertDetailBody';
import { useWallet } from '@/components/wallet/WalletProvider';
import { useCrcBalance } from '@/hooks/use-crc-balance';
import { isValidBookingEmail } from '@/lib/booking-validation';
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

  const isSelf = !!address && address.toLowerCase() === expert.circles_address.toLowerCase();
  const hasSlot = !!selectedSlot;
  const isValidEmail = isValidBookingEmail(email);

  function handleSelectSlot(slot: string | null) {
    setSelectedSlot(slot);
    if (!slot) setDrawerOpen(false);
  }

  function handleDrawerOpenChange(open: boolean) {
    if (open && !isValidEmail) return;
    setDrawerOpen(open);
    if (open) {
      trackUmamiEvent('pay_drawer_open', { expert_id: expert.id });
    }
  }

  function focusBookingEmail() {
    const el = document.getElementById('booker-email');
    el?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    if (el instanceof HTMLInputElement) {
      el.focus({ preventScroll: true });
    }
  }

  function handleStickyContinue() {
    focusBookingEmail();
  }

  function handleStickyReview() {
    if (!isValidEmail) {
      focusBookingEmail();
      return;
    }
    handleDrawerOpenChange(true);
  }

  async function reloadExpert() {
    const res = await fetch(`/api/experts/${expert.id}`);
    if (res.ok) {
      const updated = (await res.json()) as ExpertRow;
      setExpert(updated);
    }
    setEditing(false);
  }

  function handlePaySuccess() {
    setDrawerOpen(false);
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

        <ExpertDetailBody
          editing={editing}
          expert={expert}
          isSelf={isSelf}
          walletAddress={address}
          selectedSlot={selectedSlot}
          onSelectSlot={handleSelectSlot}
          email={email}
          onEmailChange={setEmail}
          balance={balance}
          onSaved={reloadExpert}
          onCancelEdit={() => setEditing(false)}
          onDeactivated={() => router.push('/')}
          onPaySuccess={handlePaySuccess}
        />
      </div>

      {!editing && hasSlot && (
        <>
          <StickyPayBar
            priceCrc={expert.price_crc}
            hasSlot={hasSlot}
            isValidEmail={isValidEmail}
            onContinue={handleStickyContinue}
            onReview={handleStickyReview}
          />
          <div className="md:hidden">
            <PayDrawer
              open={drawerOpen}
              onOpenChange={handleDrawerOpenChange}
              gateMessage={drawerOpen && !isValidEmail ? UI_COPY.booking.enterEmailFirst : null}
            >
              <PayButton
                expert={expert}
                selectedSlot={selectedSlot}
                email={email}
                onEmailChange={setEmail}
                onSuccess={handlePaySuccess}
                showEmail
              />
            </PayDrawer>
          </div>
        </>
      )}
    </>
  );
}
