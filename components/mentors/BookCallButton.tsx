"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";

import { Button } from "@/components/ui/button";
import { useBookCall } from "@/hooks/use-book-call";
import { BOOKING_AMOUNT_CRC, type Mentor, type TimeSlot } from "@/lib/mentors";
import { shortenAddress } from "@/lib/utils";

export function BookCallButton({
  mentor,
  selectedSlot,
}: {
  mentor: Mentor;
  selectedSlot: TimeSlot | null;
}) {
  const router = useRouter();
  const { book, status, canBook } = useBookCall(mentor, selectedSlot);

  useEffect(() => {
    if (status.kind === "success") {
      const t = setTimeout(() => router.push("/calls"), 1500);
      return () => clearTimeout(t);
    }
  }, [status, router]);

  return (
    <div className="space-y-2">
      <Button
        className="w-full"
        size="lg"
        onClick={book}
        disabled={!canBook || status.kind === "pending"}
      >
        {status.kind === "pending"
          ? "En attente de l'hôte…"
          : `PAY ${BOOKING_AMOUNT_CRC} CRC to book`}
      </Button>
      {!selectedSlot && (
        <p className="text-center text-xs text-muted-foreground">
          Sélectionnez un créneau pour réserver.
        </p>
      )}
      {status.kind === "success" && (
        <p className="text-center text-xs text-emerald-700">
          Réservé — redirection vers Mes appels… (
          {shortenAddress(status.txHash, 6)})
        </p>
      )}
      {status.kind === "error" && (
        <p className="text-center text-xs text-destructive">{status.error}</p>
      )}
    </div>
  );
}
