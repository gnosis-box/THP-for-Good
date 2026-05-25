'use client';

import { useEffect, useId, useRef, useState } from 'react';
import { X } from 'lucide-react';

import { Input } from '@/components/ui/input';
import { tagChipClass } from '@/components/ui-patterns/highlight-pill';
import { cn } from '@/lib/utils';

export type MultiSelectOption = {
  value: string;
  label: string;
  hint?: string;
};

type Suggestion =
  | { type: 'option'; option: MultiSelectOption }
  | { type: 'create'; label: string; value: string };

type Props = {
  options: MultiSelectOption[];
  selectedValues: string[];
  onSelectedChange: (values: string[]) => void;
  placeholder: string;
  ariaLabel: string;
  loading?: boolean;
  disabled?: boolean;
  emptyListMessage?: string;
  allowCreate?: boolean;
  getCreateLabel?: (query: string) => string;
  /** Return false to keep the query open (e.g. duplicate). */
  onCreateValue?: (query: string) => boolean;
  inputClassName?: string;
  chipClassName?: string;
};

function isSelectedCaseInsensitive(selectedValues: string[], value: string): boolean {
  const query = value.toLowerCase();
  return selectedValues.some((item) => item.toLowerCase() === query);
}

function resolveOptionLabel(options: MultiSelectOption[], value: string): string {
  return (
    options.find((option) => option.value.toLowerCase() === value.toLowerCase())?.label ?? value
  );
}

function filterOptions(options: MultiSelectOption[], query: string): MultiSelectOption[] {
  const normalized = query.trim().toLowerCase();
  if (!normalized) return options;
  return options.filter(
    (option) =>
      option.label.toLowerCase().includes(normalized) ||
      option.value.toLowerCase().includes(normalized),
  );
}

export function MultiSelectSearch({
  options,
  selectedValues,
  onSelectedChange,
  placeholder,
  ariaLabel,
  loading = false,
  disabled = false,
  emptyListMessage = 'All options are already selected.',
  allowCreate = false,
  getCreateLabel = (query) => `Add “${query}”`,
  onCreateValue,
  inputClassName,
  chipClassName,
}: Props) {
  const [query, setQuery] = useState('');
  const [open, setOpen] = useState(false);
  const [highlightIndex, setHighlightIndex] = useState(0);
  const listboxId = useId();
  const inputRef = useRef<HTMLInputElement>(null);

  const availableOptions = options.filter(
    (option) => !isSelectedCaseInsensitive(selectedValues, option.value),
  );
  const filteredOptions = filterOptions(availableOptions, query);
  const trimmedQuery = query.trim();
  const exactCatalogMatch = trimmedQuery
    ? availableOptions.find(
        (option) =>
          option.label.toLowerCase() === trimmedQuery.toLowerCase() ||
          option.value.toLowerCase() === trimmedQuery.toLowerCase(),
      )
    : undefined;

  const showCreate =
    allowCreate &&
    trimmedQuery.length > 0 &&
    !exactCatalogMatch &&
    !isSelectedCaseInsensitive(selectedValues, trimmedQuery);

  const suggestions: Suggestion[] = [
    ...filteredOptions.map((option) => ({ type: 'option' as const, option })),
    ...(showCreate
      ? [
          {
            type: 'create' as const,
            label: getCreateLabel(trimmedQuery),
            value: trimmedQuery,
          },
        ]
      : []),
  ];

  useEffect(() => {
    setHighlightIndex(0);
  }, [query, suggestions.length]);

  function removeValue(value: string) {
    onSelectedChange(selectedValues.filter((item) => item !== value));
  }

  function addValue(value: string) {
    if (!value || isSelectedCaseInsensitive(selectedValues, value)) return false;
    const option = options.find((item) => item.value.toLowerCase() === value.toLowerCase());
    const canonical = option?.value ?? value;
    if (isSelectedCaseInsensitive(selectedValues, canonical)) return false;
    onSelectedChange([...selectedValues, canonical]);
    return true;
  }

  function resetQuery() {
    setQuery('');
    setOpen(false);
    setHighlightIndex(0);
  }

  function commitSuggestion(index: number): boolean {
    const item = suggestions[index];
    if (!item) return false;

    if (item.type === 'option') {
      if (!addValue(item.option.value)) return false;
    } else if (onCreateValue) {
      if (!onCreateValue(item.value)) return false;
    } else if (!addValue(item.value)) {
      return false;
    }

    resetQuery();
    inputRef.current?.focus();
    return true;
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'ArrowDown') {
      if (suggestions.length === 0) return;
      e.preventDefault();
      setOpen(true);
      setHighlightIndex((index) => Math.min(index + 1, suggestions.length - 1));
      return;
    }

    if (e.key === 'ArrowUp') {
      if (suggestions.length === 0) return;
      e.preventDefault();
      setOpen(true);
      setHighlightIndex((index) => Math.max(index - 1, 0));
      return;
    }

    if (e.key === 'Tab') {
      if (open && suggestions.length > 0) {
        e.preventDefault();
        commitSuggestion(highlightIndex);
      }
      return;
    }

    if (e.key === 'Enter') {
      if (suggestions.length > 0) {
        e.preventDefault();
        commitSuggestion(highlightIndex);
      }
      return;
    }

    if (e.key === 'Escape') {
      setOpen(false);
    }
  }

  const showList = open && !loading && !disabled;
  const listEmpty = availableOptions.length === 0;

  return (
    <div className="flex flex-col gap-2">
      {selectedValues.length > 0 ? (
        <div className="flex flex-wrap gap-2" role="list" aria-label={`Selected ${ariaLabel}`}>
          {selectedValues.map((value) => (
            <button
              key={value}
              type="button"
              role="listitem"
              onClick={() => removeValue(value)}
              className={cn(
                tagChipClass(true),
                'gap-1.5 pr-2 touch-manipulation',
                chipClassName,
              )}
              aria-label={`Remove ${resolveOptionLabel(options, value)}`}
            >
              <span>{resolveOptionLabel(options, value)}</span>
              <X className="size-3.5 opacity-80" aria-hidden />
            </button>
          ))}
        </div>
      ) : null}

      {loading ? (
        <p className="text-xs text-muted-foreground">Loading…</p>
      ) : (
        <div className="relative">
          <Input
            ref={inputRef}
            type="search"
            value={query}
            disabled={disabled || listEmpty}
            placeholder={listEmpty ? emptyListMessage : placeholder}
            aria-label={ariaLabel}
            aria-expanded={showList && suggestions.length > 0}
            aria-controls={listboxId}
            aria-autocomplete="list"
            role="combobox"
            onChange={(e) => {
              setQuery(e.target.value);
              setOpen(true);
            }}
            onFocus={() => setOpen(true)}
            onBlur={() => {
              window.setTimeout(() => setOpen(false), 120);
            }}
            onKeyDown={handleKeyDown}
            className={inputClassName}
          />

          {showList && suggestions.length > 0 ? (
            <ul
              id={listboxId}
              role="listbox"
              aria-label={`${ariaLabel} suggestions`}
              className="absolute z-20 mt-1 max-h-48 w-full overflow-y-auto rounded-lg border border-border bg-popover py-1 text-sm shadow-md"
            >
              {suggestions.map((item, index) => {
                const isActive = index === highlightIndex;
                const label =
                  item.type === 'option'
                    ? `${item.option.label}${item.option.hint ? ` ${item.option.hint}` : ''}`
                    : item.label;

                return (
                  <li key={item.type === 'option' ? item.option.value : `create-${item.value}`}>
                    <button
                      type="button"
                      role="option"
                      aria-selected={isActive}
                      className={cn(
                        'flex w-full touch-manipulation items-center px-3 py-2 text-left',
                        isActive ? 'bg-muted text-foreground' : 'text-foreground hover:bg-muted/70',
                        item.type === 'create' && 'font-medium',
                      )}
                      onMouseDown={(e) => e.preventDefault()}
                      onClick={() => commitSuggestion(index)}
                    >
                      {label}
                    </button>
                  </li>
                );
              })}
            </ul>
          ) : null}

          {showList && query.trim() && suggestions.length === 0 ? (
            <p className="absolute z-20 mt-1 w-full rounded-lg border border-border bg-popover px-3 py-2 text-xs text-muted-foreground shadow-md">
              No matches. {allowCreate ? 'Keep typing to add a new entry.' : 'Try another search.'}
            </p>
          ) : null}
        </div>
      )}

      {!loading ? (
        <p className="text-[11px] text-muted-foreground sm:text-xs">
          Tab, Enter, or tap a suggestion to add.
        </p>
      ) : null}
    </div>
  );
}
