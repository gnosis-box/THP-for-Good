'use client';

import { useEffect, useState } from 'react';

import { useWallet } from '@/components/wallet/WalletProvider';

export function useIsAdmin() {
  const { address, isConnected } = useWallet();
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!isConnected || !address) {
      setIsAdmin(false);
      setLoading(false);
      return;
    }

    let cancelled = false;
    setLoading(true);

    fetch('/api/admin/check', {
      headers: { 'x-wallet-address': address },
    })
      .then(async (res) => {
        if (!res.ok) return { isAdmin: false };
        return res.json() as Promise<{ isAdmin: boolean }>;
      })
      .then((data) => {
        if (!cancelled) setIsAdmin(Boolean(data.isAdmin));
      })
      .catch(() => {
        if (!cancelled) setIsAdmin(false);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [address, isConnected]);

  return { isAdmin, loading };
}
