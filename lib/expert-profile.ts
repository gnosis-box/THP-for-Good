import { defaultCallLanguagesFromSpoken } from '@/lib/languages';

/** API payload for spoken languages; call languages derived from spoken ∩ {en, fr}. */
export function buildExpertLanguagePayload(spoken: string[]) {
  return {
    spoken_languages: spoken,
    call_languages: defaultCallLanguagesFromSpoken(spoken),
  };
}
