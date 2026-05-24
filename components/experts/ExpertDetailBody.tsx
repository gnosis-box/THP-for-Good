'use client';

import { AnimatePresence, motion } from 'motion/react';
import { BookingStepper } from '@/components/booking/BookingStepper';
import { ExpertProfileHero } from '@/components/booking/ExpertProfileHero';
import { PayButton } from '@/components/experts/PayButton';
import { ExpertEditForm } from '@/components/experts/ExpertEditForm';
import { SlotPicker } from '@/components/experts/SlotPicker';
import { PaymentSummary } from '@/components/booking/PaymentSummary';
import { usePrefersReducedMotion } from '@/hooks/use-prefers-reduced-motion';
import { UI_COPY } from '@/lib/ui-copy';
import type { ExpertRow } from '@/lib/db';
import type { CrcBalanceState } from '@/hooks/use-crc-balance';

type Props = {
  editing: boolean;
  expert: ExpertRow;
  isSelf: boolean;
  walletAddress: string | null;
  selectedSlot: string | null;
  onSelectSlot: (slot: string | null) => void;
  email: string;
  onEmailChange: (email: string) => void;
  balance: CrcBalanceState;
  onSaved: () => void;
  onCancelEdit: () => void;
  onDeactivated: () => void;
  onPaySuccess: () => void;
};

export function ExpertDetailBody({
  editing,
  expert,
  isSelf,
  walletAddress,
  selectedSlot,
  onSelectSlot,
  email,
  onEmailChange,
  balance,
  onSaved,
  onCancelEdit,
  onDeactivated,
  onPaySuccess,
}: Props) {
  const reducedMotion = usePrefersReducedMotion();
  const hasSlot = !!selectedSlot;
  const hasEmail = !!email.trim();

  if (reducedMotion) {
    if (editing) {
      return (
        <ExpertEditForm
          expert={expert}
          walletAddress={walletAddress!}
          onSaved={onSaved}
          onCancel={onCancelEdit}
          onDeactivated={onDeactivated}
        />
      );
    }
    return (
      <BookingView
        expert={expert}
        isSelf={isSelf}
        selectedSlot={selectedSlot}
        onSelectSlot={onSelectSlot}
        hasSlot={hasSlot}
        hasEmail={hasEmail}
        email={email}
        onEmailChange={onEmailChange}
        balance={balance}
        onPaySuccess={onPaySuccess}
      />
    );
  }

  return (
    <AnimatePresence mode="wait">
      {editing ? (
        <motion.div
          key="edit"
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.2, ease: 'easeOut' }}
        >
          <ExpertEditForm
            expert={expert}
            walletAddress={walletAddress!}
            onSaved={onSaved}
            onCancel={onCancelEdit}
            onDeactivated={onDeactivated}
          />
        </motion.div>
      ) : (
        <motion.div
          key="view"
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.2, ease: 'easeOut' }}
        >
          <BookingView
            expert={expert}
            isSelf={isSelf}
            selectedSlot={selectedSlot}
            onSelectSlot={onSelectSlot}
            hasSlot={hasSlot}
            hasEmail={hasEmail}
            email={email}
            onEmailChange={onEmailChange}
            balance={balance}
            onPaySuccess={onPaySuccess}
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function BookingView({
  expert,
  isSelf,
  selectedSlot,
  onSelectSlot,
  hasSlot,
  hasEmail,
  email,
  onEmailChange,
  balance,
  onPaySuccess,
}: {
  expert: ExpertRow;
  isSelf: boolean;
  selectedSlot: string | null;
  onSelectSlot: (slot: string | null) => void;
  hasSlot: boolean;
  hasEmail: boolean;
  email: string;
  onEmailChange: (email: string) => void;
  balance: CrcBalanceState;
  onPaySuccess: () => void;
}) {
  return (
    <>
      <BookingStepper hasSlot={hasSlot} hasEmail={hasEmail} className="w-full" />
      <ExpertProfileHero expert={expert} />

      <section className="flex w-full flex-col gap-3">
        {expert.cal_event_type_id ? (
          <>
            <h2 className="text-center text-sm font-semibold">
              {UI_COPY.booking.selectAvailabilitySlot}
            </h2>
            <SlotPicker expertId={expert.id} selected={selectedSlot} onSelect={onSelectSlot} />
          </>
        ) : (
          <p className="text-center text-sm text-muted-foreground">
            {isSelf ? UI_COPY.booking.noCalSelf : UI_COPY.booking.noCalVisitor}
          </p>
        )}
      </section>

      {hasSlot && (
        <section className="hidden w-full flex-col gap-3 md:flex">
          <h2 className="text-title text-center text-sm font-semibold">{UI_COPY.booking.bookSession}</h2>
          <PayButton
            expert={expert}
            selectedSlot={selectedSlot}
            email={email}
            onEmailChange={onEmailChange}
            onSuccess={onPaySuccess}
          />
        </section>
      )}

      {hasSlot && (
        <section className="flex w-full flex-col gap-3 md:hidden">
          <h2 className="text-title text-center text-sm font-semibold">{UI_COPY.booking.stepDetails}</h2>
          <PaymentSummary
            balance={balance}
            sharePercent={expert.expert_share_percent ?? 20}
            email={email}
            onEmailChange={onEmailChange}
          />
        </section>
      )}
    </>
  );
}
