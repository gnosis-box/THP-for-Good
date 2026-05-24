import type { ExpertRow } from '@/lib/db';
import { getDisplayCallLanguages } from '@/lib/languages';

export type ExpertFilterState = {
  skills?: string[];
  languages?: string[];
  q?: string;
};

function normalizeCodes(codes: string[] | undefined): string[] {
  if (!codes?.length) return [];
  return [...new Set(codes.map((c) => c.trim().toLowerCase()).filter(Boolean))];
}

function normalizeSkills(skills: string[] | undefined): string[] {
  if (!skills?.length) return [];
  return [...new Set(skills.map((s) => s.trim()).filter(Boolean))];
}

/** Client-side OR filter — mirrors getAllExperts DB semantics for skills and session languages. */
export function filterExpertsClientSide(
  experts: ExpertRow[],
  filters: ExpertFilterState,
): ExpertRow[] {
  const skills = normalizeSkills(filters.skills);
  const languages = normalizeCodes(filters.languages);
  const q = filters.q?.trim().toLowerCase();

  return experts.filter((expert) => {
    if (skills.length > 0 && !skills.some((skill) => expert.skills.includes(skill))) {
      return false;
    }

    if (languages.length > 0) {
      const bookable = getDisplayCallLanguages(expert);
      if (!languages.some((code) => bookable.includes(code))) {
        return false;
      }
    }

    if (q) {
      const matchesQuery =
        expert.name.toLowerCase().includes(q) ||
        (expert.bio ?? '').toLowerCase().includes(q) ||
        expert.skills.some((skill) => skill.toLowerCase().includes(q));
      if (!matchesQuery) return false;
    }

    return true;
  });
}
