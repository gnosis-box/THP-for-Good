'use client';

import { AnimatePresence, motion } from 'motion/react';
import { StickyBookingStepper } from '@/components/booking/StickyBookingStepper';
import { ExpertProfileHero } from '@/components/booking/ExpertProfileHero';
import { PayButton } from '@/components/experts/PayButton';
import { ExpertEditForm } from '@/components/experts/ExpertEditForm';
import { SlotPicker } from '@/components/experts/SlotPicker';
import { PaymentSummary } from '@/components/booking/PaymentSummary';
import { usePrefersReducedMotion } from '@/hooks/use-prefers-reduced-motion';
import { isValidBookingContext, isValidBookingDomain, normalizeBookingText } from '@/lib/booking-context';
import { isValidBookingEmail } from '@/lib/booking-validation';
import { UI_COPY } from '@/lib/ui-copy';
import { Button } from '@/components/ui/button';
import { StatusAlert } from '@/components/ui-patterns/StatusAlert';
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
  callDomain: string;
  onCallDomainChange: (value: string) => void;
  callContext: string;
  onCallContextChange: (value: string) => void;
  balance: CrcBalanceState;
  requiresOnboarding: boolean;
  onboardingHandled: boolean;
  onboardingInviteUrl: string | null;
  onboardingError: string | null;
  onboardingHint: string | null;
  claimingInvitation: boolean;
  onClaimInvitation: () => void;
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
  callDomain,
  onCallDomainChange,
  callContext,
  onCallContextChange,
  balance,
  requiresOnboarding,
  onboardingHandled,
  onboardingInviteUrl,
  onboardingError,
  onboardingHint,
  claimingInvitation,
  onClaimInvitation,
  onSaved,
  onCancelEdit,
  onDeactivated,
  onPaySuccess,
}: Props) {
  const reducedMotion = usePrefersReducedMotion();
  const hasSlot = !!selectedSlot;
  const isValidEmail = isValidBookingEmail(email);
  const hasContext =
    isValidBookingDomain(normalizeBookingText(callDomain)) &&
    isValidBookingContext(normalizeBookingText(callContext));

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
        isValidEmail={isValidEmail}
        hasContext={hasContext}
        email={email}
        onEmailChange={onEmailChange}
        callDomain={callDomain}
        onCallDomainChange={onCallDomainChange}
        callContext={callContext}
        onCallContextChange={onCallContextChange}
        balance={balance}
        requiresOnboarding={requiresOnboarding}
        onboardingHandled={onboardingHandled}
        onboardingInviteUrl={onboardingInviteUrl}
        onboardingError={onboardingError}
        onboardingHint={onboardingHint}
        claimingInvitation={claimingInvitation}
        onClaimInvitation={onClaimInvitation}
        onPaySuccess={onPaySuccess}
      />
    );
  }

  return (
    <AnimatePresence mode="wait">
      {editing ? (
        <motion.div
          key="edit"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
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
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2, ease: 'easeOut' }}
        >
          <BookingView
            expert={expert}
            isSelf={isSelf}
            selectedSlot={selectedSlot}
            onSelectSlot={onSelectSlot}
            hasSlot={hasSlot}
            isValidEmail={isValidEmail}
            hasContext={hasContext}
            email={email}
            onEmailChange={onEmailChange}
            callDomain={callDomain}
            onCallDomainChange={onCallDomainChange}
            callContext={callContext}
            onCallContextChange={onCallContextChange}
            balance={balance}
            requiresOnboarding={requiresOnboarding}
            onboardingHandled={onboardingHandled}
            onboardingInviteUrl={onboardingInviteUrl}
            onboardingError={onboardingError}
            onboardingHint={onboardingHint}
            claimingInvitation={claimingInvitation}
            onClaimInvitation={onClaimInvitation}
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
  isValidEmail,
  hasContext,
  email,
  onEmailChange,
  callDomain,
  onCallDomainChange,
  callContext,
  onCallContextChange,
  balance,
  requiresOnboarding,
  onboardingHandled,
  onboardingInviteUrl,
  onboardingError,
  onboardingHint,
  claimingInvitation,
  onClaimInvitation,
  onPaySuccess,
}: {
  expert: ExpertRow;
  isSelf: boolean;
  selectedSlot: string | null;
  onSelectSlot: (slot: string | null) => void;
  hasSlot: boolean;
  isValidEmail: boolean;
  hasContext: boolean;
  email: string;
  onEmailChange: (email: string) => void;
  callDomain: string;
  onCallDomainChange: (value: string) => void;
  callContext: string;
  onCallContextChange: (value: string) => void;
  balance: CrcBalanceState;
  requiresOnboarding: boolean;
  onboardingHandled: boolean;
  onboardingInviteUrl: string | null;
  onboardingError: string | null;
  onboardingHint: string | null;
  claimingInvitation: boolean;
  onClaimInvitation: () => void;
  onPaySuccess: () => void;
}) {
  const sharePercent = expert.expert_share_percent ?? 20;
  const detailsComplete = isValidEmail && hasContext;
  const needsOnboardingClaim = requiresOnboarding && !onboardingHandled;

  return (
    <>
      <StickyBookingStepper
        hasSlot={hasSlot}
        isValidEmail={isValidEmail}
        hasContext={hasContext && !needsOnboardingClaim}
      />
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

      {requiresOnboarding && (
        <section id="booking-onboarding-claim" className="flex w-full flex-col gap-3">
          <StatusAlert
            variant="warning"
            title={UI_COPY.booking.onboardingRequiredTitle}
            description={
              <div className="flex flex-col gap-2">
                <p>{UI_COPY.booking.onboardingRequiredDescription}</p>
                {onboardingInviteUrl ? (
                  <p className="text-xs text-muted-foreground">
                    {UI_COPY.booking.onboardingOpenInvite}: {onboardingInviteUrl}
                  </p>
                ) : null}
                {onboardingError ? <p className="text-xs text-destructive">{onboardingError}</p> : null}
                {onboardingHint ? (
                  <p className="text-xs text-muted-foreground">{onboardingHint}</p>
                ) : null}
                {!onboardingHandled ? (
                  <div className="pt-1">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      disabled={claimingInvitation}
                      onClick={onClaimInvitation}
                    >
                      {claimingInvitation
                        ? `${UI_COPY.booking.onboardingGetInvite}…`
                        : UI_COPY.booking.onboardingGetInvite}
                    </Button>
                  </div>
                ) : null}
              </div>
            }
          />
        </section>
      )}

      {hasSlot && (!detailsComplete || needsOnboardingClaim) && (
        <section className="hidden w-full flex-col gap-3 md:flex">
          <h2 className="text-title text-center text-sm font-semibold">{UI_COPY.booking.stepDetails}</h2>
          <PaymentSummary
            balance={balance}
            sharePercent={sharePercent}
            email={email}
            onEmailChange={onEmailChange}
            callDomain={callDomain}
            onCallDomainChange={onCallDomainChange}
            callContext={callContext}
            onCallContextChange={onCallContextChange}
          />
        </section>
      )}

      {hasSlot && detailsComplete && !needsOnboardingClaim && (
        <section className="hidden w-full flex-col gap-3 md:flex">
          <h2 className="text-title text-center text-sm font-semibold">{UI_COPY.booking.bookSession}</h2>
          <PayButton
            expert={expert}
            selectedSlot={selectedSlot}
            email={email}
            onEmailChange={onEmailChange}
            callDomain={callDomain}
            onCallDomainChange={onCallDomainChange}
            callContext={callContext}
            onCallContextChange={onCallContextChange}
            onboardingReady={!needsOnboardingClaim}
            onSuccess={onPaySuccess}
          />
        </section>
      )}

      {hasSlot && (
        <section className="flex w-full flex-col gap-3 md:hidden">
          <h2 className="text-title text-center text-sm font-semibold">{UI_COPY.booking.stepDetails}</h2>
          <PaymentSummary
            balance={balance}
            sharePercent={sharePercent}
            email={email}
            onEmailChange={onEmailChange}
            callDomain={callDomain}
            onCallDomainChange={onCallDomainChange}
            callContext={callContext}
            onCallContextChange={onCallContextChange}
          />
        </section>
      )}
    </>
  );
}
