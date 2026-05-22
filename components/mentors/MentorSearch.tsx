'use client';

import { Search } from 'lucide-react';

type Props = {
  value: string;
  onChange: (v: string) => void;
};

export function MentorSearch({ value, onChange }: Props) {
  return (
    <div className="relative flex items-center">
      <Search className="absolute left-3 size-4 text-muted-foreground pointer-events-none" />
      <input
        type="search"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Search by name, skill or bio…"
        className="w-full rounded-lg border border-border bg-background py-2 pl-9 pr-3 text-sm outline-none placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring"
      />
    </div>
  );
}
