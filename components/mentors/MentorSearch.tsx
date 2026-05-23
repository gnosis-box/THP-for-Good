'use client';

import { Search } from 'lucide-react';

import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from '@/components/ui/input-group';
import { UI_COPY } from '@/lib/ui-copy';

type Props = {
  value: string;
  onChange: (v: string) => void;
};

export function MentorSearch({ value, onChange }: Props) {
  return (
    <InputGroup>
      <InputGroupAddon>
        <Search className="size-4" aria-hidden />
      </InputGroupAddon>
      <InputGroupInput
        type="search"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={UI_COPY.home.searchPlaceholder}
        aria-label="Search mentors"
      />
    </InputGroup>
  );
}
