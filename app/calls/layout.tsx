import type { ReactNode } from "react";

import { MentorsShell } from "@/components/mentors/MentorsShell";
import { PageNav } from "@/components/layout/PageNav";

export default function CallsLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <MentorsShell>{children}</MentorsShell>
      <PageNav />
    </>
  );
}
