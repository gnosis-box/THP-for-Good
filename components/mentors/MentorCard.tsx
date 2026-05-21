import Link from "next/link";
import type { ReactNode } from "react";

import { MentorAvatar } from "@/components/mentors/MentorAvatar";
import { MentorTag } from "@/components/mentors/MentorStats";
import type { Mentor } from "@/lib/mentors";

type MentorCardProps = {
  mentor: Mentor;
  href?: string;
  action?: ReactNode;
  variant?: "grid" | "row";
};

export function MentorCard({
  mentor,
  href,
  action,
  variant = "row",
}: MentorCardProps) {
  const content =
    variant === "grid" ? (
      <div className="flex h-full min-h-[11.5rem] flex-col items-center rounded-xl border border-border bg-card p-4 text-center shadow-sm transition-shadow hover:shadow-md">
        <MentorAvatar name={mentor.name} imageUrl={mentor.imageUrl} size="lg" />
        <p className="mt-3 line-clamp-2 min-h-[2.5rem] font-semibold">
          {mentor.name}
        </p>
        <div className="mt-2 flex min-h-[1.625rem] flex-wrap justify-center gap-1">
          {mentor.tags.map((tag) => (
            <MentorTag key={tag} label={tag} />
          ))}
        </div>
      </div>
    ) : (
      <div className="flex items-start gap-3 rounded-xl border border-border bg-card p-4 shadow-sm">
        <MentorAvatar name={mentor.name} imageUrl={mentor.imageUrl} />
        <div className="min-w-0 flex-1">
          <p className="font-semibold">{mentor.name}</p>
          <div className="mt-2 flex flex-wrap gap-1">
            {mentor.tags.map((tag) => (
              <MentorTag key={tag} label={tag} />
            ))}
          </div>
        </div>
        {action}
      </div>
    );

  if (href) {
    return (
      <Link href={href} className="block h-full">
        {content}
      </Link>
    );
  }

  return content;
}
