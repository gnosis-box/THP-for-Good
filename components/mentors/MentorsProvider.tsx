"use client";

import { useQuery } from "@tanstack/react-query";
import {
  createContext,
  useContext,
  useMemo,
  type ReactNode,
} from "react";

import { buildBaseMentors, type Mentor } from "@/lib/mentors";

type MentorsContextValue = {
  mentors: Mentor[];
  loading: boolean;
  getBySlug: (slug: string) => Mentor | undefined;
};

const MentorsContext = createContext<MentorsContextValue | null>(null);

async function fetchMentors(): Promise<Mentor[]> {
  const res = await fetch("/api/mentors");
  if (!res.ok) throw new Error("Impossible de charger les mentors");
  return res.json() as Promise<Mentor[]>;
}

export function MentorsProvider({ children }: { children: ReactNode }) {
  const placeholder = useMemo(() => buildBaseMentors(), []);

  const { data, isPending, isPlaceholderData } = useQuery({
    queryKey: ["mentors"],
    queryFn: fetchMentors,
    staleTime: 5 * 60_000,
    placeholderData: placeholder,
  });

  const mentors = data ?? placeholder;
  const loading = isPending && !isPlaceholderData;

  const value = useMemo(
    () => ({
      mentors,
      loading,
      getBySlug: (slug: string) => mentors.find((m) => m.slug === slug),
    }),
    [mentors, loading],
  );

  return (
    <MentorsContext.Provider value={value}>{children}</MentorsContext.Provider>
  );
}

export function useMentors() {
  const ctx = useContext(MentorsContext);
  if (!ctx) {
    throw new Error("useMentors must be used within MentorsProvider");
  }
  return ctx;
}
