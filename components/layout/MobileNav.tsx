'use client';

import { Menu } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';

import { Button } from '@/components/ui/button';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { useIsAdmin } from '@/hooks/use-is-admin';
import { getNavItems, isNavItemActive, type NavItem } from '@/lib/nav';
import { cn } from '@/lib/utils';

const navLinkClass = (active: boolean, compact = false) =>
  cn(
    'inline-flex min-h-11 items-center rounded-lg font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
    compact ? 'px-2.5 text-xs' : 'px-3 text-sm',
    active
      ? 'bg-accent/10 font-semibold text-accent'
      : 'text-foreground hover:bg-muted',
  );

type NavLinksProps = {
  items: NavItem[];
  pathname: string;
  compact?: boolean;
  onNavigate?: () => void;
  className?: string;
};

function NavLinks({ items, pathname, compact = false, onNavigate, className }: NavLinksProps) {
  return (
    <>
      {items.map((item) => {
        const active = isNavItemActive(pathname, item.href);
        const label = compact && item.shortLabel ? item.shortLabel : item.label;
        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={onNavigate}
            aria-current={active ? 'page' : undefined}
            className={cn(navLinkClass(active, compact), className)}
          >
            {label}
          </Link>
        );
      })}
    </>
  );
}

export function DesktopNav() {
  const pathname = usePathname();
  const { isAdmin } = useIsAdmin();
  const items = getNavItems(isAdmin);

  return (
    <nav
      className="hidden min-w-0 flex-1 items-center justify-center gap-0.5 md:flex lg:gap-1"
      aria-label="Main navigation"
    >
      <NavLinks items={items} pathname={pathname} compact />
    </nav>
  );
}

export function MobileNav() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const { isAdmin } = useIsAdmin();
  const items = getNavItems(isAdmin);
  const sheetId = 'mobile-main-nav';

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger
        render={
          <Button
            variant="ghost"
            size="icon"
            className="size-11 shrink-0 md:hidden"
            aria-label={open ? 'Close navigation menu' : 'Open navigation menu'}
            aria-expanded={open}
            aria-controls={sheetId}
          >
            <Menu className="size-5" aria-hidden />
          </Button>
        }
      />
      <SheetContent
        id={sheetId}
        side="left"
        className="w-[min(calc(100vw-2rem),16rem)] gap-0 p-0 pb-[env(safe-area-inset-bottom)] [&_[data-slot=sheet-close]]:size-11 [&_[data-slot=sheet-close]]:min-h-11 [&_[data-slot=sheet-close]]:min-w-11"
      >
        <SheetHeader className="border-b border-border px-4 py-4 pr-14">
          <SheetTitle>Menu</SheetTitle>
          <SheetDescription className="sr-only">
            Main navigation links for THP for Good
          </SheetDescription>
        </SheetHeader>
        <nav className="flex flex-col gap-1 p-3" aria-label="Main navigation">
          <NavLinks
            items={items}
            pathname={pathname}
            onNavigate={() => setOpen(false)}
            className="w-full"
          />
        </nav>
      </SheetContent>
    </Sheet>
  );
}
