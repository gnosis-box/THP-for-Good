'use client';

import { Field, FieldLabel } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { PAY_COPY } from '@/lib/pay-copy';
import type { CrcBalanceState } from '@/hooks/use-crc-balance';

type Props = {
  balance: CrcBalanceState;
  sharePercent: number;
  email: string;
  onEmailChange: (v: string) => void;
  showEmail?: boolean;
};

export function PaymentSummary({
  balance,
  sharePercent,
  email,
  onEmailChange,
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
            />
          </Field>
        </>
      )}
    </div>
  );
}
