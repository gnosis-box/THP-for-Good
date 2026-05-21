"use client";

import { useMemo, useState } from "react";

import { MentorGrid } from "@/components/mentors/MentorGrid";
import { MentorHeader } from "@/components/mentors/MentorHeader";
import { Input } from "@/components/ui/input";
import { useMentors } from "@/hooks/use-mentors";
import { filterMentorsByDomain } from "@/lib/mentors";

export default function MentorsPage() {
  const { mentors, loading } = useMentors();
  const [domainQuery, setDomainQuery] = useState("");
  const filtered = useMemo(
    () => filterMentorsByDomain(mentors, domainQuery),
    [mentors, domainQuery],
  );

  return (
    <>
      <MentorHeader />
      <p className="mb-6 text-lg font-medium leading-snug">
        Get a call with a mentor, Pay in CRC, help someone get a free bootcamp
        tuition.
      </p>
      <label
        htmlFor="domain-filter"
        className="mb-2 block text-sm font-medium"
      >
        Which domain you want be helped with
      </label>
      <Input
        id="domain-filter"
        className="mb-6"
        placeholder="AI ; Developpement; Legal ; …"
        value={domainQuery}
        onChange={(e) => setDomainQuery(e.target.value)}
      />
      <p
        className={`mb-3 min-h-5 text-xs text-muted-foreground ${loading ? "invisible" : ""}`}
      >
        Profils chargés depuis Circles lorsque l&apos;adresse mentor est
        configurée.
      </p>
      <MentorGrid mentors={filtered} loading={loading} />
      {!loading && filtered.length === 0 && (
        <p className="mt-4 text-center text-sm text-muted-foreground">
          Aucun mentor pour ce domaine.
        </p>
      )}
    </>
  );
}
