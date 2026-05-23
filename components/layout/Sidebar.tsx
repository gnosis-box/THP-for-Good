'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

import { NAV } from '@/lib/nav';
import { cn } from '@/lib/utils';

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden border-r border-border/60 bg-sidebar p-3 md:block">
      <nav className="flex flex-col gap-0.5">
        {NAV.map((item) => {
          const isActive =
            item.href === '/' ? pathname === '/' : pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'rounded-xl px-3 py-2 text-sm font-medium transition-colors',
                isActive
                  ? 'bg-accent/15 text-accent font-semibold'
                  : 'text-sidebar-foreground hover:bg-sidebar-accent/60',
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
