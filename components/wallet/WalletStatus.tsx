'use client';

import { Badge } from '@/components/ui/badge';
import { useWallet } from '@/components/wallet/WalletProvider';
import { shortenAddress } from '@/lib/utils';

export function WalletStatus() {
  const { address, isConnected } = useWallet();

  return (
    <Badge
      variant={isConnected ? 'default' : 'secondary'}
      className="max-h-11 min-h-11 max-w-[7.5rem] items-center truncate px-2.5 py-2 font-mono text-xs sm:max-w-[10rem] md:max-w-none md:text-sm"
      aria-label={isConnected ? `Wallet connected: ${address}` : 'Wallet not connected'}
    >
      <span
        className={
          'mr-1.5 inline-block size-2 shrink-0 rounded-full ' +
          (isConnected ? 'bg-emerald-500' : 'bg-muted-foreground')
        }
        aria-hidden
      />
      <span className="truncate">{address ? shortenAddress(address, 4) : 'Not connected'}</span>
    </Badge>
  );
}
