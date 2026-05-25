/** Spoken languages an expert may declare (FEAT-L4-07). */
export const SESSION_LANGUAGES = [
  { code: 'en', label: 'English' },
  { code: 'fr', label: 'French' },
  { code: 'de', label: 'German' },
  { code: 'es', label: 'Spanish' },
  { code: 'pt', label: 'Portuguese' },
  { code: 'it', label: 'Italian' },
  { code: 'nl', label: 'Dutch' },
] as const;

/** Languages offered for paid sessions — English and French only. */
export const CALL_LANGUAGES = [
  { code: 'en', label: 'English' },
  { code: 'fr', label: 'French' },
] as const;

export type SessionLanguageCode = (typeof SESSION_LANGUAGES)[number]['code'];
export type CallLanguageCode = (typeof CALL_LANGUAGES)[number]['code'];

const VALID_CODES = new Set<string>(SESSION_LANGUAGES.map((l) => l.code));
const VALID_CALL_CODES = new Set<string>(CALL_LANGUAGES.map((l) => l.code));

export function filterCallLanguageCodes(codes: string[]): string[] {
  return codes.map((c) => c.toLowerCase()).filter((c) => VALID_CALL_CODES.has(c));
}

/** Default call languages when none selected: spoken ∩ {en, fr}. */
export function defaultCallLanguagesFromSpoken(spoken: string[]): string[] {
  return filterCallLanguageCodes(spoken);
}

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

export function parseCallLanguageCodes(raw: string | null | undefined): string[] {
  return filterCallLanguageCodes(parseLanguageCodes(raw));
}

export function serializeCallLanguageCodes(codes: string[]): string | null {
  const unique = [...new Set(filterCallLanguageCodes(codes))];
  return unique.length > 0 ? unique.join(',') : null;
}

export function normalizeExpertLanguages(
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
    call = defaultCallLanguagesFromSpoken(spoken);
  } else {
    if (!Array.isArray(callInput) || !callInput.every((c) => typeof c === 'string')) {
      return { error: 'call_languages must be an array of language codes' };
    }
    call = filterCallLanguageCodes(callInput);
  }

  if (call.some((c) => !spoken.includes(c))) {
    return { error: 'Every call language must also be a spoken language (English or French only)' };
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

export type ExpertLanguageFields = {
  call_languages: string[];
  spoken_languages: string[];
};

/** Bookable session languages: call_languages, else spoken ∩ {en, fr}. */
export function getDisplayCallLanguages(expert: ExpertLanguageFields): string[] {
  if (expert.call_languages.length > 0) {
    return expert.call_languages;
  }
  return filterCallLanguageCodes(expert.spoken_languages);
}

export type SessionLanguageFormat = 'compact' | 'full' | 'card';

/** Display helper — compact: "EN · FR"; full: "English, French"; card: "English · French". */
export function formatSessionLanguages(
  codes: string[],
  variant: SessionLanguageFormat = 'full',
): string {
  if (codes.length === 0) return '';
  if (variant === 'compact') return formatLanguageBadges(codes);
  if (variant === 'card') return codes.map(languageLabel).join(' · ');
  return formatLanguageList(codes);
}
