'use client';

import { useState } from 'react';
import { Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useWallet } from '@/hooks/use-wallet';

// AffiliateGroupRegistry contract (not Hub V2)
const AFFILIATE_GROUP_REGISTRY = '0xca8222e780d046707083f51377b5fd85e2866014';
// setAffiliateGroup(0x2b5E4045936ef12250a8c01e4Cbf71E9bEE69e00)
const CALLDATA =
  '0xbaa3440f0000000000000000000000002b5e4045936ef12250a8c01e4cbf71e9bee69e00';

export function JoinSupporterButton() {
  const { isConnected, isMiniappHost } = useWallet();
  const [status, setStatus] = useState<'idle' | 'pending' | 'success' | 'error'>('idle');
  const [errorMsg, setErrorMsg] = useState('');

  if (!isConnected || !isMiniappHost) return null;

  async function handleJoin() {
    setStatus('pending');
    setErrorMsg('');
    try {
      const { sendTransactions } = await import('@aboutcircles/miniapp-sdk');
      await sendTransactions([{ to: AFFILIATE_GROUP_REGISTRY, data: CALLDATA, value: '0x0' }]);
      setStatus('success');
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : 'Transaction failed');
      setStatus('error');
    }
  }

  if (status === 'success') {
    return (
      <p className="text-sm text-emerald-400">
        You are now a supporter of THP for Good.
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-1">
      <Button
        variant="outline"
        size="sm"
        onClick={handleJoin}
        disabled={status === 'pending'}
      >
        <Star className="size-3.5" />
        {status === 'pending' ? 'Confirming…' : 'Join as a supporter'}
      </Button>
      {status === 'error' && (
        <p className="text-xs text-destructive">{errorMsg}</p>
      )}
    </div>
  );
}
