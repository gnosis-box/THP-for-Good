'use client';

import { cn } from '@/lib/utils';
import { SESSION_LANGUAGES } from '@/lib/languages';

type Props = {
  spoken: string[];
  call: string[];
  onSpokenChange: (codes: string[]) => void;
  onCallChange: (codes: string[]) => void;
  size?: 'sm' | 'md';
};

const sizeClasses = {
  sm: 'min-h-8 rounded-full px-2.5 py-0.5 text-xs',
  md: 'min-h-11 rounded-full px-4 text-sm',
} as const;

export function LanguagePicker({
  spoken,
  call,
  onSpokenChange,
  onCallChange,
  size = 'md',
}: Props) {
  const pill = sizeClasses[size];

  function toggleSpoken(code: string) {
    if (spoken.includes(code)) {
      const nextSpoken = spoken.filter((c) => c !== code);
      onSpokenChange(nextSpoken);
      onCallChange(call.filter((c) => nextSpoken.includes(c)));
      return;
    }
    onSpokenChange([...spoken, code]);
  }

  function toggleCall(code: string) {
    if (!spoken.includes(code)) return;
    onCallChange(
      call.includes(code) ? call.filter((c) => c !== code) : [...call, code],
    );
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
        <div className="flex flex-wrap gap-2" role="group" aria-label="Spoken languages">
          {SESSION_LANGUAGES.map(({ code, label }) => {
            const active = spoken.includes(code);
            return (
              <button
                key={code}
                type="button"
                aria-pressed={active}
                onClick={() => toggleSpoken(code)}
                className={cn(
                  'shrink-0 font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
                  pill,
                  active
                    ? 'bg-primary text-primary-foreground'
                    : 'border border-border bg-background text-foreground hover:bg-muted',
                )}
              >
                {label}
              </button>
            );
          })}
        </div>
      </div>

      {spoken.length > 0 && (
        <div className="flex flex-col gap-1.5">
          <span className={cn('font-medium', size === 'sm' ? 'text-xs' : 'text-sm')}>
            Languages for calls
          </span>
          <p className="text-xs text-muted-foreground">
            Which spoken languages you offer for paid sessions. Defaults to all spoken languages.
          </p>
          <div className="flex flex-wrap gap-2" role="group" aria-label="Call languages">
            {spoken.map((code) => {
              const label = SESSION_LANGUAGES.find((l) => l.code === code)?.label ?? code.toUpperCase();
              const active = call.includes(code);
              return (
                <button
                  key={code}
                  type="button"
                  aria-pressed={active}
                  onClick={() => toggleCall(code)}
                  className={cn(
                    'shrink-0 font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
                    pill,
                    active
                      ? 'bg-accent text-accent-foreground'
                      : 'border border-border bg-background text-muted-foreground hover:bg-muted',
                  )}
                >
                  {label}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
