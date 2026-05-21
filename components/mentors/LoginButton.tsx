"use client";

import { Button } from "@/components/ui/button";
import { useSignIn } from "@/hooks/use-sign-in";

export function LoginButton() {
  const { signedIn, signing, signIn, canSignIn, isConnected, isMiniappHost } =
    useSignIn();

  if (signedIn) {
    return (
      <span className="rounded-lg bg-emerald-100 px-3 py-1.5 text-xs font-medium text-emerald-800">
        Connected
      </span>
    );
  }

  return (
    <Button
      size="sm"
      onClick={() => signIn()}
      disabled={!canSignIn || signing}
      title={
        !isMiniappHost
          ? "Ouvrez dans l'hôte Circles"
          : !isConnected
            ? "Connectez le wallet dans l'hôte"
            : undefined
      }
    >
      {signing ? "…" : "Login"}
    </Button>
  );
}
