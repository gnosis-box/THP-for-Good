'use client';

import Link from 'next/link';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { CIRCLES_PLAYGROUND_URL } from '@/lib/config';
import { useWallet } from '@/hooks/use-wallet';

export function OpenInCirclesHint() {
  const { isMiniappHost } = useWallet();

  if (isMiniappHost) return null;

  return (
    <Card className="border-dashed">
      <CardHeader>
        <CardTitle className="text-base">Open in Circles</CardTitle>
        <CardDescription>
          Wallet connection and payments only work inside the Circles host iframe.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Button
          render={
            <Link
              href={CIRCLES_PLAYGROUND_URL}
              target="_blank"
              rel="noreferrer"
            />
          }
        >
          Open Circles playground
        </Button>
      </CardContent>
    </Card>
  );
}
