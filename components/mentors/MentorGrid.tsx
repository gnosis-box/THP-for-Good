import { MentorCard } from "@/components/mentors/MentorCard";
import { MentorCardSkeleton } from "@/components/mentors/MentorCardSkeleton";
import type { Mentor } from "@/lib/mentors";

export function MentorGrid({
  mentors,
  loading,
}: {
  mentors: Mentor[];
  loading?: boolean;
}) {
  if (loading) {
    return (
      <div className="grid auto-rows-fr grid-cols-2 gap-3">
        {Array.from({ length: 4 }).map((_, i) => (
          <MentorCardSkeleton key={i} />
        ))}
      </div>
    );
  }

  return (
    <div className="grid auto-rows-fr grid-cols-2 gap-3">
      {mentors.map((mentor) => (
        <MentorCard
          key={mentor.slug}
          mentor={mentor}
          href={`/mentors/${mentor.slug}`}
          variant="grid"
        />
      ))}
    </div>
  );
}
