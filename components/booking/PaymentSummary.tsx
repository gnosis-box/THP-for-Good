'use client';

import { Field, FieldDescription, FieldError, FieldLabel } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { Textarea } from '@/components/ui/textarea';
import { PAY_COPY } from '@/lib/pay-copy';
import {
  BOOKING_CONTEXT_MAX_LENGTH,
  normalizeBookingText,
  isValidBookingContext,
  isValidBookingDomain,
} from '@/lib/booking-context';
import { UI_COPY } from '@/lib/ui-copy';
import type { CrcBalanceState } from '@/hooks/use-crc-balance';

type Props = {
  balance: CrcBalanceState;
  sharePercent: number;
  email: string;
  onEmailChange: (v: string) => void;
  callDomain: string;
  onCallDomainChange: (v: string) => void;
  callContext: string;
  onCallContextChange: (v: string) => void;
  showValidation?: boolean;
  showEmail?: boolean;
};

export function PaymentSummary({
  balance,
  sharePercent,
  email,
  onEmailChange,
  callDomain,
  onCallDomainChange,
  callContext,
  onCallContextChange,
  showValidation = false,
  showEmail = true,
}: Props) {
  const domainValue = normalizeBookingText(callDomain);
  const contextValue = normalizeBookingText(callContext);
  const domainError =
    domainValue.length === 0
      ? showValidation
        ? UI_COPY.booking.callDomainRequired
        : null
      : isValidBookingDomain(domainValue)
        ? null
        : UI_COPY.booking.callDomainInvalid;
  const contextError =
    contextValue.length === 0
      ? showValidation
        ? UI_COPY.booking.callContextRequired
        : null
      : isValidBookingContext(contextValue)
        ? null
        : UI_COPY.booking.callContextInvalid;

  return (
    <div className="flex flex-col gap-3">
      {balance.status === 'ready' && (
        <p className="text-sm text-muted-foreground">
          Your balance: <strong className="text-foreground">{balance.formatted} CRC</strong>
        </p>
      )}
      <p className="text-xs text-accent">
        {PAY_COPY.paymentSplit(sharePercent, 100 - sharePercent)}
      </p>
      {showEmail && (
        <>
          <Separator />
          <Field>
            <FieldLabel htmlFor="booker-email">Email for calendar invite</FieldLabel>
            <Input
              id="booker-email"
              type="email"
              value={email}
              onChange={(e) => onEmailChange(e.target.value)}
              placeholder="you@example.com"
              autoComplete="email"
              className="min-h-11"
            />
          </Field>
          <Field data-invalid={!!domainError || undefined}>
            <FieldLabel htmlFor="call-domain">{UI_COPY.booking.callDomainLabel}</FieldLabel>
            <Input
              id="call-domain"
              type="text"
              value={callDomain}
              onChange={(e) => onCallDomainChange(e.target.value)}
              placeholder={UI_COPY.booking.callDomainPlaceholder}
              className="min-h-11"
              maxLength={80}
            />
            <FieldDescription>{UI_COPY.booking.callDomainHelper}</FieldDescription>
            <FieldError>{domainError}</FieldError>
          </Field>
          <Field data-invalid={!!contextError || undefined}>
            <FieldLabel htmlFor="call-context">{UI_COPY.booking.callContextLabel}</FieldLabel>
            <Textarea
              id="call-context"
              value={callContext}
              onChange={(e) => onCallContextChange(e.target.value)}
              placeholder={UI_COPY.booking.callContextPlaceholder}
              className="min-h-24"
              maxLength={BOOKING_CONTEXT_MAX_LENGTH}
            />
            <FieldDescription>
              {UI_COPY.booking.callContextHelper} {contextValue.length}/{BOOKING_CONTEXT_MAX_LENGTH}
            </FieldDescription>
            <FieldError>{contextError}</FieldError>
          </Field>
        </>
      )}
    </div>
  );
}
