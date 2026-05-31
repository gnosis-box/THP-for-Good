'use client';

import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';

type WalletContextValue = {
  address: string | null;
  isConnected: boolean;
  isMiniappHost: boolean;
};

const WalletContext = createContext<WalletContextValue>({
  address: null,
  isConnected: false,
  isMiniappHost: false,
});

export function WalletProvider({ children }: { children: ReactNode }) {
  const [address, setAddress] = useState<string | null>(null);
  const [isMiniappHost, setIsMiniappHost] = useState(false);

  useEffect(() => {
    // Dev/ops escape hatch: force guest mode and skip host wallet bridge.
    if (process.env.NEXT_PUBLIC_DISABLE_MINIAPP_BRIDGE === '1') {
      return;
    }

    let unsubscribe: (() => void) | undefined;
    let cancelled = false;

    const shouldDowngradeToGuest = (value: unknown): boolean => {
      const message =
        value instanceof Error
          ? value.message
          : typeof value === 'string'
            ? value
            : typeof value === 'object' && value !== null && 'message' in value
              ? String((value as { message: unknown }).message)
              : '';
      const lowered = message.toLowerCase();
      return (
        lowered.includes('passkey') ||
        lowered.includes('unable to retrieve wallet address') ||
        lowered.includes('blocked_by_client')
      );
    };

    const downgradeToGuest = () => {
      if (cancelled) return;
      setAddress(null);
    };

    const onUnhandledRejection = (event: PromiseRejectionEvent) => {
      if (shouldDowngradeToGuest(event.reason)) {
        downgradeToGuest();
      }
    };

    const onWindowError = (event: ErrorEvent) => {
      if (shouldDowngradeToGuest(event.error ?? event.message)) {
        downgradeToGuest();
      }
    };

    window.addEventListener('unhandledrejection', onUnhandledRejection);
    window.addEventListener('error', onWindowError);

    // Dynamic import: the SDK reads window/parent, so it must not run on the server.
    import('@aboutcircles/miniapp-sdk')
      .then(({ onWalletChange, isMiniappMode }) => {
        if (cancelled) return;
        try {
          setIsMiniappHost(isMiniappMode());
          unsubscribe = onWalletChange((addr) => setAddress(addr ?? null));
        } catch (error) {
          console.warn('[wallet] miniapp bridge unavailable, fallback to guest mode:', error);
          downgradeToGuest();
        }
      })
      .catch((err) => {
        console.error('[miniapp-sdk] failed to load:', err);
        downgradeToGuest();
      });

    return () => {
      cancelled = true;
      unsubscribe?.();
      window.removeEventListener('unhandledrejection', onUnhandledRejection);
      window.removeEventListener('error', onWindowError);
    };
  }, []);

  return (
    <WalletContext.Provider value={{ address, isConnected: !!address, isMiniappHost }}>
      {children}
    </WalletContext.Provider>
  );
}

export function useWallet() {
  return useContext(WalletContext);
}
