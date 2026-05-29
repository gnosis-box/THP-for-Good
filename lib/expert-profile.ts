import { defaultCallLanguagesFromSpoken } from '@/lib/languages';

/** First line of bio, trimmed to max chars for card excerpts. Returns null when empty. */
export function truncateBio(bio: string | null | undefined, max = 120): string | null {
  if (!bio?.trim()) return null;
  const trimmed = bio.trim();
  const newlineIndex = trimmed.indexOf('\n');
  let excerpt = newlineIndex >= 0 ? trimmed.slice(0, newlineIndex).trim() : trimmed;
  if (!excerpt) return null;
  if (excerpt.length > max) {
    excerpt = `${excerpt.slice(0, max - 1).trimEnd()}…`;
  }
  return excerpt;
}

/** API payload for spoken languages; call languages derived from spoken ∩ {en, fr}. */
export function buildExpertLanguagePayload(spoken: string[]) {
  return {
    spoken_languages: spoken,
    call_languages: defaultCallLanguagesFromSpoken(spoken),
  };
}
