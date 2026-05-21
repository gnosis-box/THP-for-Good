"use client";

import { useCallback, useMemo, useState } from "react";

import { useWallet } from "@/hooks/use-wallet";
import { trackEvent } from "@/lib/analytics";
import {
  buildSignInMessage,
  clearSignedInSession,
  getSignedInSession,
  setSignedInSession,
} from "@/lib/sign-in-message";

export function useSignIn() {
  const { address, isConnected, isMiniappHost } = useWallet();
  const [sessionVersion, setSessionVersion] = useState(0);
  const [signing, setSigning] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const signedIn = useMemo(() => {
    void sessionVersion;
    return address ? getSignedInSession(address) : false;
  }, [address, sessionVersion]);

  const signIn = useCallback(
    async (purpose = "THP for Good") => {
      if (!address) return;
      setSigning(true);
      setError(null);
      try {
        const { signMessage } = await import("@aboutcircles/miniapp-sdk");
        const message = buildSignInMessage(address, purpose);
        const { verified } = await signMessage(message);
        if (!verified) {
          throw new Error("Signature non vérifiée par l'hôte");
        }
        setSignedInSession(address, true);
        trackEvent("sign_in_success");
        setSessionVersion((v) => v + 1);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Erreur inconnue");
      } finally {
        setSigning(false);
      }
    },
    [address],
  );

  const signOut = useCallback(() => {
    clearSignedInSession();
    setSessionVersion((v) => v + 1);
    setError(null);
  }, []);

  const canSignIn = isConnected && isMiniappHost;

  return {
    signedIn,
    signing,
    error,
    signIn,
    signOut,
    canSignIn,
    isConnected,
    isMiniappHost,
  };
}
