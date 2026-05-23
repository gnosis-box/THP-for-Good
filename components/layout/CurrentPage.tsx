'use client';

import { usePathname } from 'next/navigation';

import { useIsAdmin } from '@/hooks/use-is-admin';
import { findNavItem } from '@/lib/nav';

/** Optional page crumb — use in page content, not in the crowded header bar. */
export function CurrentPage() {
  const pathname = usePathname();
  const { isAdmin } = useIsAdmin();
  const current = findNavItem(pathname, isAdmin);

  if (!current) return null;

  return (
    <p className="text-sm text-muted-foreground" aria-current="page">
      {current.label}
    </p>
  );
}
