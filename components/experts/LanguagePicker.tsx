'use client';

import {
  MultiSelectSearch,
  type MultiSelectOption,
} from '@/components/ui-patterns/multi-select-search';
import { cn } from '@/lib/utils';
import { SESSION_LANGUAGES } from '@/lib/languages';

type Props = {
  spoken: string[];
  onSpokenChange: (codes: string[]) => void;
  size?: 'sm' | 'md';
};

const sizeClasses = {
  sm: { input: 'h-8 text-xs' },
  md: { input: 'h-11 text-sm' },
} as const;

export function LanguagePicker({ spoken, onSpokenChange, size = 'md' }: Props) {
  const styles = sizeClasses[size];

  const spokenOptions: MultiSelectOption[] = SESSION_LANGUAGES.map(({ code, label }) => ({
    value: code,
    label,
  }));

  function handleSpokenChange(nextSpoken: string[]) {
    onSpokenChange(nextSpoken.map((code) => code.toLowerCase()));
  }

  return (
    <div className="flex flex-col gap-1.5">
      <span className={cn('font-medium', size === 'sm' ? 'text-xs' : 'text-sm')}>
        Spoken languages
      </span>
      <p className="text-xs text-muted-foreground">
        Languages you can communicate in during a session. Paid sessions are offered in English and
        French only.
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
  );
}
