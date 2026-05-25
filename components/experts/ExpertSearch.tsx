'use client';

import { Search } from 'lucide-react';
import { useId, useState } from 'react';

import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from '@/components/ui/input-group';
import { usePrefersReducedMotion } from '@/hooks/use-prefers-reduced-motion';
import { UI_COPY } from '@/lib/ui-copy';
import { cn } from '@/lib/utils';

type Props = {
  value: string;
  onChange: (v: string) => void;
};

export function ExpertSearch({ value, onChange }: Props) {
  const id = useId();
  const reducedMotion = usePrefersReducedMotion();
  const [focused, setFocused] = useState(false);
  const floated = focused || value.length > 0;

  return (
    <div className="relative">
      <label
        htmlFor={id}
        className={cn(
          'pointer-events-none absolute left-10 z-10 origin-left text-sm text-muted-foreground',
          reducedMotion
            ? 'top-1/2 -translate-y-1/2'
            : cn(
                'transition-all duration-[var(--motion-fast)] ease-out',
                floated
                  ? 'top-0 -translate-y-1/2 scale-90 bg-background px-1 text-xs font-medium text-foreground'
                  : 'top-1/2 -translate-y-1/2',
              ),
        )}
      >
        Search experts
      </label>
      <InputGroup
        className={cn(
          'min-h-11 h-auto',
          !reducedMotion && floated && 'pt-1',
        )}
      >
        <InputGroupAddon>
          <Search className="size-4" aria-hidden />
        </InputGroupAddon>
        <InputGroupInput
          id={id}
          type="search"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          placeholder={floated ? UI_COPY.home.searchPlaceholder : undefined}
          aria-label="Search experts"
        />
      </InputGroup>
    </div>
  );
}
