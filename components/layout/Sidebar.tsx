'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

import { useIsAdmin } from '@/hooks/use-is-admin';
import { getNavItems, isNavItemActive } from '@/lib/nav';
import { cn } from '@/lib/utils';

export function Sidebar() {
  const pathname = usePathname();
  const { isAdmin } = useIsAdmin();
  const items = getNavItems(isAdmin);

  return (
    <aside className="hidden border-r bg-sidebar p-2 md:block">
      <nav className="flex flex-col gap-1" aria-label="Main navigation">
        {items.map((item) => {
          const active = isNavItemActive(pathname, item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              aria-current={active ? 'page' : undefined}
              className={cn(
                'min-h-11 rounded-md px-3 py-2 text-sm font-medium text-sidebar-foreground transition-colors',
                active
                  ? 'bg-accent/10 font-semibold text-accent'
                  : 'hover:bg-sidebar-accent/60',
              )}
            >
              {item.label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
