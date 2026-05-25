import type { ExpertRow } from '@/lib/db';
import { getDisplayCallLanguages, languageLabel } from '@/lib/languages';

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

export function recordToURLSearchParams(
  raw: Record<string, string | string[] | undefined>,
): URLSearchParams {
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(raw)) {
    if (value === undefined) continue;
    if (Array.isArray(value)) {
      for (const entry of value) {
        if (entry) params.append(key, entry);
      }
    } else if (value) {
      params.append(key, value);
    }
  }
  return params;
}

export function parseExpertFilterParams(searchParams: URLSearchParams): ExpertFilterState {
  const skills = normalizeSkills(searchParams.getAll('skill'));
  const languages = normalizeCodes(searchParams.getAll('lang'));
  const q = searchParams.get('q')?.trim() || undefined;

  return {
    skills: skills.length > 0 ? skills : undefined,
    languages: languages.length > 0 ? languages : undefined,
    q,
  };
}

export function buildExpertFilterSearchParams(filters: ExpertFilterState): URLSearchParams {
  const params = new URLSearchParams();
  for (const skill of normalizeSkills(filters.skills)) {
    params.append('skill', skill);
  }
  for (const lang of normalizeCodes(filters.languages)) {
    params.append('lang', lang);
  }
  const q = filters.q?.trim();
  if (q) params.set('q', q);
  return params;
}

export function countSheetFilters(filters: ExpertFilterState): number {
  return normalizeSkills(filters.skills).length + normalizeCodes(filters.languages).length;
}

export function hasActiveExpertFilters(filters: ExpertFilterState): boolean {
  return (
    countSheetFilters(filters) > 0 ||
    Boolean(filters.q?.trim())
  );
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
      const bookable = getDisplayCallLanguages(expert);
      const matchesQuery =
        expert.name.toLowerCase().includes(q) ||
        (expert.bio ?? '').toLowerCase().includes(q) ||
        expert.skills.some((skill) => skill.toLowerCase().includes(q)) ||
        bookable.some(
          (code) =>
            code.includes(q) || languageLabel(code).toLowerCase().includes(q),
        );
      if (!matchesQuery) return false;
    }

    return true;
  });
}
