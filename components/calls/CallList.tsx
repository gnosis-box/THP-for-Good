'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';

import { TrustTagPicker } from '@/components/calls/TrustTagPicker';
import { OpenInCirclesHint } from '@/components/wallet/OpenInCirclesHint';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useWallet } from '@/hooks/use-wallet';
import { getBookingsForAddress, markBookingCompleted } from '@/lib/bookings-storage';
import { getMentorById } from '@/lib/mentors';
import { GNOSISSCAN_TX_URL } from '@/lib/config';

export function CallList() {
  const { address, isConnected, isMiniappHost } = useWallet();
  const [refreshKey, setRefreshKey] = useState(0);

  const bookings = useMemo(() => {
    void refreshKey;
    if (!address) return [];
    return getBookingsForAddress(address);
  }, [address, refreshKey]);

  if (!isConnected) {
    return (
      <div className="space-y-4">
        {!isMiniappHost ? <OpenInCirclesHint /> : null}
        <p className="text-sm text-muted-foreground">Connect via Circles to see your calls.</p>
      </div>
    );
  }

  if (bookings.length === 0) {
    return (
      <div className="space-y-4 text-center">
        <p className="text-sm text-muted-foreground">No calls yet.</p>
        <Link href="/" className="text-sm font-medium text-primary underline">
          Browse mentors
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {bookings.map((booking) => {
        const mentor = getMentorById(booking.mentorId);
        const slot = mentor?.slots.find((item) => item.id === booking.slotId);

        if (!mentor) return null;

        return (
          <Card key={booking.id}>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">{mentor.name}</CardTitle>
              <p className="text-sm text-muted-foreground">
                {slot?.label ?? booking.slotId} · {new Date(booking.paidAt).toLocaleString()}
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-wrap gap-1.5">
                {mentor.tags.map((tag) => (
                  <Badge key={tag} variant="secondary">
                    {tag}
                  </Badge>
                ))}
              </div>
              <a
                href={`${GNOSISSCAN_TX_URL}/${booking.txHash}`}
                target="_blank"
                rel="noreferrer"
                className="font-mono text-xs text-primary underline"
              >
                Payment tx
              </a>
              <TrustTagPicker
                mentor={mentor}
                bookingId={booking.id}
                onTrusted={() => {
                  markBookingCompleted(booking.id);
                  setRefreshKey((value) => value + 1);
                }}
              />
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
