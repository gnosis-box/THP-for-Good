'use client';

import { useState } from 'react';
import { Star, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useWallet } from '@/hooks/use-wallet';

const AFFILIATE_GROUP_REGISTRY = '0xca8222e780d046707083f51377b5fd85e2866014';
// setAffiliateGroup(0x2b5E4045936ef12250a8c01e4Cbf71E9bEE69e00)
const CALLDATA =
  '0xbaa3440f0000000000000000000000002b5e4045936ef12250a8c01e4cbf71e9bee69e00';

// 8 evenly-spaced directions for the star particles
const PARTICLES = [0, 45, 90, 135, 180, 225, 270, 315].map((deg) => {
  const rad = (deg * Math.PI) / 180;
  return {
    tx: Math.round(Math.cos(rad) * 56),
    ty: Math.round(Math.sin(rad) * 56),
    delay: Math.round(Math.abs(Math.sin(rad + 0.5)) * 80),
  };
});

function StarBurst() {
  return (
    <>
      <style>{`
        @keyframes star-burst {
          0%   { transform: translate(-50%, -50%) scale(1.2); opacity: 1; }
          60%  { opacity: 0.8; }
          100% { transform: translate(calc(-50% + var(--tx)), calc(-50% + var(--ty))) scale(0.2); opacity: 0; }
        }
        .star-particle {
          position: absolute;
          left: 50%; top: 50%;
          width: 8px; height: 8px;
          border-radius: 50%;
          background: #facc15;
          box-shadow: 0 0 4px 1px #fbbf24;
          animation: star-burst 0.55s ease-out forwards;
          pointer-events: none;
        }
        @keyframes btn-success-in {
          0%   { transform: scale(0.85); opacity: 0; }
          60%  { transform: scale(1.08); }
          100% { transform: scale(1); opacity: 1; }
        }
        .btn-success-content {
          animation: btn-success-in 0.35s ease-out forwards;
        }
      `}</style>
      {PARTICLES.map(({ tx, ty, delay }, i) => (
        <span
          key={i}
          className="star-particle"
          style={
            {
              '--tx': `${tx}px`,
              '--ty': `${ty}px`,
              animationDelay: `${delay}ms`,
            } as React.CSSProperties
          }
        />
      ))}
    </>
  );
}

interface Props {
  onSuccess?: () => void;
  isAlreadySupporter?: boolean;
}

export function JoinSupporterButton({ onSuccess, isAlreadySupporter = false }: Props) {
  const { isConnected, isMiniappHost } = useWallet();
  const [status, setStatus] = useState<'idle' | 'pending' | 'success' | 'error'>('idle');
  const [burst, setBurst] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  if (!isConnected || !isMiniappHost) return null;
  // Hide entirely once we know they're a supporter (unless mid-flow showing success)
  if (isAlreadySupporter && status !== 'success') return null;

  async function handleJoin() {
    setStatus('pending');
    setErrorMsg('');
    try {
      const { sendTransactions } = await import('@aboutcircles/miniapp-sdk');
      await sendTransactions([{ to: AFFILIATE_GROUP_REGISTRY, data: CALLDATA, value: '0x0' }]);
      setBurst(true);
      setStatus('success');
      // Slight delay so the animation is visible before refetch re-renders
      setTimeout(() => {
        onSuccess?.();
        setBurst(false);
      }, 700);
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : 'Transaction failed');
      setStatus('error');
    }
  }

  if (status === 'success') {
    return (
      <div className="relative flex flex-col items-center gap-1">
        {burst && <StarBurst />}
        <Button variant="outline" size="default" disabled className="btn-success-content gap-2">
          <Check className="size-4 text-orange-400" />
          <span className="text-orange-400">Thank you — you&apos;re a supporter!</span>
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-1">
      <Button
        size="default"
        onClick={handleJoin}
        disabled={status === 'pending'}
        className="gap-2"
      >
        <Star className="size-4" />
        {status === 'pending' ? 'Confirming…' : 'Join as a supporter'}
      </Button>
      {status === 'error' && (
        <p className="text-xs text-destructive">{errorMsg}</p>
      )}
    </div>
  );
}
