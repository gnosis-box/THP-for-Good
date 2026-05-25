'use client';

import {
  MultiSelectSearch,
  type MultiSelectOption,
} from '@/components/ui-patterns/multi-select-search';
import { cn } from '@/lib/utils';
import {
  CALL_LANGUAGES,
  SESSION_LANGUAGES,
  filterCallLanguageCodes,
  languageLabel,
} from '@/lib/languages';

type Props = {
  spoken: string[];
  call: string[];
  onSpokenChange: (codes: string[]) => void;
  onCallChange: (codes: string[]) => void;
  size?: 'sm' | 'md';
};

const sizeClasses = {
  sm: { input: 'h-8 text-xs' },
  md: { input: 'h-11 text-sm' },
} as const;

export function LanguagePicker({
  spoken,
  call,
  onSpokenChange,
  onCallChange,
  size = 'md',
}: Props) {
  const styles = sizeClasses[size];

  const spokenOptions: MultiSelectOption[] = SESSION_LANGUAGES.map(({ code, label }) => ({
    value: code,
    label,
  }));

  const callOptions: MultiSelectOption[] = filterCallLanguageCodes(spoken).map((code) => ({
    value: code,
    label: CALL_LANGUAGES.find((lang) => lang.code === code)?.label ?? languageLabel(code),
  }));

  function handleSpokenChange(nextSpoken: string[]) {
    const normalized = nextSpoken.map((code) => code.toLowerCase());
    onSpokenChange(normalized);
    onCallChange(filterCallLanguageCodes(call.filter((code) => normalized.includes(code))));
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-1.5">
        <span className={cn('font-medium', size === 'sm' ? 'text-xs' : 'text-sm')}>
          Spoken languages
        </span>
        <p className="text-xs text-muted-foreground">
          Languages you can communicate in during a session.
        </p>
        <MultiSelectSearch
          options={spokenOptions}
          selectedValues={spoken}
          onSelectedChange={handleSpokenChange}
          placeholder="Search spoken languages…"
          ariaLabel="Spoken languages"
          emptyListMessage="All spoken languages are selected."
          inputClassName={styles.input}
        />
      </div>

      {spoken.length > 0 ? (
        <div className="flex flex-col gap-1.5">
          <span className={cn('font-medium', size === 'sm' ? 'text-xs' : 'text-sm')}>
            Languages for calls
          </span>
          <p className="text-xs text-muted-foreground">
            Paid sessions are offered in English and French only. Select which of those you speak
            you accept for bookings.
          </p>
          {callOptions.length === 0 ? (
            <p className="text-xs text-muted-foreground">
              Add English or French under spoken languages to configure call languages.
            </p>
          ) : (
            <MultiSelectSearch
              options={callOptions}
              selectedValues={call}
              onSelectedChange={(codes) =>
                onCallChange(filterCallLanguageCodes(codes.map((code) => code.toLowerCase())))
              }
              placeholder="Search call languages…"
              ariaLabel="Call languages"
              emptyListMessage="All call languages are selected."
              inputClassName={styles.input}
            />
          )}
        </div>
      ) : null}
    </div>
  );
}
