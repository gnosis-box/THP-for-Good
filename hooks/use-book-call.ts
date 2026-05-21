"use client";

import { useCallback, useState } from "react";

import { useSignIn } from "@/hooks/use-sign-in";
import { useWallet } from "@/hooks/use-wallet";
import { trackEvent } from "@/lib/analytics";
import { addBooking } from "@/lib/bookings-storage";
import { humanizeCirclesError } from "@/lib/circles-errors";
import {
  BOOKING_PRICE_CRC,
  FOUNDATION_ADDRESS,
  isFoundationConfigured,
} from "@/lib/config";
import { buildCrcPaymentTransactions } from "@/lib/crc-transfer";
import { type Mentor, type TimeSlot } from "@/lib/mentors";

type BookStatus =
  | { kind: "idle" }
  | { kind: "pending" }
  | { kind: "success"; txHash: string }
  | { kind: "error"; error: string };

export function useBookCall(mentor: Mentor, selectedSlot: TimeSlot | null) {
  const { address } = useWallet();
  const { signedIn, canSignIn, isMiniappHost } = useSignIn();
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
    if (!isFoundationConfigured()) {
      setStatus({
        kind: "error",
        error: "Adresse fondation THP non configurée (voir .env.example).",
      });
      return;
    }

    setStatus({ kind: "pending" });
    try {
      const txs = await buildCrcPaymentTransactions(
        address as `0x${string}`,
        FOUNDATION_ADDRESS,
        BOOKING_PRICE_CRC,
      );

      const { sendTransactions } = await import("@aboutcircles/miniapp-sdk");
      const hashes = await sendTransactions(txs);
      const txHash = hashes[hashes.length - 1] ?? hashes[0];
      if (!txHash) {
        throw new Error("Paiement réussi mais aucun hash de transaction.");
      }

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
  }, [address, mentor, selectedSlot, signedIn]);

  const canBook =
    !!address &&
    !!selectedSlot &&
    signedIn &&
    canSignIn &&
    isMiniappHost &&
    isFoundationConfigured();

  return { book, status, canBook, signedIn };
}
