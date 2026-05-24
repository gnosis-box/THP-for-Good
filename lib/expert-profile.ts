import {
  defaultCallLanguagesFromSpoken,
  filterCallLanguageCodes,
} from '@/lib/languages';

/** API payload for spoken + call languages (register, edit, promote). */
export function buildExpertLanguagePayload(spoken: string[], call: string[]) {
  return {
    spoken_languages: spoken,
    call_languages:
      call.length > 0
        ? filterCallLanguageCodes(call)
        : defaultCallLanguagesFromSpoken(spoken),
  };
}

/** Initial call languages when loading an expert row into a form. */
export function initialCallLanguagesFromExpert(
  spoken: string[],
  call: string[],
): string[] {
  return call.length > 0 ? filterCallLanguageCodes(call) : defaultCallLanguagesFromSpoken(spoken);
}
