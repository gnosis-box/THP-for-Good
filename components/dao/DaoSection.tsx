'use client';

import { useState } from 'react';
import { useWallet } from '@/hooks/use-wallet';
import { JoinSupporterButton } from '@/components/dao/JoinSupporterButton';
import { DaoView } from '@/components/dao/DaoView';
import type { DaoSupporterDto } from '@/app/api/dao/supporters/route';

export function DaoSection() {
  const { address } = useWallet();
  const [refreshKey, setRefreshKey] = useState(0);
  const [supporters, setSupporters] = useState<DaoSupporterDto[]>([]);

  // Derived reactively — recomputes whenever address or supporters change
  const isSupporter = Boolean(
    address && supporters.some((s) => s.address.toLowerCase() === address.toLowerCase()),
  );

  return (
    <>
      <div className="flex justify-center">
        <JoinSupporterButton
          isAlreadySupporter={isSupporter}
          onSuccess={() => setRefreshKey((k) => k + 1)}
        />
      </div>
      <DaoView refreshKey={refreshKey} onSupportersLoaded={setSupporters} />
    </>
  );
}
