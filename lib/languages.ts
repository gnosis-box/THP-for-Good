/** Curated ISO 639-1 session languages (FEAT-L4-07). */
export const SESSION_LANGUAGES = [
  { code: 'en', label: 'English' },
  { code: 'fr', label: 'French' },
  { code: 'de', label: 'German' },
  { code: 'es', label: 'Spanish' },
  { code: 'pt', label: 'Portuguese' },
  { code: 'it', label: 'Italian' },
  { code: 'nl', label: 'Dutch' },
] as const;

export type SessionLanguageCode = (typeof SESSION_LANGUAGES)[number]['code'];

const VALID_CODES = new Set<string>(SESSION_LANGUAGES.map((l) => l.code));

export function parseLanguageCodes(raw: string | null | undefined): string[] {
  if (!raw?.trim()) return [];
  return raw
    .split(',')
    .map((c) => c.trim().toLowerCase())
    .filter((c) => VALID_CODES.has(c));
}

export function serializeLanguageCodes(codes: string[]): string | null {
  const unique = [...new Set(codes.map((c) => c.toLowerCase()).filter((c) => VALID_CODES.has(c)))];
  return unique.length > 0 ? unique.join(',') : null;
}

export function normalizeMentorLanguages(
  spokenInput: unknown,
  callInput?: unknown,
): { spoken_languages: string[]; call_languages: string[] } | { error: string } {
  if (!Array.isArray(spokenInput)) {
    return { error: 'spoken_languages must be an array of language codes' };
  }
  if (!spokenInput.every((c) => typeof c === 'string')) {
    return { error: 'spoken_languages must be an array of language codes' };
  }

  const spoken = spokenInput
    .map((c) => c.toLowerCase())
    .filter((c) => VALID_CODES.has(c));

  let call: string[];
  if (callInput === undefined || (Array.isArray(callInput) && callInput.length === 0)) {
    call = [...spoken];
  } else {
    if (!Array.isArray(callInput) || !callInput.every((c) => typeof c === 'string')) {
      return { error: 'call_languages must be an array of language codes' };
    }
    call = callInput.map((c) => c.toLowerCase()).filter((c) => VALID_CODES.has(c));
  }

  if (call.some((c) => !spoken.includes(c))) {
    return { error: 'Every call language must also be a spoken language' };
  }

  return {
    spoken_languages: [...new Set(spoken)],
    call_languages: [...new Set(call)],
  };
}

export function languageLabel(code: string): string {
  return SESSION_LANGUAGES.find((l) => l.code === code)?.label ?? code.toUpperCase();
}

/** Compact display for cards: "EN · FR" */
export function formatLanguageBadges(codes: string[]): string {
  return codes.map((c) => c.toUpperCase()).join(' · ');
}

/** Readable list: "English, French" */
export function formatLanguageList(codes: string[]): string {
  return codes.map(languageLabel).join(', ');
}
