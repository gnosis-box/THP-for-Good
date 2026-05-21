"use client";

import { Button } from "@/components/ui/button";
import { useTrustMentor } from "@/hooks/use-trust-mentor";
import type { Mentor } from "@/lib/mentors";

export function TrustMentorButton({ mentor }: { mentor: Mentor }) {
  const { trust, status, canTrust, alreadyTrusting, checking } =
    useTrustMentor(mentor);

  if (alreadyTrusting) {
    return (
      <span className="shrink-0 rounded-lg bg-emerald-100 px-3 py-1.5 text-xs font-medium text-emerald-800">
        Trusted
      </span>
    );
  }

  return (
    <div className="flex shrink-0 flex-col items-end gap-1">
      <Button
        size="sm"
        onClick={trust}
        disabled={!canTrust || status.kind === "pending" || checking}
      >
        {status.kind === "pending" || checking
          ? "…"
          : `TRUST ${mentor.name}`}
      </Button>
      {status.kind === "error" && (
        <p className="max-w-32 text-right text-[10px] text-destructive">
          {status.error}
        </p>
      )}
    </div>
  );
}
