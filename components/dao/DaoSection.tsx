'use client';

import { useState } from 'react';
import { JoinSupporterButton } from '@/components/dao/JoinSupporterButton';
import { DaoView } from '@/components/dao/DaoView';

export function DaoSection() {
  const [refreshKey, setRefreshKey] = useState(0);

  return (
    <>
      <div className="flex justify-center">
        <JoinSupporterButton onSuccess={() => setRefreshKey((k) => k + 1)} />
      </div>
      <DaoView refreshKey={refreshKey} />
    </>
  );
}
