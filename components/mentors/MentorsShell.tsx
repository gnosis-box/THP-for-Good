"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState, type ReactNode } from "react";

import { MentorsProvider } from "@/components/mentors/MentorsProvider";

export function MentorsShell({ children }: { children: ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            refetchOnWindowFocus: false,
            retry: 1,
          },
        },
      }),
  );

  return (
    <QueryClientProvider client={queryClient}>
      <MentorsProvider>
        <div className="mx-auto w-full max-w-md">{children}</div>
      </MentorsProvider>
    </QueryClientProvider>
  );
}
