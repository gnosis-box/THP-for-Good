"use client";

import { useEffect, useState } from "react";

import { useWallet } from "@/hooks/use-wallet";
import { createMiniappRunner } from "@/lib/miniapp-runner";

type CirclesAvatar = import("@aboutcircles/sdk").Avatar;

type LoadedAvatar = {
  address: string;
  avatar: CirclesAvatar;
};

export function useCirclesAvatar() {
  const { address, isConnected, isMiniappHost } = useWallet();
  const [loaded, setLoaded] = useState<LoadedAvatar | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const active =
    !!address && isConnected && isMiniappHost ? address.toLowerCase() : null;

  const avatar =
    active && loaded?.address === active ? loaded.avatar : null;

  useEffect(() => {
    if (!active) return;

    let cancelled = false;

    (async () => {
      setLoading(true);
      setError(null);
      try {
        const { Sdk } = await import("@aboutcircles/sdk");
        const runner = createMiniappRunner(active as `0x${string}`);
        await runner.init();
        const sdk = new Sdk(undefined, runner);
        const av = await sdk.getAvatar(active as `0x${string}`);
        if (!cancelled) {
          setLoaded({ address: active, avatar: av });
        }
      } catch (err) {
        if (!cancelled) {
          setLoaded(null);
          setError(err instanceof Error ? err.message : "Erreur SDK");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [active]);

  return {
    avatar,
    loading: active ? loading : false,
    error: active ? error : null,
    ready: !!avatar && !loading,
  };
}
