'use client';

import { Field, FieldLabel } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import { PAY_COPY } from '@/lib/pay-copy';
import type { CrcBalanceState } from '@/hooks/use-crc-balance';

type Props = {
  balance: CrcBalanceState;
  sharePercent: number;
  email: string;
  onEmailChange: (v: string) => void;
  message?: string;
  onMessageChange?: (v: string) => void;
  showEmail?: boolean;
};

export function PaymentSummary({
  balance,
  sharePercent,
  email,
  onEmailChange,
  message = '',
  onMessageChange,
  showEmail = true,
}: Props) {
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
          <Field className="mt-2">
            <FieldLabel htmlFor="booker-message">Message for the expert (optional)</FieldLabel>
            <Textarea
              id="booker-message"
              value={message}
              onChange={(e) => onMessageChange?.(e.target.value)}
              placeholder="e.g. Topics you'd like to cover..."
              className="min-h-20 resize-none"
            />
          </Field>
        </>
      )}
    </div>
  );
}
