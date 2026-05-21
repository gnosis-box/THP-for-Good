"use client";

import { useCallback, useEffect, useState } from "react";

import { useCirclesAvatar } from "@/hooks/use-circles-avatar";
import { useSignIn } from "@/hooks/use-sign-in";
import { trackEvent } from "@/lib/analytics";
import { humanizeCirclesError } from "@/lib/circles-errors";
import { type Mentor, isMentorConfigured } from "@/lib/mentors";

type TrustStatus =
  | { kind: "idle" }
  | { kind: "pending" }
  | { kind: "success"; txHash: string }
  | { kind: "error"; error: string };

export function useTrustMentor(mentor: Mentor) {
  const { signedIn, canSignIn, isMiniappHost } = useSignIn();
  const { avatar, ready } = useCirclesAvatar();
  const [alreadyTrusting, setAlreadyTrusting] = useState<boolean | null>(
    null,
  );
  const [status, setStatus] = useState<TrustStatus>({ kind: "idle" });

  const canCheck = !!avatar && ready && isMentorConfigured(mentor);

  useEffect(() => {
    if (!canCheck) return;

    let cancelled = false;

    avatar!.trust
      .isTrusting(mentor.circlesAddress!)
      .then((trusting) => {
        if (!cancelled) setAlreadyTrusting(trusting);
      })
      .catch(() => {
        if (!cancelled) setAlreadyTrusting(false);
      });

    return () => {
      cancelled = true;
    };
  }, [avatar, canCheck, mentor.circlesAddress]);

  const trust = useCallback(async () => {
    if (!signedIn) {
      setStatus({
        kind: "error",
        error: "Connectez-vous via Login avant de trust.",
      });
      return;
    }
    if (!isMentorConfigured(mentor)) {
      setStatus({
        kind: "error",
        error: "Adresse Circles du mentor non configurée.",
      });
      return;
    }
    if (!avatar || !ready) {
      setStatus({ kind: "error", error: "Avatar Circles non disponible." });
      return;
    }

    setStatus({ kind: "pending" });
    try {
      const receipt = await avatar.trust.add(mentor.circlesAddress!);
      setAlreadyTrusting(true);
      trackEvent("trust_success", { mentor: mentor.slug });
      setStatus({ kind: "success", txHash: receipt.transactionHash });
    } catch (err) {
      setStatus({
        kind: "error",
        error: humanizeCirclesError(err),
      });
    }
  }, [avatar, mentor, ready, signedIn]);

  const checking = canCheck && alreadyTrusting === null;
  const isTrusting = alreadyTrusting === true;

  const canTrust =
    signedIn &&
    canSignIn &&
    isMiniappHost &&
    isMentorConfigured(mentor) &&
    ready &&
    !isTrusting &&
    !checking;

  return {
    trust,
    status,
    canTrust,
    alreadyTrusting: isTrusting,
    checking,
  };
}
