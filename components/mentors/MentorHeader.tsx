"use client";

import Link from "next/link";

import { LoginButton } from "@/components/mentors/LoginButton";
import { Button } from "@/components/ui/button";

export function MentorHeader({ showBack = false }: { showBack?: boolean }) {
  return (
    <header className="mb-6 flex items-center justify-between">
      {showBack ? (
        <Button variant="secondary" size="sm" render={<Link href="/mentors" />}>
          back
        </Button>
      ) : (
        <span />
      )}
      <LoginButton />
    </header>
  );
}
