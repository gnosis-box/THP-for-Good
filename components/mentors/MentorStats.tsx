import { Badge } from "@/components/ui/badge";
import type { Mentor } from "@/lib/mentors";

export function MentorTag({ label }: { label: string }) {
  return (
    <Badge variant="secondary" className="text-[0.65rem]">
      {label}
    </Badge>
  );
}

export function MentorStats({ mentor }: { mentor: Mentor }) {
  const hasTrustedBy = mentor.trustedByCount != null;
  const hasTrusts = mentor.trustsCount != null;
  const showStats = hasTrustedBy || hasTrusts;

  return (
    <div
      className="mt-3 flex min-h-7 flex-wrap justify-center gap-2 text-xs text-muted-foreground"
      aria-hidden={!showStats}
    >
      {hasTrustedBy && (
        <span className="rounded-full bg-muted px-2 py-0.5">
          Trusted by {mentor.trustedByCount}
        </span>
      )}
      {hasTrusts && (
        <span className="rounded-full bg-muted px-2 py-0.5">
          Trust {mentor.trustsCount}
        </span>
      )}
    </div>
  );
}
