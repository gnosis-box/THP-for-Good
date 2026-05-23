'use client';

import { useEffect, useState } from 'react';
import { useWallet } from '@/components/wallet/WalletProvider';
import { resolveTrustRelation, type TrustRelationKind } from '@/lib/trust-relation';

export type TrustRelationState =
  | { status: 'disconnected' }
  | { status: 'self' }
  | { status: 'loading' }
  | { status: TrustRelationKind };

export function useTrustRelation(otherAddress: string | null | undefined): TrustRelationState {
  const { address, isConnected } = useWallet();
  const [state, setState] = useState<TrustRelationState>({ status: 'loading' });

  useEffect(() => {
    if (!otherAddress) {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- reset when target cleared
      setState({ status: 'disconnected' });
      return;
    }
    if (!isConnected || !address) {
      setState({ status: 'disconnected' });
      return;
    }
    if (address.toLowerCase() === otherAddress.toLowerCase()) {
      setState({ status: 'self' });
      return;
    }

    let cancelled = false;
    // eslint-disable-next-line react-hooks/set-state-in-effect -- loading before async RPC
    setState({ status: 'loading' });

    resolveTrustRelation(address, otherAddress)
      .then((kind) => {
        if (!cancelled) setState({ status: kind });
      })
      .catch(() => {
        if (!cancelled) setState({ status: 'none' });
      });

    return () => {
      cancelled = true;
    };
  }, [address, isConnected, otherAddress]);

  return state;
}
