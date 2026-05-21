"use client";

import { useCallback, useState } from "react";

import { useCirclesAvatar } from "@/hooks/use-circles-avatar";
import { useSignIn } from "@/hooks/use-sign-in";
import { useWallet } from "@/hooks/use-wallet";
import { trackEvent } from "@/lib/analytics";
import { addBooking } from "@/lib/bookings-storage";
import { humanizeCirclesError } from "@/lib/circles-errors";
import {
  BOOKING_AMOUNT_ATTO,
  type Mentor,
  type TimeSlot,
  isMentorConfigured,
} from "@/lib/mentors";

type BookStatus =
  | { kind: "idle" }
  | { kind: "pending" }
  | { kind: "success"; txHash: string }
  | { kind: "error"; error: string };

export function useBookCall(mentor: Mentor, selectedSlot: TimeSlot | null) {
  const { address } = useWallet();
  const { signedIn, canSignIn, isMiniappHost } = useSignIn();
  const { avatar, ready } = useCirclesAvatar();
  const [status, setStatus] = useState<BookStatus>({ kind: "idle" });

  const book = useCallback(async () => {
    if (!address || !selectedSlot) return;
    if (!signedIn) {
      setStatus({
        kind: "error",
        error: "Connectez-vous via Login avant de payer.",
      });
      return;
    }
    if (!isMentorConfigured(mentor)) {
      setStatus({
        kind: "error",
        error: "Adresse Circles du mentor non configurée (voir .env.example).",
      });
      return;
    }
    if (!avatar || !ready) {
      setStatus({ kind: "error", error: "Avatar Circles non disponible." });
      return;
    }

    setStatus({ kind: "pending" });
    try {
      const recipient = mentor.circlesAddress!;
      let receipt;
      try {
        receipt = await avatar.transfer.direct(recipient, BOOKING_AMOUNT_ATTO);
      } catch {
        receipt = await avatar.transfer.advanced(
          recipient,
          BOOKING_AMOUNT_ATTO,
        );
      }

      const txHash = receipt.transactionHash;
      addBooking(address, {
        mentorSlug: mentor.slug,
        mentorName: mentor.name,
        tags: mentor.tags,
        slotId: selectedSlot.id,
        slotLabel: selectedSlot.label,
        txHash,
        imageUrl: mentor.imageUrl,
      });
      trackEvent("booking_success", { mentor: mentor.slug });
      setStatus({ kind: "success", txHash });
    } catch (err) {
      setStatus({
        kind: "error",
        error: humanizeCirclesError(err),
      });
    }
  }, [address, avatar, mentor, ready, selectedSlot, signedIn]);

  const canBook =
    !!address &&
    !!selectedSlot &&
    signedIn &&
    canSignIn &&
    isMiniappHost &&
    isMentorConfigured(mentor) &&
    ready;

  return { book, status, canBook, signedIn };
}
