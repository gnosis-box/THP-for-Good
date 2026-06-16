'use client';

import { useEffect } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';

import { useWallet } from '@/components/wallet/WalletProvider';

const SESSION_KEY = 'thp_landing_shown';

/**
 * Circles playground loads the app root (`/`). Landing polish lives on `/landing`.
 * Show the splash once per miniapp session; later visits to `/` (e.g. Experts nav) skip redirect.
 */
export function MiniappLandingRedirect() {
  const { isMiniappHost } = useWallet();
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    if (!isMiniappHost || pathname !== '/') return;
    if (searchParams.toString().length > 0) return;
    if (sessionStorage.getItem(SESSION_KEY)) return;

    sessionStorage.setItem(SESSION_KEY, '1');
    router.replace('/landing');
  }, [isMiniappHost, pathname, router, searchParams]);

  return null;
}
