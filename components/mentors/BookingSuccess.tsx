'use client';

import Link from 'next/link';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { GNOSISSCAN_TX_URL } from '@/lib/config';
import type { Booking } from '@/lib/types';

type BookingSuccessProps = {
  booking: Booking;
  mentorName: string;
  slotLabel: string;
};

export function BookingSuccess({ booking, mentorName, slotLabel }: BookingSuccessProps) {
  return (
    <Card className="border-emerald-200 bg-emerald-50/50">
      <CardHeader>
        <CardTitle className="text-lg text-emerald-900">Booking confirmed</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3 text-sm">
        <p>
          Paid <strong>{booking.amountCrc} CRC</strong> to THP for Good for a call with{' '}
          <strong>{mentorName}</strong> ({slotLabel}).
        </p>
        <p className="font-mono text-xs break-all text-muted-foreground">{booking.txHash}</p>
        <div className="flex flex-wrap gap-2">
          <Button render={<Link href={`${GNOSISSCAN_TX_URL}/${booking.txHash}`} target="_blank" rel="noreferrer" />} size="sm">
            View on GnosisScan
          </Button>
          <Button render={<Link href="/calls" />} variant="outline" size="sm">
            My calls
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
