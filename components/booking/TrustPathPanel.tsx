'use client';

import { AlertTriangle, Check } from 'lucide-react';

import { StatusAlert } from '@/components/ui-patterns/StatusAlert';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Spinner } from '@/components/ui/spinner';
import { PAY_COPY } from '@/lib/pay-copy';
import type { TrustEligibleBalanceState } from '@/hooks/use-trust-eligible-balance';

type LegRowProps = {
  label: string;
  maxFormatted: string;
  legCrc: number;
};

function LegRow({ label, maxFormatted, legCrc }: LegRowProps) {
  const maxNum = parseFloat(maxFormatted) || 0;
  const pct = legCrc > 0 ? Math.min(100, (maxNum / legCrc) * 100) : 0;
  const ok = maxNum >= legCrc;

  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-center justify-between gap-2 text-xs">
        <span className="font-medium text-foreground">{label}</span>
        <span className="tabular-nums text-muted-foreground">
          ~{maxFormatted} / {legCrc} CRC
          {ok ? (
            <Check className="ml-1 inline size-3.5 text-success" aria-label="Sufficient" />
          ) : (
            <AlertTriangle className="ml-1 inline size-3.5 text-warning" aria-label="May be insufficient" />
          )}
        </span>
      </div>
      <Progress value={pct} aria-label={`${label}: ${maxFormatted} of ${legCrc} CRC`} />
    </div>
  );
}

type Props = {
  trustEligible: TrustEligibleBalanceState;
  expertLegCrc: number;
  treasuryLegCrc: number;
  mentorName: string;
  priceCrc: number;
};

export function TrustPathPanel({
  trustEligible,
  expertLegCrc,
  treasuryLegCrc,
  mentorName,
  priceCrc,
}: Props) {
  if (trustEligible.status === 'loading') {
    return (
      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        <Spinner className="size-4" />
        {PAY_COPY.trustEstimateLoading}
      </div>
    );
  }

  if (trustEligible.status === 'error') {
    return (
      <p className="text-xs text-muted-foreground">{PAY_COPY.trustEstimateUnavailable}</p>
    );
  }

  if (trustEligible.status !== 'ready') return null;

  const shortfall = trustEligible.limits.bookableCrc < priceCrc;

  return (
    <Card className="border-border/80 bg-card/80">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium">{PAY_COPY.trustEstimateTitle}</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-3">
        {expertLegCrc > 0 && (
          <LegRow
            label={mentorName}
            maxFormatted={trustEligible.formatted.expert}
            legCrc={expertLegCrc}
          />
        )}
        {treasuryLegCrc > 0 && (
          <LegRow
            label={PAY_COPY.thpForGood}
            maxFormatted={trustEligible.formatted.foundation}
            legCrc={treasuryLegCrc}
          />
        )}
        <p className="text-xs text-muted-foreground">
          {PAY_COPY.bookableLine(trustEligible.formatted.bookable, priceCrc)}
        </p>
        {shortfall && (
          <StatusAlert
            variant="warning"
            title="Trust path shortfall"
            description={PAY_COPY.trustEstimateShortfall}
          />
        )}
      </CardContent>
    </Card>
  );
}
